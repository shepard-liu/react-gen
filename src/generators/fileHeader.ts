export interface FileHeaderConfig {
    author: string,
    description: string,
    time: boolean,
    componentName: string,
}

export function generateFileHeader({
    componentName,
    author,
    description,
    time
}: FileHeaderConfig) {

    return `\
/**
 * ${componentName}
 *
 * ${description ? description + '\n * ' : ''}\
${author ? `@author ${author}\n * ` : ''}\
${time ? `@date ${new Date().toLocaleDateString()}\n` : ''}\
 */ 
`;
}

export default generateFileHeader