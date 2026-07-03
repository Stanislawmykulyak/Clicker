const accRock = document.getElementById('entire-rock')
const gemCounter = document.querySelector('.gem-counter')

const playlist = [
        'media/Music/BG-Music-DeusLover.mp3',
        'media/Music/BG-Music-DeusLover-2.mp3',
        'media/Music/BG-Music-DeusLover-3.mp3',
        'media/Music/BG-Music-DeusLover-4.mp3',
        'media/Music/BG-Music-DeusLover-5.mp3'
]
let savedSongIndex = localStorage.getItem('clicker_current_song_index');
let currentTrackIndex;

if (savedSongIndex !== null) {
        currentTrackIndex = parseInt(savedSongIndex, 10);
} else {
        currentTrackIndex = Math.floor(Math.random() * playlist.length);
        localStorage.setItem('clicker_current_song_index', currentTrackIndex);
}
const bgMusic = new Audio(playlist[currentTrackIndex]);
bgMusic.volume = 1;

let isMuted = false;
const audioBtn = document.getElementById('audio-toggle');

function playNextTrack() {
        currentTrackIndex++;

        if (currentTrackIndex >= playlist.length) {
                currentTrackIndex = 0;
        }

        bgMusic.src = playlist[currentTrackIndex];

        if (!isMuted) {
                bgMusic.play().catch(err => console.log("Autoplay block na kolejnym utworze:", err));
        }

        localStorage.setItem('clicker_current_song_index', currentTrackIndex);
}

bgMusic.onended = playNextTrack;

function tryAutoplay() {
        if (isMuted) return;
        bgMusic.play().then(() => {
                window.removeEventListener('click', tryAutoplay);
        }).catch(() => {
                console.log("browser is blocking autoplay, you need to click");
        });
}

window.addEventListener('click', tryAutoplay);

audioBtn.onclick = function (e) {
        e.stopPropagation();

        if (bgMusic.paused) {
                bgMusic.play();
                audioBtn.innerHTML = "🔊 Muzyka: ON";
                audioBtn.style.borderColor = "#475569";
                isMuted = false;
        } else {
                bgMusic.pause();
                audioBtn.innerHTML = "🔇 Muzyka: OFF";
                audioBtn.style.borderColor = "#991b1b";
                isMuted = true;
        }
};

function formatNumber(num) {
        return new Intl.NumberFormat('en-US', {
                notation: 'compact',
                compactDisplay: 'short',
                maximumFractionDigits: 1
        }).format(num);
}

let gems = 0;

function updateGems() {
        gemCounter.innerHTML = `Gems : ${formatNumber(gems)}💎`
}

let gem_per_click = 1;
let lucky_gem_percentage = 3

function createFloatingText(x, y, amount, isLucky) {
        const textNode = document.createElement('div');

        textNode.className = 'floating-text';
        if (isLucky) {
                textNode.classList.add('lucky-text');
        }

        textNode.style.left = `${x}px`;
        textNode.style.top = `${y}px`;

        textNode.innerHTML = `+${formatNumber(amount)}`;

        document.body.appendChild(textNode);

        setTimeout(() => {
                textNode.remove();
        }, 700);
}

const rockImg = document.querySelector('.GemRock img');

accRock.addEventListener('click', function (e) {
        rockImg.classList.remove('rock-pop');
        void rockImg.offsetWidth;
        rockImg.classList.add('rock-pop');

        let gainedGems = 0;
        let isLucky = false;

        let gauntletLvl = shopUpgrades.lucky_gauntlet ? shopUpgrades.lucky_gauntlet.level : 0;

        let currentLuckyChance = lucky_gem_percentage + (gauntletLvl * 1);
        let currentLuckyMultiplier = 5 + (gauntletLvl * 2);

        if ((Math.random() * 100) < currentLuckyChance) {
                gainedGems = gem_per_click * currentLuckyMultiplier;
                isLucky = true;
                console.log("Lucky gem strike!");
        } else {
                gainedGems = gem_per_click;
                console.log("Rock clicked");
        }

        let clickMultiplier = Math.pow(shopUpgrades.sharper_pickaxe.multiplier, shopUpgrades.sharper_pickaxe.level);
        gainedGems *= clickMultiplier;

        gems += gainedGems;

        createFloatingText(e.clientX, e.clientY, gainedGems, isLucky);
});

