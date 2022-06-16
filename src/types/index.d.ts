export interface ConfigType {
    "component": {
        "outDir": string,
        "wrapNamespace": boolean,
        "style": string,
        "forwardRef": boolean,
        "time": boolean,
        "customCode": string[],
        "baseElement": string,
        "indexPath": string
    },
    "page": {
        "sourceDir": string,
        "style": string,
        "time": boolean,
        "customCode": string[]
    }
    "author": string,
}

export interface ComponentCommandOptionType {
    outDir: string,
    baseElement: string,
    wrapNamespace: boolean,
    style: string,
    forwardRef: boolean,
    author: string,
    descrip: string,
    time: boolean,
    indexPath: string,
}