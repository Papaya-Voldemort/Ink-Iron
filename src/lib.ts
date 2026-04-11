import chalk from "chalk";

const speed = 1; // change for faster test

const decoder = new TextDecoder();
let buffer = "";
let stdinReader: any = null;

function getStdinReader(): any {
    if (!stdinReader) {
        stdinReader = Bun.stdin.stream().getReader();
    }
    return stdinReader;
}

// function for timing
export function sleep(ms: number) {
    return new Promise((resolve) => setTimeout(resolve, ms));
}

// type writer function for immersion
export async function typeWriter(text: string, delay = 30) {
    delay *= speed;
    for (const char of text) {
        process.stdout.write(char);
        await sleep(delay);
    }
    console.log();
}

// New question implementation replacing readline sync
export async function question(prompt: string): Promise<string> {
    process.stdout.write(prompt);

    const reader = getStdinReader();
    
    while (true) {
        // Serve from buffer if we already have a full line
        const newlineIndex = buffer.indexOf("\n");
        if (newlineIndex !== -1) {
            const line = buffer.slice(0, newlineIndex).trim();
            buffer = buffer.slice(newlineIndex + 1); // keep remainder
            return line;
        }

        // Otherwise read more from stdin - read until we get a newline
        let foundLine = false;
        while (!foundLine) {
            const { done, value } = await reader.read();
            if (done) {
                // EOF - return whatever we have
                const result = buffer.trim();
                buffer = "";
                return result;
            }
            buffer += decoder.decode(value, { stream: true });
            
            // Check if we have a complete line now
            const idx = buffer.indexOf("\n");
            if (idx !== -1) {
                const line = buffer.slice(0, idx).trim();
                buffer = buffer.slice(idx + 1);
                return line;
            }
        }
    }
}

// Choice function for limited option questions
export async function choice(prompt: string, valid: string[]) {
    while (true) {
        const input = (await question(prompt)).toLowerCase().trim();
        if (valid.includes(input)) return input;
        await typeWriter(`Please enter: ${valid.join("/")}`);
    }
}

// Menu function for complex choices
export async function menuChoice(prompt: string, options: string[]) {
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

export async function chapterTransition(title: string, subtitle: string) {
    process.stdout.write("\x1Bc"); // Clear screen
    const rows = process.stdout.rows || 24;

    console.log("\n".repeat(Math.floor(rows / 3)));
    await typeWriter(chalk.bold.redBright(centerText(title)), 100);
    await typeWriter(chalk.white(centerText(subtitle)), 50);
    await sleep(2500);

    process.stdout.write("\x1Bc"); // Clear for the next scene
}

// Helper to center text based on terminal width
export function centerText(text: string): string {
    const width = process.stdout.columns || 80;
    const padding = Math.max(0, Math.floor((width - text.length) / 2));
    return " ".repeat(padding) + text;
}

export let player: any = {
    "name": "placeholder",
    "hp": 100,
    "qi": 20,
    "yin": 10,
    "yang": 10,
    "strength": 5,
    "defense": 2,
    "maxHp": 100,
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