// Zaktualizowany obiekt ulepszeń bazowych
let upgrades = {
        miner: {
                baseCost: 15,
                cost: 15,
                efficiency: 0.1,
                level: 0,
                maxLevel: 100,
                milestones: { 10: 2, 25: 2, 50: 2, 100: 5 }
        },
        quarry: {
                baseCost: 100,
                cost: 100,
                efficiency: 1,
                level: 0,
                maxLevel: 100,
                milestones: { 10: 2, 25: 2, 50: 2, 100: 5 }
        },
        catapult: {
                baseCost: 1100,
                cost: 1100,
                efficiency: 8,
                level: 0,
                maxLevel: 100,
                milestones: { 10: 2, 25: 2, 50: 2, 100: 5 }
        },
        iron_hammers: {
                baseCost: 12000,
                cost: 12000,
                efficiency: 47,
                level: 0,
                maxLevel: 100,
                milestones: { 10: 2, 25: 2, 50: 2, 100: 5 }
        },
        mine_inspector: {
                baseCost: 130000,
                cost: 130000,
                efficiency: 260,
                level: 0,
                maxLevel: 100,
                milestones: { 10: 2, 25: 2, 50: 2, 100: 5 }
        },
        runic_golem: {
                baseCost: 1400000,
                cost: 1400000,
                efficiency: 1400,
                level: 0,
                maxLevel: 100,
                milestones: { 10: 2, 25: 2, 50: 2, 100: 5 }
        },
        alchemic: {
                baseCost: 20000000,
                cost: 20000000,
                efficiency: 7800,
                level: 0,
                maxLevel: 100,
                milestones: { 10: 2, 25: 2, 50: 2, 100: 5 }
        },
        earth_mage: {
                baseCost: 330000000,
                cost: 330000000,
                efficiency: 44000,
                level: 0,
                maxLevel: 100,
                milestones: { 10: 2, 25: 2, 50: 2, 100: 5 }
        },
        deep_shaft: {
                baseCost: 5100000000,
                cost: 5100000000,
                efficiency: 260000,
                level: 0,
                maxLevel: 100,
                milestones: { 10: 2, 25: 2, 50: 2, 100: 5 }
        },
        gem_tower: {
                baseCost: 75000000000,
                cost: 75000000000,
                efficiency: 1600000,
                level: 0,
                maxLevel: 100,
                milestones: { 10: 2, 25: 2, 50: 2, 100: 5 }
        }
};

