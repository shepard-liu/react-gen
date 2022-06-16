#!/usr/bin/env node

process.env.NODE_ENV = 'production';

import { program } from 'commander';
import componentHandler from './commands/component';
import path from 'path';
import { ConfigType } from './types';
import { readFileAsync } from './utils/node';
import { blue, green, success, warn, yellow } from './utils/chalks';
import Debug from './utils/debugger';


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
        warn("Failed to read 'package.json' for default configurations.");
    }

    /**
     * * Configurations in "react-gen.config.json"
     * {
     *      "component": {
     *          "sourceDir": "./src/component",
     *          "wrapNamespace": true | false,
     *          "style":  "scss" | "css" | "less" | "none",
     *          "forwardRef": true | false,
     *          "time": true | false,
     *          "baseElement": "div",
     *          "customCode": [
     *              "import {something} from 'somelib';",
     *              "",
     *              "// Let's roll"
     *          ],
     *          "indexPath": "./src/index.ts"
     *      },
     * 
     *      "page": {
     *          "sourceDir": "./src/page",
     *          "style":  "scss" | "css" | "less" | "none",
     *          "time": true | false,
     *          "customCode": [
     *              "import {something} from 'somelib';",
     *              "",
     *              "// Let's roll"
     *          ]
     *      },
     *      
     *      "author": "shepard",
     * }
     */


    // Setting up commander
    program
        .version('1.0.0', "-v --version", "A React Component Generator CLI Tool.");

    program.addHelpText('before', green`A configuation file are used by default, see  `)

    // * The "Component" Command
    program
        .command("component").alias('c')
        .description("Generate a react component. You can use 'c' as a shorthand.")
        .argument(yellow`<name>`, "The name of the component.")
        .option(yellow`-d --outDir <directory>`, `Where you would like to store the generated components.`)
        .option(blue`-b --baseElement <element>`, `The base element of the component`)
        .option(blue`-w --wrapNamespace`, `Will export a typescript namespace with the same name in the component module.`)
        .option(blue`-s --style <scss|css|less|none>`, `Specify CSS preprocessor type.`)
        .option(blue`-f --forwardRef`, `Use React.forwardRef`)
        .option(blue`-i --indexPath`, `Specify the path of an index file in which the component is re-exported.`)
        .option(blue`-a --author <author>`, `The author name to use in the file header comments.`)
        .option(blue`-e --descrip <description>`, `Description of the component in the file header comments.`)
        .option(blue`-t --time`, `Mark the creation time of this component file in the file header comments.`)
        .action((...args) => {
            args.unshift(config);
            componentHandler.apply(null, args);
        });

    program.parse();

})();

