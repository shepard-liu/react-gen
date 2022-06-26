import { green, yellow } from "chalk";
import path from "path";
import generateStylesheet from "../generators/stylesheet";
import { brandWrite, logWrite, successWrite } from "../utils/chalks";
import { errorUnexpected } from "../utils/errorHandler";
import { readFileAsync, writeFileAsync } from "../utils/node";
import { promptOverrideIfExist } from "../utils/validators";

// Update index module
export async function updateIndex(indexPath: string, componentDir: string, componentName: string) {
    brandWrite();
    logWrite(`Updating index module "${green(path.basename(indexPath))}" in "${yellow(path.dirname(indexPath))}" ... `);
    try {
        const indexContent = await readFileAsync(indexPath);
        const relativePath = path.relative(path.dirname(indexPath), componentDir);
        const newLine = `export * from '.${relativePath}/${componentName}';`;
        if (indexContent.toString().includes(newLine)) return;
        await writeFileAsync(indexPath, '\n' + newLine, { flag: 'a' });
    } catch (err) {
        errorUnexpected(err);
    }
    successWrite('successful\n');
}


// generate and write stylesheet
export async function writeStylesheet(styleFilenameNoExt: string, componentName: string, cssPreprocessor: string, componentDir: string, cssClass: string) {
    let stylesheetPath = path.join(componentDir, styleFilenameNoExt + '.' + cssPreprocessor);

    if (await promptOverrideIfExist(stylesheetPath) === true) {
        brandWrite();
        logWrite(`Generating stylesheet "${green(styleFilenameNoExt + '.' + cssPreprocessor)}" in "${yellow(componentDir)}" ... `);
        try {
            await writeFileAsync(
                stylesheetPath,
                generateStylesheet(cssClass)
            )
        } catch (err) {
            errorUnexpected(err);
        }
        successWrite('successful\n');
    }
}