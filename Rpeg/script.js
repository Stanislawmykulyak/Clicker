// 1. GLOBALNY OBIEKT STANU GRY (Mózg Gry)
const gameState = {
    currentAct: 1,
    resources: {
        gold: 150,
        supplies: 60,
        commanderCoins: 5 // Dodana wcześniej waluta[cite: 18]
    },
    campUpgrades: {
        infirmaryLevel: 1,
        smithyLevel: 1
    },
    inventory: {
        swords: 0,
        armors: 0,
        hornOfCourage: 0
    },
    isExpeditionRunning: false, // Blokada spamu zwiadu
    army: [],
    goldBonusPerBattle: 0,
};

let canvasLoopInterval = null;

const soldierPools = {
    human: {
        names: ["Edric", "Garrick", "Rowena", "Aldus", "Valen", "Kaelen"],
        skins: ["Light", "Tan", "Dark"],
        eyes: ["Blue", "Green", "Brown"],
        hair: ["Blond", "Brown", "Black", "Grey"]
    },
    elf: {
        names: ["Galon", "Thranil", "Lirael", "Aelith", "Finarfin", "Eldrin"],
        skins: ["Pale", "Fair"],
        eyes: ["Gold", "Silver", "Emerald"],
        hair: ["Silver", "Golden", "White", "Midnight Black"]
    },
    dwarf: {
        names: ["Thorin", "Broggan", "Dain", "Hilda", "Gimli", "Marni"],
        skins: ["Ruddy", "Weathered"],
        eyes: ["Dark Brown", "Grey"],
        hair: ["Red", "Brown", "Black", "Grey Broard"]
    }
};

const companions = [
    { name: "Eleniel Voidweaver", race: "Elf", role: "Battle-Mage", assignedTo: null },
    { name: "Kaelen Moss-Foot", race: "Faun", role: "Pathfinder", assignedTo: null },
    { name: "Brammer Stoneshield", race: "Dwarf", role: "Tank", assignedTo: null },
    { name: "Vaelra Embersoul", race: "Drakonid", role: "Dragon-Knight", assignedTo: null },
    { name: "Korr Earth-Bound", race: "Goliath", role: "Juggernaut", assignedTo: null },
    { name: "Skrag Short-Fuse", race: "Goblin", role: "Saper", assignedTo: null }
];

let travelState = {
    currentLocation: 'camp',
    unlockedLocations: ['camp', 'forest'] // Na start odblokowany Obóz i Las
};
let battleState = {
    allies: [
        // Twój Bohater jako potężna jednostka
        {
            id: 'hero_1',
            name: 'Artas (Bohater)',
            type: 'hero',
            x: 100,
            y: 200,
            size: 22,
            speed: 2.5,
            hp: 250,
            maxHp: 250,
            damage: 25,
            defense: 8,
            attackRange: 30,
            color: '#00ffcc',
            target: null // Tu system AI wpisze aktualnego wroga
        },
        // Zwykły żołnierz nr 1
        {
            id: 'ally_1',
            name: 'Wojownik',
            type: 'soldier',
            x: 80,
            y: 150,
            size: 16,
            speed: 1.8,
            hp: 100,
            maxHp: 100,
            damage: 12,
            defense: 4,
            attackRange: 25,
            color: '#3366ff',
            target: null
        }
    ],
    enemies: [
        // Przykładowy wróg na start
        {
            id: 'enemy_1',
            name: 'Szkielet',
            type: 'monster',
            x: 600,
            y: 180,
            size: 16,
            speed: 1.5,
            hp: 80,
            maxHp: 80,
            damage: 10,
            defense: 2,
            attackRange: 25,
            color: '#ff3333',
            target: null
        }
    ],
    isRunning: false,
    combatLog: []
};

const mapLocations = [
    { id: 'camp', name: '⛺ Bezpieczna Polana', desc: 'Miejsce wypoczynku Twojej drużyny. Tu regenerujecie siły.', req: null },
    { id: 'forest', name: '🌲 Stary Las', desc: 'Gęste winorośle i grasujące wilki. Dobre miejsce na początek.', req: null },
    { id: 'caves', name: '🪨 Mroczne Jaskinie', desc: 'Kopalnie opanowane przez Gobliny. Wymaga zabezpieczenia Lasu.', req: 'forest' },
    { id: 'castle', name: '🏰 Zamek Zardasa', desc: 'Siedziba czarnoksiężnika. Ostateczne starcie.', req: 'caves' }
];

const travelQuotes = [
    "„Słońce chowało się za horyzontem, gdy drużyna przedzierała się przez gęste zarośla...”",
    "„Kroki ruszających w drogę wojowników zagłuszał jedynie niepokojący szum wiatru...”",
    "„Wędrówka przez te skażone ziemie niosła ze sobą wyraźny zapach krwi i spalenizny...”",
    "„Trzymając dłonie na rękojeściach mieczy, bacznie obserwowaliście korony drzew...”"
];

