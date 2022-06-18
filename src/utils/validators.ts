import { error, log, warn } from "./chalks";

// @ts-ignore
import { Input, BooleanPrompt } from 'enquirer';
import { errorUnexpected } from "./errorHandler";
import { checkPathAsync, createDirectoryAsync } from "./node";
import { red, yellow } from "chalk";
import { validateName } from "./naming";
import path from "path";
import { exit } from "process";

export interface EnsureSatisfyConfig {
    initial: string,
    emptyHintText: string,

    // The invalid hint text can contain '$value' placeholders
    invalidHintText: string,

    inputHintText: string,

    // The condition can be left undefined, then checks only if the value is falsy
    condition?: (value: string) => Promise<boolean>;
}

/**
 * Guarantees the argument/option meets the requirement.
 * The function checks if the value is falsy.
 * @param config 
 * @returns ensured value
 */
export async function ensureSatisfy({
    initial,
    emptyHintText,
    invalidHintText,
    inputHintText,
    condition
}: EnsureSatisfyConfig) {
    let value = initial;

    while (!value || await condition(value) === false) {
        if (!value) error(emptyHintText);
        else error(invalidHintText.replace(/\$value/, value));

        try {
            value = await new Input({
                message: inputHintText,
            }).run();
        } catch (err) {
            errorUnexpected(err);
        }
    }

    return value;
}

export interface EnsureSatisfyOrEmptyConfig {
    initial: string,

    // The invalid hint text can contain '$value' placeholders
    invalidHintText: string,

    inputHintText: string,

    // The condition can be left undefined, then checks only if the value is falsy
    condition?: (value: string) => Promise<boolean>;
}

//* Guarantees the argument/option meets the requirement or is left empty
export async function ensureSatisfyOrEmpty({
    initial,
    invalidHintText,
    inputHintText,
    condition
}: EnsureSatisfyOrEmptyConfig) {
    let value = initial;

    while (value && await condition(value) === false) {
        error(invalidHintText.replace(/\$value/, value));

        try {
            value = await new Input({
                message: inputHintText,
            }).run();
        } catch (err) {
            errorUnexpected(err);
        }
    }

    return value;
}

export interface EnsureDirectoryConfig {
    initial: string,
    emptyHintText: string,
    inputHintText: string,
    promptCreateIfNotExists: boolean
}

// * Guarantees the directory to exist
export async function ensureDirectory({
    initial,
    emptyHintText,
    inputHintText,
    promptCreateIfNotExists,
}: EnsureDirectoryConfig): Promise<{ exists: boolean, dir: string }> {

    let dir = await ensureSatisfy({
        emptyHintText, initial, inputHintText,
        invalidHintText: '',
        condition: async (value) => typeof value === 'string' && Boolean(value)
    });

    if (await checkPathAsync(dir) === false) {
        if (!promptCreateIfNotExists) return { dir, exists: false };

        warn(`The directory "${red(dir)}" does not exist.`);
        // Prompt user if wish to create it
        try {
            const shouldCreate = await new BooleanPrompt({
                message: "Do you wish to create it?"
            }).run();
            if (shouldCreate) await createDirectoryAsync(dir);
            else return { dir, exists: false };
        } catch (err) {
            errorUnexpected(err);
        }
    }

    return { dir, exists: true };
}

export interface EnsureFilepathConfig {
    initial: string,
    emptyHintText: string,
    inputHintText: string,
    promptCreateDirectoryIfNotExists: boolean
}

// * Guarantees the filepath is none empty, and the directory exists
export async function ensureFilepath({
    initial,
    emptyHintText,
    inputHintText,
    promptCreateDirectoryIfNotExists
}: EnsureFilepathConfig): Promise<{ filepath: string, dirExists }> {
    let filepath = await ensureSatisfy({
        emptyHintText, initial, inputHintText,
        invalidHintText: '',
        condition: async (value) => typeof value === 'string' && Boolean(value)
    });

    if (await checkPathAsync(path.dirname(filepath)) === false) {
        if (!promptCreateDirectoryIfNotExists) return { filepath, dirExists: false };

        const dir = path.dirname(filepath);
        warn(`The directory "${red(path.dirname(filepath))}" of the file does not exist.`);

        // Prompt user if wish to create it
        try {
            const shouldCreate = await new BooleanPrompt({
                message: "Do you wish to create it?"
            }).run();
            if (shouldCreate) await createDirectoryAsync(dir);
            else return { filepath, dirExists: false };
        } catch (err) {
            errorUnexpected(err);
        }
    }

    return {
        filepath, dirExists: true
    };
}


export interface EnsureStyleConfig {
    initial: string,
    errorHint: boolean,
    inputHintText: string
}

// * Guarantees the style option to be valid
export async function ensureStyle({
    initial,
    errorHint,
    inputHintText
}: EnsureStyleConfig) {
    let style = initial;

    while (['scss', 'css', 'less', 'none'].includes(style) === false) {
        if (errorHint) error(`Unsupported stylesheet type ${style}.`);

        try {
            style = await new Input({
                message: inputHintText
            }).run();
        } catch (err) {
            errorUnexpected(err);
        }
    }

    return style as ('scss' | 'css' | 'less' | 'none');
}



export interface EnsureNameConfig {
    initial: string,
    inputHintText: string,
    errorHint: boolean,
}

// * Guarantees the component/page name to be valid
export async function ensureName({
    initial,
    inputHintText,
    errorHint
}: EnsureNameConfig) {
    let name = initial;

    // Validate component name
    while (validateName(name) === false) {
        if (errorHint)
            error(`Invalid component name "${name}". Must be valid JavaScript identifier.`);

        try {
            name = await new Input({
                message: inputHintText
            }).run();
        } catch (err) {
            errorUnexpected(err);
        }
    }

    return name;
}


// * Prompt user whether to override if exists. Returns true if not exists.
export async function promptOverride(filepath: string) {

    if (await checkPathAsync(filepath) === false) return true;

    log(`'${red(path.basename(filepath))}' already exists in '${yellow(path.dirname(filepath))}'.`);

    const ans = await new BooleanPrompt({
        message: `Would you like to override?`
    }).run();

    return ans;
}

export function parseCustomCodeOption(customCode: any): string {
    let res = true;
    if (!Array.isArray(customCode)) res = false;
    for (const elem of customCode) {
        if (typeof elem !== 'string') {
            res = false;
            break;
        }
    }

    if (!res) {
        error("CustomCode speficified in configuration file does not match the schema.");
        exit(-1);
    }

    return customCode.join('\n');
}

export function parseReplaceFilenameRulesOption(replaceFilenameRules: any): { from: RegExp, to: string }[] {
    if (!Array.isArray(replaceFilenameRules)) {
        error('The replace rules must be an array of object with string property "from" and "to".');
        exit(-1);
    }

    const parsedRules: { from: RegExp, to: string }[] = [];

    for (const elem of replaceFilenameRules) {
        if (typeof elem !== 'object' ||
            typeof elem.from !== 'string' || typeof elem.to !== 'string') {
            error('The replace rules must be an array of object with string property "from" and "to".');
            exit(-1);
        }

        try {
            parsedRules.push({
                from: new RegExp(elem.from),
                to: elem.to
            });
        } catch (err) {
            console.log(err);
            error(`Invalid regular expression '${elem.from}'.`);
            exit(-1);
        }
    }

    return parsedRules;

}