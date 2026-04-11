import { typeWriter, player, sleep, question, menuChoice, choice } from "./lib";

export interface Combatant {
    name: string;
    hp: number;
    maxHp: number;
    qi: number;
    yin: number;
    yang: number;
    strength: number;
    defense: number;
    inventory: {
        name: string;
        id: number;
        description: string;
        type: string;
    }[];
}

export type CombatResult = {
    winner: Combatant;
    loser: Combatant;
    log: string[];
};

function applyMove(attacker: Combatant, defender: Combatant, move: CombatOption) {
    const damage = Math.max(1, move.power + attacker.strength - defender.defense);
    defender.hp -= damage;
    attacker.qi -= move.cost.qi;
    attacker.hp -= move.cost.hp;

    return damage;
}

export async function combatMenu(
    prompt: string,
    options: CombatOption[],
    player: Combatant
): Promise<CombatOption> {
    
    // Filter usable moves
    const available = options.filter(opt =>
        player.qi >= opt.cost.qi &&
        player.hp > opt.cost.hp &&
        player.yin >= opt.reqs.yin &&
        player.yang >= opt.reqs.yang &&
        opt.reqs.item.every(reqItem =>
            player.inventory.some(inv => inv.name === reqItem)
        )
    );

    while (true) {
        await typeWriter(prompt);

        for (let i = 0; i < available.length; i++) {
            const opt = available[i]!;

            // Build display string
            let line = `${i + 1}. ${opt.name} (Power: ${opt.power}`;

            if (opt.cost.qi > 0) line += ` | Qi: -${opt.cost.qi}`;
            if (opt.cost.hp > 0) line += ` | HP: -${opt.cost.hp}`;

            line += ")";

            await typeWriter(line, 10);
        }

        const input = (await question("> ")).trim();
        const choiceNum = Number(input);

        if (!isNaN(choiceNum)) {
            const index = choiceNum - 1;

            if (index >= 0 && index < available.length) {
                return available[index]!;
            }
        }

        await typeWriter("Please enter a valid number.");
    }
}

interface CombatOption {
    "name": string,
    "power": number,
    "cost": {
        "qi": number,
        "hp": number,
    },
    "reqs": {
        "yin": number,
        "yang": number,
        "item": string[],
    },
    "flavor"?: string,
    "phaseReq"?: number
};

export async function playerChoice(player: Combatant) {

    const CombatOptions: CombatOption[] = [

        {
            name: "Basic Strike",
            power: 10,
            cost: { qi: 0, hp: 0 },
            reqs: { yin: 0, yang: 0, item: [] }
        },

        {
            name: "Qi Jab",
            power: 14,
            cost: { qi: 4, hp: 0 },
            reqs: { yin: 5, yang: 5, item: [] }
        },

        {
            name: "Shadow Grip",
            power: 16,
            cost: { qi: 6, hp: 0 },
            reqs: { yin: 15, yang: 5, item: [] }
        },

        {
            name: "Blazing Palm",
            power: 18,
            cost: { qi: 6, hp: 2 },
            reqs: { yin: 5, yang: 15, item: [] }
        },

        {
            name: "Void Pressure",
            power: 22,
            cost: { qi: 10, hp: 0 },
            reqs: { yin: 25, yang: 10, item: [] }
        },

        {
            name: "Solar Break",
            power: 26,
            cost: { qi: 12, hp: 4 },
            reqs: { yin: 10, yang: 25, item: [] }
        },

        {
            name: "Harmony Strike",
            power: 24,
            cost: { qi: 10, hp: 0 },
            reqs: { yin: 30, yang: 30, item: [] }
        },

        {
            name: "Seal Burst",
            power: 28,
            cost: { qi: 8, hp: 0 },
            reqs: { yin: 20, yang: 20, item: ["Dragon Seal"] }
        },


        {
            name: "Heaven-Earth Collapse",
            power: 35,
            cost: { qi: 18, hp: 5 },
            reqs: { yin: 45, yang: 45, item: [] }
        },

        {
            name: "Desperate Lunge",
            power: 40,
            cost: { qi: 0, hp: 15 },
            reqs: { yin: 0, yang: 0, item: [] }
        }
    ];

    return await combatMenu("What is your move?", CombatOptions, player);
}

