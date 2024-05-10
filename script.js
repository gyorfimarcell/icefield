const speedSlider = document.getElementById("speed");
const speedLabel = document.getElementById("speedLabel");
const autoCheckbox = document.getElementById("auto");
const stepButton = document.getElementById("stepButton");
const gameField = document.getElementById("game");
const messages = document.getElementById("messages");

const ROWS = 12;
const COLUMNS = 30;
const NUM_HOLES = Math.floor(ROWS * COLUMNS / 10);
const NUM_PLAYERS = Math.floor(ROWS * COLUMNS / 10);

let autoInterval = null;

function MakeField() {
    for (let index = 0; index < ROWS * COLUMNS; index++) {
        const tile = document.createElement("div");
        tile.className = "tile";
        tile.style.flexBasis = `calc(100% / ${COLUMNS})`;
        gameField.appendChild(tile);
    }

    const tiles = Array.from(document.querySelectorAll(".tile"));

    for (let index = 0; index < NUM_HOLES; index++) {
        const hole = document.createElement("div");
        hole.className = "hole";

        const chosenIndex = Math.floor(Math.random() * tiles.length);
        tiles[chosenIndex].appendChild(hole);
        tiles.splice(chosenIndex, 1);
    }

    for (let index = 0; index < NUM_PLAYERS; index++) {
        const player = document.createElement("div");
        player.className = "player";
        player.innerText = index.toString().padStart(2, "0");
        player.dataset.num = index;

        const chosenIndex = Math.floor(Math.random() * tiles.length);
        tiles[chosenIndex].appendChild(player);
        tiles.splice(chosenIndex, 1);
    }
}

function GetTile(col, row) {
    return document.querySelectorAll(".tile")[row * COLUMNS + col];
}

function AdjacentTiles(tile) {
    const index = Array.from(document.querySelectorAll(".tile")).indexOf(tile);
    const row = Math.floor(index / COLUMNS);
    const col = index % COLUMNS;

    let tiles = [];

    if (col != 0) {
        tiles.push(GetTile(col - 1, row));
    }
    if (col != COLUMNS - 1) {
        tiles.push(GetTile(col + 1, row));
    }
    if (row != 0) {
        tiles.push(GetTile(col, row - 1));
    }
    if (row != ROWS - 1) {
        tiles.push(GetTile(col, row + 1));
    }

    return tiles;
}

function Step() {
    messages.innerHTML = "";

    const players = Array.from(document.querySelectorAll(".player"));
    for (const player of players) {
        const adjacentTiles = AdjacentTiles(player.parentElement);
        const availableTiles = adjacentTiles.filter(x => x.matches(":not(:has(.player))"));

        if (availableTiles.length == 0) {
            continue;
        }

        const pickedTile = availableTiles[Math.floor(Math.random() * availableTiles.length)];

        if (pickedTile.matches(":has(.hole)")) {
            AddMessage(`Player ${player.dataset.num} fell`);
            player.remove();
        }
        else {
            pickedTile.appendChild(player);
        }
    }
}

function AddMessage(text) {
    const p = document.createElement("p");
    p.innerText = text;
    messages.appendChild(p);
}

function ToggleAuto() {
    if (autoCheckbox.checked) {
        autoInterval = setInterval(() => {
            Step();
        }, Number(speedSlider.value));
    }
    else {
        clearInterval(autoInterval);
    }
}

MakeField();
stepButton.addEventListener("click", Step);
autoCheckbox.addEventListener("change", ToggleAuto);
speedSlider.addEventListener("input", () => speedLabel.innerText = speedSlider.value);