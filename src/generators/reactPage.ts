
export interface ReactPageGeneratorConfig {
    fileHeader: string,
    pageName: string,
    cssClass: string,
    cssPreprocessor: string,
    customCode: string
}

export default function generateReactPage({
    fileHeader,
    pageName,
    cssClass,
    cssPreprocessor,
    customCode
}) {
    return `\
${fileHeader}\
${customCode}\
import React from 'react';

// Components

// Interfaces

// Stylesheet
import './${pageName}.${cssPreprocessor}';

export const ${pageName} = (): JSX.Element => {
    
    return (
        <div className={\`${cssClass}\`}>
        </div>
    );
};

export default ${pageName}
`;
}