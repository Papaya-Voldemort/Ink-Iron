# 🥋 Wuxia CLI Toolkit (Bun + TypeScript)

A quick reference for building CLI games using:
- `readline-sync` → input system
- `chalk` → terminal colors
- Bun runtime

---

# 📦 Setup

```bash
bun add readline-sync chalk
```

---

# ⌨️ readline-sync (INPUT)

```ts
import readlineSync from "readline-sync";
```

## 🟢 Text input
```ts
const name = readlineSync.question("Enter your name: ");
```

---

## 🔢 Number input
```ts
const level = readlineSync.questionInt("Enter level: ");
```

---

## ❓ Yes / No prompt
```ts
const confirm = readlineSync.keyInYN("Enter the temple?");
```

Returns:
- `true` → yes
- `false` → no

---

## 🎮 Limited choices (menu input)
```ts
const action = readlineSync.keyIn("Attack or Run? (a/r) ", {
  limit: "ar"
});
```

---

## 🔒 Hidden input
```ts
const secret = readlineSync.question("Enter technique: ", {
  hideEchoBack: true
});
```

---

## ⏸ Pause
```ts
readlineSync.question("Press Enter to continue...");
```

---

# 🎨 chalk (COLORS)

```ts
import chalk from "chalk";
```

## Basic colors

```ts
console.log(chalk.red("Damage taken"));
console.log(chalk.green("Healed"));
console.log(chalk.yellow("Warning"));
console.log(chalk.blue("Qi restored"));
```

---

## Styled text

```ts
console.log(chalk.bold.red("CRITICAL HIT!"));
console.log(chalk.greenBright("Victory achieved"));
```

---

## Suggested Wuxia color system

| Meaning | Color |
|--------|------|
| Damage | red |
| Healing | green |
| Qi / energy | blue |
| Warnings | yellow |
| Story text | white |

---

# 🔁 Basic Game Loop Pattern

```ts
while (true) {
  console.log("\n=== Wuxia Path ===");

  const choice = readlineSync.question(
    "1) Travel\n2) Train\n3) Rest\n> "
  );

  if (choice === "1") {
    console.log("You travel through misty mountains...");
  }

  if (choice === "2") {
    console.log("You refine your inner qi...");
  }

  if (choice === "3") {
    console.log("You rest under bamboo shadows...");
  }
}
```

---

# ⚔️ Simple Combat System

```ts
let playerHP = 100;
let enemyHP = 50;

while (enemyHP > 0 && playerHP > 0) {
  const action = readlineSync.question("Attack or defend? (a/d) ", {
    limit: "ad"
  });

  if (action === "a") {
    enemyHP -= 10;
    console.log(chalk.red("You strike the enemy! -10 HP"));
  } else {
    playerHP -= 5;
    console.log(chalk.yellow("You defend but take damage -5 HP"));
  }

  console.log(`HP: ${playerHP} | Enemy: ${enemyHP}`);
}
```

---

# 🧠 Core Game Model

Every CLI game follows:

```
STATE → INPUT → UPDATE → OUTPUT → LOOP
```

Example state:
- HP
- Qi
- Rank
- Inventory

---

# 🧱 Suggested Project Structure

```
src/
  main.ts        # game loop
  combat.ts      # battle system
  events.ts      # random encounters
  player.ts      # stats
  utils.ts       # helpers
```

---

# 🥋 Design Philosophy

- Keep loops simple
- Prefer readable over complex
- Everything should feel like:
  "input → consequence → story"

---

# 🧧 Wuxia CLI Add-On Guide

This includes:
- Basic Song Dynasty China context (for story flavor)
- Simple `sleep` / `wait` equivalent in Bun
- Typewriter text effect for CLI immersion

---

# 🏯 Basic China Context (Song Dynasty vibe)

> Good for story flavor, not strict history

The **Song Dynasty (960–1279 AD)** is often remembered for:

## 🧠 Culture & Society
- Highly educated bureaucratic government (civil exams)
- Flourishing poetry, art, and philosophy (Confucianism)
- Cities were extremely advanced and urbanized
- Paper money was first widely used

## ⚔️ Martial World (Wuxia-style interpretation)
- Real military power was weaker than earlier dynasties
- Many “martial heroes” stories are fictionalized versions of this era
- Traveling swordsmen and sects = literary invention, not historical fact
- Strong contrast between scholars vs warriors

## 🏯 Common Wuxia Settings Inspired by This Era
- Mountain sects (hidden martial schools)
- Imperial courts with corruption plots
- Trade towns + bustling night markets
- Bamboo forests, temples, riverside inns

👉 In your game:
Think of it as:
> “A peaceful but politically unstable world where martial legends rise in the shadows.”

---

# ⏳ Time Delay (Bun equivalent of `time.sleep`)

In Bun / Node-style TS:

```ts id="sleep_func"
function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
```

### Usage:

```ts id="sleep_usage"
console.log("You begin training...");
await sleep(1000);
console.log("Qi flows through your body...");
```

⚠️ Important:
To use `await`, your function must be async:

```ts id="async_example"
async function main() {
  await sleep(1000);
}
```

---

# ✍️ Typewriter Text Effect (CLI immersion)

This makes your story feel WAY more alive.

```ts id="typewriter"
async function typeWriter(text: string, delay = 30) {
  for (const char of text) {
    process.stdout.write(char);
    await sleep(delay);
  }
  console.log(); // new line at end
}
```

---

## 🥋 Usage example:

```ts id="typewriter_usage"
await typeWriter("You step into the misty bamboo forest...");
await typeWriter("A distant sword echoes through the mountains...", 50);
```

---

# 🎮 Combo Example (Game feel upgrade)

```ts id="combo_example"
console.log("=== Wuxia Path ===");

await typeWriter("You arrive at the mountain sect gate...");
await sleep(800);

await typeWriter("An elder watches you silently.");

const choice = readlineSync.question("Enter or leave? (e/l) ");
```

---

# 🧠 Design Tip (VERY important)

Use:
- `sleep` → pacing
- `typeWriter` → story moments
- instant logs → combat / stats

👉 Rule of thumb:
- Story = slow & dramatic
- Combat = fast & responsive

---

# 🥋 Result

With just these tools, your CLI game can feel like:
- an actual RPG
- not just terminal text spam
- way more immersive without any heavy frameworks

---