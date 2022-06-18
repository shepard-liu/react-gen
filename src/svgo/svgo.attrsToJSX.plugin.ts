export default {

    name: 'attrsToJSX',
    type: 'visitor',
    active: true,
    description: 'convert svg attributes into react JSX camel-cased props',

    fn: (root, params) => {
        return {
            element: {
                enter: (node) => {
                    const attributes = node.attributes;
                    for (const attrKey in attributes) {
                        const propKey = attributesToProps[attrKey];
                        if (propKey !== undefined) {
                            // console.log(`${attrKey} - ${propKey}`);
                            attributes[propKey] = attributes[attrKey];
                            // console.log(attributes[propKey]);
                            delete attributes[attrKey];
                        }
                    }
                },
            },
        };
    }
}

// Mapping dashed attributes to camel-cased props
// Generated from react typescript type definitions.
const attributesToProps = {
    "tab-index": "tabIndex",
    "cross-origin": "crossOrigin",
    "accent-height": "accentHeight",
    "alignment-baseline": "alignmentBaseline",
    "allow-reorder": "allowReorder",
    "arabic-form": "arabicForm",
    "attribute-name": "attributeName",
    "attribute-type": "attributeType",
    "auto-reverse": "autoReverse",
    "base-frequency": "baseFrequency",
    "baseline-shift": "baselineShift",
    "base-profile": "baseProfile",
    "calc-mode": "calcMode",
    "cap-height": "capHeight",
    "clip-path": "clipPath",
    "clip-path-units": "clipPathUnits",
    "clip-rule": "clipRule",
    "color-interpolation": "colorInterpolation",
    "color-interpolation-filters": "colorInterpolationFilters",
    "color-profile": "colorProfile",
    "color-rendering": "colorRendering",
    "content-script-type": "contentScriptType",
    "content-style-type": "contentStyleType",
    "diffuse-constant": "diffuseConstant",
    "dominant-baseline": "dominantBaseline",
    "edge-mode": "edgeMode",
    "enable-background": "enableBackground",
    "external-resources-required": "externalResourcesRequired",
    "fill-opacity": "fillOpacity",
    "fill-rule": "fillRule",
    "filter-res": "filterRes",
    "filter-units": "filterUnits",
    "flood-color": "floodColor",
    "flood-opacity": "floodOpacity",
    "font-family": "fontFamily",
    "font-size": "fontSize",
    "font-size-adjust": "fontSizeAdjust",
    "font-stretch": "fontStretch",
    "font-style": "fontStyle",
    "font-variant": "fontVariant",
    "font-weight": "fontWeight",
    "glyph-name": "glyphName",
    "glyph-orientation-horizontal": "glyphOrientationHorizontal",
    "glyph-orientation-vertical": "glyphOrientationVertical",
    "glyph-ref": "glyphRef",
    "gradient-transform": "gradientTransform",
    "gradient-units": "gradientUnits",
    "horiz-adv-x": "horizAdvX",
    "horiz-origin-x": "horizOriginX",
    "image-rendering": "imageRendering",
    "kernel-matrix": "kernelMatrix",
    "kernel-unit-length": "kernelUnitLength",
    "key-points": "keyPoints",
    "key-splines": "keySplines",
    "key-times": "keyTimes",
    "length-adjust": "lengthAdjust",
    "letter-spacing": "letterSpacing",
    "lighting-color": "lightingColor",
    "limiting-cone-angle": "limitingConeAngle",
    "marker-end": "markerEnd",
    "marker-height": "markerHeight",
    "marker-mid": "markerMid",
    "marker-start": "markerStart",
    "marker-units": "markerUnits",
    "marker-width": "markerWidth",
    "mask-content-units": "maskContentUnits",
    "mask-units": "maskUnits",
    "num-octaves": "numOctaves",
    "overline-position": "overlinePosition",
    "overline-thickness": "overlineThickness",
    "paint-order": "paintOrder",
    "path-length": "pathLength",
    "pattern-content-units": "patternContentUnits",
    "pattern-transform": "patternTransform",
    "pattern-units": "patternUnits",
    "pointer-events": "pointerEvents",
    "points-at-x": "pointsAtX",
    "points-at-y": "pointsAtY",
    "points-at-z": "pointsAtZ",
    "preserve-alpha": "preserveAlpha",
    "preserve-aspect-ratio": "preserveAspectRatio",
    "primitive-units": "primitiveUnits",
    "ref-x": "refX",
    "ref-y": "refY",
    "rendering-intent": "renderingIntent",
    "repeat-count": "repeatCount",
    "repeat-dur": "repeatDur",
    "required-extensions": "requiredExtensions",
    "required-features": "requiredFeatures",
    "shape-rendering": "shapeRendering",
    "specular-constant": "specularConstant",
    "specular-exponent": "specularExponent",
    "spread-method": "spreadMethod",
    "start-offset": "startOffset",
    "std-deviation": "stdDeviation",
    "stitch-tiles": "stitchTiles",
    "stop-color": "stopColor",
    "stop-opacity": "stopOpacity",
    "strikethrough-position": "strikethroughPosition",
    "strikethrough-thickness": "strikethroughThickness",
    "stroke-dasharray": "strokeDasharray",
    "stroke-dashoffset": "strokeDashoffset",
    "stroke-linecap": "strokeLinecap",
    "stroke-linejoin": "strokeLinejoin",
    "stroke-miterlimit": "strokeMiterlimit",
    "stroke-opacity": "strokeOpacity",
    "stroke-width": "strokeWidth",
    "surface-scale": "surfaceScale",
    "system-language": "systemLanguage",
    "table-values": "tableValues",
    "target-x": "targetX",
    "target-y": "targetY",
    "text-anchor": "textAnchor",
    "text-decoration": "textDecoration",
    "text-length": "textLength",
    "text-rendering": "textRendering",
    "underline-position": "underlinePosition",
    "underline-thickness": "underlineThickness",
    "unicode-bidi": "unicodeBidi",
    "unicode-range": "unicodeRange",
    "units-per-em": "unitsPerEm",
    "v-alphabetic": "vAlphabetic",
    "vector-effect": "vectorEffect",
    "vert-adv-y": "vertAdvY",
    "vert-origin-x": "vertOriginX",
    "vert-origin-y": "vertOriginY",
    "v-hanging": "vHanging",
    "v-ideographic": "vIdeographic",
    "view-box": "viewBox",
    "view-target": "viewTarget",
    "v-mathematical": "vMathematical",
    "word-spacing": "wordSpacing",
    "writing-mode": "writingMode",
    "x-channel-selector": "xChannelSelector",
    "x-height": "xHeight",
    "xlink:actuate": "xlinkActuate",
    "xlink:arcrole": "xlinkArcrole",
    "xlink:href": "xlinkHref",
    "xlink:role": "xlinkRole",
    "xlink:show": "xlinkShow",
    "xlink:title": "xlinkTitle",
    "xlink:type": "xlinkType",
    "xml:base": "xmlBase",
    "xml:lang": "xmlLang",
    "xmlns:xlink": "xmlnsXlink",
    "xml:space": "xmlSpace",
    "y-channel-selector": "yChannelSelector",
    "zoom-and-pan": "zoomAndPan",
}