function updateUpgradesUI() {
        const upgradeNames = {
                miner: "Miner",
                quarry: "Quarry",
                catapult: "Catapult",
                iron_hammers: "Iron Hammer Order",
                mine_inspector: "Mine Inspector",
                runic_golem: "Runic Golem",
                alchemic: "Alchemic",
                earth_mage: "Earth Mage",
                deep_shaft: "Deep Shaft",
                gem_tower: "Gem Tower"
        };

        Object.keys(upgrades).forEach(key => {
                const up = upgrades[key];
                const upgradeContainer = document.querySelector(`.${key}-upgrades`);

                if (!upgradeContainer) return;

                const priceEl = upgradeContainer.querySelector(`.${key}-price`);
                const lvlEl = upgradeContainer.querySelector(`.${key}-lvl`);
                const btnEl = upgradeContainer.querySelector(`.${key}-upgrade`);

                // Logika kłódek dopasowana sekwencyjnie do nowych budynków
                let isUnlocked = true;
                if (key === 'quarry' && upgrades.miner.level < 5) isUnlocked = false;
                if (key === 'catapult' && upgrades.miner.level < 5) isUnlocked = false;
                if (key === 'iron_hammers' && upgrades.catapult.level < 9) isUnlocked = false;
                if (key === 'mine_inspector' && upgrades.iron_hammers.level < 9) isUnlocked = false;
                if (key === 'runic_golem' && upgrades.mine_inspector.level < 9) isUnlocked = false;
                if (key === 'alchemic' && upgrades.runic_golem.level < 9) isUnlocked = false;
                if (key === 'earth_mage' && upgrades.alchemic.level < 9) isUnlocked = false;
                if (key === 'deep_shaft' && upgrades.earth_mage.level < 9) isUnlocked = false;
                if (key === 'gem_tower' && upgrades.deep_shaft.level < 9) isUnlocked = false;

                if (!isUnlocked) {
                        upgradeContainer.classList.add('locked-upgrade');
                        if (btnEl) {
                                btnEl.innerHTML = "???";
                                btnEl.disabled = true;
                        }
                        if (lvlEl) lvlEl.innerHTML = "🔒";
                        if (priceEl) priceEl.innerHTML = `Price: ${formatNumber(up.cost)}$`;
                } else {
                        upgradeContainer.classList.remove('locked-upgrade');
                        if (btnEl) btnEl.innerHTML = upgradeNames[key];
                        if (priceEl) priceEl.innerHTML = `Price: ${formatNumber(up.cost)}$`;

                        if (lvlEl) {
                                if (up.level === up.maxLevel) {
                                        lvlEl.innerHTML = `MAX LVL`;
                                } else {
                                        lvlEl.innerHTML = `Lvl: ${up.level}`;
                                }
                        }
                }

                if (isUnlocked) {
                        if (gems >= up.cost && up.level < up.maxLevel) {
                                upgradeContainer.classList.remove('cant-afford');
                                upgradeContainer.classList.add('can-afford');
                                if (btnEl) btnEl.disabled = false;
                        } else {
                                upgradeContainer.classList.add('cant-afford');
                                upgradeContainer.classList.remove('can-afford');
                                if (btnEl) btnEl.disabled = true;
                        }
                } else {
                        upgradeContainer.classList.remove('cant-afford');
                        upgradeContainer.classList.remove('can-afford');
                }
        });
}

function buyUpgrade(upgradeKey) {
        const up = upgrades[upgradeKey];

        // Zabezpieczenie przed kupowaniem zablokowanych jednostek
        let isUnlocked = true;
        if (upgradeKey === 'quarry' && upgrades.miner.level < 5) isUnlocked = false;
        if (upgradeKey === 'catapult' && upgrades.miner.level < 5) isUnlocked = false;
        if (upgradeKey === 'iron_hammers' && upgrades.catapult.level < 9) isUnlocked = false;
        if (upgradeKey === 'mine_inspector' && upgrades.iron_hammers.level < 9) isUnlocked = false;
        if (upgradeKey === 'runic_golem' && upgrades.mine_inspector.level < 9) isUnlocked = false;
        if (upgradeKey === 'alchemic' && upgrades.runic_golem.level < 9) isUnlocked = false;
        if (upgradeKey === 'earth_mage' && upgrades.alchemic.level < 9) isUnlocked = false;
        if (upgradeKey === 'deep_shaft' && upgrades.earth_mage.level < 9) isUnlocked = false;
        if (upgradeKey === 'gem_tower' && upgrades.deep_shaft.level < 9) isUnlocked = false;

        if (!isUnlocked) return;

        if (gems >= up.cost && up.level < up.maxLevel) {
                gems -= up.cost;
                up.level++;

                if (up.milestones[up.level]) {
                        up.efficiency *= up.milestones[up.level];
                }

                up.cost = Math.floor(up.baseCost * Math.pow(1.15, up.level));

                updateGems();
                updateUpgradesUI();
                updateShopUI();
        } else if (up.level >= up.maxLevel) {
                console.log("You cant Upgrade , Max level reached");
        }
}

