// ==========================================
// 1. GLOBALNY STAN GRY (State)
// ==========================================
const gameState = {
    resources: {
        commanderCoins: 100
    },
    production: {
        ccPerSecond: 1 // Pasywny przychód z akademii
    },
    units: {
        knights: 0,
        archers: 0
    },
    lastTick: performance.now()
};

// ==========================================
// 2. SILNIK GRY (Game Loop z Delta Time)
// ==========================================
function gameLoop(currentTime) {
    // Obliczamy ile milisekund minęło od ostatniej klatki
    const deltaTime = (currentTime - gameState.lastTick) / 1000; // Konwersja na sekundy
    gameState.lastTick = currentTime;

    // Aktualizacja logiki i surowców na bazie upływu czasu
    updateResources(deltaTime);

    // Renderowanie zmienionych wartości na ekranie gracza
    renderUI();

    // Zapętlenie pętli przy kolejnej klatce animacji systemu
    requestAnimationFrame(gameLoop);
}

// Przeliczanie pasywnego przychodu/straty surowców
function updateResources(dt) {
    gameState.resources.commanderCoins += gameState.production.ccPerSecond * dt;
}

// Aktualizacja warstwy wizualnej (DOM)
function renderUI() {
    const ccElement = document.getElementById('res-cc');
    if (ccElement) {
        ccElement.innerText = Math.floor(gameState.resources.commanderCoins);
    }
}

// ==========================================
// 3. INICJALIZACJA I OBSŁUGA NABIEŻĄCO
// ==========================================
window.switchScreen = function(screenId) {
    const buttons = document.querySelectorAll('.nav-btn');
    
    // Aktualizacja podświetlenia przycisków w menu bocznym
    buttons.forEach(btn => {
        if (btn.getAttribute('data-target') === screenId) {
            btn.classList.add('active');
        } else {
            btn.classList.remove('active');
        }
    });

    // Dynamiczne odpalanie renderera z odpowiedniego modułu
    if (screenId === 'map-screen' && window.renderMapScreen) {
        window.renderMapScreen();
    } else if (screenId === 'barracks-screen' && window.renderBarracksScreen) {
        window.renderBarracksScreen();
    } else {
        document.getElementById('active-screen').innerHTML = `<h2>Ekran w budowie: ${screenId}</h2>`;
    }
};

document.addEventListener("DOMContentLoaded", () => {
    // Obsługa kliknięć w sidebarze
    const buttons = document.querySelectorAll('.nav-btn');
    buttons.forEach(btn => {
        btn.addEventListener('click', (e) => {
            const target = e.target.getAttribute('data-target');
            window.switchScreen(target);
        });
    });

    // START GRY: Domyślnie ładujemy mapę świata
    window.switchScreen('map-screen');
    requestAnimationFrame(gameLoop);
});
window.renderMapScreen = function() {
    const viewport = document.getElementById('active-screen');
    
    viewport.innerHTML = `
        <div class="map-wrapper">
            <!-- Podkład pod mapę -->
            <img src="watermarked_img_3717427206643532346.png" alt="Mapa Świata" class="map-bg-img">

            <!-- Interaktywna siatka nakładki -->
            <svg viewBox="0 0 1000 562" class="map-overlay-svg">
                
                <!-- ZIELONY PUNKCIK: Obozowisko / Koszary -->
                <circle cx="500" cy="350" r="15" class="map-camp-node" onclick="window.switchScreen('barracks-screen')" />
                <text x="500" y="385" class="map-node-label" text-anchor="middle">Obozowisko Główne</text>
                
            </svg>
        </div>
    `;
};
window.renderBarracksScreen = function() {
    const viewport = document.getElementById('active-screen');
    
    viewport.innerHTML = `
        <div class="barracks-panel">
            <h2>⚔️ Koszary Wojskowe</h2>
            <p class="subtitle">Zarządzaj oddziałami i werbuj rekrutów za Commander Coins.</p>
            
            <div class="placeholder-content">
                <p>Status: Wolne miejsca w namiotach.Gotowy na rozkazy.</p>
                <!-- Przycisk powrotu dla wygody testera -->
                <button class="nav-btn" onclick="window.switchScreen('map-screen')">⬅ Wróć do mapy</button>
            </div>
        </div>
    `;
};