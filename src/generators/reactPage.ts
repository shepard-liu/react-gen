export default function reactPageGenerator(
    fileHeader: string,
    pageName: string,
    cssClass: string,
    cssPreprocessor: string
) {
    return `${fileHeader}
import React from 'react';

// Components

// Interfaces

// Stylesheet
import './${pageName}.${cssPreprocessor}';

export const ${pageName} = (): JSX.Element => {
    
    return (
        <div className={\`${cssClass} \${className || ''} \`}>
        </div>
    );
};

export default ${pageName}
`;
}