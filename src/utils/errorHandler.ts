import { exit } from "process";
import { error } from "./chalks"

export const errorUnexpected = (err: any) => {
    console.log(err);
    error("Program encountered an unexpected error. Please post an issue with your activities.");
    exit(-2);
}