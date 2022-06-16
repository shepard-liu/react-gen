import fs from 'fs';

export async function readFileAsync(path: fs.PathOrFileDescriptor): Promise<Buffer> {
    return new Promise((resolve, reject) => {
        fs.readFile(path, (err, data) => {
            if (err) reject(err);
            else resolve(data);
        })
    });
};

export async function writeFileAsync(path: fs.PathOrFileDescriptor, data: string | NodeJS.ArrayBufferView): Promise<void> {
    return new Promise((resolve, reject) => {
        fs.writeFile(path, data, (err) => {
            if (err) reject(err);
            else resolve();
        })
    });
}

export async function checkPath(path: fs.PathLike): Promise<boolean> {
    return new Promise((resolve) => {
        fs.access(path, (err) => {
            if (err) resolve(false);
            else resolve(true);
        })
    })
}

export async function createDirectory(path: fs.PathLike): Promise<void> {
    return new Promise((resolve, reject) => {
        fs.mkdir(path, { recursive: true }, (err) => {
            if (err) reject(err);
            else resolve();
        })
    });
}