const HEALING_COSTS = {
    herbs: 5,   // Potrzeba 5 wiązek rzadkich ziół
    gold: 10
};

//System rekrutacji wojownikow 

function generateSoldier(race) {
    const pool = soldierPools[race] || soldierPools.human; // Fallback do ludzi

    // Losowanie tożsamości i wyglądu
    const randomName = pool.names[Math.floor(Math.random() * pool.names.length)];
    const randomSkin = pool.skins[Math.floor(Math.random() * pool.skins.length)];
    const randomEyes = pool.eyes[Math.floor(Math.random() * pool.eyes.length)];
    const randomHair = pool.hair[Math.floor(Math.random() * pool.hair.length)];

    // Zwracamy obiekt żołnierza z pełną strukturą statystyk i ekwipunku
    return {
        id: 'unit_' + Math.random().toString(36).substr(2, 9),
        name: randomName,
        race: race,
        appearance: {
            skinColor: randomSkin,
            eyeColor: randomEyes,
            hairStyle: randomHair
        },
        stats: {
            hp: 100,
            maxHp: 100,
            atk: 10,
            xp: 0,
            level: 1
        },
        equipment: {
            weapon: null, // Slot na broń z Kuźni
            armor: null,  // Slot na pancerz z Kuźni
            trinket: null // Slot na talizman od Skraga/Brammera
        },
        status: "Ready" // Ready / Wounded (Szpital Polowy)
    };
}

function useHornOfCourage() {
    if (gameState.inventory.hornOfCourage <= 0) return;
    
    // Konsumpcja zasobu z ekwipunku obozowego
    gameState.inventory.hornOfCourage--;
    
    // Bojowy szał: Zwiększamy obrażenia (ATK) wszystkich żywych sojuszników o 50%
    battleState.allies.forEach(ally => {
        if (ally.stats.hp > 0) {
            ally.stats.atk *= 1.5;
        }
    });

    // Zabezpieczenie przycisku w interfejsie bocznej kolumny
    const hornBtn = document.getElementById('btn-ability-horn');
    if (hornBtn) {
        hornBtn.innerText = `📯 Róg Odwagi (${gameState.inventory.hornOfCourage})`;
        hornBtn.disabled = true;
    }
    
    showNotification("📯 Arkelas dmie w Róg Odwagi! Atak Twoich wojsk wzrósł o 50%!", "success")
}

// Funkcja rekrutacji dodająca jednostkę do armii gracza
function recruitSoldier(race) {
    if (gameState.resources.gold >= 50) {
        gameState.resources.gold -= 50;
        const newRecruit = generateSoldier(race);
        gameState.army.push(newRecruit);

        updateResourcesUI();
        console.log(`⚔️ Zrekrutowano: ${newRecruit.name} (${race})! Wgląd w konsoli.`);
        return newRecruit;
    } else {
        console.log("❌ Za mało złota na rekrutację!");
        return null;
    }
}

function renderBarracks() {
    const heroesList = document.getElementById('heroes-list');
    const soldiersList = document.getElementById('soldiers-list');

    if (heroesList) heroesList.innerHTML = '';
    if (soldiersList) soldiersList.innerHTML = '';

    // Helper do generowania przycisków ekwipunku i obsługi zakładania
    const createSlotsHtml = (unitId, isHero, eq) => {
        const weaponText = eq.weapon ? `⚔️ ${eq.weapon}` : '🗡️ Pusty Slot';
        const armorText = eq.armor ? `🛡️ ${eq.armor}` : '🦺 Pusty Slot';
        
        return `
            <div class="unit-equipment" style="display: flex; gap: 8px; margin-top: 8px;">
                <button onclick="equipItem('${unitId}', ${isHero}, 'weapon')" class="equip-btn-action" style="font-size: 0.75rem; padding: 4px 8px;">
                    ${weaponText}
                </button>
                <button onclick="equipItem('${unitId}', ${isHero}, 'armor')" class="equip-btn-action" style="font-size: 0.75rem; padding: 4px 8px;">
                    ${armorText}
                </button>
            </div>
        `;
    };

    // 1. Renderowanie Bohaterów (Oficerów)
    companions.forEach((hero, index) => {
        if (!hero.equipment) {
            hero.equipment = { weapon: null, armor: null, trinket: null };
        }
        const heroId = `hero_${index}`;
        const card = document.createElement('div');
        card.className = 'unit-card';
        card.innerHTML = `
            <div class="unit-info">
                <h4>${hero.name}</h4>
                <p>Rasa: ${hero.race} | Rola: ${hero.role}</p>
                ${createSlotsHtml(heroId, true, hero.equipment)}
            </div>
            <span class="badge" style="border: 1px solid #d4af37; color: #d4af37;">Oficer</span>
        `;
        if (heroesList) heroesList.appendChild(card);
    });

    // 2. Renderowanie Zwerbowanych Żołnierzy
    if (gameState.army.length === 0) {
        if (soldiersList) soldiersList.innerHTML = '<p style="color: #777; text-align: center; margin-top: 20px;">Brak jednostek. Zwerbuj kogoś powyżej!</p>';
    } else {
        gameState.army.forEach(soldier => {
            const card = document.createElement('div');
            card.className = 'unit-card';
            card.innerHTML = `
                <div class="unit-info">
                    <h4>${soldier.name}</h4>
                    <p>Rasa: ${soldier.race} | HP: ${soldier.stats.hp}/${soldier.stats.maxHp} | Lvl: ${soldier.stats.level}</p>
                    ${createSlotsHtml(soldier.id, false, soldier.equipment)}
                </div>
                <span class="badge">${soldier.status}</span>
            `;
            if (soldiersList) soldiersList.appendChild(card);
        });
    }
}

