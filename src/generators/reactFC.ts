export interface reactFCGeneratorConfig {
    fileHeader: string,
    customCode: string,
    componentName: string,
    cssClass: string,
    cssPreprocessor: string,
    styleFilenameNoExt: string,
    wrapNamespace: boolean,
    forwardRef: boolean,
    baseElementTag: string,
    baseElementType: string,
}

export default function generateReactFC({
    baseElementTag,
    componentName,
    cssClass,
    styleFilenameNoExt,
    cssPreprocessor,
    customCode,
    fileHeader,
    forwardRef,
    wrapNamespace,
    baseElementType,
}: reactFCGeneratorConfig) {

    const propsExtends = baseElementTag
        ? forwardRef
            ? ` extends React.ComponentPropsWithRef<'${baseElementTag}'>`
            : ` extends React.ComponentPropsWithoutRef<'${baseElementTag}'>`
        : '';

    const classNameProp = baseElementTag
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
    className = '',
    ...otherProps
}, ref) => {`
        : `export const ${componentName} = ({
    className = '',
    ...otherProps
}: ${propsInterfaceName}): JSX.Element => {`;

    // Template
    return `\
${fileHeader}\
import React from 'react';

// ----- Components ----- //

// ----- Interfaces ----- //

// ----- Stylesheet ----- //
import './${styleFilenameNoExt}.${cssPreprocessor}';

${customCode}\

${propsInterface}
${functionSignature}
    return (
        <${baseElementTag} className={\`${cssClass} \${className} \`}${forwardRef ? ' ref={ref} ' : ' '}{...otherProps}>
        </${baseElementTag}>
    );
}${forwardRef ? ')' : ''};
${namespaceExport}
`;
}