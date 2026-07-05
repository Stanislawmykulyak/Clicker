// ==========================================
// RENDEROWANIE INTERFEJSU (UI) I WIDOKÓW
// ==========================================

function renderUI() {
    const ccElement = document.getElementById('res-cc');
    const ironElement = document.getElementById('res-iron');
    const herbsElement = document.getElementById('res-herbs');

    if (ccElement) ccElement.innerText = Math.floor(gameState.resources.commanderCoins);
    if (ironElement) ironElement.innerText = Math.floor(gameState.resources.iron);
    if (herbsElement) herbsElement.innerText = Math.floor(gameState.resources.herbs);
}

window.switchScreen = function (screenId) {
    const buttons = document.querySelectorAll('.nav-btn');

    buttons.forEach(btn => {
        if (btn.getAttribute('data-target') === screenId) {
            btn.classList.add('active');
        } else {
            btn.classList.remove('active');
        }
    });

    if (screenId === 'map-screen' && window.renderMapScreen) {
        window.renderMapScreen();
    } else if (screenId === 'barracks-screen' && window.renderBarracksScreen) {
        window.renderBarracksScreen();
    } else if (screenId === 'missions-screen' && window.renderMissionsScreen) {
        window.renderMissionsScreen();
    } else {
        document.getElementById('active-screen').innerHTML = `<h2>Ekran w budowie: ${screenId}</h2>`;
    }
};

window.renderMapScreen = function () {
    const viewport = document.getElementById('active-screen');
    let nodesHtml = '';

    Object.entries(battleNodesData).forEach(([id, node]) => {
        const isConquered = gameState.conqueredNodes.includes(id);
        const nodeColor = isConquered ? '#3498db' : '#c0392b';
        const nodeLabel = isConquered ? node.conqueredName : node.name;
        const nodeShadow = isConquered ? '0px 0px 8px #3498db' : '0px 0px 8px #ff0000';

        nodesHtml += `
            <circle cx="${node.cx}" cy="${node.cy}" r="15" onclick="window.triggerCombat('${id}')" style="cursor: pointer; fill: ${nodeColor}; filter: drop-shadow(${nodeShadow});" />
            <text x="${node.cx}" y="${node.cy + 35}" class="map-node-label" text-anchor="middle" style="fill: #ebd6b3; font-family: 'MedievalSharp'; font-size: 0.9rem;">${nodeLabel}</text>
        `;
    });

    viewport.innerHTML = `
        <div class="map-wrapper">
            <img src="media/map.png" alt="Mapa Świata" class="map-bg-img">
            <svg viewBox="0 0 1000 562" class="map-overlay-svg">
                <circle cx="500" cy="350" r="15" class="map-camp-node" onclick="window.switchScreen('barracks-screen')" style="cursor: pointer; fill: #27ae60;" />
                <text x="500" y="385" class="map-node-label" text-anchor="middle" style="fill: #ebd6b3; font-family: 'MedievalSharp';">Obozowisko Główne</text>
                ${nodesHtml}
            </svg>
        </div>
    `;
};

