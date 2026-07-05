// ==========================================
// SILNIK GRY, WALKA I LOGIKA SYSTEMOWA
// ==========================================

function gameLoop(currentTime) {
    const deltaTime = (currentTime - gameState.lastTick) / 1000;
    gameState.lastTick = currentTime;

    updateResources(deltaTime);

    if (gameState.isCombatActive) {
        gameState.combatTimer += deltaTime;
        if (gameState.combatTimer >= 1) {
            gameState.resources.commanderCoins += 6;
            gameState.combatTimer = 0;
        }
    }

    renderUI();
    requestAnimationFrame(gameLoop);
}

function updateResources(dt) {
    gameState.resources.commanderCoins += gameState.production.ccPerSecond * dt;

    for (let i = gameState.activeMissions.length - 1; i >= 0; i--) {
        let mission = gameState.activeMissions[i];
        mission.timeLeft -= dt;

        if (mission.timeLeft <= 0) {
            const isSuccess = Math.random() > 0.2;
            let dialogText = "";

            if (isSuccess) {
                gameState.units[mission.requiredUnit]++;
                gameState.resources.commanderCoins += mission.reward;
                dialogText = `Twoi ludzie ukończyli zadanie: ${mission.name}. Do skarbca trafia +${mission.reward} CC, a jednostka wraca do koszar!`;
            } else {
                dialogText = `Fatalne wieści! Wyprawa ${mission.name} zakończyła się zasadzką. Twój ${mission.requiredUnit} poległ w walce.`;
            }

            setTimeout(() => {
                window.showRpgDialog(isSuccess ? "🏆 Misja Ukończona" : "💀 Tragedia na Szlaku", dialogText);
                renderUI();
            }, 50);

            gameState.activeMissions.splice(i, 1);
            if (document.getElementById('missions-list')) window.renderMissionsScreen();
        }
    }
}

function calculateTacticalPower(commander, formation) {
    let totalPower = 0;

    const getLineModifier = (type, line) => {
        if (line === 'backLine' && (type === 'archers' || type === 'mages')) return 1.3;
        if (line === 'frontLine' && (type === 'knights' || type === 'cavalry')) return 1.2;
        return 1.0;
    };

    ['frontLine', 'backLine'].forEach(line => {
        Object.entries(formation[line]).forEach(([type, count]) => {
            if (count > 0 && UNIT_STATS[type]) {
                const baseUnitPower = (UNIT_STATS[type].atk * 0.7) + (UNIT_STATS[type].hp * 0.3);
                totalPower += Math.round(baseUnitPower * count * getLineModifier(type, line));
            }
        });
    });

    totalPower += (gameState.upgrades.blacksmithLevel * 5);

    if (commander && commander.perk === "knight_buff") {
        const knightCount = (formation.frontLine.knights || 0) + (formation.backLine.knights || 0);
        totalPower += knightCount * 4;
    }

    return totalPower;
}

