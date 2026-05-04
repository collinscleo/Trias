const POSITIONS = [
    { x: 200, y: 80 },
    { x: 303, y: 104 },
    { x: 303, y: 296 },
    { x: 200, y: 320 },
    { x: 97, y: 296 },
    { x: 97, y: 104 },
    { x: 200, y: 200 }
];

const ADJACENT = {
    0: [1,5,6],
    1: [0,2,6],
    2: [1,3,6],
    3: [2,4,6],
    4: [3,5,6],
    5: [4,0,6],
    6: [0,1,2,3,4,5]
};

const WINNING_COMBOS = [
    [0,1,2],[1,2,3],[2,3,4],
    [3,4,5],[4,5,0],[5,0,1],
    [0,6,3],[1,6,4],[2,6,5]
];

let board = Array(7).fill(null);
let currentPlayer = 1; // 1 = human, 2 = bot
let phase = "placement";
let selected = null;
let placed = {1:0, 2:0};
let gameOver = false;

const svg = document.querySelector("svg");
const status = document.getElementById("status");

// random who goes first
let aiFirst = Math.random() < 0.5;

if (aiFirst) {
    currentPlayer = 2;
    setTimeout(botMove, 500);
}

document.querySelectorAll(".position").forEach(p => {
    p.addEventListener("click", () => {
        if (gameOver || currentPlayer !== 1) return;
        handleClick(+p.dataset.position);
    });
});

function handleClick(i) {
    if (phase === "placement") {
        if (board[i] === null) {
            board[i] = 1;
            placed[1]++;

            if (checkWin(1)) return endGame(1);

            if (placed[1] === 3 && placed[2] === 3) {
                phase = "movement";
            }

            currentPlayer = 2;
            update();
            setTimeout(botMove, 400);
        }
    } else {
        if (selected === null) {
            if (board[i] === 1) selected = i;
        } else {
            if (ADJACENT[selected].includes(i) && board[i] === null) {
                board[i] = 1;
                board[selected] = null;
                selected = null;

                if (checkWin(1)) return endGame(1);

                currentPlayer = 2;
                update();
                setTimeout(botMove, 400);
            } else {
                selected = null;
            }
        }
    }

    update();
}

// ---------------- BOT ----------------
function botMove() {
    if (gameOver) return;

    let move;

    if (phase === "placement") {
        move = getBestPlacement();
        board[move] = 2;
        placed[2]++;

    } else {
        move = getBestMove();
        board[move.from] = null;
        board[move.to] = 2;
    }

    if (checkWin(2)) return endGame(2);

    currentPlayer = 1;
    update();
}

// simple AI
function getBestPlacement() {
    let empty = board.map((v,i)=>v===null?i:null).filter(v=>v!==null);
    return empty[Math.floor(Math.random()*empty.length)];
}

function getBestMove() {
    let moves = [];

    for (let i=0;i<7;i++) {
        if (board[i] === 2) {
            for (let j of ADJACENT[i]) {
                if (board[j] === null) {
                    moves.push({from:i,to:j});
                }
            }
        }
    }

    return moves[Math.floor(Math.random()*moves.length)];
}

// ---------------- WIN ----------------
function checkWin(p) {
    return WINNING_COMBOS.some(c =>
        board[c[0]]===p && board[c[1]]===p && board[c[2]]===p
    );
}

function endGame(p) {
    gameOver = true;
    status.textContent = (p===1?"You win!":"Bot wins!");
}

// ---------------- UI ----------------
function update() {
    status.textContent =
        currentPlayer === 1 ? "Your turn" : "Bot thinking...";

    document.querySelectorAll(".piece").forEach(p=>p.remove());

    board.forEach((v,i)=>{
        if (v !== null) {
            let c = document.createElementNS("http://www.w3.org/2000/svg","circle");
            c.setAttribute("cx", POSITIONS[i].x);
            c.setAttribute("cy", POSITIONS[i].y);
            c.setAttribute("r", i===6?8:15);
            c.setAttribute("fill", v===1?"#1976d2":"#c2185b");
            c.classList.add("piece");
            svg.appendChild(c);
        }
    });
}

function newGame() {
    location.reload();
}

function undoMove() {
    alert("Undo not implemented yet in AI mode");
}

update();