// Funkcja pomocnicza dla przycisku w UI koszar
function recruitSoldierTest() {
    // Losujemy rasę dla testu
    const races = ['Human', 'Elf', 'Dwarf'];
    const randomRace = races[Math.floor(Math.random() * races.length)];

    const unit = recruitSoldier(randomRace);
    if (unit) {
        renderBarracks(); // Odśwież widok po rekrutacji
    } else {
        alert("Brak złota, bratku! Zakończ bitwę testową, żeby zarobić.");
    }
}

function equipItem(unitId, isHero, slotType) {
    let unit = null;

    // Pobieramy odpowiednią jednostkę
    if (isHero) {
        const index = parseInt(unitId.split('_')[1]);
        unit = companions[index];
    } else {
        unit = gameState.army.find(s => s.id === unitId);
    }

    if (!unit) return;

    // Jeśli slot jest już zajęty – ściągamy przedmiot z powrotem do magazynu obozu
    if (unit.equipment[slotType]) {
        const oldItem = unit.equipment[slotType];
        if (slotType === 'weapon') gameState.inventory.swords++;
        if (slotType === 'armor') gameState.inventory.armors++;
        
        unit.equipment[slotType] = null;
        showNotification(`Zdemontowano: ${oldItem}`, 'info');
        renderBarracks();
        return;
    }

    // Zakładanie przedmiotu, jeśli mamy go na stanie w Kuźni
    if (slotType === 'weapon') {
        if (gameState.inventory.swords > 0) {
            gameState.inventory.swords--;
            unit.equipment.weapon = "Miecz ze Stali Elfów";
            if (!isHero) unit.stats.atk += 10; // Bonus do statystyk dla zwykłego żołnierza
            showNotification("Wyposażono w broń!", "success");
        } else {
            alert("Brak wolnych mieczy w kuźni obozowej, mordo!");
        }
    } else if (slotType === 'armor') {
        if (gameState.inventory.armors > 0) {
            gameState.inventory.armors--;
            unit.equipment.armor = "Żelazny Pancerz";
            if (!isHero) {
                unit.stats.maxHp += 50;
                unit.stats.hp += 50;
            }
            showNotification("Wyposażono w pancerz!", "success");
        } else {
            alert("Brak wolnych pancerzy w kuźni obozowej, bratku!");
        }
    }

    renderBarracks();
}

function findClosestTarget(unit, targetsCollection) {
    // Jeśli cel już istnieje i wciąż żyje, nie szukaj nowego
    if (unit.target && unit.target.hp > 0) return unit.target;

    let closest = null;
    let minDistance = Infinity;

    // Filtrujemy tylko żywe cele
    const aliveTargets = targetsCollection.filter(t => t.hp > 0);

    for (let target of aliveTargets) {
        // Liczymy dystans z Pitagorasa: d = sqrt((x2-x1)^2 + (y2-y1)^2)
        let dx = target.x - unit.x;
        let dy = target.y - unit.y;
        let distance = Math.sqrt(dx * dx + dy * dy);

        if (distance < minDistance) {
            minDistance = distance;
            closest = target;
        }
    }
    return closest;
}


function updateUnitsAI() {
    // 1. Aktualizacja Sojuszników (w tym Bohatera, jeśli nim nie sterujemy)
    battleState.allies.forEach(ally => {
        if (ally.hp <= 0) return;

        // Znajdź najbliższego wroga
        ally.target = findClosestTarget(ally, battleState.enemies);

        if (ally.target) {
            let dx = ally.target.x - ally.x;
            let dy = ally.target.y - ally.y;
            let distance = Math.sqrt(dx * dx + dy * dy);

            // Jeśli wróg jest poza zasięgiem ataku -> idź do niego
            if (distance > ally.attackRange) {
                ally.x += (dx / distance) * ally.speed;
                ally.y += (dy / distance) * ally.speed;
            } else {
                // JEST W ZASIĘGU -> Zadaj obrażenia (uwzględniając obronę celu)
                // Używamy Math.max(..., 1), żeby minimalny hit to był zawsze 1 HP
                let actualDamage = Math.max(ally.damage - ally.target.defense, 1);
                
                // UWAGA: Żeby nie zabijać w ułamku sekundy, dzielimy obrażenia przez 60 klatek
                ally.target.hp -= actualDamage / 60; 
            }
        }
    });

    // 2. Aktualizacja Wrogów (robią dokładnie to samo, celując w sojuszników)
    battleState.enemies.forEach(enemy => {
        if (enemy.hp <= 0) return;

        enemy.target = findClosestTarget(enemy, battleState.allies);

        if (enemy.target) {
            let dx = enemy.target.x - enemy.x;
            let dy = enemy.target.y - enemy.y;
            let distance = Math.sqrt(dx * dx + dy * dy);

            if (distance > enemy.attackRange) {
                enemy.x += (dx / distance) * enemy.speed;
                enemy.y += (dy / distance) * enemy.speed;
            } else {
                let actualDamage = Math.max(enemy.damage - enemy.target.defense, 1);
                enemy.target.hp -= actualDamage / 60;
            }
        }
    });

    // Clean-up: Usuwamy martwe jednostki z pola bitwy
    battleState.allies = battleState.allies.filter(a => a.hp > 0);
    battleState.enemies = battleState.enemies.filter(e => e.hp > 0);
}

