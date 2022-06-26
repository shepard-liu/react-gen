import { OptimizeOptions } from 'svgo';
import attrsToJSX from './svgo.attrsToJSX.plugin';
import modifySize from './svgo.modifySize.plugin';

interface SvgoConfigParamsType {
    convertColorsParams: {
        currentColor: boolean, // Enables to create monocolor svgs
    },
    modifySizeParams: {
        width: string,
        height: string,
    }
}
function getSvgoConfigObject({
    convertColorsParams,
    modifySizeParams,
}: Partial<SvgoConfigParamsType>): OptimizeOptions {
    return {
        multipass: false, // If enabled, the converted JSX property will be removed
        plugins: [
            // set of built-in plugins enabled by default
            {
                name: 'preset-default',
                params: {
                    overrides: {
                        convertColors: false,   // Use this plugin later
                        inlineStyles: {
                            onlyMatchedOnce: false,
                        },
                        removeViewBox: false,
                    }
                }
            },
            'convertStyleToAttrs',
            {
                name: 'removeAttrs',
                params: {
                    // remove styles that is unable to be converted to attributes
                    attrs: "(data-.*)|(style)"
                }
            },
            {
                name: 'convertColors',
                params: convertColorsParams
            },
            Object.assign({}, modifySize, {
                params: modifySizeParams
            }) as any,
            attrsToJSX
        ],
    };
}

export default getSvgoConfigObject;