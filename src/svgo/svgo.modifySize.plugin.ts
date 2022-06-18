
import assert from 'assert';

export default {

    name: 'modifySize',
    type: 'visitor',
    active: true,
    description: 'change the width and height attribute of the top-level svg element',

    /**
     *  params:
     *      width: string,
     *      height: string,
     */

    fn: (root, params) => {
        if (params.width)
            assert(typeof params.width === 'string');
        if (params.height)
            assert(typeof params.height === 'string');

        return {
            root: {
                enter: node => {
                    const attributes = node.children[0].attributes;
                    if (params.width)
                        attributes.width = params.width;
                    if (params.height)
                        attributes.height = params.height;
                }
            }
        };
    },
}
