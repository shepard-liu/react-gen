import fs from 'fs';
import path from 'path';

export const readFileAsync = fs.promises.readFile;

export const writeFileAsync = fs.promises.writeFile;

export async function checkPathAsync(path: fs.PathLike): Promise<boolean> {
    return new Promise((resolve) => {
        fs.access(path, (err) => {
            if (err) resolve(false);
            else resolve(true);
        })
    })
}

export const createDirectoryAsync = fs.promises.mkdir;


export async function gatherFilesAsync(dir: string, condition: (p: string) => boolean, recursive?: boolean): Promise<string[]> {
    if (await checkPathAsync(dir) === false) return [];

    const paths: string[] = [];

    await loopOverDirectory(paths, dir, condition, recursive);

    return paths;
}

async function loopOverDirectory(paths: string[], dirname: string, condition: (path: string) => boolean, recursive?: boolean) {
    const files = await fs.promises.readdir(dirname);

    for (const file of files) {
        const filepath = path.join(dirname, file);
        const type = await fs.promises.stat(filepath);
        if (type.isFile() && condition(file)) {
            paths.push(filepath);
        } else if (recursive && type.isDirectory()) {
            await loopOverDirectory(paths, filepath, condition);
        }
    }
}

export async function removeDirectoryIfExist(path: fs.PathLike) {
    if (await checkPathAsync(path) === false) return;
    return fs.promises.rm(path, {
        recursive: true,
        force: true,
    });
}