// advanced combat implementation
export async function initiateCombat(player: Combatant, enemy: Combatant): Promise<CombatResult> {
    const combatLog: string[] = [];

    await typeWriter(`An encounter begins: ${player.name} vs ${enemy.name}!`);

    while (player.hp > 0 && enemy.hp > 0) {

        // PLAYER TURN
        const move = await playerChoice(player);
        const damage = applyMove(player, enemy, move);
        
        const playerMsg = `${player.name} used ${move.name} for ${damage} damage.`;
        combatLog.push(playerMsg);
        await typeWriter(playerMsg, 20);

        if (enemy.hp <= 0) break;

        // ENEMY TURN
        const enemyDamage = Math.max(1, enemy.strength - player.defense + Math.random() * 5);
        player.hp -= enemyDamage;

        const enemyMsg = `${enemy.name} hits for ${enemyDamage}.`;
        combatLog.push(enemyMsg);
        await typeWriter(enemyMsg, 20);
    }

    const winner = player.hp > 0 ? player : enemy;
    const loser = player.hp > 0 ? enemy : player;

    return {
        winner,
        loser,
        log: combatLog
    };
};


// Calculate health percentage
function getHealthPercent(combatant: Combatant): number {
    return Math.floor((combatant.hp / combatant.maxHp) * 100);
}

// Boss AI: select move based on phase and strategy
function selectBossMove(boss: Combatant, moveSet: CombatOption[]): CombatOption {
    const healthPercent = getHealthPercent(boss);
    
    // Filter moves that meet phase requirements
    const availableMoves = moveSet.filter(move => {
        const phaseThreshold = move.phaseReq ?? 0;
        return healthPercent <= phaseThreshold;
    });

    // If no phase-gated moves available, use all moves
    const candidateMoves = availableMoves.length > 0 ? availableMoves : moveSet;

    // Smart selection: prioritize high-power moves when low HP, balanced when healthy
    if (healthPercent <= 25) {
        // Desperate phase: use strongest moves
        const strongMoves = candidateMoves.sort((a, b) => b.power - a.power).slice(0, Math.ceil(candidateMoves.length / 2));
        return strongMoves[Math.floor(Math.random() * strongMoves.length)]!;
    } else if (healthPercent <= 50) {
        // Mid phase: mix of medium and strong moves
        return candidateMoves[Math.floor(Math.random() * candidateMoves.length)]!;
    } else {
        // Healthy: favor balanced moves, avoid burning qi early
        const balancedMoves = candidateMoves.filter(m => m.cost.qi <= 8);
        const picks = balancedMoves.length > 0 ? balancedMoves : candidateMoves;
        return picks[Math.floor(Math.random() * picks.length)]!;
    }
}

// advanced boss combat implementation
export async function initiateBossCombat(player: Combatant, boss: Combatant, moveSet: CombatOption[]): Promise<CombatResult> {
    const combatLog: string[] = [];
    let lastPhase = 100;

    await typeWriter(`An encounter begins: ${player.name} vs ${boss.name}!`);

    while (player.hp > 0 && boss.hp > 0) {

        // PLAYER TURN
        const move = await playerChoice(player);
        const damage = applyMove(player, boss, move);
        
        const playerMsg = `${player.name} used ${move.name} for ${damage} damage.`;
        combatLog.push(playerMsg);
        await typeWriter(playerMsg, 20);

        if (boss.hp <= 0) break;

        // Phase transition
        const currentPhase = getHealthPercent(boss);
        if (currentPhase <= 50 && lastPhase > 50) {
            await sleep(500);
            await typeWriter(`\n${boss.name}'s eyes glow brighter. ${boss.name} shifts stance!`);
            await sleep(300);
            lastPhase = 50;
        } else if (currentPhase <= 25 && lastPhase > 25) {
            await sleep(500);
            await typeWriter(`\n${boss.name} is wounded. A desperate intensity fills the air!`);
            await sleep(300);
            lastPhase = 25;
        }

        // BOSS TURN - AI selected
        const bossMove = selectBossMove(boss, moveSet);
        const bossDamage = applyMove(boss, player, bossMove);

        // Use flavor text if available, otherwise generic
        const bossMsg = bossMove.flavor 
            ? `${boss.name}: "${bossMove.flavor}"\n→ ${bossMove.name} deals ${bossDamage} damage!`
            : `${boss.name} used ${bossMove.name} for ${bossDamage} damage.`;

        combatLog.push(bossMsg);
        await typeWriter(bossMsg, 20);
    }

    const winner = player.hp > 0 ? player : boss;
    const loser = player.hp > 0 ? boss : player;

    return {
        winner,
        loser,
        log: combatLog
    };
};