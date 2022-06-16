import commander from 'commander';

//@ts-ignore
import { Input, BooleanPrompt } from 'enquirer';

import { ComponentCommandOptionType, ConfigType } from '../types';
import { brandWrite, error, logWrite, successWrite, warn } from '../utils/chalks';
import { normalizeComponentName, validateName } from '../utils/naming';
import { checkPath, createDirectory, readFileAsync, writeFileAsync } from '../utils/node';
import { elementAttributesTypeMap, elementTypeMap } from '../utils/intrisicElementTypes';
import { errorUnexpected } from '../utils/errorHandler';
import Debug from '../utils/debugger';
import reactFCGenerator from '../generators/reactFC';
import path from 'path';
import stylesheetGenerator from '../generators/stylesheet';
import chalk, { green, magenta, red, yellow } from 'chalk';
import { exit } from 'process';

async function componentHandler(
    config: Partial<ConfigType>,
    rawName: string,
    options: ComponentCommandOptionType,
    command: commander.Command) {

    Debug(() => {
        console.log("argument:", rawName);
        console.log("options:", options);
        console.log("config:", config);
    })

    // [Argument] Name
    let nameArg = rawName;

    // Validate component name
    while (validateName(nameArg) === false) {
        error(`Invalid component name "${nameArg}". Must be valid JavaScript identifier.`);
        try {
            nameArg = await new Input({
                message: 'Please re-input component name:'
            }).run();
        } catch (err) {
            errorUnexpected(err);
        }
    }

    /**
     * * Check Options
     */

    // [Option] directory
    let outDirOption = options.outDir || config.component?.outDir;

    while (!outDirOption) {
        error(`The output directory option cannot be left empty.`);
        // Prompt user if directory is not provided
        try {
            outDirOption = await new Input({
                message: 'The directory to store generated component files (You may configure the default directory using "config" command):',
            }).run();
        } catch (err) {
            errorUnexpected(err);
        }
    }

    if (await checkPath(outDirOption) === false) {
        warn(`The output directory "${red(outDirOption)}" does not exist.`);
        // Prompt user if wish to create it
        try {
            const shouldCreate = await new BooleanPrompt({
                message: "Do you wish to create it?"
            }).run();
            if (shouldCreate) await createDirectory(outDirOption);
            else exit(0);
        } catch (err) {
            errorUnexpected(err);
        }
    }

    // [Option] baseElement
    let baseElementOption = options.baseElement || config.component?.baseElement || '';
    let baseElementType = elementTypeMap[baseElementOption] || '';

    // If specified in the configuration or options, will check if the element exists.
    while (baseElementOption && baseElementType === undefined) {
        try {
            baseElementOption = await new Input({
                message: `"${baseElementOption}" is not valid HTML element, please re-input or leave it blank:`
            }).run() || '';
        } catch (err) {
            errorUnexpected(err);
        }
        baseElementType = elementAttributesTypeMap[baseElementOption] || '';
    }

    // [Option] wrapNamespace
    let wrapNamespaceOption = options.wrapNamespace || config.component?.wrapNamespace;

    // [Option] style
    let styleOption = options.style || config.component?.style || 'css';
    while (['scss', 'css', 'less', 'none'].includes(styleOption) === false) {
        try {
            styleOption = await new Input({
                message: `Style option can only be 'scss', 'css', 'less' or 'none', please re-input:`
            }).run();
        } catch (err) {
            errorUnexpected(err);
        }
    }

    // [Option] forwardRef
    let forwardRefOption = options.forwardRef || config.component?.forwardRef;

    // [Option] indexPath
    let indexPathOption = options.indexPath || config.component?.indexPath;
    let indexExists = await checkPath(indexPathOption);

    // If specified, check if the index file exists.
    while (indexPathOption && indexExists === false) {
        try {
            indexPathOption = await new Input({
                message: `Unable to access the index file path "${indexPathOption}", please re-input or leave it blank:`
            }).run();
        } catch (err) {
            errorUnexpected(err);
        }
        indexExists = await checkPath(indexPathOption);
    }

    // [Option] author
    let authorOption = options.author || config.author;

    // [Option] description
    let descripOption = options.descrip || '';

    // [Option] time
    let timeOption = options.time || config.component?.time;

    // [Option] customCode
    let customCodeOption = config.component.customCode || [''];

    /**
     * * Pre-process information
     */

    const [compName, cssClass] = normalizeComponentName(nameArg);

    const fileHeader = (authorOption || descripOption || timeOption)
        ? `\
/**
 * ${compName}
 *
 * ${descripOption ? descripOption + '\n * ' : ''}\
${authorOption ? `@author ${authorOption}\n * ` : ''}\
${timeOption ? `@date ${new Date().toLocaleDateString()}\n` : ''}\
 */ 
`
        : '';

    const customCode = customCodeOption.join('\n');

    /**
     * * Start writing files
     */

    // [React.FC]
    brandWrite();
    logWrite(`Generating "${green(compName)}${magenta('.tsx')}" in "${yellow(outDirOption)}" ... `);
    try {
        await writeFileAsync(
            path.join(outDirOption, `${compName}.tsx`),
            reactFCGenerator({
                fileHeader,
                baseElementTag: baseElementOption,
                baseElementType,
                baseElementAttributeType: elementAttributesTypeMap[baseElementOption],
                componentName: compName,
                cssClass,
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

    // [Stylesheet]
    if (styleOption !== 'none') {
        brandWrite();
        logWrite(`Generating "${green(compName)}.${magenta(styleOption)}" in "${yellow(outDirOption)}" ... `);
        try {
            await writeFileAsync(
                path.join(outDirOption, `${compName}.${styleOption}`),
                stylesheetGenerator(cssClass)
            )
        } catch (err) {
            errorUnexpected(err);
        }
        successWrite('successful\n');
    }

    // [Index]
    if (indexPathOption) {
        brandWrite();
        logWrite(`Appending to "${green(path.basename(indexPathOption))}" in "${yellow(path.dirname(indexPathOption))}" ... `);
        try {
            const indexContent = await readFileAsync(indexPathOption);
            const relativePath = path.relative(path.dirname(indexPathOption), outDirOption);
            const newIndexContent = `${indexContent}\nexport * from '${relativePath}/${compName}';`;
            await writeFileAsync(indexPathOption, newIndexContent);
        } catch (err) {
            errorUnexpected(err);
        }
        successWrite('successful\n');
    }

}

export default componentHandler;