Object.keys(upgrades).forEach(key => {
        const container = document.querySelector(`.${key}-upgrades`);
        if (container) {
                container.onclick = (e) => {
                        // Zapobiega podwójnemu wywoływaniu jeśli kliknięto bezpośrednio przycisk wewnątrz kontenera
                        buyUpgrade(key);
                };
        }
});

let shopUpgrades = {
        sharper_pickaxe: {
                name: "Mithril Pickaxe",
                desc: "Forges your tool from legendary elven metal. Each level doubles manual click power (x2).",
                baseCost: 150, cost: 150, level: 0, maxLevel: 10, multiplier: 2, costGrowth: 2.5
        },
        miner_gear: {
                name: "Reinforced Shovels",
                desc: "Equips your Miners with heavy steel tools. Doubles Miner efficiency (x2).",
                baseCost: 500, cost: 500, level: 0, maxLevel: 10, multiplier: 2, costGrowth: 2.8
        },
        quarry_gear: {
                name: "Black Powder Blasting",
                desc: "Uses gunpowder to clear topsoil faster. Doubles Quarry yield (x2).",
                baseCost: 3000, cost: 3000, level: 0, maxLevel: 10, multiplier: 2, costGrowth: 3.0
        },
        catapult_gear: {
                name: "Heavy Steel Winches",
                desc: "Allows catapult to fire massive boulders with incredible force. Catapult yield x2.",
                baseCost: 15000, cost: 15000, level: 0, maxLevel: 10, multiplier: 2, costGrowth: 3.2
        },
        iron_hammers_gear: {
                name: "Hardened Steel Anvils",
                desc: "Improves the forging quality of heavy weapons. Iron Hammer Order yield x2.",
                baseCost: 85000, cost: 85000, level: 0, maxLevel: 10, multiplier: 2, costGrowth: 3.4
        },
        inspector_gear: {
                name: "Iron Discipline",
                desc: "Enforces strict mine regulations and working hours. Mine Inspector yield x2.",
                baseCost: 450000, cost: 450000, level: 0, maxLevel: 10, multiplier: 2, costGrowth: 3.5
        },
        golem_gear: {
                name: "Earth-Core Infusion",
                desc: "Channels core elemental energy directly into the constructs. Runic Golem yield x2.",
                baseCost: 2500000,
                cost: 2500000,
                level: 0,
                maxLevel: 10,
                multiplier: 2,
                costGrowth: 3.6
        },
        alchemic_gear: {
                name: "Acidic Dissolution",
                desc: "Alchemical solutions that melt away dense granite layers. Alchemic yield x2.",
                baseCost: 15000000,
                cost: 15000000,
                level: 0,
                maxLevel: 10,
                multiplier: 2,
                costGrowth: 3.7
        },
        earth_mage_gear: {
                name: "Resonance Crystals",
                desc: "Amplifies earth spells to soften stubborn bedrock. Earth Mage yield x2.",
                baseCost: 90000000,
                cost: 90000000,
                level: 0,
                maxLevel: 10,
                multiplier: 2,
                costGrowth: 3.8
        },
        deep_shaft_gear: {
                name: "Reinforced Pulley Cables",
                desc: "Allows hauling much heavier mineral loads from the deeps. Deep Shaft yield x2.",
                baseCost: 550000000,
                cost: 550000000,
                level: 0,
                maxLevel: 10,
                multiplier: 2,
                costGrowth: 3.9
        },
        gem_tower_gear: {
                name: "Prismatic Lenses",
                desc: "Focuses extracted magical light to draw gems out effortlessly. Gem Tower yield x2.",
                baseCost: 4000000000,
                cost: 4000000000,
                level: 0,
                maxLevel: 10,
                multiplier: 2,
                costGrowth: 4.0
        },
        lucky_gauntlet: {
                name: "Prospector's Charm",
                desc: "An old talisman filled with gold dust. Grants +3% Critical Shard chance and increases its value by +2x.",
                baseCost: 1000, cost: 1000, level: 0, maxLevel: 10, multiplier: 0, costGrowth: 3.5
        }
};
const storeTooltip = document.getElementById('store-tooltip');
let currentActiveTooltipKey = null;