// 2. SYSTEM PRZEŁĄCZANIA EKRANÓW
function switchScreen(screenId) {
    // Ukryj absolutnie wszystkie ekrany gry
    document.querySelectorAll('.game-screen').forEach(screen => {
        screen.classList.add('hidden');
    });

    // Pokaż żądany ekran usuwając klasę hidden
    const activeScreen = document.getElementById(`screen-${screenId}`);
    if (activeScreen) {
        activeScreen.classList.remove('hidden');
    }

    // Odpal akcje specyficzne dla danego ekranu
    if (screenId === 'camp') {
        updateResourcesUI();
        renderCampCompanions(); // Odświeża postacie przy ognisku
    }
    if (screenId === 'battle') {
        startBattleCanvasLoop();
    }
    if (screenId === 'barracks') {
        renderBarracks();
    }
    if (screenId === 'world-map') {
        renderWorldMap();
    }
    if (screenId === 'smithy') {
        updateSmithyUI();
        updateResourcesUI();
    }
    if (screenId === 'tavern') {
        updateResourcesUI();
    }
    if (screenId === 'infirmary') {
        renderInfirmary();
    }
}

function worldMapScreenFix() {
    switchScreen('world-map');
}

// 3. AKTUALIZACJA INTERFEJSU
function updateResourcesUI() {
    // Górny pasek obozu
    const resGold = document.getElementById('res-gold');
    const resSupplies = document.getElementById('res-supplies');
    if (resGold) resGold.innerText = gameState.resources.gold;
    if (resSupplies) resSupplies.innerText = gameState.resources.supplies;

    // Ekrany Kuźni
    const smithyGold = document.getElementById('smithy-res-gold');
    const smithyCoins = document.getElementById('smithy-res-coins');
    if (smithyGold) smithyGold.innerText = gameState.resources.gold;
    if (smithyCoins) smithyCoins.innerText = gameState.resources.commanderCoins;

    const coinsEl = document.getElementById('res-coins');
    if (coinsEl) coinsEl.innerText = gameState.resources.commanderCoins;
}

function showNotification(message, type = 'info') {
    const container = document.getElementById('notification-container');
    if (!container) return;

    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.innerText = message;

    container.appendChild(toast);

    // Automatyczne usuwanie po 3 sekundach
    setTimeout(() => {
        toast.classList.add('fade-out');
        setTimeout(() => toast.remove(), 500);
    }, 3000);
}
let selectedAlly = null;