window.executeTacticalBattle = function (nodeId) {
    const viewport = document.getElementById('active-screen');
    const nodeData = battleNodesData[nodeId];

    let playerArmy = [];
    let enemyArmy = [];
    let battleInterval = null;
    
    let commandPoints = 10; 
    let selectedActiveUnit = null; 
    let turnQueue = [];

    const generateInstances = (formation, side) => {
        let arr = [];
        ['frontLine', 'backLine'].forEach(line => {
            Object.entries(formation[line]).forEach(([type, count]) => {
                for (let i = 0; i < count; i++) {
                    const baseHp = UNIT_STATS[type].hp + (side === 'gracz' ? gameState.upgrades.blacksmithLevel * 10 : 0);
                    arr.push({
                        id: `${side}_${type}_${i}_${Math.floor(Math.random() * 100000)}`,
                        type, side, line,
                        hp: baseHp, maxHp: baseHp,
                        atk: UNIT_STATS[type].atk,
                        spd: UNIT_STATS[type].spd,
                        skillReady: false,
                        turnsToSkill: 2 
                    });
                }
            });
        });
        return arr;
    };

    playerArmy = generateInstances(activeBattleFormation, 'gracz');
    enemyArmy = generateInstances(nodeData.enemy, 'wróg');

    const rebuildTurnQueue = () => {
        turnQueue = [...playerArmy.filter(u => u.hp > 0), ...enemyArmy.filter(u => u.hp > 0)]
            .sort((a, b) => b.spd - a.spd);
    };

    window.handleBattleCardClick = function(unitId) {
        const clickedUnit = playerArmy.concat(enemyArmy).find(u => u.id === unitId);
        if (!clickedUnit || clickedUnit.hp <= 0) return;

        if (clickedUnit.side === 'gracz' && clickedUnit.skillReady) {
            if (selectedActiveUnit) document.getElementById(`card-${selectedActiveUnit.id}`).style.borderColor = '#22c55e';
            selectedActiveUnit = clickedUnit;
            document.getElementById(`card-${unitId}`).style.borderColor = '#38bdf8'; 
            return;
        }

        if (selectedActiveUnit && clickedUnit.side === 'wróg') {
            executeUnitActiveSkill(selectedActiveUnit, clickedUnit);
            selectedActiveUnit = null;
            return;
        }

        if (clickedUnit.side === 'wróg') {
            playerArmy.concat(enemyArmy).forEach(u => {
                const c = document.getElementById(`card-${u.id}`);
                if(c) c.classList.remove('focus-target-active');
            });
            document.getElementById(`card-${unitId}`).classList.add('focus-target-active');
        }
    };

    const executeUnitActiveSkill = (attacker, target) => {
        let skillDmg = attacker.atk * 2; 
        let effectText = "POTĘŻNY CIOS";

        if (attacker.type === 'mages') {
            effectText = "🔥 KULA OGNIA";
            enemyArmy.filter(u => u.id !== target.id && u.hp > 0).slice(0, 2).forEach(u => {
                const splash = Math.round(attacker.atk * 0.8);
                u.hp = Math.max(0, u.hp - splash);
                updateCardVisuals(u);
                triggerVisualEffect(u.id, `-${splash}`, "#a855f7");
            });
        } else if (attacker.type === 'cavalry') {
            effectText = "🐴 TRATOWANIE";
            target.spd = Math.max(1, target.spd - 5); 
        }

        target.hp = Math.max(0, target.hp - skillDmg);
        attacker.skillReady = false;
        attacker.turnsToSkill = 3; 

        triggerVisualEffect(target.id, `-${Math.round(skillDmg)}`, "#38bdf8", true);
        triggerVisualEffect(attacker.id, effectText, "#38bdf8");

        updateCardVisuals(target);
        updateCardVisuals(attacker);
    };

    const unitTokenTemplate = (u) => `
        <div id="card-${u.id}" onclick="window.handleBattleCardClick('${u.id}')" class="battle-card" style="cursor: pointer; background: #0f172a; border: 2px solid ${u.side === 'gracz' ? '#22c55e' : '#ef4444'}; border-radius: 8px; padding: 10px; width: 100px; text-align: center; position: relative; transition: all 0.2s;">
            <div style="font-size: 1.2rem;">${UNIT_STATS[u.type].icon}</div>
            <div style="font-size: 0.6rem; color: #94a3b8; font-weight: bold;">${UNIT_STATS[u.type].name}</div>
            <div id="hp-txt-${u.id}" style="font-size: 0.75rem; color: #fff; font-weight: bold; margin: 2px 0;">${u.hp} HP</div>
            <div style="background: #2d1414; width: 100%; height: 4px; border-radius: 2px; overflow: hidden;">
                <div id="hp-bar-${u.id}" style="background: #22c55e; width: 100%; height: 100%;"></div>
            </div>
            <div id="skill-badge-${u.id}" style="font-size: 0.5rem; margin-top: 4px; color: #64748b;">⏳ Ładowanie...</div>
        </div>
    `;

    viewport.innerHTML = `
        <div style="max-width: 1100px; margin: 0 auto; background: #020617; border: 2px solid #334155; border-radius: 12px; font-family: sans-serif; display: flex; flex-direction: column; height: 700px; justify-content: space-between; overflow: hidden;">
            <div style="background: #0f172a; padding: 12px 25px; display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid #1e293b;">
                <div>
                    <span style="font-size: 0.65rem; color: #94a3b8; display: block;">PUNKTY DOWODZENIA (BITWA)</span>
                    <strong style="color: #38bdf8; font-size: 1.5rem;">⚡ <span id="arena-cp-counter">${commandPoints}</span> PD</strong>
                </div>
                <div style="font-size: 0.9rem; color: #e2e8f0; font-weight: bold;">⚔️ KLIKNIJ ŚWIECĄCĄ JEDNOSTKĘ, BY UŻYĆ ZDOLNOŚCI!</div>
                <div style="text-align: right; color: #ef4444; font-weight: bold;">Przeciwnik: ${nodeData.enemy.name}</div>
            </div>

            <div style="display: flex; flex: 1; padding: 20px; gap: 40px; align-items: center; justify-content: center; background: radial-gradient(circle, #0f172a 0%, #020617 100%);">
                <div style="display: flex; flex-direction: column; gap: 15px;">
                    <div style="display: flex; gap: 10px;" id="grid-player-back">${playerArmy.filter(u => u.line === 'backLine').map(unitTokenTemplate).join('')}</div>
                    <div style="border-top: 1px dashed #334155; padding-top: 15px; display: flex; gap: 10px;" id="grid-player-front">${playerArmy.filter(u => u.line === 'frontLine').map(unitTokenTemplate).join('')}</div>
                </div>
                <div style="font-size: 2rem; color: #334155; font-weight: 900;">VS</div>
                <div style="display: flex; flex-direction: column; gap: 15px;">
                    <div style="display: flex; gap: 10px;" id="grid-enemy-front">${enemyArmy.filter(u => u.line === 'frontLine').map(unitTokenTemplate).join('')}</div>
                    <div style="border-top: 1px dashed #334155; padding-top: 15px; display: flex; gap: 10px;" id="grid-enemy-back">${enemyArmy.filter(u => u.line === 'backLine').map(unitTokenTemplate).join('')}</div>
                </div>
            </div>

            <div style="background: #0f172a; padding: 15px; display: flex; justify-content: center; gap: 15px; border-top: 1px solid #1e293b;">
                <button onclick="window.castCommanderTactics('heal')" class="rpg-btn" style="padding: 8px 16px; font-size: 0.8rem;">💚 Masowe Leczenie (15 PD)</button>
                <button onclick="window.castCommanderTactics('strike')" class="rpg-btn" style="padding: 8px 16px; font-size: 0.8rem; background: #991b1b;">☄️ Deszcz Meteorów (25 PD)</button>
            </div>
        </div>
    `;

    window.castCommanderTactics = function(type) {
        if (type === 'heal' && commandPoints >= 15) {
            commandPoints -= 15;
            playerArmy.filter(u => u.hp > 0).forEach(u => {
                u.hp = Math.min(u.maxHp, u.hp + 25);
                updateCardVisuals(u);
                triggerVisualEffect(u.id, "+25 HP", "#22c55e");
            });
        } else if (type === 'strike' && commandPoints >= 25) {
            commandPoints -= 25;
            enemyArmy.filter(u => u.hp > 0).forEach(u => {
                u.hp = Math.max(0, u.hp - 30);
                updateCardVisuals(u);
                triggerVisualEffect(u.id, "-30 HP", "#ef4444");
            });
        }
        document.getElementById('arena-cp-counter').innerText = commandPoints;
    };

    const updateCardVisuals = (u) => {
        const card = document.getElementById(`card-${u.id}`);
        const hpTxt = document.getElementById(`hp-txt-${u.id}`);
        const hpBar = document.getElementById(`hp-bar-${u.id}`);
        const badge = document.getElementById(`skill-badge-${u.id}`);
        
        if (!card) return;

        if (u.hp <= 0) {
            card.style.opacity = '0.15';
            card.style.transform = 'scale(0.9)';
            if (hpTxt) hpTxt.innerText = "POLEGŁ";
            if (hpBar) hpBar.style.width = '0%';
            if (badge) badge.innerText = "";
            return;
        }

        if (hpTxt) hpTxt.innerText = `${Math.round(u.hp)} HP`;
        if (hpBar) hpBar.style.width = `${(u.hp / u.maxHp) * 100}%`;
        
        if (badge) {
            if (u.side === 'gracz') {
                if (u.skillReady) {
                    badge.innerText = "⭐ GOTOWY (KLIKNIJ)";
                    badge.style.color = '#38bdf8';
                    card.style.boxShadow = '0 0 12px rgba(56, 189, 248, 0.4)';
                } else {
                    badge.innerText = `⏳ Ładowanie (${u.turnsToSkill})`;
                    badge.style.color = '#64748b';
                    card.style.boxShadow = 'none';
                }
            } else {
                badge.innerText = ""; 
            }
        }
    };

    const triggerVisualEffect = (targetId, text, color, isCrit = false) => {
        const card = document.getElementById(`card-${targetId}`);
        if (!card) return;
        const fText = document.createElement('div');
        fText.className = 'floating-dmg';
        fText.style.color = color;
        fText.style.position = 'absolute';
        fText.style.top = '-10px';
        fText.style.left = '50%';
        fText.style.fontWeight = 'bold';
        fText.innerText = text;
        card.appendChild(fText);
        setTimeout(() => fText.remove(), 800);
    };

    const runCombatTick = () => {
        let activePlayers = playerArmy.filter(u => u.hp > 0);
        let activeEnemies = enemyArmy.filter(u => u.hp > 0);

        if (activePlayers.length === 0 || activeEnemies.length === 0) {
            clearInterval(battleInterval);
            endBattle(activePlayers.length > 0);
            return;
        }

        if (turnQueue.length === 0) {
            rebuildTurnQueue();
            commandPoints = Math.min(50, commandPoints + 4);
            const cpCounter = document.getElementById('arena-cp-counter');
            if (cpCounter) cpCounter.innerText = commandPoints;

            playerArmy.concat(enemyArmy).forEach(u => {
                if (u.hp > 0 && u.turnsToSkill > 0) {
                    u.turnsToSkill--;
                    if (u.turnsToSkill === 0) u.skillReady = true;
                }
                updateCardVisuals(u);
            });
        }

        let attacker = turnQueue.shift();
        while (attacker && attacker.hp <= 0) { attacker = turnQueue.shift(); }
        if (!attacker) return;

        let targetSide = attacker.side === 'gracz' ? enemyArmy : playerArmy;
        let aliveTargets = targetSide.filter(u => u.hp > 0);
        if (aliveTargets.length === 0) return;

        let target = aliveTargets[Math.floor(Math.random() * aliveTargets.length)];
        let dmg = attacker.atk;
        target.hp = Math.max(0, target.hp - dmg);
        
        triggerVisualEffect(target.id, `-${dmg}`, attacker.side === 'gracz' ? "#22c55e" : "#ef4444");
        updateCardVisuals(target);
    };

    const endBattle = (isVictory) => {
        const counts = { knights: 0, archers: 0, mages: 0, cavalry: 0, catapults: 0 };
        playerArmy.forEach(u => { if (u.hp > 0) counts[u.type]++; });
        Object.keys(counts).forEach(type => {
            gameState.commanders[0].troops[type] = counts[type] + activeBattleFormation.pool[type];
        });

        resetFormations();
        window.switchScreen('map-screen');
        renderUI();

        if (isVictory) {
            const rewards = battleNodesData[nodeId].rewards;
            gameState.resources.iron += rewards.iron;
            gameState.resources.herbs += rewards.herbs;
            gameState.conqueredNodes.push(nodeId);
            window.showRpgDialog("🏆 Wygrana!", `Terytorium zajęte. Zdobyłeś surowce do rozbudowy bazy!`);
        } else {
            window.showRpgDialog("💀 Odwrót", "Twój oddział został rozbity.");
        }
    };

    battleInterval = setInterval(runCombatTick, 1000);
};

