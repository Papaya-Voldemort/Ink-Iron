import { typeWriter, player, sleep, question, menuChoice, choice } from "../lib";
import chalk from "chalk";
import { initiateBossCombat, initiateCombat } from "../combat";

import type { Combatant } from '../combat';

const monasterySpirit: Combatant = {
    name: chalk.red("Weak Spirit"),
    hp: 30,
    maxHp: 30,
    qi: 15,
    yin: 30,
    yang: 10,
    strength: 4,
    defense: 3,
    inventory: []
};

export async function chapterTwo() {
    await typeWriter(`The ascent is ${chalk.red("brutal.")}`);
    await typeWriter(`The stone steps are slick with mildew and feel harder with every step.`);
    await sleep(1000);

    // Dynamic stat check
    if (player.yin > player.yang) {
        await typeWriter(chalk.cyan("The shadows between the pines seem to bow as you pass."));
    } else {
        await typeWriter(chalk.yellow("The cold bites at your skin, testing your resolve."));
    };

    await sleep(1000);
    await typeWriter(`"${player.name}," Shan Dan calls out without looking back.`);
    await typeWriter(`"Beyond this gate, the laws of your world are... ${chalk.red("suggestions.")}"`);
    await sleep(1000);

    await typeWriter(`Before you stands a massive gate made of ${chalk.black("black iron")}, etched with ${chalk.red("glowing red sutras.")}`)

    let choices = [
        "Push the gate open",
        "Ask Shan Dan about the sutras",
        "Check your pulse (Meditate)",
    ]

    let selection;
    let hasMeditated = false;

    while (true) {
        selection = await menuChoice("\nThe Iron Gate looms. What now?", choices);
        if (selection === 0) {
            await typeWriter("The iron is freezing. It drains the warmth from your palms.");
            await sleep(750);
            await typeWriter("You fail to open the gate.");
            player.hp -= 2;
        } else if (selection === 1) {
            await typeWriter(`"They are bindings," he whispers.`)
            await typeWriter(`"To keep the ${chalk.cyan("spirits")} in... or to keep the world out."`);
            await sleep(1000);
            await typeWriter("He places a hand on the iron. The red sutras flare brightly.");
            await typeWriter("The gate groans and swings open.");
            break;
        } else if (selection === 2) {
            await typeWriter("You close your eyes, slowing your breath against the mountain chill.");
            await sleep(1500);

            // Cultivation logic
            player.qi += 10;
            player.yang += 2;
            player.yin -= 2;
            player.hp += 10;

            await typeWriter(chalk.green("Your Qi stabilizes. You feel a strange warmth in your chest."));
            await sleep(1000);
            await typeWriter("Shan Dan watches you. 'Good. You will need that focus.'");
            await typeWriter("He pushes the gate open with a single finger.");
            break;
        }
    }

    await sleep(1500);
    await typeWriter(`You step through the threshold into the ${chalk.bgRed.black(" Iron Cloud Monastery. ")}`);

    await sleep(1000);
    await typeWriter(`A ghostly figure bobs up to you with ${chalk.red("malice.")}`);
    await typeWriter(chalk.red("The air grows heavy. Combat begins!"));
    await sleep(1000);

    const combatPlayer = structuredClone(player);

    const monasteryResult = await initiateCombat(combatPlayer, monasterySpirit);

    const playerWon = monasteryResult.winner.hp > 0;

    if (playerWon) {
        await typeWriter(chalk.green("\nThe spirit fades away. The path forward is clear."));
        player.hp = combatPlayer.hp;
        player.qi = combatPlayer.qi;
        player.yin = combatPlayer.yin;
        player.yang = combatPlayer.yang;

    } else {
        await typeWriter(chalk.red("\nYour vision fades as you collapse to the stone floor..."));
        process.exit();
    }

    await typeWriter(`"Nicely done!" Shan Dan claps his hands!`)
    await sleep(500);
    await typeWriter(`You do improve quickly!`);
    await sleep(500);
    await typeWriter(`Walking further into the monastery Shan Dan waves you in.`);
    await sleep(750);

    await typeWriter(`A small figure steps into the hall.`);
    await sleep(500);

    await typeWriter(`The Abbot adjusts its lenses as Shan Dan enters.`);
    await typeWriter(chalk.cyan(`"Patron Shan Dan."`));
    await sleep(500);

    await typeWriter(chalk.cyan(`"It has been some time since your last visit."`));
    await sleep(750);

    await typeWriter(chalk.cyan(`"You’ve brought another external variable."`));
    await typeWriter(chalk.cyan(`"I assume this is another trial."`));
    await sleep(1000);

    await typeWriter(`Their eyes briefly shift toward you—but they do not address you.`);
    await sleep(750);

    await typeWriter(chalk.cyan(`"Enjoy the facilities and let me know if you have any needs I can attend to."`));
    await sleep(500);
    await typeWriter(`Shan Dan nods "Please prepare the cliff side for this evening"`)
    await sleep(500);
    await typeWriter(`${chalk.cyan(`"It will be done."`)} The Abbot glides out of the room leaving you alone.`)
    await sleep(500);
    await typeWriter(`Shan Dan turns to you "Feel free to explore I will meet you at the ${chalk.cyan("springs")}"`);

    let explorationChoices = [
        "Visit the Library of Unwritten History",
        "Enter the Hall of Bleeding Ink",
        "Meditate at the Iron Springs",
    ];

    let visited = { library: false, hall: false, springs: false };

    while (!visited.library || !visited.hall || !visited.springs) {
        let choiceIndex = await menuChoice("\nWhere would you like to go?", explorationChoices);

        if (choiceIndex === 0 && !visited.library) {
            await typeWriter(`The Library is filled with blank scrolls that pulse like a heartbeat.`);
            await sleep(500);
            await typeWriter(`You touch a scroll. For a second, you see lines of ${chalk.green("code")}—your own life, compiled.`);
            player.qi += 15;
            visited.library = true;
            await typeWriter(chalk.cyan("Your understanding of your own 'Source' deepens."));
        }
        else if (choiceIndex === 1 && !visited.hall) {
            await typeWriter(`The walls of this hall bleed thick, black ink that never hits the floor.`);
            await sleep(500);
            await typeWriter(`The shadows here bow to the ${chalk.red("Dragon Seal")} in your pocket.`);
            await sleep(500);
            await typeWriter(`You notice a black ink stained rock on the ground.`)

            let rockChoices = [
                "Take the rock",
                "Destroy the rock",
                "Ignore the rock",
            ]

            let rockChoice = await menuChoice(`What do you do?`, rockChoices);

            await sleep(500);
            if (rockChoice === 0) {
                await typeWriter(`You pick up the rock and place it in your pocket.`);
                player.inventory.push({
                    name: "Ink-Stained Rock",
                    id: 2,
                    description: "A heavy stone dripping with eternal ink.",
                    type: "curio"
                });
                await sleep(1000);
                await typeWriter(chalk.magenta("The ink feels heavy against your leg."));
            } else if (rockChoice === 1) {
                await typeWriter(`Destroy the rock! How would you ever do that?`);
                await sleep(1000);
                await typeWriter(`You move on deciding it was silly.`)
            } else if (rockChoice === 2) {
                await typeWriter(`You move on it's not worth your time.`)
            }


            player.yin += 5;
            visited.hall = true;
            await typeWriter(chalk.magenta("The ink whispers secrets of the void."));
        }
        else if (choiceIndex === 2) {
            // Only allow the springs (and the final spar) if they've seen the other rooms
            if (!visited.library || !visited.hall) {
                await typeWriter("The springs are guarded by a mist. Perhaps explore the Library and Hall first.");
                continue;
            }

            await typeWriter(chalk.red("The springs represent the point of no return. Are you ready? (Y/N)"));
            const response = await choice("> ", ["y", "n"]);

            if (response === "y") {
                await typeWriter("You meditate at the springs, washing the ink from your hands...");
                player.hp = player.maxHp;
                player.yang += 5;
                visited.springs = true;
                break;
            }
        } else {
            await typeWriter("You have already gleaned what you can from this place.");
        }
    }

    await typeWriter(`The cliffs are waiting. There is somthing we must do.`);

    await typeWriter(`The cliff edge is treacherous. One wrong step and the clouds would swallow you whole.`);
    await sleep(800);

    await typeWriter(`Shan Dan stands with his back to you, watching the ${chalk.yellow("clouds")} swirl below.`);
    await sleep(1000);

    await typeWriter(`"Tell me, ${player.name}," he says without turning.`);
    await typeWriter(`"In your world, is strength something you are born with, or something you ${chalk.yellow("develop")}?"`)
    
    const response = await question("> ");

    await typeWriter(`"I see. Here, strength is simply the ability to remain ${chalk.white("constant")} while the world flickers."`);
    await sleep(1000);

    await typeWriter(`He turns. His robes are no longer fabric; they look like ${chalk.bgBlack.white(" flowing ink ")}.`);
    await typeWriter(`"Let us spar, show me your strength. Do not hold back."`);
    await sleep(1500);

    // Prepare the mentor for the spar
    const mentorShanDan: Combatant = {
        name: chalk.yellow("Mentor Shan Dan"),
        hp: 250, 
        maxHp: 250,
        qi: 100,
        yin: 50,
        yang: 50,
        strength: 10,
        defense: 6,
        inventory: []
    };

    const shanDanMoves = [
        {
            name: "Ink Whisper",
            power: 12,
            cost: { qi: 3, hp: 0 },
            reqs: { yin: 0, yang: 0, item: [] },
            flavor: "The shadows whisper your name..."
        },
        {
            name: "Shadow Weaving",
            power: 18,
            cost: { qi: 5, hp: 0 },
            reqs: { yin: 0, yang: 0, item: [] },
            flavor: "Darkness takes form around your foes."
        },
        {
            name: "Void Palm Strike",
            power: 22,
            cost: { qi: 8, hp: 3 },
            reqs: { yin: 0, yang: 0, item: [] },
            flavor: "The void itself becomes his palm!"
        },
        {
            name: "Sutras of Binding",
            power: 20,
            cost: { qi: 7, hp: 0 },
            reqs: { yin: 0, yang: 0, item: [] },
            flavor: "Ancient words carve through reality..."
        },
        {
            name: "Way of Constant Flow",
            power: 16,
            cost: { qi: 4, hp: 2 },
            reqs: { yin: 0, yang: 0, item: [] },
            flavor: "Like water flowing eternal, unstoppable."
        },
        {
            name: "Three Lifetimes Convergence",
            power: 35,
            cost: { qi: 15, hp: 5 },
            reqs: { yin: 0, yang: 0, item: [] },
            flavor: "He stands as three, across three lives, across three worlds!",
            phaseReq: 50
        }
    ];


    const sparPlayer = structuredClone(player);
    const result = await initiateBossCombat(sparPlayer, mentorShanDan, shanDanMoves);

    await sleep(1000);
    await typeWriter("\x1Bc"); // Clear screen for the aftermath

    // Display final stats
    await typeWriter(`${sparPlayer.name}: ${sparPlayer.hp}/${sparPlayer.maxHp} HP`);
    await typeWriter(`${mentorShanDan.name}: ${mentorShanDan.hp}/${mentorShanDan.maxHp} HP`);
    await sleep(1000);

    if (sparPlayer.hp > 0) {
        await typeWriter(`Shan Dan breathes steadily, a small cut on his cheek bleeding ${chalk.red("golden ink")}.`);
        await sleep(1000);
        await typeWriter(`"You have done more than survive. You have left a mark on the Way."`);
    } else {
        await typeWriter(`You lie on the cold stone, gasping for air. Shan Dan stands over you, offering a hand.`);
        await sleep(1000);
        await typeWriter(`"Failure is merely a ${chalk.red("difficult change")} for the soul. Stand up."`);
    }

    await sleep(1500);
    await typeWriter(`"The Iron Cloud Monastery has taught you all it can."`);
    await typeWriter(`"Go now. The ${chalk.red("Dragon Seal")} is restless, and the Song Dynasty is waiting."`);
    
    await sleep(2000);
    await typeWriter(chalk.green.bold("\n--- END OF CHAPTER TWO ---"));
}