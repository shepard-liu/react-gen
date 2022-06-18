import chalk from "chalk";

const brandTag = chalk.blue("[react-gen] ");

// Console utilities
export const warn = (...args: any) => { if (args) console.warn(brandTag + chalk.yellow(...args)) };
export const error = (...args: any) => { if (args) console.error(brandTag + chalk.red(...args)) };
export const log = (...args: any) => { if (args) console.log(brandTag + chalk(...args)) };
export const success = (...args: any) => { if (args) console.log(brandTag + chalk.green(...args)) };

export const brandWrite = () => { process.stdout.write(brandTag) };

export const warnWrite = (...args: any) => { if (args) process.stdout.write(chalk.yellow(...args)) };
export const errorWrite = (...args: any) => { if (args) process.stdout.write(chalk.red(...args)) };
export const logWrite = (...args: any) => { if (args) process.stdout.write(chalk(args)) };
export const successWrite = (...args: any) => { if (args) process.stdout.write(chalk.green(...args)) };

export const newLines = (num: number) => {
    if (num < 0) throw new Error("Invalid number of new lines to log.");
    console.log(Array(num).fill('\n').join(''));
}
