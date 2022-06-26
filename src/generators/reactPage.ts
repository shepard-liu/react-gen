
export interface ReactPageGeneratorConfig {
    fileHeader: string,
    pageName: string,
    cssClass: string,
    cssPreprocessor: string,
    customCode: string,
    styleFilenameNoExt: string,
}

export default function generateReactPage({
    fileHeader,
    pageName,
    cssClass,
    cssPreprocessor,
    styleFilenameNoExt,
    customCode
}) {
    return `\
${fileHeader}\
import React from 'react';

// Components

// Interfaces

// Stylesheet
import './${styleFilenameNoExt}.${cssPreprocessor}';

${customCode}\

export const ${pageName} = (): JSX.Element => {
    
    return (
        <div className={\`${cssClass}\`}>
        </div>
    );
};

export default ${pageName}
`;
}