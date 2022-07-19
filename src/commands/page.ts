
import { ConfigType, PageCommandOptionType } from '../types';
import commander from 'commander';
import Debug from '../utils/debugger';
import { ensureDirectory, ensureName, ensureStyle, promptOverrideIfExist, parseCustomCodeOption } from '../utils/validators';
import { exit } from 'process';
import { normalizeComponentName } from '../utils/naming';
import generateFileHeader from '../generators/fileHeader';
import { brandWrite, logWrite, successWrite } from '../utils/chalks';
import { green, magenta, yellow } from 'chalk';
import { writeFileAsync } from '../utils/node';
import path from 'path';
import generateReactPage from '../generators/reactPage';
import { errorUnexpected } from '../utils/errorHandler';
import { writeStylesheet } from './sharedUtils';

async function pageHandler(
    config: Partial<ConfigType>,
    rawName: string,
    options: Partial<PageCommandOptionType>,
    command: commander.Command) {

    Debug(() => {
        console.log("argument:", rawName);
        console.log("options:", options);
        console.log("config:", config);
    });

    /**
     * * Check Argument
     */

    // [Argument] name
    let nameArg = rawName;

    nameArg = await ensureName({
        initial: nameArg,
        errorHint: true,
        inputHintText: "Please re-input component name:"
    });

    /**
     * * Check Options
     */

    // [Option] directory
    let outDirOption = options.outDir || config.page?.outDir || '';
    {
        const result = await ensureDirectory({
            initial: outDirOption,
            emptyHintText: "The output directory option cannot be left empty.",
            inputHintText: 'The directory to store generated component files (You may configure the default directory using "config" command):',
            promptCreateIfNotExists: true,
        });

        if (result.exists === false) exit(0);
        outDirOption = result.dir;
    }

    // [Option] style
    let styleOption = options.style || config.page?.style || 'css';

    styleOption = await ensureStyle({
        initial: styleOption,
        errorHint: true,
        inputHintText: `Style option can only be 'scss', 'css', 'less' or 'none', please re-input:`
    });

    // [Option] author
    const authorOption = options.author || config.author || '';

    // [Option] description
    const descripOption = options.descrip || '';

    // [Option] time
    const timeOption = options.time || config.page?.time;

    // [Option] styleFilename
    const styleFilenameOption = options.styleFilename || config.page?.styleFilename || '$component';

    // [Option] customCode
    const customCodeOption = config.page?.customCode || [''];

    /**
     * * Preprocess information
     */

    const [compName, cssClass] = normalizeComponentName(nameArg);

    const fileHeader = (authorOption || descripOption || timeOption)
        ? generateFileHeader({
            componentName: compName,
            author: authorOption,
            description: descripOption,
            time: timeOption,
        })
        : '';

    const styleFilename = styleFilenameOption.replace('$component', compName);

    const customCode = parseCustomCodeOption(customCodeOption, compName);

    /**
     * * Write files
     */

    // [React Page]

    let componentFilepath = path.join(outDirOption, `${compName}.tsx`);

    if (await promptOverrideIfExist(componentFilepath) === true) {
        brandWrite();
        logWrite(`Generating component "${green(compName)}${magenta('.tsx')}" in "${yellow(outDirOption)}" ... `);
        try {
            await writeFileAsync(
                path.join(outDirOption, `${compName}.tsx`),
                generateReactPage({
                    fileHeader,
                    pageName: compName,
                    styleFilenameNoExt: styleFilename,
                    cssClass,
                    cssPreprocessor: styleOption,
                    customCode,
                })
            );
        } catch (err) {
            errorUnexpected(err);
        }
        successWrite('successful\n');
    }

    // [Stylesheet]    
    if (styleOption !== 'none')
        await writeStylesheet(styleFilename, compName, styleOption, outDirOption, cssClass);

}

export default pageHandler;