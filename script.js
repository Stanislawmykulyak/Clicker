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
                audioBtn.innerHTML = "🔊 Music: ON";
                audioBtn.style.borderColor = "#475569";
                isMuted = false;
        } else {
                bgMusic.pause();
                audioBtn.innerHTML = "🔇 Music: OFF";
                audioBtn.style.borderColor = "#991b1b";
                isMuted = true;
        }
};

function formatNumber(num) {
    if (num === 0) return "0";
    
    if (num < 1000) {
        return num % 1 === 0 ? num.toString() : num.toFixed(1);
    }

    const suffixes = ["", "K", "M", "B", "T", "Q", "Qi", "Sx", "Sp", "Oc", "No", "Dc"];
    
    const i = Math.floor(Math.log10(num) / 3);

    if (i >= suffixes.length) {
        return num.toExponential(2);
    }

    const formatted = (num / Math.pow(10, i * 3)).toFixed(1);
    
    // TUTAJ BYŁ BŁĄD - brakowało tego return:
    return formatted.replace(/\.0$/, '') + suffixes[i];
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
function toggleMuteSettings() {
    if (typeof isMuted !== 'undefined' && typeof bgMusic !== 'undefined') {
        isMuted = !isMuted;
        bgMusic.muted = isMuted;
        
        const muteBtn = document.getElementById('settings-mute-btn');
        if (muteBtn) {
            muteBtn.innerText = isMuted ? "Włącz Muzykę 🔊" : "Wycisz Muzykę 🔇";
        }
        
        // Aktualizacja globalnego stanu zapisu w localStorage (opcjonalnie)
        localStorage.setItem('clicker_muted', isMuted ? 'true' : 'false');
        console.log(isMuted ? "Muzyka wyciszona." : "Muzyka włączona.");
    }
}

function nextTrackSettings() {
    if (typeof nextTrack === 'function') {
        nextTrack(); // Wywołanie istniejącej już logiki zmiany piosenki
        console.log("Zmieniono utwór na następny.");
    } else if (typeof bgMusic !== 'undefined' && typeof playlist !== 'undefined' && typeof currentTrackIndex !== 'undefined') {
        // Zabezpieczenie na wypadek braku globalnej funkcji nextTrack
        currentTrackIndex = (currentTrackIndex + 1) % playlist.length;
        bgMusic.src = playlist[currentTrackIndex];
        if (!isMuted) bgMusic.play().catch(() => {});
        localStorage.setItem('clicker_current_song_index', currentTrackIndex);
    }
}

function resetProgress() {
    // Pierwsza weryfikacja
    const firstConfirm = confirm("⚠️ CZY NA PEWNO CHCESZ ZRESETOWAĆ POSTĘP?\n\nStracisz wszystkie zebrane klejnoty, kryształy, poziomy robotników oraz odblokowane ulepszenia w sklepie. Tej operacji NIE MOŻNA cofnąć.");
    
    if (firstConfirm) {
        // Druga weryfikacja (zabezpieczenie przed przypadkowym kliknięciem)
        const secondConfirm = confirm("🔥 OSTATECZNE OSTRZEŻENIE 🔥\n\nTwoje królestwo zostanie obrócone w pył, a Ty zaczniesz jako zwykły górnik z pustymi rękami. Czy kontynuować destrukt?");
        
        if (secondConfirm) {
            // 1. Czyszczenie pamięci zapisu automatycznego
            localStorage.removeItem('medieval_clicker_autosave');
            localStorage.removeItem('clicker_tutorial_passed');
            localStorage.removeItem('clicker_current_song_index');
            
            // 2. Zerowanie wartości systemowych w pamięci podręcznej okna
            gems = 0;
            if (typeof magicalCrystals !== 'undefined') magicalCrystals = 0;
            isTutorialPassed = false;

            // 3. Reset ulepszeń do wartości bazowych
            if (typeof upgrades !== 'undefined') {
                Object.keys(upgrades).forEach(key => {
                    upgrades[key].level = 0;
                    if (upgrades[key].baseCost) upgrades[key].cost = upgrades[key].baseCost;
                });
            }

            if (typeof shopUpgrades !== 'undefined') {
                Object.keys(shopUpgrades).forEach(key => {
                    shopUpgrades[key].level = 0;
                    if (shopUpgrades[key].baseCost) shopUpgrades[key].cost = shopUpgrades[key].baseCost;
                });
            }

            console.log("Niszczenie starego świata powiodło się... Inicjalizacja nowego królestwa.");
            
            // 4. Przeładowanie strony w celu zresetowania zmiennych i interwałów czasowych
            location.reload();
        }
    }
}

// Synchronizacja przycisku wyciszenia przy starcie (opcjonalnie)
document.addEventListener("DOMContentLoaded", () => {
    const muteBtn = document.getElementById('settings-mute-btn');
    if (muteBtn && typeof isMuted !== 'undefined') {
        muteBtn.innerText = isMuted ? "Włącz Muzykę 🔊" : "Wycisz Muzykę 🔇";
    }
});

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

// --- DYNAMIC SCALED ALTAR SYSTEM ---
let magicalCrystals = 0;
const baseCrystalCost = 1000000; // Koszt bazowy: 1 Milion
const costMultiplier = 1.5;      // Skalowanie: +50% ceny za każdy posiadany kryształ

const crystalCountEl = document.getElementById('crystal-count');
const altarCore = document.getElementById('altar-core');
const altarOrb = altarCore ? altarCore.querySelector('.altar-orb') : null;
const btnTransmute1 = document.getElementById('btn-transmute-1');
const btnTransmuteAll = document.getElementById('btn-transmute-all');

// Funkcja formatująca duże liczby z suffixami (K, M, B, T...)
function formatWithSuffix(value) {
    if (value < 1000) return value.toFixed(0);
    const suffixes = ["", "K", "M", "B", "T", "Q", "Qi", "Sx", "Sp", "Oc", "No", "Dc"];
    const i = Math.floor(Math.log10(value) / 3);
    const formatted = (value / Math.pow(10, i * 3)).toFixed(2);
    return formatted + (suffixes[i] || "e" + (i * 3));
}

// Obliczanie aktualnego kosztu JEDNEGO kolejnego kryształu
function getNextCrystalCost() {
    return Math.floor(baseCrystalCost * Math.pow(costMultiplier, magicalCrystals));
}

// Obliczanie kosztu hurtowego dla przycisku ALL (symulacja bezpiecznej pętli)
function getMaxCrystalsAffordable() {
    let currentGems = gems;
    let count = 0;
    let totalCost = 0;
    let tempCrystals = magicalCrystals;

    while (true) {
        let nextCost = Math.floor(baseCrystalCost * Math.pow(costMultiplier, tempCrystals));
        if (currentGems >= nextCost) {
            currentGems -= nextCost;
            totalCost += nextCost;
            tempCrystals++;
            count++;
        } else {
            break;
        }
    }
    return { amount: count, cost: totalCost };
}

// Funkcja aktualizacji UI Ołtarza
function updateAltarUI() {
    if (!crystalCountEl) return;
    crystalCountEl.innerText = formatWithSuffix(magicalCrystals);

    const nextCost = getNextCrystalCost();
    const costDisplayEl = document.getElementById('crystal-cost-display');
    if (costDisplayEl) {
        costDisplayEl.innerText = formatWithSuffix(nextCost);
    }

    // Walidacja przycisku pojedynczego transmutowania
    if (gems >= nextCost) {
        btnTransmute1.disabled = false;
        btnTransmute1.innerText = `Transmute 1 Crystal`;
    } else {
        btnTransmute1.disabled = true;
        btnTransmute1.innerText = `Transmute 1 Crystal`;
    }

    // Walidacja przycisku transmutowania WSZYSTKIEGO
    const maxAffordable = getMaxCrystalsAffordable();
    if (maxAffordable.amount > 0) {
        btnTransmuteAll.disabled = false;
        btnTransmuteAll.innerText = `Transmute ALL (+${maxAffordable.amount})`;
    } else {
        btnTransmuteAll.disabled = true;
        btnTransmuteAll.innerText = `Transmute ALL Possible`;
    }
}

// Podpięcie pod pętlę gry
const originalGameLoop = gameLoop;
gameLoop = function(timestamp) {
    originalGameLoop(timestamp);
    updateAltarUI();
};

// RYTUAŁ TRANSMUTACJI (Z UWZGLĘDNIENIEM NOWEJ CENY)
function performRitual(crystalAmount, totalCost) {
    gems -= totalCost;
    magicalCrystals += crystalAmount;
    if (typeof updateGems === "function") updateGems();
    updateAltarUI();

    // 1. Audio tweak (przyciszenie tła pod sfx)
    let originalVolume = bgMusic.volume;
    if (!isMuted) {
        bgMusic.volume = 0.1; 
        const transSound = new Audio('media/transmutation.mp3'); 
        transSound.volume = 1.0;
        transSound.play().catch(()=>{});
    }

    // 2. Animacje wizualne ołtarza
    if (altarCore && altarOrb) {
        altarCore.classList.add('altar-shake');
        altarOrb.classList.add('altar-blast');
    }

    // Generowanie magicznych particlesów
    for(let i=0; i<30; i++) {
        createAltarParticle();
    }

    // 3. Koniec inkantacji (po 800ms) i modal
    setTimeout(() => {
        if (altarCore && altarOrb) {
            altarCore.classList.remove('altar-shake');
            altarOrb.classList.remove('altar-blast');
        }
        if (!isMuted) bgMusic.volume = originalVolume;

        spawnCongratsModal(crystalAmount);
    }, 800);
}
// --- ZAAWANSOWANY SYSTEM PULI MISJI I WYMAGAŃ ---
const MISSION_POOL = [
    { id: 1, title: "Oczyszczanie Korytarzy z Goblinów", desc: "Plaga goblinów blokuje dolne szyby wydobywcze. Wymagane wsparcie bojowe i nadzór.", baseDuration: 25, gemMultiplier: 8, requiredUnits: { iron_hammers: 1, mine_inspector: 1 } },
    { id: 2, title: "Głęboka Eskorta Szybu", desc: "Zabezpiecz najniższe korytarze przed dzikimi bestiami z głębi ziemi.", baseDuration: 15, gemMultiplier: 5, requiredUnits: { miner: 2 } },
    { id: 3, title: "Ekstrakcja Kryształowej Żyły", desc: "Prowadź zaawansowane operacje wydobywcze w strefie niestabilnej tektonicznie.", baseDuration: 60, gemMultiplier: 18, requiredUnits: { quarry: 1, mine_inspector: 1 } },
    { id: 4, title: "Odzyskiwanie Zalanego Szybu", desc: "Wypompuj toksyczną wodę i odzyskaj porzucone ciężkie maszyny górnicze.", baseDuration: 120, gemMultiplier: 45, requiredUnits: { alchemic: 1, miner: 3 } },
    { id: 5, title: "Kalibracja Runicznego Golema", desc: "Zharmonizuj niestabilne rdzenie magiczne konstrukcji wewnątrz głównego kamieniołomu.", baseDuration: 90, gemMultiplier: 35, requiredUnits: { runic_golem: 1, earth_mage: 1 } },
    { id: 6, title: "Uszczelnianie Magmowego Ujścia", desc: "Powstrzymaj ekstremalne ciśnienie geotermalne, zanim stopi górne poziomy operacyjne.", baseDuration: 180, gemMultiplier: 90, requiredUnits: { gem_tower: 1, deep_shaft: 1 } }
];

// Trzy stałe sloty na misje widoczne na tablicy
let missionSlots = [
    { status: "empty", mission: null, timeLeft: 0, setupUnits: {}, activeUnits: {}, cooldownLeft: 0, timerId: null, cooldownTimerId: null },
    { status: "empty", mission: null, timeLeft: 0, setupUnits: {}, activeUnits: {}, cooldownLeft: 0, timerId: null, cooldownTimerId: null },
    { status: "empty", mission: null, timeLeft: 0, setupUnits: {}, activeUnits: {}, cooldownLeft: 0, timerId: null, cooldownTimerId: null }
];

// Losowanie nowych misji do pustych slotów z zachowaniem unikalności na tablicy
function fillMissionSlots() {
    missionSlots.forEach(slot => {
        if (slot.status === "empty" && slot.cooldownLeft <= 0) {
            const currentlyUsedIds = missionSlots.filter(s => s.mission).map(s => s.mission.id);
            const availableMissions = MISSION_POOL.filter(m => !currentlyUsedIds.includes(m.id));
            
            if (availableMissions.length > 0) {
                const randomMission = availableMissions[Math.floor(Math.random() * availableMissions.length)];
                slot.status = "available";
                slot.mission = { ...randomMission };
                slot.setupUnits = {};
                slot.activeUnits = {};
            }
        }
    });
}

function getFreeUnits(unitKey) {
    let busyUnits = 0;
    missionSlots.forEach(slot => {
        if (slot.status === "active" && slot.activeUnits[unitKey]) busyUnits += slot.activeUnits[unitKey];
        if (slot.status === "available" && slot.setupUnits[unitKey]) busyUnits += slot.setupUnits[unitKey];
    });
    return upgrades[unitKey].level - busyUnits;
}

function calculateMissionReward(mission, unitsAllocation) {
    let totalPower = 0;
    Object.keys(unitsAllocation).forEach(key => {
        let count = unitsAllocation[key] || 0;
        if (count <= 0) return;

        let shopKey = key === 'miner' ? 'miner_gear' : 
                      key === 'quarry' ? 'quarry_gear' : 
                      key === 'catapult' ? 'catapult_gear' : `${key}_gear`;
        if (key === 'mine_inspector') shopKey = 'inspector_gear';
        if (key === 'iron_hammers') shopKey = 'iron_hammers_gear';
        if (key === 'runic_golem') shopKey = 'golem_gear';

        let shopMultiplier = 1;
        if (shopUpgrades[shopKey]) {
            shopMultiplier = Math.pow(shopUpgrades[shopKey].multiplier, shopUpgrades[shopKey].level);
        }
        totalPower += count * upgrades[key].efficiency * shopMultiplier;
    });
    return Math.floor(totalPower * mission.baseDuration * mission.gemMultiplier);
}

function changeMissionUnits(slotIndex, unitKey, amount) {
    const slot = missionSlots[slotIndex];
    if (!slot || slot.status !== "available") return;

    if (!slot.setupUnits[unitKey]) slot.setupUnits[unitKey] = 0;

    if (amount > 0 && amount <= getFreeUnits(unitKey)) {
        slot.setupUnits[unitKey] += amount;
    } else if (amount < 0 && slot.setupUnits[unitKey] >= Math.abs(amount)) {
        slot.setupUnits[unitKey] += amount;
    }
    renderMissions();
}

function setMissionUnits(slotIndex, unitKey, value) {
    const slot = missionSlots[slotIndex];
    if (!slot || slot.status !== "available") return;
    
    let parsedValue = parseInt(value) || 0;
    if (parsedValue < 0) parsedValue = 0;
    
    let currentSetup = slot.setupUnits[unitKey] || 0;
    slot.setupUnits[unitKey] = 0; 
    let maxAvailable = currentSetup + getFreeUnits(unitKey);
    
    if (parsedValue > maxAvailable) parsedValue = maxAvailable;
    
    slot.setupUnits[unitKey] = parsedValue;
    renderMissions();
}

// Sprawdzanie czy sztywno zdefiniowane bariery jednostek dla typu misji są spełnione
function checkMissionRequirements(slot) {
    if (!slot.mission || !slot.mission.requiredUnits) return true;
    let allMet = true;
    Object.keys(slot.mission.requiredUnits).forEach(unitKey => {
        const requiredCount = slot.mission.requiredUnits[unitKey];
        const assignedCount = slot.setupUnits[unitKey] || 0;
        if (assignedCount < requiredCount) {
            allMet = false;
        }
    });
    return allMet;
}

function startMission(slotIndex) {
    const slot = missionSlots[slotIndex];
    if (!slot || slot.status !== "available") return;

    // Blokada uruchomienia jeśli gracz nie przydzielił wymaganych jednostek specjalnych
    if (!checkMissionRequirements(slot)) {
        console.log("Nie można rozpocząć! Brak wymaganych specjalistów na misji.");
        return;
    }

    let totalAssigned = Object.values(slot.setupUnits).reduce((a, b) => a + b, 0);
    if (totalAssigned <= 0) return;

    slot.status = "active";
    slot.activeUnits = { ...slot.setupUnits };
    slot.timeLeft = slot.mission.baseDuration;

    slot.timerId = setInterval(() => {
        slot.timeLeft--;

        if (slot.timeLeft <= 0) {
            clearInterval(slot.timerId);
            
            let finalReward = calculateMissionReward(slot.mission, slot.activeUnits);
            gems += finalReward;
            
            // Uruchomienie czasu oczekiwania na nową misję (Slot staje się pusty)
            slot.status = "empty";
            slot.mission = null;
            slot.activeUnits = {};
            slot.setupUnits = {};
            slot.cooldownLeft = 20; // Czas w sekundach, przez jaki slot będzie pusty
            
            console.log(`Misja ukończona! Zdobyto: ${finalReward} 💎`);
            updateGems();
            startCooldown(slotIndex);
        }
        renderMissions();
    }, 1000);

    renderMissions();
}

function startCooldown(slotIndex) {
    const slot = missionSlots[slotIndex];
    slot.cooldownTimerId = setInterval(() => {
        slot.cooldownLeft--;
        if (slot.cooldownLeft <= 0) {
            clearInterval(slot.cooldownTimerId);
            fillMissionSlots();
        }
        renderMissions();
    }, 1000);
}

function renderMissions() {
    const container = document.getElementById('missions-container');
    if (!container) return;

    const upgradeNames = {
        miner: "Miner", quarry: "Quarry", catapult: "Catapult", iron_hammers: "Iron Hammer Order",
        mine_inspector: "Mine Inspector", runic_golem: "Runic Golem", alchemic: "Alchemic",
        earth_mage: "Earth Mage", deep_shaft: "Deep Shaft", gem_tower: "Gem Tower"
    };

    // Zawsze renderujemy dokładnie 3 sloty z puli
    container.innerHTML = missionSlots.map((slot, idx) => {
        
        // Stan 1: Slot pusty (Oczekiwanie na nową misję / Cooldown)
        if (slot.status === "empty") {
            return `
                <div class="mission-card cooldown-slot">
                    <div class="cooldown-hourglass">⏳</div>
                    <h3>Poszukiwanie kontraktów...</h3>
                    <p>Nowe zlecenia pojawią się za: <strong>${slot.cooldownLeft}s</strong></p>
                </div>
            `;
        }

        let expectedReward = calculateMissionReward(slot.mission, slot.status === "active" ? slot.activeUnits : slot.setupUnits);

        // Stan 2: Misja aktywna (Wykonywana)
        if (slot.status === "active") {
            let deployedList = Object.keys(slot.activeUnits)
                .filter(k => slot.activeUnits[k] > 0)
                .map(k => `${upgradeNames[k]}: ${slot.activeUnits[k]}`)
                .join(', ');

            return `
                <div class="mission-card active-mission">
                    <div class="mission-timer-ring">${slot.timeLeft}s</div>
                    <div class="mission-info">
                        <h3>${slot.mission.title}</h3>
                        <p class="mission-status-text"><strong>Status:</strong> Ekspedycja w toku</p>
                        <p class="mission-status-text" style="font-size:0.85rem; color:#94a3b8;">(${deployedList})</p>
                        <div class="mission-live-reward">Łup: +${formatNumber(expectedReward)} 💎</div>
                    </div>
                </div>
            `;
        } 
        
        // Stan 3: Misja dostępna do konfiguracji i startu
        else {
            let unlockedUnits = Object.keys(upgrades).filter(k => upgrades[k].level > 0);
            
            // Renderowanie wizualnego wyznacznika wymagań (Wymagane Jednostki Specjalne)
            let requirementsHTML = "";
            let reqsMet = checkMissionRequirements(slot);
            
            if (slot.mission.requiredUnits) {
                requirementsHTML = `<div class="mission-requirements-title">Wymagany skład obowiązkowy:</div><div class="mission-req-box">`;
                Object.keys(slot.mission.requiredUnits).forEach(reqKey => {
                    let requiredNum = slot.mission.requiredUnits[reqKey];
                    let currentAssigned = slot.setupUnits[reqKey] || 0;
                    let isMet = currentAssigned >= requiredNum;
                    requirementsHTML += `
                        <span class="mission-req-item ${isMet ? 'met' : 'unmet'}">
                            ${isMet ? '✅' : '❌'} ${upgradeNames[reqKey]}: ${currentAssigned}/${requiredNum}
                        </span>
                    `;
                });
                requirementsHTML += `</div>`;
            }

            let totalMineIncome = Object.keys(upgrades).reduce((sum, key) => {
                let shopKey = key === 'miner' ? 'miner_gear' : key === 'quarry' ? 'quarry_gear' : key === 'catapult' ? 'catapult_gear' : `${key}_gear`;
                if (key === 'mine_inspector') shopKey = 'inspector_gear';
                if (key === 'iron_hammers') shopKey = 'iron_hammers_gear';
                if (key === 'runic_golem') shopKey = 'golem_gear';

                let shopMultiplier = 1;
                if (shopUpgrades[shopKey]) shopMultiplier = Math.pow(shopUpgrades[shopKey].multiplier, shopUpgrades[shopKey].level);
                return sum + (upgrades[key].level * upgrades[key].efficiency * shopMultiplier);
            }, 0);

            let unitSelectorsHTML = unlockedUnits.map(k => {
                let currentSetup = slot.setupUnits[k] || 0;
                let free = getFreeUnits(k);
                
                let shopKey = k === 'miner' ? 'miner_gear' : k === 'quarry' ? 'quarry_gear' : k === 'catapult' ? 'catapult_gear' : `${k}_gear`;
                if (k === 'mine_inspector') shopKey = 'inspector_gear';
                if (k === 'iron_hammers') shopKey = 'iron_hammers_gear';
                if (k === 'runic_golem') shopKey = 'golem_gear';

                let shopMultiplier = 1;
                if (shopUpgrades[shopKey]) shopMultiplier = Math.pow(shopUpgrades[shopKey].multiplier, shopUpgrades[shopKey].level);

                let singleUnitIncome = upgrades[k].efficiency * shopMultiplier;
                let totalUpgradeIncome = upgrades[k].level * singleUnitIncome;
                let sharePercent = totalMineIncome > 0 ? ((totalUpgradeIncome / totalMineIncome) * 100).toFixed(1) : 0;

                return `
                    <div class="mission-control-box">
                        <div class="control-info-wrapper">
                            <span class="control-label">${upgradeNames[k]} (Dostępni: ${free}):</span>
                            <div class="unit-analytics">
                                <span>1x: +${formatNumber(singleUnitIncome)}/s</span>
                                <span class="separator">|</span>
                                <span>Udział: ${sharePercent}%</span>
                            </div>
                        </div>
                        <div class="counter-actions">
                            <button onclick="changeMissionUnits(${idx}, '${k}', -1); event.stopPropagation();" class="btn-ctrl">-</button>
                            <input type="number" 
                                   value="${currentSetup}" 
                                   min="0" 
                                   max="${currentSetup + free}" 
                                   onclick="event.stopPropagation();"
                                   onchange="setMissionUnits(${idx}, '${k}', this.value)"
                                   onkeyup="if(event.key === 'Enter') this.blur();"
                                   class="unit-counter-input" />
                            <button onclick="changeMissionUnits(${idx}, '${k}', 1); event.stopPropagation();" class="btn-ctrl" ${free <= 0 ? 'disabled' : ''}>+</button>
                        </div>
                    </div>
                `;
            }).join('');

            return `
                <div class="mission-card">
                    <h3>${slot.mission.title}</h3>
                    <p class="mission-desc">${slot.mission.desc}</p>
                    
                    ${requirementsHTML}
                    
                    <div class="mission-meta">
                        <span>Czas: ${slot.mission.baseDuration}s</span>
                        <span>Przewidywany Łup: +${formatNumber(expectedReward)} 💎</span>
                    </div>
                    <div class="mission-selectors-container">
                        ${unitSelectorsHTML}
                    </div>
                    <button onclick="startMission(${idx})" class="btn-launch" ${(expectedReward <= 0 || !reqsMet) ? 'disabled' : ''}>Wyślij Ekspedycję</button>
                </div>
            `;
        }
    }).join('');
}

// Inicjalne napełnienie tablicy misji przy startu gry
fillMissionSlots();

// Generator cząsteczek magii
function createAltarParticle() {
    if (!altarCore) return;
    const p = document.createElement('div');
    p.style.position = 'fixed';
    p.style.pointerEvents = 'none';
    p.style.zIndex = '99999';
    
    const rect = altarCore.getBoundingClientRect();
    const startX = rect.left + rect.width/2;
    const startY = rect.top + rect.height/2;
    
    p.style.left = startX + 'px';
    p.style.top = startY + 'px';
    p.innerText = Math.random() > 0.5 ? '✨' : '🔮';
    p.style.fontSize = (Math.random() * 20 + 10) + 'px';
    p.style.transition = 'all 0.8s cubic-bezier(0.1, 0.8, 0.3, 1)';
    
    document.body.appendChild(p);
    
    setTimeout(() => {
        const angle = Math.random() * Math.PI * 2;
        const dist = Math.random() * 160 + 60;
        p.style.transform = `translate(${Math.cos(angle)*dist}px, ${Math.sin(angle)*dist}px) scale(0)`;
        p.style.opacity = '0';
    }, 10);
    
    setTimeout(() => p.remove(), 800);
}

// Generator Okna Gratulacji
function spawnCongratsModal(amount) {
    const overlay = document.createElement('div');
    overlay.className = 'congrats-overlay';
    
    overlay.innerHTML = `
        <div class="congrats-banner">
            <h2 class="congrats-title">CONGRATS!</h2>
            <p class="congrats-subtitle">You have successfully manufactured <strong>${formatWithSuffix(amount)}</strong> Magical Crystal${amount > 1 ? 's' : ''}! 🔮</p>
            <button class="btn-altar" id="btn-congrats-close">Claim Power</button>
        </div>
    `;
    
    document.body.appendChild(overlay);
    
    document.getElementById('btn-congrats-close').onclick = () => {
        overlay.remove();
    };
}

// Handlery Kliknięć z przekazaniem precyzyjnych kosztów
if (btnTransmute1) {
    btnTransmute1.onclick = (e) => {
        e.stopPropagation();
        const cost = getNextCrystalCost();
        if (gems >= cost) performRitual(1, cost);
    };
}

if (btnTransmuteAll) {
    btnTransmuteAll.onclick = (e) => {
        e.stopPropagation();
        const maxAffordable = getMaxCrystalsAffordable();
        if (maxAffordable.amount > 0) performRitual(maxAffordable.amount, maxAffordable.cost);
    };
}

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

// --- ADVANCED MULTI-UNIT MISSION SYSTEM ---
let missionsState = [
    { id: 1, title: "Deep Shaft Escort", desc: "Secure the lower tunnels against feral deep-earth beasts.", baseDuration: 15, active: false, timeLeft: 0, setupUnits: {}, activeUnits: {}, gemMultiplier: 5, timerId: null },
    { id: 2, title: "Crystal Vein Extraction", desc: "Conduct high-yield mining operations in a tectonically unstable zone.", baseDuration: 60, active: false, timeLeft: 0, setupUnits: {}, activeUnits: {}, gemMultiplier: 15, timerId: null },
    { id: 3, title: "Flooded Shaft Reclamation", desc: "Pump out toxic water and recover lost heavy mining machinery.", baseDuration: 180, active: false, timeLeft: 0, setupUnits: {}, activeUnits: {}, gemMultiplier: 50, timerId: null }
];

// Calculate available units of a specific type
function getFreeUnits(unitKey) {
    let busyUnits = 0;
    missionsState.forEach(m => {
        if (m.active && m.activeUnits[unitKey]) busyUnits += m.activeUnits[unitKey];
        if (!m.active && m.setupUnits[unitKey]) busyUnits += m.setupUnits[unitKey];
    });
    return upgrades[unitKey].level - busyUnits;
}

// Dynamically calculate cumulative mission reward based on all sent unit types
function calculateMissionReward(mission, unitsAllocation) {
    let totalPower = 0;
    
    Object.keys(unitsAllocation).forEach(key => {
        let count = unitsAllocation[key] || 0;
        if (count <= 0) return;

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

        let shopMultiplier = 1;
        if (shopKey && shopUpgrades[shopKey]) {
            shopMultiplier = Math.pow(shopUpgrades[shopKey].multiplier, shopUpgrades[shopKey].level);
        }

        totalPower += count * upgrades[key].efficiency * shopMultiplier;
    });

    return Math.floor(totalPower * mission.baseDuration * mission.gemMultiplier);
}

function changeMissionUnits(missionId, unitKey, amount) {
    const mission = missionsState.find(m => m.id === missionId);
    if (!mission || mission.active) return;

    if (!mission.setupUnits[unitKey]) mission.setupUnits[unitKey] = 0;

    if (amount > 0 && amount <= getFreeUnits(unitKey)) {
        mission.setupUnits[unitKey] += amount;
        renderMissions();
    } else if (amount < 0 && mission.setupUnits[unitKey] >= Math.abs(amount)) {
        mission.setupUnits[unitKey] += amount;
        renderMissions();
    }
}

function startMission(missionId) {
    const mission = missionsState.find(m => m.id === missionId);
    if (!mission || mission.active) return;

    // Sanity check: verify if at least one unit is assigned
    let totalAssigned = Object.values(mission.setupUnits).reduce((a, b) => a + b, 0);
    if (totalAssigned <= 0) return;

    mission.active = true;
    mission.activeUnits = { ...mission.setupUnits };
    mission.timeLeft = mission.baseDuration;

    mission.timerId = setInterval(() => {
        mission.timeLeft--;

        if (mission.timeLeft <= 0) {
            clearInterval(mission.timerId);
            
            let finalReward = calculateMissionReward(mission, mission.activeUnits);
            gems += finalReward;
            
            mission.active = false;
            mission.activeUnits = {};
            mission.setupUnits = {};
            
            console.log(`Mission completed! Earned: ${finalReward} 💎`);
            updateGems();
        }
        renderMissions();
    }, 1000);

    renderMissions();
}

function toggleMissionExpand(missionId) {
    const mission = missionsState.find(m => m.id === missionId);
    if (mission) {
        mission.expanded = !mission.expanded;
        renderMissions();
    }
}
function setMissionUnits(missionId, unitKey, value) {
    const mission = missionsState.find(m => m.id === missionId);
    if (!mission || mission.active) return;
    
    let parsedValue = parseInt(value) || 0;
    if (parsedValue < 0) parsedValue = 0;
    
    let currentSetup = mission.setupUnits[unitKey] || 0;
    mission.setupUnits[unitKey] = 0; // Reset na czas kalkulacji puli
    let maxAvailable = currentSetup + getFreeUnits(unitKey);
    
    if (parsedValue > maxAvailable) parsedValue = maxAvailable;
    
    mission.setupUnits[unitKey] = parsedValue;
    renderMissions();
}
function renderMissions() {
    const container = document.getElementById('missions-container');
    if (!container) return;

    const upgradeNames = {
        miner: "Miner", quarry: "Quarry", catapult: "Catapult", iron_hammers: "Iron Hammer Order",
        mine_inspector: "Mine Inspector", runic_golem: "Runic Golem", alchemic: "Alchemic",
        earth_mage: "Earth Mage", deep_shaft: "Deep Shaft", gem_tower: "Gem Tower"
    };

    container.innerHTML = missionsState.map(m => {
        let expectedReward = calculateMissionReward(m, m.active ? m.activeUnits : m.setupUnits);
        
        if (m.active) {
            let deployedList = Object.keys(m.activeUnits)
                .filter(k => m.activeUnits[k] > 0)
                .map(k => `${upgradeNames[k]}: ${m.activeUnits[k]}`)
                .join(', ');

            return `
                <div class="mission-card active-mission">
                    <div class="mission-timer-ring">${m.timeLeft}s</div>
                    <div class="mission-info">
                        <h3>${m.title}</h3>
                        <p class="mission-status-text"><strong>Status:</strong> Workforce Deployed</p>
                        <p class="mission-status-text" style="font-size:0.85rem; color:#94a3b8;">(${deployedList})</p>
                        <div class="mission-live-reward">Expected Loot: +${formatNumber(expectedReward)} 💎</div>
                    </div>
                </div>
            `;
        } else {
            // 1. Obliczamy łączny dochód CAŁEJ kopalni z uwzględnieniem poprawnego klucza golema
            let totalMineIncome = Object.keys(upgrades).reduce((sum, key) => {
                let shopKey = key === 'miner' ? 'miner_gear' : 
                              key === 'quarry' ? 'quarry_gear' : 
                              key === 'catapult' ? 'catapult_gear' : `${key}_gear`;
                if (key === 'mine_inspector') shopKey = 'inspector_gear';
                if (key === 'iron_hammers') shopKey = 'iron_hammers_gear';
                if (key === 'runic_golem') shopKey = 'golem_gear'; // FIX: Poprawny klucz ulepszenia golema

                let shopMultiplier = 1;
                if (shopUpgrades[shopKey]) {
                    shopMultiplier = Math.pow(shopUpgrades[shopKey].multiplier, shopUpgrades[shopKey].level);
                }
                return sum + (upgrades[key].level * upgrades[key].efficiency * shopMultiplier);
            }, 0);

            let unlockedUnits = Object.keys(upgrades).filter(k => upgrades[k].level > 0);
            
            let unitSelectorsHTML = unlockedUnits.map(k => {
                let currentSetup = m.setupUnits[k] || 0;
                let free = getFreeUnits(k);
                
                let shopKey = k === 'miner' ? 'miner_gear' : 
                              k === 'quarry' ? 'quarry_gear' : 
                              k === 'catapult' ? 'catapult_gear' : `${k}_gear`;
                if (k === 'mine_inspector') shopKey = 'inspector_gear';
                if (k === 'iron_hammers') shopKey = 'iron_hammers_gear';
                if (k === 'runic_golem') shopKey = 'golem_gear'; // FIX: Poprawny klucz ulepszenia golema

                let shopMultiplier = 1;
                if (shopUpgrades[shopKey]) {
                    shopMultiplier = Math.pow(shopUpgrades[shopKey].multiplier, shopUpgrades[shopKey].level);
                }

                // 2. Właściwa kalkulacja oparta o efficiency i ulepszenia
                let singleUnitIncome = upgrades[k].efficiency * shopMultiplier;
                let totalUpgradeIncome = upgrades[k].level * singleUnitIncome;
                let sharePercent = totalMineIncome > 0 ? ((totalUpgradeIncome / totalMineIncome) * 100).toFixed(1) : 0;

                return `
                    <div class="mission-control-box">
                        <div class="control-info-wrapper">
                            <span class="control-label">${upgradeNames[k]} (Avail: ${free}):</span>
                            <div class="unit-analytics">
                                <span>1x: +${formatNumber(singleUnitIncome)}/s</span>
                                <span class="separator">|</span>
                                <span>Total: +${formatNumber(totalUpgradeIncome)}/s</span>
                                <span class="separator">|</span>
                                <span class="analytics-percent">${sharePercent}% kopalni</span>
                            </div>
                        </div>
                        <div class="counter-actions">
                            <button onclick="changeMissionUnits(${m.id}, '${k}', -1); event.stopPropagation();" class="btn-ctrl">-</button>
                            <input type="number" 
                                   value="${currentSetup}" 
                                   min="0" 
                                   max="${currentSetup + free}" 
                                   onclick="event.stopPropagation();"
                                   onchange="setMissionUnits(${m.id}, '${k}', this.value)"
                                   onkeyup="if(event.key === 'Enter') this.blur();"
                                   class="unit-counter-input" />
                            <button onclick="changeMissionUnits(${m.id}, '${k}', 1); event.stopPropagation();" class="btn-ctrl" ${free <= 0 ? 'disabled' : ''}>+</button>
                        </div>
                    </div>
                `;
            }).join('');

            // FIX: Dodany brakujący return dla wygenerowanej karty nieaktywnej misji
            return `
                <div class="mission-card">
                    <h3>${m.title}</h3>
                    <p class="mission-desc">${m.desc}</p>
                    <div class="mission-meta">
                        <span>Duration: ${m.baseDuration}s</span>
                        <span>Loot: +${formatNumber(expectedReward)} 💎</span>
                    </div>
                    <div class="mission-selectors-container">
                        ${unitSelectorsHTML}
                    </div>
                    <button onclick="startMission(${m.id})" class="btn-launch" ${expectedReward <= 0 ? 'disabled' : ''}>Launch Mission</button>
                </div>
            `;
        }
    }).join(''); // FIX: Poprawne domknięcie mapowania tablicy misji
}
        
const sidebarButtons = document.querySelectorAll('.sidebar-btn');
const tabContents = document.querySelectorAll('.tab-content');

function handleSidebarNavigation() {
    const sidebarButtons = document.querySelectorAll('.sidebar-btn');
    const tabContents = document.querySelectorAll('.tab-content');

    // Funkcja dynamicznie sprawdzająca progi i aplikująca znaki zapytania oraz klasy CSS
    function updateSidebarLocks() {
        sidebarButtons.forEach(btn => {
            const targetTabId = btn.getAttribute('data-tab');
            const labelSpan = btn.querySelector('span');
            
            if (targetTabId === 'tavern-tab' || targetTabId === 'altar-tab') {
                if (gems < 1000000) {
                    if (labelSpan) labelSpan.innerText = "???";
                    btn.classList.add('locked-sidebar-btn');
                } else {
                    if (labelSpan) {
                        labelSpan.innerText = targetTabId === 'tavern-tab' ? "Tavern" : "Altar";
                    }
                    btn.classList.remove('locked-sidebar-btn');
                }
            }
        });
    }

    sidebarButtons.forEach(btn => {
        btn.onclick = (e) => {
            e.stopPropagation();
            const targetTabId = btn.getAttribute('data-tab');

            // Blokada mechaniczna kliknięcia poniżej 1 000 000 klejnotów
            if ((targetTabId === 'tavern-tab' || targetTabId === 'altar-tab') && gems < 1000000) {
                console.log("Ta sekcja jest jeszcze zablokowana! Potrzebujesz 1.00M Gems.");
                return;
            }

            sidebarButtons.forEach(b => b.classList.remove('active'));
            tabContents.forEach(tab => tab.classList.add('hidden'));

            btn.classList.add('active');
            const targetTab = document.getElementById(targetTabId);
            if (targetTab) {
                targetTab.classList.remove('hidden');
                if (targetTabId === 'tavern-tab') {
                    renderMissions();
                }
            }
        };
    });

    // Podpinamy aktualizację wizualną blokad pod pętlę gry
    const originalAltarLoop = gameLoop;
    gameLoop = function(timestamp) {
        originalAltarLoop(timestamp);
        updateSidebarLocks();
    };
}

// Wywołanie nawigacji
handleSidebarNavigation();


function saveGameToFile() {
        const dataToSave = {
                gems: gems,
                magicalCrystals: magicalCrystals, // NOWA WALUTA
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
                        if (typeof loadedData.magicalCrystals === "number") {
                                magicalCrystals = loadedData.magicalCrystals; // WCZYTYWANIE NOWEJ WALUTY
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
                        if (typeof updateAltarUI === 'function') updateAltarUI();
                        renderMissions();

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
                magicalCrystals: magicalCrystals, // AUTOSAVE NOWEJ WALUTY
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
                        
                        if (typeof parsed.magicalCrystals === "number") {
                            magicalCrystals = parsed.magicalCrystals; // AUTOLOAD NOWEJ WALUTY
                        }

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
                        if (typeof updateAltarUI === 'function') updateAltarUI();
                        renderMissions();

                        console.log("Backup Loaded Successfully.");
                } catch (e) {
                        console.error("Backup loading failed", e);
                }
        }
}

silentLoad();

renderMissions();