function resetFormations() {
    Object.keys(activeBattleFormation).forEach(zone => {
        Object.keys(activeBattleFormation[zone]).forEach(unit => {
            activeBattleFormation[zone][unit] = 0;
        });
    });
}

window.battleDragStart = function (event, unitType, sourceZone) {
    event.dataTransfer.setData("text/plain", JSON.stringify({ unitType, sourceZone }));
};

window.battleAllowDrop = function (event) {
    event.preventDefault();
};

window.battleDropUnit = function (event, targetZone) {
    event.preventDefault();
    const dataStr = event.dataTransfer.getData("text/plain");
    if (!dataStr) return;

    const { unitType, sourceZone } = JSON.parse(dataStr);
    if (sourceZone === targetZone) return;

    if (activeBattleFormation[sourceZone][unitType] > 0) {
        const countToMove = activeBattleFormation[sourceZone][unitType];
        activeBattleFormation[sourceZone][unitType] = 0;
        activeBattleFormation[targetZone][unitType] += countToMove;

        window.renderBattlePrepScreen(currentActiveNodeId, battleNodesData[currentActiveNodeId].enemy);
    }
};

window.battleTokenClick = function (unitType, currentZone, nodeId) {
    let nextZone = 'frontLine';
    if (currentZone === 'pool') nextZone = 'frontLine';
    else if (currentZone === 'frontLine') nextZone = 'backLine';
    else if (currentZone === 'backLine') nextZone = 'pool';

    if (activeBattleFormation[currentZone][unitType] > 0) {
        activeBattleFormation[currentZone][unitType]--;
        activeBattleFormation[nextZone][unitType]++;

        window.renderBattlePrepScreen(nodeId, battleNodesData[nodeId].enemy);
    }
};