function setupBattle() {
    const canvas = document.getElementById('battleCanvas');
    if (!canvas) return;

    selectedAlly = null; // Reset selekcji przed nową walką

    // Aktywacja przycisku Rogu Odwagi w zależności od stanu magazynu
    const hornBtn = document.getElementById('btn-ability-horn');
    if (hornBtn) {
        hornBtn.innerText = `📯 Róg Odwagi (${gameState.inventory.hornOfCourage})`;
        hornBtn.disabled = gameState.inventory.hornOfCourage <= 0;
    }

    // Obsługa myszy - kliknięcia na Canvasie (Zaznaczanie i Ruch)
    canvas.onclick = (e) => {
        const rect = canvas.getBoundingClientRect();
        const mouseX = e.clientX - rect.left;
        const mouseY = e.clientY - rect.top;

        // 1. Szukanie, czy gracz kliknął w żywą jednostkę sojuszniczą (rozmiar 30x30)
        const clickedAlly = battleState.allies.find(ally => 
            ally.stats.hp > 0 &&
            mouseX >= ally.x && mouseX <= ally.x + 30 &&
            mouseY >= ally.y && mouseY <= ally.y + 30
        );

        if (clickedAlly) {
            selectedAlly = clickedAlly;
            showNotification(`Wybrano: ${selectedAlly.name}`, 'info');
        } else if (selectedAlly) {
            // 2. Jeśli jednostka była wybrana, a kliknięto w puste pole - wydaj punktowy rozkaz marszu
            selectedAlly.manualX = mouseX - 15; // Centrowanie punktu docelowego
            selectedAlly.manualY = mouseY - 15;
            selectedAlly.target = null; // Porzucenie automatycznego agro
        }
    };

    battleState.allies = [];
    battleState.enemies = [];
    battleState.isRunning = true;

    // 1. Kopiujemy jednostki z gameState.army na pole bitwy i nadajemy im pozycje X, Y
    gameState.army.forEach((soldier, index) => {
        battleState.allies.push({
            ...soldier,
            x: 50 + (index * 20), // Lekki rozstrzał, żeby nie stali w jednym punkcie
            y: 150 + (index * 45),
            speed: 1.5,
            target: null
        });
    });

    // Awaryjny spawnowicz Arkelasa, jeśli gracz nie kupił nikogo w koszarach
    if (battleState.allies.length === 0) {
        battleState.allies.push({
            id: 'arkelas_mvp', name: 'Arkelas (Dowódca)', stats: { hp: 200, maxHp: 200, atk: 25 },
            x: 50, y: 225, speed: 2, target: null
        });
    }

    // 2. Generowanie przeciwników na podstawie aktualnej lokacji
    let enemyCount = 3 + gameState.currentAct;
    for (let i = 0; i < enemyCount; i++) {
        battleState.enemies.push({
            id: 'enemy_' + i,
            name: travelState.currentLocation === 'forest' ? 'Skażony Wilk' : 'Sługa Zardasa',
            stats: { hp: 80, maxHp: 80, atk: 8 },
            x: canvas.width - 80 - (i * 20),
            y: 120 + (i * 55),
            speed: 1.2,
            target: null
        });
    }
}

function startBattleCanvasLoop() {
    setupBattle(); // Przygotuj planszę przed odpaleniem pętli

    const canvas = document.getElementById('battleCanvas');
    const ctx = canvas.getContext('2d');
    if (canvasLoopInterval) clearInterval(canvasLoopInterval);

    canvasLoopInterval = setInterval(() => {
        if (!battleState.isRunning) return;

        // --- 1. AKTUALIZACJA LOGIKI (MECHANIKA STRATEGICZNA) ---

        // Ruch i szukanie celów dla Aljantów
        battleState.allies.forEach(ally => {
            if (ally.stats.hp <= 0) return;

            // NOWOŚĆ: Nadpisanie ruchu rozkazem ręcznym gracza
            if (ally.manualX !== undefined && ally.manualY !== undefined) {
                const distX = ally.manualX - ally.x;
                const distY = ally.manualY - ally.y;
                const dist = Math.sqrt(distX * distX + distY * distY);

                if (dist > 4) {
                    ally.x += (distX / dist) * ally.speed;
                    ally.y += (distY / dist) * ally.speed;
                    return; // Blokujemy auto-atak w trakcie celowego przemieszczania
                } else {
                    // Jednostka dotarła na wskazane miejsce
                    delete ally.manualX;
                    delete ally.manualY;
                }
            }

            // Standardowy system wyszukiwania wrogów (gdy brak rozkazów ręcznych)
            const aliveEnemies = battleState.enemies.filter(e => e.stats.hp > 0);
            if (aliveEnemies.length > 0) {
                let closest = aliveEnemies[0];
                ally.target = closest;

                if (ally.x < closest.x - 35) {
                    ally.x += ally.speed;
                } else if (Math.abs(ally.y - closest.y) > 5) {
                    ally.y += ally.y < closest.y ? ally.speed : -ally.speed;
                } else {
                    closest.stats.hp -= ally.stats.atk * 0.05;
                }
            }
        });

        // Ruch i szukanie celów dla Wrogów
        battleState.enemies.forEach(enemy => {
            if (enemy.stats.hp <= 0) return;
            const aliveAllies = battleState.allies.filter(a => a.stats.hp > 0);
            if (aliveAllies.length > 0) {
                let closest = aliveAllies[0];
                enemy.target = closest;

                if (enemy.x > closest.x + 35) {
                    enemy.x -= enemy.speed;
                } else if (Math.abs(enemy.y - closest.y) > 5) {
                    enemy.y += enemy.y < closest.y ? enemy.speed : -enemy.speed;
                } else {
                    closest.stats.hp -= enemy.stats.atk * 0.05;
                }
            }
        });

        // --- 2. RYSOWANIE GRAFIKI (RENDEROWANIE CANVAS 2D) ---
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = "#1e231e"; // Ciemnotrawiaste tło pola bitwy
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // Rysuj Sojuszników (Niebieskie jednostki)
        battleState.allies.forEach(ally => {
            if (ally.stats.hp <= 0) return;
            ctx.fillStyle = "#3b82f6";
            ctx.fillRect(ally.x, ally.y, 30, 30);

            // Pasek życia
            ctx.fillStyle = "#red";
            ctx.fillRect(ally.x, ally.y - 10, 30, 4);
            ctx.fillStyle = "#22c55e";
            ctx.fillRect(ally.x, ally.y - 10, 30 * (ally.stats.hp / ally.stats.maxHp), 4);
        });

        // Rysuj Przeciwników (Czerwone jednostki)
        battleState.enemies.forEach(enemy => {
            if (enemy.stats.hp <= 0) return;
            ctx.fillStyle = "#ef4444";
            ctx.fillRect(enemy.x, enemy.y, 30, 30);

            // Pasek życia
            ctx.fillStyle = "#red";
            ctx.fillRect(enemy.x, enemy.y - 10, 30, 4);
            ctx.fillStyle = "#22c55e";
            ctx.fillRect(enemy.x, enemy.y - 10, 30 * (enemy.stats.hp / enemy.stats.maxHp), 4);
        });

        // --- 3. WARUNKI ZWYCIĘSTWA / PRZEGRANEJ ---
        const totalAlliesAlive = battleState.allies.filter(a => a.stats.hp > 0).length;
        const totalEnemiesAlive = battleState.enemies.filter(e => e.stats.hp > 0).length;

        if (totalEnemiesAlive === 0) {
            endBattleResolution(true);
        } else if (totalAlliesAlive === 0) {
            endBattleResolution(false);
        }

    }, 1000 / 30); // 30 FPS
};


