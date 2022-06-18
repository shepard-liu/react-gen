import { green, yellow } from "chalk";
import path from "path";
import { brandWrite, logWrite, successWrite } from "../utils/chalks";
import { errorUnexpected } from "../utils/errorHandler";
import { readFileAsync, writeFileAsync } from "../utils/node";

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

