import commander from 'commander';

//@ts-ignore
import { Input } from 'enquirer';

import { ComponentCommandOptionType, ConfigType } from '../types';
import { brandWrite, logWrite, successWrite } from '../utils/chalks';
import { normalizeComponentName } from '../utils/naming';
import { checkFileAsync, writeFileAsync } from '../utils/node';
import { elementTypeMap } from '../utils/intrisicElementTypes';
import { errorUnexpected } from '../utils/errorHandler';
import Debug from '../utils/debugger';
import generateReactFC from '../generators/reactFC';
import path from 'path';
import { green, magenta, yellow } from 'chalk';
import { exit } from 'process';
import { ensureDirectory, ensureName, ensureSatisfyOrEmpty, ensureStyle, promptOverrideIfExist, parseCustomCodeOption } from '../utils/validators';
import generateFileHeader from '../generators/fileHeader';
import { updateIndex, writeStylesheet } from './sharedUtils';

async function componentHandler(
    config: Partial<ConfigType>,
    rawName: string,
    options: Partial<ComponentCommandOptionType>,
    command: commander.Command) {

    Debug(() => {
        console.log("argument:", rawName);
        console.log("options:", options);
        console.log("config:", config);
    })

    // [Argument] Name
    let nameArg = rawName;

    // Validate component name
    nameArg = await ensureName({
        initial: nameArg,
        errorHint: true,
        inputHintText: "Please re-input component name:"
    });

    /**
     * * Check Options
     */

    // [Option] directory
    let outDirOption = options.outDir || config.component?.outDir || '';
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

    // [Option] baseElement
    let baseElementOption = options.baseElement || config.component?.baseElement || '';
    let baseElementType = '';

    baseElementOption = await ensureSatisfyOrEmpty({
        initial: baseElementOption,
        inputHintText: 'Please re-input or leave it blank:',
        invalidHintText: '"$value" is not valid HTML element.',
        condition: async (value) => {
            baseElementType = elementTypeMap[value];
            return baseElementType !== undefined;
        }
    })

    // [Option] wrapNamespace
    const wrapNamespaceOption = options.wrapNamespace || config.component?.wrapNamespace;

    // [Option] style
    let styleOption = options.style || config.component?.style || 'css';

    styleOption = await ensureStyle({
        initial: styleOption,
        errorHint: true,
        inputHintText: `Style option can only be 'scss', 'css', 'less' or 'none', please re-input:`
    });

    // [Option] styleFilename
    const styleFilenameOption = options.styleFilename || config.component.styleFilename || '$component';

    // [Option] forwardRef
    const forwardRefOption = options.forwardRef || config.component?.forwardRef;

    // [Option] indexPath
    let indexPathOption = options.indexPath || config.component?.indexPath || '';
    indexPathOption = await ensureSatisfyOrEmpty({
        initial: indexPathOption,
        inputHintText: 'Please re-input the index filepath or leave it blank:',
        invalidHintText: 'Unable to access the index file path "$value"',
        condition: async (value) => {
            return await checkFileAsync(value);
        }
    });

    // [Option] author
    const authorOption = options.author || config.author || '';

    // [Option] description
    const descripOption = options.descrip || '';

    // [Option] time
    const timeOption = options.time || config.component?.time;

    // [Option] customCode
    const customCodeOption = config.component.customCode || [''];

    /**
     * * Pre-process information
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
     * * Writing files
     */

    // [React.FC]
    const componentFilepath = path.join(outDirOption, `${compName}.tsx`);

    if (await promptOverrideIfExist(componentFilepath) === true) {
        brandWrite();
        logWrite(`Generating component "${green(compName)}${magenta('.tsx')}" in "${yellow(outDirOption)}" ... `);
        try {
            await writeFileAsync(
                componentFilepath,
                generateReactFC({
                    fileHeader,
                    baseElementTag: baseElementOption,
                    baseElementType,
                    componentName: compName,
                    cssClass,
                    styleFilenameNoExt: styleFilename,
                    cssPreprocessor: styleOption,
                    customCode,
                    forwardRef: forwardRefOption,
                    wrapNamespace: wrapNamespaceOption
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

    // [Index]
    if (indexPathOption)
        await updateIndex(indexPathOption, outDirOption, compName);

}

export default componentHandler;