const accRock = document.getElementById('entire-rock')
const gemCounter = document.querySelector('.gem-counter')

let gems = 0;

function updateGems() {
        gemCounter.innerHTML = `Gems : ${gems.toFixed(0)}$`
}

let gem_per_click = 1;
let lucky_gem_percentage = 3
accRock.addEventListener('click', function (e) {
        if ((Math.random()*100) < lucky_gem_percentage) {
                gems += gem_per_click * 7;
                console.log("Lucky gem");
        } else {
                // Zwykly klik
                gems += gem_per_click;
                console.log("Kliknięcie w kamyczek");
        }
})


// Miner Upgrade
const minerUpgrade = document.querySelector(".miner-upgrade")
const minerLvl = document.querySelector(".miner-lvl")
const minerPrice = document.querySelector(".miner-price")

function updateLvL() {
        minerLvl.innerHTML = `Lvl: ${miner_level + 1}`
}
function updatePrice() {
        minerPrice.innerHTML = `Price: ${minerCost.toFixed(0)}$`;
}
const minerBaseCost = 10;
let minerCost = 10;
let minerEfficiency = 0.1;
let miner_level = 0;

minerUpgrade.onclick = function () {
        if (gems >= minerCost) {
                gems -= minerCost

                miner_level++
                if (miner_level == 10 || miner_level == 20 || miner_level == 50) {
                        minerEfficiency *= 2
                }
                minerCost = Math.floor(minerBaseCost * Math.pow(1.15, miner_level));

                updateLvL();
                updatePrice();
        }
}


let lastTime = 0;
let accumulatedTime = 0;

function gameLoop(timestamp) {
        // 1. Inicjalizacja przy pierwszym uruchomieniu
        if (!lastTime) lastTime = timestamp;

        // 2. Obliczanie Delta Time (czasu między klatkami)
        const deltaTime = timestamp - lastTime;
        lastTime = timestamp;
        accumulatedTime += deltaTime;

        // --- TUTAJ WCHODZI TWOJA LOGIKA ---
        // Na przykład: przesunięcie postaci o (prędkość * deltaTime)
        while (accumulatedTime >= 1000) {
                gems += miner_level * minerEfficiency; // Dodajemy gemy z ulepszeń
                accumulatedTime -= 1000; // Odejmujemy zużyte pół sekundy
        }
        // ----------------------------------

        // 3. Prośba o kolejną klatkę
        requestAnimationFrame(gameLoop);
        updateGems()
        updateLvL()
        updatePrice()
}

// Pierwsze odpalenie pętli
requestAnimationFrame(gameLoop);