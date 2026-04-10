import chalk from "chalk";

const stdinReader = Bun.stdin.stream().getReader();
const decoder = new TextDecoder();
let buffer = "";

// function for timing
function sleep(ms: number) {
    return new Promise((resolve) => setTimeout(resolve, ms));
}

// type writer function for imersion
async function typeWriter(text: string, delay = 30) {
    for (const char of text) {
        process.stdout.write(char);
        await sleep(delay);
    }
    console.log();
}

// New question imeplementation replacing readline sync
async function question(prompt: string): Promise<string> {
    process.stdout.write(prompt);

    while (true) {
        // Serve from buffer if we already have a full line
        const newlineIndex = buffer.indexOf("\n");
        if (newlineIndex !== -1) {
            const line = buffer.slice(0, newlineIndex).trim();
            buffer = buffer.slice(newlineIndex + 1); // keep remainder
            return line;
        }

        // Otherwise read more from stdin
        const { done, value } = await stdinReader.read();
        if (done) return buffer.trim();
        buffer += decoder.decode(value, { stream: true });
    }
}

// Choice function for limited option questions
async function choice(prompt: string, valid: string[]) {
    while (true) {
        const input = (await question(prompt)).toLowerCase().trim();
        if (valid.includes(input)) return input;
        await typeWriter(`Please enter: ${valid.join("/")}`);
    }
}

// Menu function for complex choices
async function menuChoice(prompt: string, options: string[]) {
    while (true) {
        await typeWriter(prompt);

        // Print numbered list
        for (let i = 0; i < options.length; i++) {
            await typeWriter(`${i + 1}. ${options[i]}`, 10);
        }

        const input = (await question("> ")).trim();

        // Allow direct number selection
        const choiceNum = Number(input);

        if (!isNaN(choiceNum)) {
            const index = choiceNum - 1;

            if (index >= 0 && index < options.length) {
                return index;
            }
        }

        // fallback retry message
        await typeWriter("Please enter a valid number.");
    }
}

let player = {
    "name": "placeholder",
    "hp": 100,
    "qi": 100,
    "yin": 50,
    "yang": 50,
    "elements": {
        "wood": 1,
        "fire": 1,
        "earth": 1,
        "metal": 1,
        "water": 1,
    },
    "inventory": [
        {
            name: "Dragon Seal",
            id: 1,
            description: "Seals away evil spirits.",
            type: "seal"
        }
    ]
}

