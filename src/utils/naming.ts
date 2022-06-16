export function normalizeComponentName(rawName: string) {
    const compName = rawName.charAt(0).toUpperCase() + rawName.substring(1);

    const parts: string[] = [];
    let currentPart: string = '';
    for (const c of rawName) {
        if (c.toUpperCase() === c && currentPart.length) {
            parts.push(currentPart);
            currentPart = '';
        }
        currentPart += c;
    }
    parts.push(currentPart);

    const cssClass = parts.join('-').toLowerCase();

    return [compName, cssClass];
}

export function validateName(name: string): boolean {
    return /^[a-zA-Z][a-zA-Z0-9]*$/.test(name);
}