// Przetwarzanie wyników starcia (Złoto, Ranni, Szpital)
function endBattleResolution(isVictory) {
    battleState.isRunning = false;
    clearInterval(canvasLoopInterval);

    if (isVictory) {
        let baseGold = 100;
        // Dodajemy mechanikę kopalni o której rozmawialiśmy!
        if (travelState.unlockedLocations.includes('caves')) {
            baseGold += 300;
        }

        gameState.resources.gold += baseGold;
        alert(`🎉 Zwycięstwo! Odepchnięto sły Zardasa. Zdobyto: ${baseGold} Złota!`);
    } else {
        gameState.resources.supplies = Math.max(0, gameState.resources.supplies - 15);
        alert(`💀 Porażka! Twoje wojska zostały rozbite. Stracono zaopatrzenie.`);
    }

    // Aktualizacja stanu faktycznych jednostek w armii po bitwie (System Rannych)
    battleState.allies.forEach(battleUnit => {
        // Pomijamy sztucznego Arkelasa
        if (battleUnit.id === 'arkelas_mvp') return;

        let realSoldier = gameState.army.find(s => s.id === battleUnit.id);
        if (realSoldier) {
            if (battleUnit.stats.hp <= 0) {
                realSoldier.status = "Wounded"; // Trafia do Szpitala Polowego
                realSoldier.stats.hp = 1;       // Zostaje mu 1 HP ratujące życie
            } else {
                realSoldier.stats.hp = Math.floor(battleUnit.stats.hp);
                realSoldier.stats.xp += 25;     // Przyznanie XP za przeżycie
            }
        }
    });
    gameState.resources.herbs += Math.floor(Math.random() * 8) + 1

    switchScreen('camp');
}
// Inicjalizacja gry po naładowaniu skryptu
window.onload = () => {
    switchScreen('menu');
};

function renderCampCompanions() {
    const container = document.getElementById('campfire-companions');
    if (!container) return;
    container.innerHTML = '';

    companions.forEach(hero => {
        const token = document.createElement('div');
        token.className = 'camp-companion-token';
        token.innerHTML = `⛺ <b>${hero.name}</b> <br><small style="color:#b0a095">${hero.role}</small>`;
        token.onclick = () => triggerCampDialogue(hero);
        container.appendChild(token);
    });
}

// Odpala okno dialogowe z dopasowanym tekstem pod klasę postaci
function triggerCampDialogue(hero) {
    const bubble = document.getElementById('dialogue-bubble');
    const speaker = document.getElementById('dialogue-speaker');
    const text = document.getElementById('dialogue-text');

    speaker.innerText = hero.name;

    // Prosta baza tekstów zależna od roli postaci
    let dialogue = "Witaj Arkelasie. Czekam na Twoje rozkazy przy ognisku.";
    if (hero.role === "Battle-Mage") dialogue = "Uniwersytet Elen-Varski dobrze nas przygotował, Arkelasie. Czuję jednak, że czarna magia Zardasa skaziła te ziemie.";
    if (hero.role === "Tank") dialogue = "Mój młot i runy kowalskie są gotowe, Brachu! Żaden potwór nie przebije się przez moją tarczę.";
    if (hero.role === "Saper") dialogue = "Hehe... mam przygotowane parę wybuchowych niespodzianek na te stwory. Tylko nie pozwól krasnalowi mówić na mnie szkodnik!";

    text.innerText = dialogue;
    bubble.classList.remove('hidden');
}

function closeDialogue() {
    document.getElementById('dialogue-bubble').classList.add('hidden');
}

