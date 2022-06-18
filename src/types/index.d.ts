export interface ConfigType {
    "component": ComponentCommandOptionType & {
        "customCode": string[],
    },
    "page": PageCommandOptionType & {
        "customCode": string[]
    }
    "icon": IconCommandOptionType & {
        "outFilepath": string,  // Optional Argument
        "customCode": string[], // [Configuration Only]

        /**
         * [Configuration Only] Svg file names without extension will be replaced according to the rules
         * before validation and conversion into the icon name.
         */
        "replaceFilenameRules": { from: string, to: string }[],
    },
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

export interface PageCommandOptionType {
    outDir: string,
    style: string,
    author: string,
    descrip: string,    // [Option Only]
    time: boolean,
}
export interface IconCommandOptionType {
    assetDirs: string[],
    recursive: boolean,
    monocolor: boolean,
    normalize: string,
    // watch: boolean,
    descrip: string,
    time: boolean,
    threshold: number,
    wrapNamespace: boolean,
    indexPath: string,
    prefixNormal: string,
    suffixNormal: string,
    prefixSingleColor: string,
    suffixSingleColor: string,
}