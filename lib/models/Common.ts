import { z } from "zod";

export const TimestampSchema = z.preprocess((val) => {
    if (typeof val === "string") {
        // Replace space with 'T' to make it ISO 8601–compatible
        const isoString = val.replace(" ", "T");
        return new Date(isoString);
    }
    return val;
}, z.date());

