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

let whitelists = {};
let blacklists = {};

let followedPlayer = null;

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

        whitelists[index] = [];
        blacklists[index] = [];

        player.addEventListener("click", () => PlayerClicked(player));

        const chosenIndex = Math.floor(Math.random() * tiles.length);
        tiles[chosenIndex].appendChild(player);
        whitelists[index].push(tiles[chosenIndex]);
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

function AlertNearby(tile) {
    const alertedTiles = AdjacentTiles(tile);
    for (const alertedTile of alertedTiles) {
        const player = alertedTile.querySelector(".player");
        if (player != null) {
            blacklists[Number(player.dataset.num)].push(tile);
            AddMessage(`${Number(player.dataset.num)} alerted`);
        }
    }
}

function ShareKnowledge(player) {
    const id = Number(player.dataset.num);
    const tile = player.parentElement;

    const adjTiles = AdjacentTiles(tile);
    for (const adjTile of adjTiles) {
        const otherPlayer = adjTile.querySelector(".player");
        if (otherPlayer != null) {
            const otherId = Number(otherPlayer.dataset.num);

            whitelists[otherId] = whitelists[id].concat(whitelists[otherId].filter(x => whitelists[id].indexOf(x) < 0));
            whitelists[id] = whitelists[otherId];

            blacklists[otherId] = blacklists[id].concat(blacklists[otherId].filter(x => blacklists[id].indexOf(x) < 0));
            blacklists[id] = blacklists[otherId];

            AddMessage(`${id} shared knowledge with ${otherId}`);
        }
    }
}

function Step() {
    messages.innerHTML = "";

    const players = Array.from(document.querySelectorAll(".player"));
    for (const player of players) {
        const id = Number(player.dataset.num);

        const adjacentTiles = AdjacentTiles(player.parentElement);
        const availableTiles = adjacentTiles.filter(x => x.matches(":not(:has(.player))"));

        if (availableTiles.length == 0) {
            continue;
        }

        const positiveTiles = availableTiles.filter(x => whitelists[id].includes(x));
        const neutralTiles = availableTiles.filter(x => !(blacklists[id].includes(x)) && !(whitelists[id].includes(x)));
        const negativeTiles = availableTiles.filter(x => blacklists[id].includes(x));

        const pickFrom = positiveTiles.length == 0 ? (neutralTiles.length == 0 ? negativeTiles : neutralTiles) : positiveTiles;

        const pickedTile = pickFrom[Math.floor(Math.random() * pickFrom.length)];

        if (pickedTile.matches(":has(.hole)")) {
            AddMessage(`Player ${player.dataset.num} fell`);
            AlertNearby(pickedTile);
            player.remove();
        }
        else {
            pickedTile.appendChild(player);
            if (!(whitelists[id].includes(pickedTile))) {
                whitelists[id].push(pickedTile);
            }
            ShareKnowledge(player);
        }
    }

    UpdateFollowVisualization();
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

function PlayerClicked(player) {
    RemoveFollowVisualization();

    if (followedPlayer == player) {
        followedPlayer = null
    }
    else {
        followedPlayer = player;
        UpdateFollowVisualization();
    }
}

function RemoveFollowVisualization() {
    document.querySelectorAll(".player.followed").forEach(element => {
        element.classList.remove("followed");
    });
    document.querySelectorAll(".tile.whitelist, .tile.blacklist").forEach(element => {
        element.classList.remove("whitelist", "blacklist");
    });
}

function UpdateFollowVisualization() {
    if (!document.contains(followedPlayer)) {
        RemoveFollowVisualization();
        return;
    }

    followedPlayer.classList.add("followed");
    const id = Number(followedPlayer.dataset.num);
    whitelists[id].forEach(element => {
        element.classList.add("whitelist");
    });
    blacklists[id].forEach(element => {
        element.classList.add("blacklist");
    });
}

MakeField();
stepButton.addEventListener("click", Step);
autoCheckbox.addEventListener("change", ToggleAuto);
speedSlider.addEventListener("input", () => speedLabel.innerText = speedSlider.value);