function updateShopUI() {
        Object.keys(shopUpgrades).forEach(key => {
                const item = shopUpgrades[key];
                const el = document.querySelector(`.store-item[data-upgrade="${key}"]`);
                if (!el) return;

                const lvlEl = el.querySelector('.store-lvl');
                if (lvlEl) {
                        lvlEl.innerHTML = item.level === item.maxLevel ? "MAX" : item.level;
                }

                if (gems >= item.cost && item.level < item.maxLevel) {
                        el.classList.remove('cant-afford');
                        el.classList.add('can-afford');
                } else {
                        el.classList.add('cant-afford');
                        el.classList.remove('can-afford');
                }
        });
}

function buyShopUpgrade(key) {
        const item = shopUpgrades[key];
        if (gems >= item.cost && item.level < item.maxLevel) {
                gems -= item.cost;
                item.level++;

                item.cost = Math.floor(item.baseCost * Math.pow(item.costGrowth, item.level));

                updateGems();
                updateShopUI();
                updateUpgradesUI();

                if (currentActiveTooltipKey === key) updateTooltipText(key);
        }
}

function updateTooltipText(key) {
        const item = shopUpgrades[key];
        if (!item) return;

        storeTooltip.innerHTML = `
        <div class="tooltip-title">${item.name}</div>
        <div class="tooltip-desc">${item.desc}</div>
        <div class="tooltip-cost">${item.level === item.maxLevel ? "MAXIMUM LEVEL" : "Price: " + formatNumber(item.cost) + " 💎"}</div>
    `;
}

document.querySelectorAll('.store-item[data-upgrade]').forEach(el => {
        const key = el.getAttribute('data-upgrade');

        el.addEventListener('click', () => buyShopUpgrade(key));

        el.addEventListener('mouseenter', () => {
                currentActiveTooltipKey = key;
                updateTooltipText(key);
                storeTooltip.style.display = 'block';
        });

        el.addEventListener('mousemove', (e) => {
                const tooltipWidth = storeTooltip.offsetWidth;
                const tooltipHeight = storeTooltip.offsetHeight;

                let left = e.clientX + 15;
                let top = e.clientY + 15;

                if (left + tooltipWidth > window.innerWidth) {
                        left = e.clientX - tooltipWidth - 15;
                }

                if (top + tooltipHeight > window.innerHeight) {
                        top = e.clientY - tooltipHeight - 15;
                }

                if (left < 0) left = 10;
                if (top < 0) top = 10;

                storeTooltip.style.left = left + 'px';
                storeTooltip.style.top = top + 'px';
        });

        el.addEventListener('mouseleave', () => {
                currentActiveTooltipKey = null;
                storeTooltip.style.display = 'none';
        });
});

function saveGameToFile() {
        const dataToSave = {
                gems: gems,
                currentTrackIndex: currentTrackIndex,
                isTutorialPassed: isTutorialPassed,
                upgrades: {},
                shopUpgrades: {}
        };

        Object.keys(upgrades).forEach(key => {
                dataToSave.upgrades[key] = {
                        level: upgrades[key].level,
                        cost: upgrades[key].cost,
                        efficiency: upgrades[key].efficiency
                };
        });

        Object.keys(shopUpgrades).forEach(key => {
                dataToSave.shopUpgrades[key] = {
                        level: shopUpgrades[key].level,
                        cost: shopUpgrades[key].cost
                };
        });

        const blob = new Blob([JSON.stringify(dataToSave, null, 2)], { type: "application/json" });
        const url = URL.createObjectURL(blob);

        const a = document.createElement("a");
        a.href = url;
        a.download = "medieval_clicker_save.json";
        a.click();

        URL.revokeObjectURL(url);
        console.log("Save scroll has been generated!");
}

