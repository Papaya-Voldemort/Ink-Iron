import { typeWriter, player, sleep, question, menuChoice, choice } from "../lib";
import chalk from "chalk";
import { initiateBossCombat, initiateCombat } from "../combat";

import type { Combatant } from '../combat';

export async function chapterThree() {
    // REMOVE ONCE CHAPTER THREE IS DONE:
    const warning = await choice("Chapter 3 is unfinished and. may be broken do you want to continue? (y/N)", ["y", "n"]);
    if (warning === "n") {
        typeWriter("Well thanks for playing and check back soon for the finished chapter!");
        return
    }
    await typeWriter("Moring light blinds you as you sit up.");
    await sleep(500);
    await typeWriter("You and Shan Dan had been traveling for days to the Song Capital of Kaifeng.");
    await sleep(500);
    await typeWriter("Last night you arrived and stayed in the local monastery.");
    await sleep(500);
    await typeWriter(`Shan Dan sands up, "I have busy to attend to"`);
    await typeWriter(`"Feel free to spend the day roaming the city."`);
    await typeWriter(`"Just remember: ${chalk.red("KEEP THE SEAL SAFE!")} There are those who would take advantage of it"`)
    
    
}