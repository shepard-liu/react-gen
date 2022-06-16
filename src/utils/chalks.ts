import chalk from "chalk";

const brandTag = chalk.blue("[react-gen] ");

// Console utilities
export const warn = (...args: any) => console.warn(brandTag + chalk.yellow(...args));
export const error = (...args: any) => console.error(brandTag + chalk.red(...args));
export const log = (...args: any) => console.log(brandTag + chalk(...args));
export const success = (...args: any) => console.log(brandTag + chalk.green(...args));

export const brandWrite = () => { process.stdout.write(brandTag) };

export const warnWrite = (...args: any) => process.stdout.write(chalk.yellow(...args));
export const errorWrite = (...args: any) => process.stdout.write(chalk.red(...args));
export const logWrite = (...args: any) => process.stdout.write(chalk(args));
export const successWrite = (...args: any) => process.stdout.write(chalk.green(...args));

export const red = chalk.red;
export const green = chalk.green;
export const blue = chalk.blue;
export const yellow = chalk.yellow;
export const magenta = chalk.magenta;
export const cyan = chalk.cyan;