function loadGameFromFile(event) {
        const file = event.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = function (e) {
                try {
                        const loadedData = JSON.parse(e.target.result);

                        if (typeof loadedData.gems === "number") {
                                gems = loadedData.gems;
                        }
                        if (typeof loadedData.isTutorialPassed === "boolean") {
                                isTutorialPassed = loadedData.isTutorialPassed;
                                if (isTutorialPassed && tutorialOverlay) {
                                        tutorialOverlay.style.display = 'none';
                                        localStorage.setItem('clicker_tutorial_passed', 'true');
                                }
                        }
                        if (typeof loadedData.currentTrackIndex === "number") {
                                currentTrackIndex = loadedData.currentTrackIndex;
                                localStorage.setItem('clicker_current_song_index', currentTrackIndex);
                                if (bgMusic) {
                                        bgMusic.src = playlist[currentTrackIndex];
                                        if (!isMuted) bgMusic.play().catch(() => { });
                                }
                        }

                        // Zaktualizowany słownik pod nowe ulepszenia
                        const defaultEfficiencies = {
                                miner: 0.1, quarry: 1, catapult: 8, iron_hammers: 47,
                                mine_inspector: 260, runic_golem: 1400, alchemic: 7800,
                                earth_mage: 44000, deep_shaft: 260000, gem_tower: 1600000
                        };

                        Object.keys(upgrades).forEach(key => {
                                if (loadedData.upgrades && loadedData.upgrades[key] !== undefined) {
                                        upgrades[key].level = loadedData.upgrades[key].level;
                                        upgrades[key].cost = loadedData.upgrades[key].cost;
                                        upgrades[key].efficiency = loadedData.upgrades[key].efficiency !== undefined ? loadedData.upgrades[key].efficiency : defaultEfficiencies[key];
                                } else {
                                        upgrades[key].level = 0;
                                        upgrades[key].cost = upgrades[key].baseCost;
                                        upgrades[key].efficiency = defaultEfficiencies[key];
                                }
                        });

                        Object.keys(shopUpgrades).forEach(key => {
                                if (loadedData.shopUpgrades && loadedData.shopUpgrades[key] !== undefined) {
                                        shopUpgrades[key].level = loadedData.shopUpgrades[key].level;
                                        shopUpgrades[key].cost = loadedData.shopUpgrades[key].cost;
                                } else {
                                        shopUpgrades[key].level = 0;
                                        shopUpgrades[key].cost = shopUpgrades[key].baseCost;
                                }
                        });

                        console.log("Scroll read successfully! Game state updated.");

                        updateGems();
                        updateUpgradesUI();
                        updateShopUI();

                } catch (err) {
                        console.error("Magic failed! Save file is corrupted.", err);
                        alert("This scroll is tainted! It cannot be read.");
                }
        };
        reader.readAsText(file);
}

document.getElementById('save-btn').onclick = saveGameToFile;

const fileInput = document.getElementById('file-input');
document.getElementById('load-btn').onclick = () => fileInput.click();
fileInput.onchange = loadGameFromFile;

let lastTime = 0;
let accumulatedTime = 0;

