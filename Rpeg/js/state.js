// ==========================================
// GLOBALNY STAN GRY (State) & KONFIGURACJA
// ==========================================

let currentActiveNodeId = null;

const gameState = {
    resources: {
        commanderCoins: 200,
        iron: 50,
        herbs: 30
    },
    production: { ccPerSecond: 1 },
    hospital: { knights: 0, archers: 0, mages: 0, cavalry: 0, catapults: 0 },
    commanders: [
        {
            id: "cmd_1",
            name: "Sir Alistair",
            perk: "knight_buff",
            troops: { knights: 4, archers: 3, mages: 2, cavalry: 2, catapults: 1 }
        }
    ],
    upgrades: { blacksmithLevel: 0 },
    activeMissions: [],
    conqueredNodes: [],
    lastTick: performance.now(),
    isCombatActive: false,
    combatTimer: 0
};

// Mapowanie referencji dla kompatybilności wstecznej koszar
gameState.units = gameState.commanders[0].troops;

const UNIT_STATS = {
    knights: { name: "Rycerz", hp: 120, atk: 15, spd: 10, icon: "🛡️", target: 'front', herbCost: 4, counters: 'cavalry' },
    archers: { name: "Łucznik", hp: 50, atk: 22, spd: 15, icon: "🏹", target: 'front', herbCost: 3, counters: 'knights' },
    mages: { name: "Mag", hp: 40, atk: 35, spd: 8, icon: "🔮", target: 'all', herbCost: 6, counters: 'knights' },
    cavalry: { name: "Kawaleria", hp: 90, atk: 25, spd: 25, icon: "🐎", target: 'back', herbCost: 5, counters: 'archers' },
    catapults: { name: "Katapulta", hp: 150, atk: 60, spd: 3, icon: "💥", target: 'front', herbCost: 8, counters: 'frontLine' }
};

let activeBattleFormation = {
    pool: { knights: 0, archers: 0, mages: 0, cavalry: 0, catapults: 0 },
    frontLine: { knights: 0, archers: 0, mages: 0, cavalry: 0, catapults: 0 },
    backLine: { knights: 0, archers: 0, mages: 0, cavalry: 0, catapults: 0 }
};

