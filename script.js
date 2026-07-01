const accRock = document.getElementById('entire-rock')
const gemCounter = document.querySelector('.gem-counter')

let gems = 0;

function updateGems(){
        gemCounter.innerHTML = `Gems : ${gems}`
}
// Klikanko w Kamyczek , Mechanika dodawania hajsu
accRock.addEventListener('click' , function(e){
        gems++;
        console.log("Klikniecie w kamyczek")
        updateGems()
})


// Miner Upgrade
const minerUpgrade = document.querySelector(".miner-upgrade")
        
let minerCount = 0;
let minerCost = 50;
minerUpgrade.onclick = function(){
        if(gems >= minerCost){
                gems -= minerCost

                minerCount++

        }
}


let lastTime = 0;

function gameLoop(timestamp) {
    // 1. Inicjalizacja przy pierwszym uruchomieniu
    if (!lastTime) lastTime = timestamp;

    // 2. Obliczanie Delta Time (czasu między klatkami)
    const deltaTime = timestamp - lastTime;
    lastTime = timestamp;

    // --- TUTAJ WCHODZI TWOJA LOGIKA ---
    // Na przykład: przesunięcie postaci o (prędkość * deltaTime)

    // ----------------------------------

    // 3. Prośba o kolejną klatkę
    requestAnimationFrame(gameLoop);
}

// Pierwsze odpalenie pętli
requestAnimationFrame(gameLoop);