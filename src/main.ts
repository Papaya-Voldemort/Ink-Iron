import { chapterOne } from "./scenes/chapterOne";
import { chapterTwo } from "./scenes/chapterTwo";

import { chapterTransition } from "./lib";
import chalk from "chalk";

async function main() {
    process.stdout.write("\x1Bc");

    try {
        await chapterOne();

        await chapterTransition("ACT II", "The Iron Cloud Monastery");

        await chapterTwo();
    } catch (err) {
        console.error(chalk.red("\nThe Dragon Seal has fractured... (System Error)"));
        console.error(err);
    }
};

main().catch(console.error);