
import { OptimizeOptions } from 'svgo';
import attrsToJSX from './svgo.attrsToJSX.plugin';

export default {
    plugins: [
        attrsToJSX,
    ],
} as OptimizeOptions;


