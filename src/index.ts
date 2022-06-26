#!/usr/bin/env node

process.env.NODE_ENV = 'production';

import { program } from 'commander';
import componentHandler from './commands/component';
import pageHandler from './commands/page';
import path from 'path';
import { ConfigType } from './types';
import { readFileAsync } from './utils/node';
import { success, warn, } from './utils/chalks';
import { blue, green, yellow } from 'chalk';
import Debug from './utils/debugger';
import iconHandler from './commands/icon';


(async function () {

    const cwd = process.cwd();
    Debug(() => {
        console.log("cwd: ", cwd);
    })

    // * Read in the default configurations
    const configPath = path.resolve(cwd, 'react-gen.config.json');
    try {
        var config = JSON.parse((await readFileAsync(configPath)).toString()) as Partial<ConfigType>;
        success('Configuration loaded.');
    } catch (err) {
        warn("Failed to read 'react-gen.config.json' in current working directory for default configurations.");
        config = {};
    }

    // Setting up commander
    program
        .version('1.0.0', "-v --version", "A React Component Generator CLI Tool.");

    program.addHelpText('after', green`\nA configuation file named "react-gen.config.json" is used to supply the default values, see  `);

    // * The "Component" Command
    program
        .command("component").alias('c')
        .description("Generate a react component. You can use 'c' as a shorthand.")
        .argument(`<name>`, "The name of the component.")
        .option(`-d --outDir <directory>`, `Where you would like to store the generated component.`)
        .option(`-b --baseElement <element>`, `The base element of the component`)
        .option(`-w --wrapNamespace`, `Will export a typescript namespace with the same name in the component module.`)
        .option(`-s --style <scss|css|less|none>`, `Specify CSS preprocessor type.`)
        .option(`--styleFilename <name>`, "Customize the stylesheet filename(extension not included). '$component' can be used to interpolate the component name.")
        .option(`-f --forwardRef`, `Use React.forwardRef`)
        .option(`-i --indexPath <path>`, `Specify the path of an index file in which the component is re-exported.`)
        .option(`-a --author <author>`, `The author name to use in the file header comments.`)
        .option(`-e --descrip <description>`, `[No Config]Description of the component in the file header comments.`)
        .option(`-t --time`, `Mark the creation time of this component file in the file header comments.`)
        .action((...args) => {
            args.unshift(config);
            componentHandler.apply(null, args);
        });

    // * The "Page" Command
    program
        .command("page").alias("p")
        .description("Generate a react page. You can use 'p' as a shorthand.")
        .argument(`<name>`, "The name of the page.")
        .option(`-d --outDir <directory>`, `Where you would like to store the generated components.`)
        .option(`-s --style <scss|css|less|none>`, `Specify CSS preprocessor type.`)
        .option(`--styleFilename <name>`, "Customize the stylesheet filename(extension not included). '$component' can be used to interpolate the component name.")
        .option(`-a --author <author>`, `The author name to use in the file header comments.`)
        .option(`-e --descrip <description>`, `[No Config] Description of the page in the file header comments.`)
        .option(`-t --time`, `Mark the creation time of this page file in the file header comments.`)
        .action((...args) => {
            args.unshift(config);
            pageHandler.apply(null, args);
        });

    // * The "Icon" Command
    program
        .command("icon").alias("i")
        .description("Optimize and sync svg icon assets into a react component file and a directory containing generated icons. The file and the directory will be overriden if already exists.")
        .argument("[outFilepath]", "The component file path. The name of the icon component will stay consistent with the file's basename. If omitted, value in the configuration file will be used.")
        .option("-d --assetDirs <dirs...>", "The directories to look for the icons.")
        .option("-r --recursive", "Search '.svg' files recursively in the asset directories.")
        .option("-m --monocolor", "Additionally export a monocolor version of the icons. Use CSS property 'color' to style these icons.")
        .option("-n --normalize <size>", "Normalize the size of the icons, e.g. '6.4rem-6.4rem', '96px-4.8rem'.")
        // .option("-w --watch", "Enables the program to work in watch mode.")
        .option("-e --descrip <description>", "Description of the component in the file header comments. ")
        .option("-t --time", "Mark the creation time of this page file in the file header comments.")
        .option("-i --indexPath", "Specify the path of an index file in which the component is re-exported.")
        .option("-t --threshold <sizeInBytes>", "The optimized file size threshold to enable icon lazy loading. If omitted, all icons will be loaded lazily.")
        .option("-wn --wrapNamespace", "Will export a typescript namespace with the same name in the component module.")
        .option("--prefixNormal", "Add prefix to the icon name.")
        .option("--suffixNormal", "Add suffix to the icon name.")
        .option("--prefixSingleColor", "Add prefix to the single-colored icon name.")
        .option("--suffixSingleColor", "Add suffix to the single-colored icon name.")
        .action((...args) => {
            args.unshift(config);
            iconHandler.apply(null, args);
        });

    // * The "Remove" Command
    program
        .command("remove").alias("r")
        .description("Removes a certain component.");


    program.parse();

})();

