import { ConfigType, IconCommandOptionType } from "../types";
import commander from 'commander';
import Debug from "../utils/debugger";
import { ensureFilepath, ensureSatisfy, ensureSatisfyOrEmpty, parseCustomCodeOption, parseReplaceFilenameRulesOption } from "../utils/validators";
import { exit } from "process";
import { checkPathAsync, createDirectoryAsync, gatherFilesAsync, readFileAsync, removeDirectoryIfExist, writeFileAsync } from "../utils/node";
import { optimize, loadConfig, OptimizeOptions, OptimizedSvg } from 'svgo';
import { brandWrite, error, log, logWrite, newLines, successWrite, warn } from "../utils/chalks";
import { red, green, blue, yellow, bold, magenta } from 'chalk';
import fs from 'fs';
import path from "path";
// @ts-ignore
import { BooleanPrompt } from 'enquirer';
import { normalizeComponentName, validateName } from "../utils/naming";
import { errorUnexpected } from "../utils/errorHandler";
import getSvgoConfigObject from "../svgo/svgo.config";
import { generateIcon, generateIconComponent } from "../generators/iconComponent";
import { updateIndex } from "./sharedUtils";
import loadingIcon from '../generators/__loading';
import missingIcon from '../generators/__missing';
import readline from 'readline';
import isValidFilename from 'valid-filename';

