import chalk from "chalk";

const speed = 1;
export const SKIP_KEYS = new Set([' ', 'r', 'R']); // Keys that skip text (space and r)

const decoder = new TextDecoder();
const ANSI_ESCAPE = /\x1B(?:[@-Z\\-_]|\[[0-?]*[ -/]*[@-~])/g;

let buffer = "";
let inputInitialized = false;
let isTypewriterActive = false;
let isQuestionActive = false;
let skipRequested = false;
let skipWaiter: (() => void) | null = null;
let questionResolver: ((line: string) => void) | null = null;

function decodeChunk(chunk: unknown): string {
    if (typeof chunk === "string") return chunk;
    if (chunk instanceof Uint8Array) return decoder.decode(chunk);
    if (chunk instanceof ArrayBuffer) return decoder.decode(new Uint8Array(chunk));
    if (ArrayBuffer.isView(chunk)) {
        return decoder.decode(new Uint8Array(chunk.buffer, chunk.byteOffset, chunk.byteLength));
    }
    return "";
}

function ensureInputInitialized() {
    if (inputInitialized) return;
    inputInitialized = true;

    if (process.stdin.isTTY) {
        process.stdin.setRawMode?.(true);
    }

    process.stdin.resume();
    process.stdin.on("data", (chunk) => {
        handleInputChunk(decodeChunk(chunk));
    });

    process.on("exit", () => {
        if (process.stdin.isTTY) {
            process.stdin.setRawMode?.(false);
        }
    });
}

export function sleep(ms: number) {
    return new Promise((resolve) => setTimeout(resolve, ms));
}

function gaussianMs(stddev: number): number {
    const u = 1 - Math.random();
    const v = Math.random();
    return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v) * stddev;
}

function tokenizeOutput(text: string): string[] {
    const tokens: string[] = [];
    let lastIndex = 0;

    // ANSI codes need to be written atomically or the terminal prints their raw bytes.
    for (const match of text.matchAll(ANSI_ESCAPE)) {
        const index = match.index ?? 0;
        if (index > lastIndex) {
            tokens.push(...[...text.slice(lastIndex, index)]);
        }
        tokens.push(match[0]);
        lastIndex = index + match[0].length;
    }

    if (lastIndex < text.length) {
        tokens.push(...[...text.slice(lastIndex)]);
    }

    return tokens;
}

function waitOrSkip(ms: number): Promise<void> {
    if (skipRequested) return Promise.resolve();

    return new Promise((resolve) => {
        const onSkip = () => {
            clearTimeout(timer);
            if (skipWaiter === onSkip) {
                skipWaiter = null;
            }
            resolve();
        };

        const timer = setTimeout(() => {
            if (skipWaiter === onSkip) {
                skipWaiter = null;
            }
            resolve();
        }, Math.max(12, ms));

        skipWaiter = onSkip;
    });
}

function consumeBufferedLine(): string | null {
    const newlineIndex = buffer.indexOf("\n");
    if (newlineIndex === -1) return null;

    const line = buffer.slice(0, newlineIndex).trim();
    buffer = buffer.slice(newlineIndex + 1);
    return line;
}

function currentBufferedLine(): string {
    const newlineIndex = buffer.indexOf("\n");
    return newlineIndex === -1 ? buffer : buffer.slice(0, newlineIndex);
}

function resolveQuestionFromBuffer(): boolean {
    if (!questionResolver) return false;

    const line = consumeBufferedLine();
    if (line === null) return false;

    const resolve = questionResolver;
    questionResolver = null;
    process.stdout.write("\n");
    resolve(line);
    return true;
}

function handleInputChunk(rawChunk: string) {
    const chunk = rawChunk.replace(ANSI_ESCAPE, "");

    for (const char of chunk) {
        if (char === "\u0003") {
            if (process.stdin.isTTY) {
                process.stdin.setRawMode?.(false);
            }
            process.exit(130);
        }

        if (isTypewriterActive && SKIP_KEYS.has(char)) {
            skipRequested = true;
            skipWaiter?.();
            continue;
        }

        if (!isQuestionActive) continue;

        if (char === "\r" || char === "\n") {
            buffer += "\n";
            resolveQuestionFromBuffer();
            continue;
        }

        if (char === "\u007f" || char === "\b") {
            if (!buffer || buffer.endsWith("\n")) continue;
            buffer = buffer.slice(0, -1);
            if (questionResolver) {
                process.stdout.write("\b \b");
            }
            continue;
        }

        if (char < " ") continue;

        buffer += char;
        if (questionResolver) {
            process.stdout.write(char);
        }
    }
}

// ── Typing profiles ───────────────────────────────────────────────────────────
export const TypingProfile = {
    NARRATOR: { base: 45, sentencePause: [300, 500] as [number, number] },
    DIALOGUE: { base: 60, sentencePause: [250, 400] as [number, number] },
    COMBAT:   { base: 18, sentencePause: [80,  120] as [number, number] },
} as const;