window.healUnit = function (unitType) {
    const cost = UNIT_STATS[unitType].herbCost;

    if (gameState.hospital[unitType] > 0 && gameState.resources.herbs >= cost) {
        gameState.resources.herbs -= cost;
        gameState.hospital[unitType]--;
        gameState.units[unitType]++;

        window.renderBarracksScreen();
        renderUI();
    } else {
        window.showRpgDialog("❌ Brak Ziół Leczniczych", "Nie masz wystarczającej ilości ziół do sporządzenia medykamentów!");
    }
};

window.buyUnit = function (unitType, ccCost) {
    if (gameState.resources.commanderCoins >= ccCost) {
        gameState.resources.commanderCoins -= ccCost;
        gameState.units[unitType]++;

        window.renderBarracksScreen();
        renderUI();
    } else {
        window.showRpgDialog("Brak monet", "Za mało Commander Coins, dowódco! Wyślij wojska na misje w tawernie.");
    }
};

window.startMission = function (missionId) {
    const mission = availableMissions.find(m => m.id === missionId);

    if (gameState.units[mission.requiredUnit] > 0) {
        gameState.units[mission.requiredUnit]--;

        gameState.activeMissions.push({
            id: mission.id,
            reward: mission.reward,
            timeLeft: mission.duration,
            requiredUnit: mission.requiredUnit
        });

        window.renderMissionsScreen();
    } else {
        window.showRpgDialog("Brak jednostki", `Nie masz wolnego ${mission.unitName}a, rekrutuj go w Koszarach!`);
    }
};

window.upgradeBlacksmith = function() {
    const ironCost = (gameState.upgrades.blacksmithLevel + 1) * 40; 
    
    if (gameState.resources.iron >= ironCost) {
        gameState.resources.iron -= ironCost;
        gameState.upgrades.blacksmithLevel++;
        window.showRpgDialog("⚒️ Kuźnia Rozbudowana", `Kowal osiągnął poziom ${gameState.upgrades.blacksmithLevel}. Twoje nowe jednostki zyskują +10 HP stałej premii!`);
        window.renderBarracksScreen();
        renderUI();
    } else {
        window.showRpgDialog("❌ Brak Surowców", `Do ulepszenia kuźni potrzebujesz ${ironCost} sztuk Żelaza. Posiadasz: ${gameState.resources.iron}.`);
    }
};

window.moveUnit = function (unitType, fromLine, toLine, nodeId) {
    const from = fromLine === 'front' ? activeBattleFormation.frontLine : activeBattleFormation.backLine;
    const to = toLine === 'front' ? activeBattleFormation.frontLine : activeBattleFormation.backLine;

    if (from[unitType] > 0) {
        from[unitType]--;
        to[unitType]++;

        window.renderBattlePrepScreen(nodeId, battleNodesData[nodeId].enemy);
    }
};