const battleNodesData = {
    village: {
        name: "Zajęta Wioska (Poziom 1)",
        conqueredName: "Oswobodzona Wioska (Sojusznik)",
        cx: 680, cy: 220,
        enemy: {
            name: "Dezerterzy z Królewskiego Regimentu",
            frontLine: { knights: 2, archers: 0, mages: 0, cavalry: 0, catapults: 0 },
            backLine: { knights: 0, archers: 3, mages: 0, cavalry: 0, catapults: 0 },
            power: 45
        },
        rewards: { cc: 250, iron: 35, herbs: 20 }
    },
    bandit_camp: {
        name: "Obóz Leśnych Bandytów (Poziom 2)",
        conqueredName: "Rozbity Obóz (Bezpieczny Szlak)",
        cx: 820, cy: 280,
        enemy: {
            name: "Gildia Cienistych Nożowników",
            frontLine: { knights: 3, archers: 0, mages: 0, cavalry: 1, catapults: 0 },
            backLine: { knights: 0, archers: 2, mages: 0, cavalry: 0, catapults: 0 },
            power: 70
        },
        rewards: { cc: 350, iron: 50, herbs: 25 }
    },
    iron_mine: {
        name: "Zajęta Kopalnia Żelaza (Poziom 3)",
        conqueredName: "Kopalnia Żelaza (Pod kontrolą)",
        cx: 400, cy: 180,
        enemy: {
            name: "Gwardia Czarnokrwistych Orków",
            frontLine: { knights: 5, archers: 2, mages: 0, cavalry: 0, catapults: 0 },
            backLine: { knights: 2, archers: 6, mages: 0, cavalry: 0, catapults: 0 },
            power: 160
        },
        rewards: { cc: 500, iron: 140, herbs: 10 }
    },
    ancient_ruins: {
        name: "Starożytne Ruiny (Poziom 4)",
        conqueredName: "Zbadane Ruiny (Oczyszczone)",
        cx: 550, cy: 120,
        enemy: {
            name: "Ożywione Posągi i Kamienni Strażnicy",
            frontLine: { knights: 6, archers: 0, mages: 0, cavalry: 0, catapults: 0 },
            backLine: { knights: 0, archers: 0, mages: 2, cavalry: 0, catapults: 1 },
            power: 210
        },
        rewards: { cc: 650, iron: 90, herbs: 45 }
    },
    whispering_woods: {
        name: "Szepczący Las (Poziom 5)",
        conqueredName: "Ukołysana Knieja (Sojusz alchemików)",
        cx: 850, cy: 140,
        enemy: {
            name: "Skażone Duchy Lasu i Wiedźmy",
            frontLine: { knights: 4, archers: 0, mages: 0, cavalry: 3, catapults: 0 },
            backLine: { knights: 0, archers: 5, mages: 3, cavalry: 0, catapults: 0 },
            power: 265
        },
        rewards: { cc: 750, iron: 40, herbs: 160 }
    },
    gold_vein: {
        name: "Złota Żyła w Wąwozie (Poziom 6)",
        conqueredName: "Prywatna Kopalnia Złota (Wydobycie)",
        cx: 310, cy: 260,
        enemy: {
            name: "Chciwe Gnomy z Głębin",
            frontLine: { knights: 8, archers: 0, mages: 0, cavalry: 2, catapults: 0 },
            backLine: { knights: 0, archers: 4, mages: 0, cavalry: 0, catapults: 2 },
            power: 320
        },
        rewards: { cc: 1100, iron: 160, herbs: 20 }
    },
    dragon_nest: {
        name: "Smocze Gniazdo (Poziom 7)",
        conqueredName: "Smoczy Szczyt (Zabezpieczony)",
        cx: 160, cy: 130,
        enemy: {
            name: "Kult Smoczego Płomienia",
            frontLine: { knights: 6, archers: 0, mages: 0, cavalry: 5, catapults: 0 },
            backLine: { knights: 0, archers: 2, mages: 5, cavalry: 0, catapults: 1 },
            power: 390
        },
        rewards: { cc: 1250, iron: 110, herbs: 95 }
    },
    smugglers_bay: {
        name: "Zatoka Przemytników (Poziom 8)",
        conqueredName: "Wolny Port Handlowy",
        cx: 740, cy: 460,
        enemy: {
            name: "Morskie Wilki i Piraccy Najemnicy",
            frontLine: { knights: 7, archers: 0, mages: 0, cavalry: 4, catapults: 0 },
            backLine: { knights: 0, archers: 8, mages: 1, cavalry: 0, catapults: 2 },
            power: 440
        },
        rewards: { cc: 1400, iron: 190, herbs: 60 }
    },
    forgotten_fortress: {
        name: "Zapomniana Twierdza (Poziom 9)",
        conqueredName: "Twierdza Awangardy (Punkt Obronny)",
        cx: 110, cy: 240,
        enemy: {
            name: "Zbuntowany Garnizon Żelaznej Ręki",
            frontLine: { knights: 10, archers: 0, mages: 0, cavalry: 3, catapults: 1 },
            backLine: { knights: 0, archers: 9, mages: 2, cavalry: 0, catapults: 3 },
            power: 580
        },
        rewards: { cc: 1700, iron: 270, herbs: 50 }
    },
    alchemist_laboratory: {
        name: "Laboratorium Szalonego Alchemika (Poziom 10)",
        conqueredName: "Odzyskane Laboratorium (Magazyn)",
        cx: 640, cy: 70,
        enemy: {
            name: "Toksyczni Mutanci i Magowie Ognia",
            frontLine: { knights: 8, archers: 0, mages: 3, cavalry: 2, catapults: 0 },
            backLine: { knights: 0, archers: 4, mages: 8, cavalry: 0, catapults: 1 },
            power: 620
        },
        rewards: { cc: 1950, iron: 80, herbs: 350 }
    },
    cursed_catacombs: {
        name: "Przeklęte Katakomby (Poziom 11)",
        conqueredName: "Krypta Wiecznego Spoczynku",
        cx: 890, cy: 400,
        enemy: {
            name: "Mroczni Nekromanci i Szkielety",
            frontLine: { knights: 12, archers: 0, mages: 1, cavalry: 0, catapults: 2 },
            backLine: { knights: 2, archers: 6, mages: 6, cavalry: 0, catapults: 1 },
            power: 710
        },
        rewards: { cc: 2200, iron: 130, herbs: 220 }
    },
    shadow_pass: {
        name: "Przełęcz Cieni (Poziom 12)",
        conqueredName: "Przełęcz Cieni (Wolny Przejazd)",
        cx: 390, cy: 490,
        enemy: {
            name: "Straż Przednia Władcy Cieni",
            frontLine: { knights: 11, archers: 0, mages: 2, cavalry: 8, catapults: 1 },
            backLine: { knights: 0, archers: 12, mages: 4, cavalry: 0, catapults: 3 },
            power: 850
        },
        rewards: { cc: 2600, iron: 320, herbs: 140 }
    },
    rotten_swamps: {
        name: "Zgniłe Mokradła (Poziom 13 - FINAŁ)",
        conqueredName: "Oczyszczone Mokradła (Zwycięstwo)",
        cx: 250, cy: 400,
        enemy: {
            name: "Armia Nieumarłych Legionistów",
            frontLine: { knights: 15, archers: 0, mages: 2, cavalry: 4, catapults: 2 },
            backLine: { knights: 4, archers: 14, mages: 5, cavalry: 0, catapults: 4 },
            power: 1100
        },
        rewards: { cc: 4000, iron: 500, herbs: 500 }
    }
};

const availableMissions = [
    { id: 'm1', name: "Zwiad w Przeklętym Lesie", duration: 10, reward: 50, requiredUnit: 'archers', unitName: "Łucznik" },
    { id: 'm2', name: "Obrona karawany kupieckiej", duration: 30, reward: 180, requiredUnit: 'knights', unitName: "Rycerz" }
];