async function iconHandler(
    config: Partial<ConfigType>,
    outFilepath: string,
    options: Partial<IconCommandOptionType>,
    command: commander.Command) {

    Debug(() => {
        console.log("argument:", outFilepath);
        console.log("options:", options);
        console.log("config:", config);
    });

    /**
     * * Check arguments
     */

    let outFilepathArg = outFilepath || config.icon?.outFilepath || '';
    let fileBasename = '';

    outFilepathArg = await ensureSatisfy({
        initial: outFilepathArg,
        emptyHintText: "The output component file path should either be specified in the configuration file, or as an argument.",
        inputHintText: "Please re-input the component file path:",
        invalidHintText: "Invalid component name resolved from path '$value'",
        condition: async (value) => validateName(fileBasename = path.basename(value).split('.')[0])
    })

    {
        const result = await ensureFilepath({
            initial: outFilepathArg,
            // Not possible to be empty
            emptyHintText: "",
            inputHintText: "",
            promptCreateDirectoryIfNotExists: true,
        });

        if (result.dirExists === false) exit(0);
    }

    /**
     * * Check options
     */

    // [Option] assetDirs

    let assetDirsOption = options.assetDirs || config.icon?.assetDirs || '';
    {
        const accessableAssetDirs: string[] = [];
        for (const dir of assetDirsOption) {
            if (await checkPathAsync(dir) === true)
                accessableAssetDirs.push(dir);
        }
        assetDirsOption = accessableAssetDirs;
    }

    // [Option] recursive

    const recursiveOption = options.recursive === undefined
        ? config.icon?.recursive === undefined
            ? true
            : config.icon?.recursive
        : options.recursive;

    // [Option] monocolor

    const monocolorOption = options.monocolor || config.icon?.monocolor;

    // [Option] normalize

    let normalizeOption = options.normalize || config.icon?.normalize;
    let width = -1, height = -1, widthUnit = '', heightUnit = '';

    normalizeOption = await ensureSatisfyOrEmpty({
        initial: normalizeOption,
        inputHintText: "Please re-input the size or leave it blank:",
        invalidHintText: '"$value" is not a valid normalized size option, you may specify the size like "6.4rem-6.4rem" or "96px-4.8rem"',
        condition: async (value) => {
            const strs = value.toString().split('-');
            if (strs.length !== 2) return false;

            function resolveDimension(str: string): { value: number, unit: string } {
                const unitIdx = str.search(/%|[a-zA-Z]/);
                const unit = str.substring(unitIdx);
                if (['em', 'ex', 'cap', 'ch', 'ic', 'rem', 'lh',
                    'rlh', 'vw', 'vh', 'vi', 'vb', 'vmin',
                    'vmax', 'cm', 'mm', 'Q', 'in', 'pc', 'pt', 'px', '%'].includes(unit) === false)
                    return null;
                const value = Number(str.substring(0, unitIdx));
                if (Number.isNaN(value))
                    return null;
                return { value, unit };
            }

            const [widthstr, heightstr] = strs;

            const widthDimension = resolveDimension(widthstr);
            if (!widthDimension) return false;

            const heightDimension = resolveDimension(heightstr);
            if (!heightDimension) return false;

            width = widthDimension.value;
            widthUnit = widthDimension.unit;
            height = heightDimension.value;
            heightUnit = heightDimension.unit;

            return true;
        },
    });

    // // [Option] watch

    // const watchOption = options.watch || config.icon?.watch;

    // [Option] descrip

    const descripOption = options.descrip || config.icon?.descrip || '';

    // [Option] time

    const timeOption = options.time || config.icon?.time;

    // [Option] customCode

    const customCodeOption = config.icon?.customCode || [''];
    const customCode = parseCustomCodeOption(customCodeOption);

    // [Option] prefixNormal

    const prefixNormalOption = options.prefixNormal || config.icon?.prefixNormal || '';

    // [Option] suffixNormal

    const suffixNormalOption = options.suffixNormal || config.icon?.suffixNormal || '';

    // [Option] prefixSingleColor

    const prefixMonocolorOption = options.prefixSingleColor || config.icon?.prefixSingleColor || '';

    // [Option] suffixSingleColor

    const suffixMonocolorOption = options.suffixSingleColor || config.icon?.suffixSingleColor || '_mono';

    // [Option] wrapNamespace

    const wrapNamespaceOption = options.wrapNamespace || config.icon?.wrapNamespace;

    // [Option] indexPath

    let indexPathOption = options.indexPath || config.icon?.indexPath || '';
    indexPathOption = await ensureSatisfyOrEmpty({
        initial: indexPathOption,
        inputHintText: 'Please re-input the index filepath or leave it blank:',
        invalidHintText: 'Unable to access the index file path "$value"',
        condition: async (value) => {
            return await checkPathAsync(value);
        }
    });

    // [Option] replaceFilenameRules

    const replaceFilenameRulesOption = config.icon?.replaceFilenameRules || [];
    const replaceFilenameRules = parseReplaceFilenameRulesOption(replaceFilenameRulesOption);

    // [Option] threshold

    let thresholdOption = options.threshold || config.icon.threshold || 0;
    thresholdOption = Number(await ensureSatisfyOrEmpty({
        initial: thresholdOption.toString(),
        inputHintText: "Please re-input the size threshold (in Bytes) to enable lazy loading or leave it blank:",
        invalidHintText: "Invalid size threshold '$value'. Must be 0 or positive integer.",
        condition: async (value) => {
            let num = Number(value);
            if (Number.isNaN(num)) return false;
            if (num < 0 || !Number.isInteger(num)) return false;
            return true;
        }
    }));

    /**
     * * Pre-process information
     */

    // Get component name and CSS class
    const [componentName, cssClass] = normalizeComponentName(fileBasename);

    // Get component directory
    const outDir = path.dirname(outFilepathArg);    // Ensured existence
    const iconsOutDir = path.join(outDir, '__icons');
    // Removes the old directory if exists
    await removeDirectoryIfExist(iconsOutDir);
    // Recreate the directory
    await createDirectoryAsync(iconsOutDir, { recursive: true });

    // Gather svg files
    log("Gathering svg files ... ");

    let svgFilepaths: string[] = [];
    for (const dir of assetDirsOption)
        svgFilepaths = svgFilepaths.concat(await gatherFilesAsync(dir, p => path.extname(p) === '.svg', recursiveOption));

    log(`Found ${svgFilepaths.length} svg files.`);

    let svgPathsMap: Map<string, fs.PathLike> = new Map();
    {
        let ignoreCounter = 0;

        // Determine the icon name of each svg file
        for (const p of svgFilepaths) {
            let name = path.basename(p, '.svg').trim();
            // Apply replace rules
            for (const rule of replaceFilenameRules)
                name = name.replace(rule.from, rule.to);

            // Validate the name
            if (!isValidFilename(name)) {
                warn(`Icon name "${red(name)}"("${blue(path.basename(p, '.svg'))}" before applying replacement rules)\
in directory "${blue(path.dirname(p))}" is not a valid filename.`);
                ++ignoreCounter;
                continue;
            }

            // Check duplication
            if (svgPathsMap.has(name)) {
                warn(`Icon name "${red(name)}" duplicates after applying replacement rules. Sources: "${blue(p)}" , "${blue(svgPathsMap.get(name))}"`);
                ++ignoreCounter;
                continue;
            }

            // Insert new path to the map
            svgPathsMap.set(name, p);
        }

        // Prompt user if wish to continue
        if (ignoreCounter > 0) {
            try {
                var ans = await new BooleanPrompt({
                    message: `\nDetected Problems in ${ignoreCounter}/${svgFilepaths.length} SVG files, \
ignore conversion of these files and continue?`
                }).run();
            } catch (err) {
                ans = false;
            }
            if (!ans) exit(0);
        }
    }

    /**
     * * Write files
     */

    // Do svg optimization and export svgs
    const lazyLoadIconNames: string[] = [];
    const nonLazyLoadIconNames: string[] = [];
    {
        // Get svgo optimize config object
        const svgoConfigNormal = getSvgoConfigObject({
            modifySizeParams: normalizeOption
                ? {
                    width: width.toString() + widthUnit,
                    height: height.toString() + heightUnit,
                } : null
        });

        // Get svgo optimize config object for monocolor icon
        const svgoConfigMono = getSvgoConfigObject({
            modifySizeParams: normalizeOption
                ? {
                    width: width.toString() + widthUnit,
                    height: height.toString() + heightUnit,
                } : null,
            convertColorsParams: {
                currentColor: true,
            }
        });

        let successCount = 0, processedCount = 0, originalSizeInTotal = 0, optimizedSizeInTotal = 0;

        for (const [name, filepath] of svgPathsMap.entries()) {
            try {
                // Read the file in
                const originialSvgBuffer = await readFileAsync(filepath);

                async function optimizeAndExport(__originalSvgBuffer: Buffer, __exportDir: string, __filename_no_ext: string, __svgoConfig: OptimizeOptions) {
                    // Status bar
                    readline.cursorTo(process.stdout, 0);
                    brandWrite();
                    logWrite(`Processing svg files [monocolor export ${monocolorOption ? 'enabled' : 'disabled'}]\
 : ${++processedCount} / ${monocolorOption ? svgPathsMap.size * 2 : svgPathsMap.size}`);
                    // Do optimization
                    let optimizedSvg = optimize(__originalSvgBuffer, __svgoConfig) as OptimizedSvg;

                    if (optimizedSvg.error !== undefined) {
                        error(`Faild to process svg file "${bold(filepath)}".\n`);
                        return;
                    }
                    // Write to output directory
                    await writeFileAsync(
                        path.join(__exportDir, __filename_no_ext + '.tsx'),
                        generateIcon(optimizedSvg.data));

                    // Statistics
                    ++successCount;
                    originalSizeInTotal += __originalSvgBuffer.length;
                    optimizedSizeInTotal += optimizedSvg.data.length;

                    // Omit the "missing" icon and the "loading" icon.
                    if (['__missing', '__loading'].includes(name) === true) return;

                    // Determine whether to load lazily
                    if (optimizedSvg.data.length > thresholdOption)
                        lazyLoadIconNames.push(__filename_no_ext);
                    else
                        nonLazyLoadIconNames.push(__filename_no_ext);
                }

                await optimizeAndExport(
                    originialSvgBuffer,
                    iconsOutDir,
                    prefixNormalOption + name + suffixNormalOption,
                    svgoConfigNormal);

                if (monocolorOption && ['__missing', '__loading'].includes(name) === false)
                    await optimizeAndExport(
                        originialSvgBuffer,
                        iconsOutDir,
                        prefixMonocolorOption + name + suffixMonocolorOption,
                        svgoConfigMono);
            } catch (err) {
                errorUnexpected(err);
            }
        }
        successWrite(' Done\n');
        // Copy the "missing" icon and the "loading" icon to the target directory if not specified
        if (!svgPathsMap.has('__missing')) await writeFileAsync(path.join(iconsOutDir, '__missing.tsx'), missingIcon);
        if (!svgPathsMap.has('__loading')) await writeFileAsync(path.join(iconsOutDir, '__loading.tsx'), loadingIcon);

        // Print status information
        log(`${processedCount} processed. ${successCount} successful, ${processedCount - successCount} failed. \
Size reduced by ${((1 - (optimizedSizeInTotal || 1) / (originalSizeInTotal || 1)) * 100).toFixed(2)}% \
(${(originalSizeInTotal / 1024).toFixed(2)}KB -> ${(optimizedSizeInTotal / 1024).toFixed(2)}KB).`);

        svgPathsMap = null;
    }

    // [Icon component]
    const componentFilepath = path.join(outDir, `${componentName}.tsx`);

    brandWrite();
    logWrite(`Generating icon component "${green(componentName)}${magenta('.tsx')}" in "${yellow(outDir)}" ... `);
    try {
        await writeFileAsync(
            componentFilepath,
            generateIconComponent({
                componentName,
                cssClass,
                customCode,
                wrapNamespace: wrapNamespaceOption,
                description: descripOption,
                icons: nonLazyLoadIconNames,
                lazyIcons: lazyLoadIconNames,
                time: timeOption,
                importDir: './__icons',
            })
        );
    } catch (err) {
        errorUnexpected(err);
    }
    successWrite('successful\n');

    // [Update index]
    if (indexPathOption) await updateIndex(indexPathOption, outDir, componentName);

}

export default iconHandler;