type Profile = typeof TypingProfile[keyof typeof TypingProfile];

const FAST_BIGRAMS = new Set([
    'th','he','in','er','an','re','nd','at','on','nt',
    'ha','es','st','en','ed','to','it','ou','ea','hi',
    'is','or','ti','as','te','et','ng','of','al','de',
]);

const PAUSE_AFTER: Record<string, [number, number]> = {
    '.': [300, 180], '!': [300, 180], '?': [300, 180],
    '…': [400, 0],   '—': [250, 0],   '·': [180, 0],
    ',': [80,  40],  ';': [100, 40],  ':': [100, 40],
    '\n':[200, 0],
};
const SENTENCE_END = new Set(['.', '!', '?']);

// ── Typewriter ────────────────────────────────────────────────────────────────
export async function typeWriter(
    text: string,
    profile: Profile = TypingProfile.NARRATOR,
): Promise<void> {
    ensureInputInitialized();
    const tokens = tokenizeOutput(text);
    let previousVisibleChar = '';

    skipRequested = false;
    isTypewriterActive = true;

    try {
        for (let i = 0; i < tokens.length; i++) {
            if (skipRequested) {
                process.stdout.write(tokens.slice(i).join(""));
                break;
            }

            const token = tokens[i]!;
            process.stdout.write(token);

            if (token.startsWith("\u001b")) continue;

            let ms = profile.base * speed;

            if (FAST_BIGRAMS.has((previousVisibleChar + token).toLowerCase())) ms *= 0.6;
            if (/[^a-zA-Z\s.,;:!?'"…—–·\n]/.test(token)) ms *= 1.7;
            if (token === ' ') ms += 25 + Math.random() * 45;

            const pause = PAUSE_AFTER[token];
            if (pause) {
                const [base, variance] = pause;
                const scale = SENTENCE_END.has(token)
                    ? profile.sentencePause[0] / 300
                    : 1;
                ms += (base + Math.random() * variance) * scale;
            }

            ms += gaussianMs(profile.base * 0.2);
            previousVisibleChar = token;
            await waitOrSkip(ms);
        }

        process.stdout.write('\n');
    } finally {
        isTypewriterActive = false;
        skipRequested = false;
        skipWaiter = null;
    }
}

export async function question(prompt: string): Promise<string> {
    ensureInputInitialized();
    isQuestionActive = true;
    process.stdout.write(prompt);

    const pendingInput = currentBufferedLine();
    if (pendingInput) {
        process.stdout.write(pendingInput);
    }

    const line = consumeBufferedLine();
    if (line !== null) {
        isQuestionActive = false;
        process.stdout.write("\n");
        return line;
    }

    return new Promise((resolve) => {
        questionResolver = (line) => {
            isQuestionActive = false;
            resolve(line);
        };
    });
}

export async function choice(prompt: string, valid: string[]) {
    while (true) {
        const input = (await question(prompt)).toLowerCase().trim();
        if (valid.includes(input)) return input;
        await typeWriter(`Please enter: ${valid.join("/")}`, TypingProfile.COMBAT);
    }
}

export async function menuChoice(prompt: string, options: string[]) {
    while (true) {
        await typeWriter(prompt);
        for (let i = 0; i < options.length; i++) {
            await typeWriter(`${i + 1}. ${options[i]}`, TypingProfile.COMBAT);
        }

        const input = (await question("> ")).trim();
        const choiceNum = Number(input);
        if (!isNaN(choiceNum)) {
            const index = choiceNum - 1;
            if (index >= 0 && index < options.length) return index;
        }
        await typeWriter("Please enter a valid number.");
    }
}

export async function chapterTransition(title: string, subtitle: string) {
    process.stdout.write("\x1Bc");
    const rows = process.stdout.rows || 24;
    console.log("\n".repeat(Math.floor(rows / 3)));
    await typeWriter(chalk.bold.redBright(centerText(title)), TypingProfile.NARRATOR);
    await typeWriter(chalk.white(centerText(subtitle)), TypingProfile.DIALOGUE);
    await sleep(2500);
    process.stdout.write("\x1Bc");
}

export function centerText(text: string): string {
    const width = process.stdout.columns || 80;
    const padding = Math.max(0, Math.floor((width - text.length) / 2));
    return " ".repeat(padding) + text;
}

export let player: any = {
    name: "placeholder",
    hp: 100,
    qi: 20,
    yin: 10,
    yang: 10,
    strength: 5,
    defense: 2,
    maxHp: 100,
    elements: { wood: 1, fire: 1, earth: 1, metal: 1, water: 1 },
    inventory: [
        { name: "Dragon Seal", id: 1, description: "Seals away evil spirits.", type: "seal" }
    ]
};