function gameLoop(timestamp) {
        if (!lastTime) lastTime = timestamp;

        const deltaTime = timestamp - lastTime;
        lastTime = timestamp;
        accumulatedTime += deltaTime;

        while (accumulatedTime >= 1000) {
                // Przerobiłem bonus szansy z Archera na Quarry (Kamieniołom)
                let Miner_Income_multiplier_chance = 0;
                if (upgrades.quarry.level >= 100) Miner_Income_multiplier_chance = 50;
                else if (upgrades.quarry.level > 50) Miner_Income_multiplier_chance = 20;
                else if (upgrades.quarry.level > 20) Miner_Income_multiplier_chance = 10;
                else if (upgrades.quarry.level > 10) Miner_Income_multiplier_chance = 5;

                let globalMinerMultiplier = 1;
                if (upgrades.quarry.level >= 10 && Math.random() * 100 < Miner_Income_multiplier_chance) {
                        globalMinerMultiplier = 2;
                        console.log("Lucky Mine! All miner income x2");
                }

                Object.keys(upgrades).forEach(key => {
                        const up = upgrades[key];
                        let income = up.level * up.efficiency;

                        if (key === 'miner') {
                                income *= globalMinerMultiplier;
                        }

                        // NAPRAWIONE: Powiązanie ulepszeń sklepu z nowymi strukturami
                        let shopKey = null;
                        if (key === 'miner') shopKey = 'miner_gear';
                        else if (key === 'quarry') shopKey = 'quarry_gear';
                        else if (key === 'catapult') shopKey = 'catapult_gear';
                        else if (key === 'iron_hammers') shopKey = 'iron_hammers_gear';
                        else if (key === 'mine_inspector') shopKey = 'inspector_gear';
                        else if (key === 'runic_golem') shopKey = 'golem_gear';
                        else if (key === 'alchemic') shopKey = 'alchemic_gear';
                        else if (key === 'earth_mage') shopKey = 'earth_mage_gear';
                        else if (key === 'deep_shaft') shopKey = 'deep_shaft_gear';
                        else if (key === 'gem_tower') shopKey = 'gem_tower_gear';

                        if (shopKey && shopUpgrades[shopKey]) {
                                let shopMultiplier = Math.pow(shopUpgrades[shopKey].multiplier, shopUpgrades[shopKey].level);
                                income *= shopMultiplier;
                        }

                        gems += income;
                });

                accumulatedTime -= 1000;
        }

        requestAnimationFrame(gameLoop);
        updateGems();
        updateUpgradesUI();
        updateShopUI();
}

requestAnimationFrame(gameLoop);

const tutorialSteps = [
        "May the Heavens watch over you, young lord. The King has finally sent a new overseer to these dark, rich lands.",
        "This rock before you is packed with deep-earth energy. CLICK it ruthlessly to break off the first raw gems.",
        "With the gathered wealth, you can expand operations and hire more personnel in the panel on the right.",
        "Once you gather 5 Miners, you will unlock permissions to open a Quarry and build heavy Catapults.",
        "The ground sometimes reacts to your strikes... Hit a weak spot to trigger a Critical Shard and shatter extra loot!",
        "Collect the minerals, build your underground empire, and make sure no one slacksoff down there!"
];

let currentStep = 0;
const tutorialOverlay = document.getElementById('tutorial-overlay');
const tutorialText = document.getElementById('tutorial-text');

let isTutorialPassed = localStorage.getItem('clicker_tutorial_passed') === 'true';

if (tutorialOverlay && tutorialText) {
        if (isTutorialPassed) {
                tutorialOverlay.style.display = 'none';
        }

        tutorialOverlay.addEventListener('click', () => {
                currentStep++;

                if (currentStep < tutorialSteps.length) {
                        tutorialText.innerHTML = tutorialSteps[currentStep];
                } else {
                        isTutorialPassed = true;
                        localStorage.setItem('clicker_tutorial_passed', 'true');

                        tutorialOverlay.style.opacity = '0';
                        setTimeout(() => {
                                tutorialOverlay.style.display = 'none';
                        }, 300);
                }
        });
}

function silentSave() {
        const dataToSave = {
                gems: gems,
                currentTrackIndex: currentTrackIndex,
                isTutorialPassed: isTutorialPassed,
                upgrades: {},
                shopUpgrades: {}
        };

        Object.keys(upgrades).forEach(key => {
                dataToSave.upgrades[key] = {
                        level: upgrades[key].level,
                        cost: upgrades[key].cost,
                        efficiency: upgrades[key].efficiency
                };
        });

        Object.keys(shopUpgrades).forEach(key => {
                dataToSave.shopUpgrades[key] = {
                        level: shopUpgrades[key].level,
                        cost: shopUpgrades[key].cost
                };
        });

        localStorage.setItem('medieval_clicker_autosave', JSON.stringify(dataToSave));
        console.log("🛡️ Autosave completed successfully.");
}