function renderWorldMap() {
    const container = document.getElementById('map-locations-container');
    if (!container) return;
    container.innerHTML = '';

    mapLocations.forEach(loc => {
        const isCurrent = travelState.currentLocation === loc.id;
        const isUnlocked = loc.req === null || travelState.unlockedLocations.includes(loc.req);

        const card = document.createElement('div');
        card.className = `map-node ${isCurrent ? 'active-node' : ''} ${!isUnlocked ? 'locked-node' : ''}`;

        // Dynamiczny status na dole karty
        let statusHtml = '';
        if (isCurrent) statusHtml = `<span class="loc-status status-current">📍 Twój Obóz Tu Stoi</span>`;
        else if (!isUnlocked) statusHtml = `<span class="loc-status status-locked">🔒 Zablokowane</span>`;
        else statusHtml = `<span class="loc-status" style="color:#d4af37">🚗 Zwiady / Podróżuj</span>`;

        card.innerHTML = `
            <div>
                <h3>${loc.name}</h3>
                <p style="font-size:0.9rem; color:#b0a095; margin-top:5px;">${loc.desc}</p>
            </div>
            ${statusHtml}
        `;

        // Kliknięcie działa tylko na odblokowane i inne niż obecna lokacja
        if (isUnlocked && !isCurrent) {
            card.onclick = () => moveCamp(loc.id);
        }

        container.appendChild(card);
        const battleBtn = document.getElementById('btn-start-battle');
        if (battleBtn) {
            if (travelState.currentLocation !== 'camp') {
                battleBtn.classList.remove('hidden');
            } else {
                battleBtn.classList.add('hidden');
            }
        }
    });
}

// Funkcja podróży (zmiany lokacji obozu)
function moveCamp(locationId) {
    const targetLoc = mapLocations.find(l => l.id === locationId);
    if (!targetLoc) return;

    // 1. Przygotowanie ekranu podróży
    document.getElementById('travel-title').innerText = `🧭 Podróż do: ${targetLoc.name}`;

    // Losowanie klimatycznego opisu drogi
    const randomQuote = travelQuotes[Math.floor(Math.random() * travelQuotes.length)];
    document.getElementById('travel-flavor').innerText = randomQuote;

    // 2. Odpalenie ekranu podróży
    switchScreen('travel');

    // Reset i wymuszenie restartu animacji paska (hack na reflow CSS)
    const fill = document.querySelector('.travel-progress-fill');
    if (fill) {
        fill.style.animation = 'none';
        fill.offsetHeight; // Wyzwolenie przebudowy widoku
        fill.style.animation = null;
    }

    // 3. Blokada czasowa (2.5 sekundy) imitująca wędrówkę
    setTimeout(() => {
        travelState.currentLocation = locationId;

        // Logika progresu i odkrywania mgły wojny
        if (locationId === 'forest' && !travelState.unlockedLocations.includes('caves')) {
            travelState.unlockedLocations.push('caves');
        }
        if (locationId === 'caves' && !travelState.unlockedLocations.includes('castle')) {
            travelState.unlockedLocations.push('castle');
        }

        // Po zakończeniu podróży wracamy na mapę, która zrenderuje się z nową pozycją
        switchScreen('world-map');
    }, 2500);
}


function calculateMineIncome() {
    let income = 0;

    // System automatycznie sprawdzi odblokowane lokacje
    if (travelState.unlockedLocations.includes('caves')) income += 300;
    // Tutaj w przyszłości łatwo dopiszesz kolejne lokacje:
    // if (travelState.unlockedLocations.includes('gold_mine')) income += 500;

    return income;
}

function updateSmithyUI() {
    document.getElementById('inv-swords').innerText = gameState.inventory.swords;
    document.getElementById('inv-armors').innerText = gameState.inventory.armors;
    document.getElementById('inv-horn').innerText = gameState.inventory.hornOfCourage;
}

// Funkcja wytwarzania przedmiotów w Kuźni
function craftItem(itemKey, goldCost, coinCost) {
    if (gameState.resources.gold < goldCost || gameState.resources.commanderCoins < coinCost) {
        alert("Bratku, Brammer krzyczy, że nie masz wystarczająco surowców!");
        return;
    }

    // Pobranie opłat
    gameState.resources.gold -= goldCost;
    gameState.resources.commanderCoins -= coinCost;

    // Dodanie do ekwipunku obozowego
    if (itemKey === 'swords') gameState.inventory.swords++;
    if (itemKey === 'armors') gameState.inventory.armors++;
    if (itemKey === 'horn') gameState.inventory.hornOfCourage++;

    // Re-render widoków
    updateResourcesUI();
    updateSmithyUI();
    console.log(`⚒️ Brammer wykuł przedmiot: ${itemKey}!`);
}