async function main() {
    let response;
    let decision;
    let location;

    // Small hook intoduce and get name effectivly
    await typeWriter("Oh?");
    await sleep(1000);

    // New world name hook
    await typeWriter(`Who are ${chalk.yellow("you")}?`);

    const name = await question("> ");
    player.name = name;
    // const name = "Eli"; // for testing

    // Keep some intrigue
    await typeWriter(`Ah ${chalk.green(name)}, I see.`);
    await sleep(500);
    await typeWriter(`What a strange name...`)
    await sleep(500);

    // Establish a calm and sense of security
    await typeWriter(`Welcome to ${chalk.green("Imperial China!")}`);
    await typeWriter(`Home of the ${chalk.red("Song Dynasty!")}`);
    await sleep(750);

    await typeWriter(`I am ${chalk.green("Hao Zan.")} Just a humble shopkeeper.`);

    await sleep(1500);

    // Maybe add walk through of the village before the instense scene to increase drama and attachment
    await typeWriter(`...suddenly Hao Zan freezes and the wind stops.`);
    await sleep(750);

    await typeWriter(`Somewhere in the mountains, a bell tolls.`);
    await sleep(500);

    await typeWriter(`And the sky darkens.`);
    await sleep(500);

    await typeWriter(`The streets seem to fade like ${chalk.black("ink.")}`);
    await sleep(1500);

    await typeWriter(`A ${chalk.redBright("dark figure")} flies through the gloom`);
    await typeWriter(`Gently landing on the street.`);
    await sleep(750);

    await typeWriter(`${chalk.yellow("Quick")} get inside!`)
    await sleep(250);

    decision = await choice(`Go inside? (Y/N)`, ["y", "n"])
    await sleep(500);
    if (decision === "y") {
        await typeWriter("You rush inside as the door slams behind you.")
        await sleep(1000);

        await typeWriter(`"We should be safe..." the Shopkeeper mutters.`);
        await typeWriter("Knock...");
        await sleep(1000);

        await typeWriter(chalk.red("Knock..."));
        await sleep(800);

        await typeWriter(chalk.redBright("Knock..."));
        await sleep(400); // Maybe add player position inside with every knock

        await typeWriter(`The door ${chalk.red("BURSTS")} open with a bang!`);
        await sleep(200);

        await typeWriter(`The figure ${chalk.yellow("bolts")} in and locks ${chalk.green("eyes")} with you.`);
        await sleep(200);

        await typeWriter(`And pauses.`)
        await sleep(2000);

        await typeWriter(`Finally he speaks, "I am ${chalk.yellow("Shan Dan")}, a humble seeker of the way."`);
        await sleep(1000);

        await typeWriter("He paces slowly, the beads on his wrist clicking like bone.");
        await sleep(800);

        await typeWriter(`"The sutras spoke of a ${chalk.cyan("Ripple in Time")}..."`);
        await typeWriter(`"A traveler from a world that does not yet exist."`);
        await sleep(1200);

        await typeWriter(`He points a long, thin finger at your chest.`);
        await sleep(500);

        await typeWriter(`"You carry the ${chalk.red("Dragon Seal")}, do you not?"`);
        await typeWriter(`"The very key I have waited three lifetimes to turn."`);

    }
    else if (decision === "n") {
        await typeWriter("You hesitate... the figure turns toward you.")
        await sleep(500);

        await typeWriter(`It moves like a ${chalk.black("shadow")} across the pavement.`);
        await sleep(800);

        await typeWriter(`"Fortune favors the brave," a rasping voice whispers, "but fate punishes the stubborn."`);
        await sleep(1000);

        await typeWriter(`The monk flickers—and suddenly he is inches from your face.`);
        await typeWriter(`He taps your forehead. Your vision ${chalk.bgWhite.black("WHITE OUTS")}.`);

        player.hp -= 5;
        player.yang -= 1;
        player.yin += 1;

        await sleep(2500);

        await typeWriter("You wake up on a cold wooden floor. The smell of incense is thick.");
        await sleep(500);

        await typeWriter(`"Ah you are awake. I am ${chalk.yellow("Shan Dan")}, a humble seeker of the way."`);
        await sleep(500);

        await typeWriter(`And you...`);
        await sleep(850);

        await typeWriter(`Are far from home.`);
        await sleep(500);

        await typeWriter(`You pocess somthing I have waited a ${chalk.red("long")} time to find.`);
    }

    // Paths converge:
    await sleep(1000);
    await typeWriter(`"Tell me, Traveler," Shan Dan leans in, his breath smelling of bitter tea.`);
    await typeWriter(`"In your time... does the Dragon still sleep, or has it been forgotten?"`);

    response = await question("> ");

    await typeWriter(`"${response}?" He chuckles darkly. "How curious."`);
    await sleep(500);

    await typeWriter(`Hao Zan watches from the corner, his hands shaking as he wipes a counter that is already clean.`);
    await sleep(500);
    await typeWriter(`"Shopkeeper bring us powdered tea"`);
    await sleep(500);

    await typeWriter(`"I have traveled far for your arival. You are..."`);
    await sleep(500);
    await typeWriter(`"Less. Than I expected. But that can be quickly remedied."`);
    await sleep(500);

    await typeWriter(`"Would you let me train you foriener?" (Y/N)`);

    response = await choice("> ", ["y", "n"]);

    if (response.toLowerCase().includes("y")) {
        await typeWriter(`A thin smile touches his lips. "Wisdom is the first step to power."`);
        await sleep(500);
        await typeWriter(`"Drink the tea. It will quiet your mind and open your meridians."`);
        await sleep(500);

        player.qi += 20;
        player.yin += 10;
        player.yang -= 20;

        await typeWriter(chalk.cyan("Your Qi flows more freely, but you feel a strange numbness in your chest."));
        await sleep(500);
        await typeWriter("Come to me when you are ready to depart.");

    } else {
        await typeWriter(`Shan Dan sighs, the sound like dry leaves skittering on stone.`);
        await typeWriter(`"One cannot outrun the tides of fate, traveler. You will learn... eventually."`);
        await sleep(1000);
        await typeWriter(`He stands and walks toward the window, looking out at the unnatural darkness.`);
        await sleep(1000);
        await typeWriter(`Come to me once you change your mind.`);

    }


    let choices = [
        "Talk to Hao Zan",
        "Examine the Dragon Seal",
        "Speak with Shan Dan",
        "Leave for the Market"
    ];

let selection = null;

    while (selection !== 2) { // Loop until they choose "Speak with Shan Dan"
        selection = await menuChoice("\nWhat do you do?", choices);
        
        if (selection === 0) { // Talk to Hao Zan
            const responses = [
                `Hao Zan whispers: "Be careful, ${player.name}. That monk's tea... it smells of the grave."`,
                `"Those monks are dangerous." He pauses. "You can always come back to me."`,
                `"Good luck. Shan Dan seems... powerful."`,
            ];
            
            // Correct way to get a random index
            const randomIndex = Math.floor(Math.random() * responses.length);
            await typeWriter(responses[randomIndex]);
        } 
        else if (selection === 1) { // Examine Dragon Seal
            await typeWriter(`The ${chalk.red(player.inventory[0].name)} is cold to the touch.`);
            await typeWriter(`It seems to be absorbing the ${chalk.black("ink-like shadow")} in the room.`);
        }
        else if (selection === 3) { // Market
            await typeWriter("The door is barred from the outside. The monk clearly doesn't want you wandering off just yet.");
        }
        
        await sleep(1000);
    }

    // This triggers once they pick option 2 (Speak with Shan Dan)
    await typeWriter(`Shan Dan turns as you approach. "The stars have aligned, traveler. It is time."`);
};

main().catch(console.error);