window.renderBattlePrepScreen = function (nodeId, enemy) {
    const viewport = document.getElementById('active-screen');
    const currentCommander = gameState.commanders[0];
    const playerPower = calculateTacticalPower(currentCommander, activeBattleFormation);
    const enemyPower = calculateTacticalPower(null, enemy);

    viewport.innerHTML = `
        <div class="battle-prep-container" style="max-width: 1050px; margin: 0 auto; background: #0b0d12; border-radius: 16px; border: 1px solid rgba(255, 215, 0, 0.15); box-shadow: 0 20px 50px rgba(0,0,0,0.7); overflow: hidden; font-family: 'Cinzel', serif;">
            <div style="background: linear-gradient(90deg, #11151f 0%, #161d2a 100%); padding: 20px; border-bottom: 1px solid rgba(255,255,255,0.05); text-align: center;">
                <span style="color: #ffd700; font-size: 0.8rem; letter-spacing: 3px; font-weight: 900; display: block; margin-bottom: 5px;">TACTICAL OPERATIONS</span>
                <h2 style="margin: 0; font-size: 2.2rem; color: #fff; font-family: 'MedievalSharp'; font-weight: 400;">Kwatera Wojenna: ${currentCommander.name}</h2>
            </div>

            <div style="display: flex; gap: 2px; background: rgba(255,255,255,0.02); flex-wrap: wrap;">
                <div style="flex: 1; min-width: 300px; background: #0f131c; padding: 25px; border-right: 1px solid rgba(255,255,255,0.05);">
                    <div style="display: flex; align-items: center; gap: 10px; margin-bottom: 20px;">
                        <div style="width: 8px; height: 8px; background: #ef4444; border-radius: 50%;"></div>
                        <h3 style="margin: 0; font-size: 1.1rem; color: #ef4444; letter-spacing: 1px;">DONIESIENIA ZWIADU</h3>
                    </div>
                    <p style="font-size: 0.85rem; color: #8a99ad; line-height: 1.5; margin-bottom: 20px;">Szpiedzy zlokalizowali wrogie ugrupowanie armii: <span style="color: #fff; font-weight: bold;">${enemy.name}</span>.</p>
                    
                    <div style="display: flex; flex-direction: column; gap: 10px;">
                        <div style="background: rgba(239, 68, 68, 0.03); border: 1px solid rgba(239, 68, 68, 0.15); padding: 12px; border-radius: 8px; text-align: center;">
                            <span style="font-size: 0.7rem; color: #ef4444; display: block; letter-spacing: 1px; margin-bottom: 4px;">LINIA WSPARCIA WROGA</span>
                            <span style="font-size: 1.05rem; color: #fff; font-weight: bold;">🏹 ${enemy.backLine.archers}x Łucznicy</span>
                        </div>
                        <div style="background: rgba(239, 68, 68, 0.06); border: 1px solid rgba(239, 68, 68, 0.25); padding: 12px; border-radius: 8px; text-align: center;">
                            <span style="font-size: 0.7rem; color: #ef4444; display: block; letter-spacing: 1px; margin-bottom: 4px;">LINIA FRONTOWA WROGA</span>
                            <span style="font-size: 1.05rem; color: #fff; font-weight: bold;">🛡️ ${enemy.frontLine.knights}x Rycerze</span>
                        </div>
                    </div>

                    <div style="margin-top: 30px; background: rgba(0,0,0,0.2); border-radius: 8px; padding: 15px; text-align: center; border: 1px solid rgba(255,255,255,0.02);">
                        <span style="font-size: 0.75rem; color: #8a99ad; display: block; margin-bottom: 10px;">AKCJA BEZPOŚREDNIA</span>
                        <button onclick="window.executeTacticalBattle('${nodeId}')" class="nav-btn" style="background: linear-gradient(180deg, #c0392b 0%, #a62c20 100%); border: 1px solid #e74c3c; color: #fff; padding: 12px 30px; font-size: 1rem; font-weight: bold; border-radius: 8px; box-shadow: 0 4px 15px rgba(192,57,43,0.3);">⚔️ ROZPOCZNIJ SZARŻĘ</button>
                    </div>
                </div>

                <div style="flex: 2; min-width: 350px; background: #0d1017; padding: 25px; display: flex; flex-direction: column; justify-content: space-between;">
                    <div>
                        <div style="display: flex; align-items: center; gap: 10px; margin-bottom: 20px;">
                            <div style="width: 8px; height: 8px; background: #22c55e; border-radius: 50%;"></div>
                            <h3 style="margin: 0; font-size: 1.1rem; color: #22c55e; letter-spacing: 1px;">OPERACYJNA SIATKA TAKTYCZNA</h3>
                        </div>

                        <div style="display: flex; flex-direction: column; gap: 16px;">
                            <div id="zone-frontLine" ondragover="window.battleAllowDrop(event)" ondrop="window.battleDropUnit(event, 'frontLine')" style="background: rgba(34, 197, 94, 0.02); border: 1px dashed rgba(34, 197, 94, 0.3); border-radius: 10px; padding: 20px; transition: all 0.2s;" ondragenter="this.style.background='rgba(34,197,94,0.06)'" ondragleave="this.style.background='rgba(34,197,94,0.02)'">
                                <span style="font-size: 0.75rem; color: #22c55e; font-weight: bold; letter-spacing: 2px; display: block; margin-bottom: 12px; text-align: center;">⚔️ PIERWSZA LINIA (FRONT)</span>
                                <div style="display: flex; justify-content: center; gap: 15px; min-height: 70px; align-items: center; flex-wrap: wrap;">
                                    ${Object.keys(UNIT_STATS).map(type => renderTacticalToken(type, activeBattleFormation.frontLine[type], 'frontLine', nodeId)).join('')}
                                    ${Object.values(activeBattleFormation.frontLine).every(count => count === 0) ? '<span style="color: #475569; font-size: 0.85rem;">Przeciągnij tutaj oddziały szturmowe</span>' : ''}
                                </div>
                            </div>

                            <div id="zone-backLine" ondragover="window.battleAllowDrop(event)" ondrop="window.battleDropUnit(event, 'backLine')" style="background: rgba(59, 130, 246, 0.02); border: 1px dashed rgba(59, 130, 246, 0.3); border-radius: 10px; padding: 20px; transition: all 0.2s;" ondragenter="this.style.background='rgba(59,130,246,0.06)'" ondragleave="this.style.background='rgba(59,130,246,0.02)'">
                                <span style="font-size: 0.75rem; color: #3b82f6; font-weight: bold; letter-spacing: 2px; display: block; margin-bottom: 12px; text-align: center;">🏹 DRUGA LINIA (WSPARCIE TYŁÓW)</span>
                                <div style="display: flex; justify-content: center; gap: 15px; min-height: 70px; align-items: center; flex-wrap: wrap;">
                                    ${Object.keys(UNIT_STATS).map(type => renderTacticalToken(type, activeBattleFormation.backLine[type], 'backLine', nodeId)).join('')}
                                    ${Object.values(activeBattleFormation.backLine).every(count => count === 0) ? '<span style="color: #475569; font-size: 0.85rem;">Przeciągnij tutaj strzelców wyborowych</span>' : ''}
                                </div>
                            </div>

                            <div id="zone-pool" ondragover="window.battleAllowDrop(event)" ondrop="window.battleDropUnit(event, 'pool')" style="background: #11141d; border: 1px solid rgba(255,255,255,0.05); border-radius: 10px; padding: 15px; margin-top: 10px;">
                                <span style="font-size: 0.7rem; color: #94a3b8; font-weight: bold; letter-spacing: 1px; display: block; margin-bottom: 10px;">📦 DOSTĘPNE REZERWY (PRZECIĄGNIJ LUB KLIKNIJ ŻETON)</span>
                                <div style="display: flex; justify-content: center; gap: 15px; min-height: 70px; align-items: center; flex-wrap: wrap;">
                                    ${Object.keys(UNIT_STATS).map(type => renderTacticalToken(type, activeBattleFormation.pool[type], 'pool', nodeId)).join('')}
                                    ${Object.values(activeBattleFormation.pool).every(count => count === 0) ? '<span style="color: #22c55e; font-size: 0.85rem; font-weight: bold;">Cała armia została zadysponowana!</span>' : ''}
                                </div>
                            </div>
                        </div>
                    </div>

                    <div style="margin-top: 30px; display: flex; align-items: center; justify-content: space-between; gap: 20px; flex-wrap: wrap; border-top: 1px solid rgba(255,255,255,0.05); padding-top: 20px;">
                        <div>
                            <span style="font-size: 0.75rem; color: #8a99ad; display: block;">SZACWANA EFEKTYWNOŚĆ NATARCIA</span>
                            <strong style="font-size: 1.8rem; color: #22c55e;">${playerPower} <span style="font-size: 1rem; color: #8a99ad;">PKT</span></strong>
                        </div>
                        
                        <div style="display: flex; gap: 10px;">
                            <button onclick="window.switchScreen('map-screen')" class="nav-btn" style="background: #181e2a; border: 1px solid rgba(255,255,255,0.1); color: #94a3b8; padding: 12px 20px; font-size: 0.9rem; border-radius: 8px;">🏳️ ODWRÓT</button>
                            <button onclick="window.executeTacticalBattle('${nodeId}')" class="nav-btn" style="background: linear-gradient(180deg, #c0392b 0%, #a62c20 100%); border: 1px solid #e74c3c; color: #fff; padding: 12px 30px; font-size: 1rem; font-weight: bold; border-radius: 8px; box-shadow: 0 4px 15px rgba(192,57,43,0.3);">⚔️ ROZPOCZNIJ SZARŻĘ</button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;
};

function renderTacticalToken(type, count, currentZone, nodeId) {
    if (count <= 0) return '';
    const stats = UNIT_STATS[type];

    return `
        <div draggable="true" 
             ondragstart="window.battleDragStart(event, '${type}', '${currentZone}')"
             onclick="window.battleTokenClick('${type}', '${currentZone}', '${nodeId}')"
             style="background: linear-gradient(135deg, #1e2533 0%, #131924 100%); border: 1px solid rgba(255,215,0,0.3); padding: 8px 12px; border-radius: 6px; text-align: center; cursor: pointer; min-width: 90px; user-select: none;">
            <span style="font-size: 0.8rem; display: block;">${stats.icon} ${stats.name}</span>
            <strong style="font-size: 1.1rem; color: #ffd700; display: block;">x${count}</strong>
            <span style="font-size: 0.55rem; color: #64748b; display: block;">INIT: ${stats.spd}</span>
        </div>
    `;
}

window.triggerCombat = function (nodeId) {
    if (gameState.conqueredNodes.includes(nodeId)) {
        window.showRpgDialog("🏘️ Region bezpieczny", "Ten teren został już trwale oswobodzony spod rąk wroga.");
        return;
    }
    currentActiveNodeId = nodeId;
    const nodeData = battleNodesData[nodeId];
    const commander = gameState.commanders[0];

    activeBattleFormation.frontLine = { knights: 0, archers: 0, mages: 0, cavalry: 0, catapults: 0 };
    activeBattleFormation.backLine = { knights: 0, archers: 0, mages: 0, cavalry: 0, catapults: 0 };
    activeBattleFormation.pool = { ...commander.troops };

    window.renderBattlePrepScreen(nodeId, nodeData.enemy);
};

window.renderBarracksScreen = function () {
    const viewport = document.getElementById('active-screen');
    const bLevel = gameState.upgrades.blacksmithLevel;
    const upgradeCost = (bLevel + 1) * 40; // Poprawiono asynchroniczność kosztów z mechaniczną realizacją ulepszenia

    let unitsMarketHtml = '';
    const buyCosts = { knights: 15, archers: 8, mages: 25, cavalry: 20, catapults: 45 };

    Object.entries(UNIT_STATS).forEach(([type, stats]) => {
        const inArmy = gameState.units[type] || 0;
        const cost = buyCosts[type];

        let unitImageHtml = '';
        if (type === 'catapults') {
            unitImageHtml = `<img src="media/catapult-upgrade.jpg" style="width:100%; height:110px; object-fit:cover; border-bottom:2px solid #2e3745; border-radius: 4px 4px 0 0;" alt="Katapulta">`;
        } else {
            unitImageHtml = `
                <div style="width:100%; height:110px; background: linear-gradient(135deg, #141822 0%, #090c12 100%); display: flex; align-items: center; justify-content: center; border-bottom: 2px solid #2e3745; border-radius: 4px 4px 0 0; font-size: 2.4rem; filter: drop-shadow(0 0 8px rgba(0,0,0,0.6));">
                    ${stats.icon}
                </div>
            `;
        }

        unitsMarketHtml += `
            <div class="rpg-card" style="width: 180px; padding: 0; text-align: center; display: flex; flex-direction: column; justify-content: space-between; border: 2px solid #2e3745;">
                <div>
                    ${unitImageHtml}
                    <div style="padding: 12px 10px 5px 10px;">
                        <h3 style="color: #ffb700; font-size: 1.1rem; margin: 0 0 6px 0; font-family: 'MedievalSharp', sans-serif; text-transform: uppercase; letter-spacing: 0.5px;">${stats.name}</h3>
                        <p style="font-size: 0.8rem; color: #94a3b8; margin: 2px 0;">W armii: <strong style="color: #fff; font-size: 1rem;">${inArmy}</strong></p>
                        
                        <div style="background: rgba(0,0,0,0.4); border: 1px solid #1e242e; padding: 5px; border-radius: 4px; margin: 10px 0 4px 0; font-size: 0.75rem; color: #cbd5e1; display: flex; justify-content: space-around;">
                            <span>⚔️ ${stats.atk}</span>
                            <span style="color: #334155;">|</span>
                            <span>❤️ ${stats.hp}</span>
                            <span style="color: #334155;">|</span>
                            <span>⚡ ${stats.spd}</span>
                        </div>
                    </div>
                </div>
                
                <div style="padding: 0 10px 12px 10px;">
                    <p style="font-size: 0.9rem; color: #ffd700; font-weight: bold; margin-bottom: 8px; font-family: 'Cinzel', serif;">💰 ${cost} CC</p>
                    <button onclick="window.buyUnit('${type}', ${cost})" class="rpg-btn" style="padding: 8px; font-size: 0.8rem; width: 100%; border-radius: 4px; letter-spacing: 1px;">Werbuj</button>
                </div>
            </div>
        `;
    });

    let hospitalHtml = '';
    let totalWounded = 0;

    Object.entries(gameState.hospital).forEach(([type, count]) => {
        if (count > 0) {
            totalWounded += count;
            const stats = UNIT_STATS[type];
            hospitalHtml += `
                <div style="display: flex; justify-content: space-between; align-items: center; background: rgba(231,76,60,0.05); border: 1px solid rgba(231,76,60,0.3); padding: 8px 12px; border-radius: 6px; margin-bottom: 6px;">
                    <span style="font-size: 0.85rem; color: #f1f5f9;">${stats.icon} ${stats.name} (Ranni: <strong style="color:#ef4444;">${count}</strong>)</span>
                    <button onclick="window.healUnit('${type}')" class="rpg-btn" style="border-color: #27ae60; padding: 4px 10px; font-size: 0.75rem; color:#2ecc71;">🏥 Ulecz (${stats.herbCost} Ziół)</button>
                </div>
            `;
        }
    });

    if (totalWounded === 0) {
        hospitalHtml = `<p style="color: #64748b; font-size: 0.8rem; text-align: center; padding: 15px; font-style: italic;">Brak rannych wojowników w lazarecie.</p>`;
    }

    viewport.innerHTML = `
        <div style="max-width: 1000px; margin: 0 auto; padding: 20px; font-family: 'Cinzel', serif;">
            <div style="display: flex; align-items: center; gap: 20px; background: rgba(27, 32, 40, 0.6); border: 2px solid #2e3745; padding: 15px; border-radius: 8px; box-shadow: inset 0 0 15px rgba(0,0,0,0.5); margin-bottom: 25px;">
                <img src="media/commander-upgrade.jpg" style="width: 70px; height: 70px; border-radius: 6px; border: 2px solid #ffb700; object-fit: cover;" alt="Garnizon">
                <div>
                    <h2 style="margin: 0; color: #fff; letter-spacing: 1px; font-size: 1.6rem;">⚔️ Królewski Garnizon Wojskowy</h2>
                    <p style="margin: 3px 0 0 0; color: #94a3b8; font-size: 0.85rem; font-family: sans-serif;">Zarządzaj rekrutacją zaawansowanych kohort bojowych i lecz rannych weteranów.</p>
                </div>
            </div>
            
            <div style="display: flex; gap: 16px; flex-wrap: wrap; justify-content: center; margin-bottom: 30px;">
                ${unitsMarketHtml}
            </div>

            <div style="display: flex; gap: 20px; flex-wrap: wrap; margin-top: 20px;">
                <div class="rpg-card" style="flex: 1; min-width: 300px; padding: 20px;">
                    <h3 style="margin-top: 0; color: #2ecc71; border-bottom: 1px solid #2e3745; padding-bottom: 8px; font-size: 1.2rem;">🏥 Lazaret Szpitalny</h3>
                    <div style="margin-top: 12px;">${hospitalHtml}</div>
                </div>

                <div class="rpg-card" style="flex: 1; min-width: 300px; padding: 20px; display: flex; gap: 15px; align-items: center;">
                    <img src="media/iron-hammers.png" style="width: 100px; height: 100px; border: 2px solid #4a3b32; border-radius: 6px; object-fit: cover;" alt="Kowalstwo">
                    <div style="flex: 1;">
                        <h3 style="margin: 0; color: #cbd5e1; font-size: 1.1rem;">⚒️ Warsztat Kowala (Lvl ${bLevel})</h3>
                        <p style="font-size: 0.8rem; color: #94a3b8; font-family: sans-serif; margin: 6px 0;">Każdy poziom zwiększa pancerz i daje <strong style="color:#22c55e;">+10 HP</strong> dla nowo rekrutowanych wojsk.</p>
                        <p style="font-size: 0.85rem; color: #ffd700; font-weight: bold; margin-bottom: 8px;">Koszt: ${upgradeCost} Żelaza</p>
                        <button onclick="window.upgradeBlacksmith()" class="rpg-btn" style="padding: 6px 12px; font-size: 0.75rem;">Ulepsz Oręż</button>
                    </div>
                </div>
            </div>

            <div style="text-align: center; margin-top: 35px;">
                <button class="rpg-btn" onclick="window.switchScreen('map-screen')" style="padding: 10px 30px; font-size: 0.9rem; letter-spacing: 1px;">⬅ Powrót do Mapy Królestwa</button>
            </div>
        </div>
    `;
};

window.renderMissionsScreen = function () {
    const viewport = document.getElementById('active-screen');

    let html = `
        <div class="tavern-panel">
            <h2>📜 Karczma pod Złotym Gryfem</h2>
            <p class="subtitle" style="font-family: 'Cinzel'; color: #a3937c; margin-bottom: 20px;">Wyślij swoich zwiadowców i żołnierzy na niebezpieczne wyprawy.</p>
            <div id="missions-list" style="display: flex; flex-direction: column; gap: 15px;">
    `;

    availableMissions.forEach(mission => {
        const active = gameState.activeMissions.find(m => m.id === mission.id);

        html += `
            <div class="mission-row" style="background: #231a14; border: 2px solid #4a3525; border-radius: 8px; padding: 15px; display: flex; justify-content: space-between; align-items: center; box-shadow: 0 4px 8px rgba(0,0,0,0.4);">
                <div>
                    <h3 style="margin: 0; color: #ebd6b3; font-size: 1.2rem;">${mission.name}</h3>
                    <p style="font-family: 'Cinzel'; font-size: 0.85rem; color: #a0907a; margin-top: 5px;">
                        Wymaga: <strong style="color: #ffd700;">1x ${mission.unitName}</strong> | Czas: <strong>${mission.duration}s</strong>
                    </p>
                </div>
                
                <div style="text-align: right; display: flex; align-items: center; gap: 20px;">
                    <span style="font-size: 1.1rem; color: #ffd700; font-weight: bold;">+ ${mission.reward} CC</span>
        `;

        if (active) {
            html += `<button disabled style="background: #4a3b32; color: #8a7b70; border: 1px solid #5a4b40; padding: 10px 20px; border-radius: 6px; font-family: 'MedievalSharp'; cursor: not-allowed;">W trasie (${Math.ceil(active.timeLeft)}s)</button>`;
        } else {
            html += `<button onclick="window.startMission('${mission.id}')" class="nav-btn" style="padding: 10px 20px; font-size: 0.95rem; min-width: 120px;">Wyślij</button>`;
        }

        html += `</div></div>`;
    });

    html += `</div></div>`;
    viewport.innerHTML = html;
};

window.showRpgDialog = function (title, text, options = []) {
    const overlay = document.getElementById('rpg-dialog-overlay');
    document.getElementById('rpg-dialog-title').innerText = title;
    document.getElementById('rpg-dialog-text').innerText = text;

    const optionsContainer = document.getElementById('rpg-dialog-options');
    optionsContainer.innerHTML = '';

    if (options.length === 0) {
        options = [{ text: "Zrozumiałem, dowódco", callback: () => { } }];
    }

    options.forEach(opt => {
        const btn = document.createElement('button');
        btn.className = 'nav-btn';
        btn.innerText = opt.text;
        btn.style.width = '100%';
        btn.style.fontSize = '1rem';
        btn.onclick = () => {
            overlay.style.display = 'none';
            opt.callback();
        };
        optionsContainer.appendChild(btn);
    });

    overlay.style.display = 'flex';
};

// Inicjalizacja nasłuchiwania zdarzeń DOM po załadowaniu całej struktury plików
document.addEventListener("DOMContentLoaded", () => {
    const buttons = document.querySelectorAll('.nav-btn');
    buttons.forEach(btn => {
        btn.addEventListener('click', () => {
            const target = btn.getAttribute('data-target');
            window.switchScreen(target);
        });
    });

    window.switchScreen('map-screen');
    requestAnimationFrame(gameLoop);
});