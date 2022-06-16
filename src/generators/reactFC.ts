export interface reactFCGeneratorConfig {
    fileHeader: string,
    customCode: string,
    componentName: string,
    cssClass: string,
    cssPreprocessor: string,
    wrapNamespace: boolean,
    forwardRef: boolean,
    baseElementTag: string,
    baseElementType: string,
    baseElementAttributeType: string
}

export default function reactFCGenerator({
    baseElementTag,
    baseElementType,
    baseElementAttributeType,
    componentName,
    cssClass,
    cssPreprocessor,
    customCode,
    fileHeader,
    forwardRef,
    wrapNamespace
}: reactFCGeneratorConfig) {

    const propsExtends = baseElementAttributeType
        ? ` extends ${baseElementAttributeType}`
        : '';

    const classNameProp = baseElementAttributeType
        ? ''
        : 'className: string';

    const propsInterface = wrapNamespace
        ? ''
        : `
export interface ${componentName}Props${propsExtends}{
    ${classNameProp}    
}
`;

    const namespaceExport = wrapNamespace
        ? `
// eslint-disable-next-line
export namespace ${componentName} {
    export interface Props${propsExtends} {
        ${classNameProp}
    }
}`
        : '';

    const propsInterfaceName = wrapNamespace ? componentName + '.Props' : componentName + 'Props';

    const functionSignature = forwardRef
        ? `export const ${componentName} = React.forwardRef<${baseElementType || 'HTMLElement'}, ${propsInterfaceName}>(({
    className,
    ...otherProps
}, ref) => {`
        : `export const ${componentName} = ({
    className,
    ...otherProps
}: ${propsInterfaceName}): JSX.Element => {`;

    // Template
    return `\
${fileHeader}\
${customCode}\
import React from 'react';

// ----- Components ----- //

// ----- Interfaces ----- //

// ----- Stylesheet ----- //
import './${componentName}.${cssPreprocessor}';
${propsInterface}
${functionSignature}
    return (
        <${baseElementTag} className={\`${cssClass} \${className || ''} \`}${forwardRef ? ' ref={ref} ' : ' '}{...otherProps}>
        </${baseElementTag}>
    );
}${forwardRef ? ')' : ''};
${namespaceExport}
`;
}