// SYSTEM ZAROBKOWY: Aktywna Ekspedycja Obozowa
function startCampExpedition() {
    if (gameState.isExpeditionRunning) return;

    if (gameState.resources.supplies < 15) {
        alert("Mordo, Twoje wojsko przymiera głodem! Brak 15 jednostek Zaopatrzenia na drogę[cite: 18].");
        return;
    }

    // Konsumpcja kosztów startowych
    gameState.resources.supplies -= 15;
    gameState.isExpeditionRunning = true;
    updateResourcesUI();

    // Aktywacja paska ładowania w UI
    document.getElementById('btn-expedition').disabled = true;
    const progressContainer = document.getElementById('expedition-progress-container');
    const progressFill = document.getElementById('expedition-progress-fill');

    progressContainer.classList.remove('hidden');
    progressFill.style.width = '0%';

    // Płynna animacja ładowania paska przez JS (3 sekundy ekspedycji)
    let width = 0;
    const interval = setInterval(() => {
        if (width >= 100) {
            clearInterval(interval);
        } else {
            width += 5;
            progressFill.style.width = width + '%';
        }
    }, 150);

    // Finał ekspedycji po 3 sekundach - Zysk!
    setTimeout(() => {
        // Losowy zysk złota od 80 do 120 sztuk
        const earnedGold = Math.floor(Math.random() * 41) + 80;
        gameState.resources.gold += earnedGold;

        // Resetowanie flag i interfejsu
        gameState.isExpeditionRunning = false;
        document.getElementById('btn-expedition').disabled = false;
        progressContainer.classList.add('hidden');

        updateResourcesUI();
        alert(`💰 Patrol wrócił! Zabezpieczono łupy ze Starego Lasu: +${earnedGold} Złota[cite: 18].`);
    }, 3000);
}

function renderInfirmary() {
    // Bezpieczna inicjalizacja ziół w stanie gry, jeśli jeszcze nie istnieją
    if (gameState.resources.herbs === undefined) {
        gameState.resources.herbs = 15; // Początkowy zapas ziół dla gracza
    }

    // Aktualizacja wskaźników surowców na ekranie szpitala
    document.getElementById('infirmary-gold').textContent = gameState.resources.gold;
    document.getElementById('infirmary-herbs').textContent = gameState.resources.herbs;

    const woundedListContainer = document.getElementById('wounded-list');
    woundedListContainer.innerHTML = ''; 

    const woundedSoldiers = gameState.army.filter(soldier => soldier.status === 'Wounded');
    document.getElementById('wounded-count').textContent = woundedSoldiers.length;

    if (woundedSoldiers.length === 0) {
        woundedListContainer.innerHTML = `
            <div class="empty-state-notice">
                <p>🎉 Wszyscy żołnierze są zdrowi i gotowi do walki! Szpital świeci pustkami.</p>
            </div>
        `;
        return;
    }

    woundedSoldiers.forEach(soldier => {
        const card = document.createElement('div');
        card.className = 'soldier-card wounded';
        
        // Sprawdzamy czy gracza stać na leczenie (Złoto + Zioła)
        const canAfford = gameState.resources.gold >= HEALING_COSTS.gold && 
                          gameState.resources.herbs >= HEALING_COSTS.herbs;

        card.innerHTML = `
            <div class="soldier-info">
                <h4>${soldier.name} <span class="soldier-level">Lvl ${soldier.level || 1}</span></h4>
                <p class="soldier-class">Klasa: <strong>${soldier.type}</strong></p>
                <p class="soldier-hp text-danger">PŻ: ${soldier.stats.hp} / ${soldier.stats.maxHp} (Ranny)</p>
                <div class="healing-cost-badge">
                    Koszt: 💰 ${HEALING_COSTS.gold} | 🌿 ${HEALING_COSTS.herbs} Ziół
                </div>
            </div>
            <button 
                class="btn btn-heal ${canAfford ? 'btn-success' : 'btn-disabled'}" 
                onclick="healSoldier('${soldier.id}')"
                ${!canAfford ? 'disabled' : ''}>
                🩹 Ulecz ziołami
            </button>
        `;
        woundedListContainer.appendChild(card);
    });
}

/**
 * Funkcja obsługująca proces leczenia rannego wojownika
 */
function healSoldier(soldierId) {
    const soldier = gameState.army.find(s => s.id === soldierId);
    
    if (!soldier) {
        showNotification("Błąd: Nie znaleziono takiego żołnierza.", "error");
        return;
    }

    // Walidacja kosztów (Złoto + Zioła)
    if (gameState.resources.gold < HEALING_COSTS.gold || gameState.resources.herbs < HEALING_COSTS.herbs) {
        showNotification("Brakuje Ci złota lub leczniczych ziół!", "error");
        return;
    }

    // Pobranie opłaty ze stanu gry
    gameState.resources.gold -= HEALING_COSTS.gold;
    gameState.resources.herbs -= HEALING_COSTS.herbs;

    // Uzdrawianie jednostki
    soldier.status = 'Ready';
    soldier.stats.hp = soldier.stats.maxHp; 

    // Klimatyczny komunikat fabularny
    showNotification(`Medycy przygotowali okład z ziół dla ${soldier.name}. Rany się zabliźniły!`, "success");

    // Odświeżenie widoków
    renderInfirmary();
    if (typeof updateResourcesDisplay === 'function') {
        updateResourcesDisplay();
    }
}