setInterval(silentSave, 10000);

function silentLoad() {
        const savedData = localStorage.getItem('medieval_clicker_autosave');
        if (savedData) {
                try {
                        const parsed = JSON.parse(savedData);
                        gems = parsed.gems;

                        const defaultEfficiencies = {
                                miner: 0.1, quarry: 1, catapult: 8, iron_hammers: 47,
                                mine_inspector: 260, runic_golem: 1400, alchemic: 7800,
                                earth_mage: 44000, deep_shaft: 260000, gem_tower: 1600000
                        };

                        Object.keys(upgrades).forEach(key => {
                                if (parsed.upgrades && parsed.upgrades[key] !== undefined) {
                                        upgrades[key].level = parsed.upgrades[key].level;
                                        upgrades[key].cost = parsed.upgrades[key].cost;
                                        upgrades[key].efficiency = parsed.upgrades[key].efficiency !== undefined ? parsed.upgrades[key].efficiency : defaultEfficiencies[key];
                                } else {
                                        upgrades[key].level = 0;
                                        upgrades[key].cost = upgrades[key].baseCost;
                                        upgrades[key].efficiency = defaultEfficiencies[key];
                                }
                        });

                        Object.keys(shopUpgrades).forEach(key => {
                                if (parsed.shopUpgrades && parsed.shopUpgrades[key] !== undefined) {
                                        shopUpgrades[key].level = parsed.shopUpgrades[key].level;
                                        shopUpgrades[key].cost = parsed.shopUpgrades[key].cost;
                                } else {
                                        shopUpgrades[key].level = 0;
                                        shopUpgrades[key].cost = shopUpgrades[key].baseCost;
                                }
                        });

                        // Poprawione kaskadowe sprawdzanie poziomów przy wczytywaniu zapisu
                        if (upgrades.miner.level < 5) {
                                upgrades.quarry.level = 0; upgrades.quarry.cost = upgrades.quarry.baseCost;
                                upgrades.catapult.level = 0; upgrades.catapult.cost = upgrades.catapult.baseCost;
                        }
                        if (upgrades.catapult.level < 9) { upgrades.iron_hammers.level = 0; upgrades.iron_hammers.cost = upgrades.iron_hammers.baseCost; }
                        if (upgrades.iron_hammers.level < 9) { upgrades.mine_inspector.level = 0; upgrades.mine_inspector.cost = upgrades.mine_inspector.baseCost; }
                        if (upgrades.mine_inspector.level < 9) { upgrades.runic_golem.level = 0; upgrades.runic_golem.cost = upgrades.runic_golem.baseCost; }
                        if (upgrades.runic_golem.level < 9) { upgrades.alchemic.level = 0; upgrades.alchemic.cost = upgrades.alchemic.baseCost; }
                        if (upgrades.alchemic.level < 9) { upgrades.earth_mage.level = 0; upgrades.earth_mage.cost = upgrades.earth_mage.baseCost; }
                        if (upgrades.earth_mage.level < 9) { upgrades.deep_shaft.level = 0; upgrades.deep_shaft.cost = upgrades.deep_shaft.baseCost; }
                        if (upgrades.deep_shaft.level < 9) { upgrades.gem_tower.level = 0; upgrades.gem_tower.cost = upgrades.gem_tower.baseCost; }

                        if (typeof updateGems === 'function') updateGems();
                        if (typeof updateUpgradesUI === 'function') updateUpgradesUI();
                        if (typeof updateShopUI === 'function') updateShopUI();

                        console.log("Backup Loaded Successfully.");
                } catch (e) {
                        console.error("Backup loading failed", e);
                }
        }
}

silentLoad();