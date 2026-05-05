const POSITIONS = [
    { x: 200, y: 80 },   // 0
    { x: 285, y: 115 },  // 1
    { x: 320, y: 200 },  // 2
    { x: 285, y: 285 },  // 3
    { x: 200, y: 320 },  // 4
    { x: 115, y: 285 },  // 5
    { x: 80, y: 200 },   // 6
    { x: 115, y: 115 },  // 7
    { x: 200, y: 200 }   // 8 center
];

const ADJACENT = {
    0: [1, 7, 8],
    1: [0, 2, 8],
    2: [1, 3, 8],
    3: [2, 4, 8],
    4: [3, 5, 8],
    5: [4, 6, 8],
    6: [5, 7, 8],
    7: [6, 0, 8],
    8: [0,1,2,3,4,5,6,7]
};
const WINNING_COMBOS = [
    [0,1,2],[1,2,3],[2,3,4],[3,4,5],
    [4,5,6],[5,6,7],[6,7,0],[7,0,1],
    [0,8,4],[1,8,5],[2,8,6],[3,8,7]
];

let board = new Array(9).fill(null);
let currentPlayer = 1;
let phase = 'placement';
let piecesPlaced = {1:0, 2:0};
let selectedPiece = null;
let gameOver = false;
let moveHistory = [];

const svg = document.querySelector('svg');
const statusDiv = document.getElementById('status');

// ---------------- EVENT LISTENERS ----------------
document.querySelectorAll('.position').forEach(pos => {
    pos.addEventListener('click', function () {
        const position = parseInt(this.getAttribute('data-position'));
        handlePositionClick(position);
    });
});

// ---------------- ANIMATE MOVE ----------------
function animateMove(fromIndex, toIndex, player, callback) {
    const start = POSITIONS[fromIndex];
    const end = POSITIONS[toIndex];

    const piece = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
    piece.setAttribute('cx', start.x);
    piece.setAttribute('cy', start.y);
    piece.setAttribute('r', fromIndex === 8 ? 8 : 15);
    piece.setAttribute('fill', player === 1 ? '#1976d2' : '#c2185b');

    svg.appendChild(piece);

    const duration = 250;
    let startTime = null;

    function animate(time) {
        if (!startTime) startTime = time;

        const t = Math.min((time - startTime) / duration, 1);
        const ease = 1 - Math.pow(1 - t, 3);

        const x = start.x + (end.x - start.x) * ease;
        const y = start.y + (end.y - start.y) * ease;

        piece.setAttribute('cx', x);
        piece.setAttribute('cy', y);

        const baseR = fromIndex === 8 ? 8 : 15;
        piece.setAttribute('r', baseR + 3 * Math.sin(Math.PI * t));

        if (t < 1) {
            requestAnimationFrame(animate);
        } else {
            piece.remove();
            callback();
        }
    }

    requestAnimationFrame(animate);
}

// ---------------- WIN LINE ----------------
function animateWinLine(combo) {
    const start = POSITIONS[combo[0]];
    const end = POSITIONS[combo[2]];

    const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');

    line.setAttribute('x1', start.x);
    line.setAttribute('y1', start.y);
    line.setAttribute('x2', start.x);
    line.setAttribute('y2', start.y);

    line.setAttribute('stroke', '#00e676');
    line.setAttribute('stroke-width', combo.includes(8) ? '7' : '6');
    line.setAttribute('stroke-linecap', 'round');
    line.style.filter = 'drop-shadow(0 0 6px #00e676)';

    svg.appendChild(line);

    let startTime = null;
    const duration = 300;

    function animate(time) {
        if (!startTime) startTime = time;

        const t = Math.min((time - startTime) / duration, 1);
        const ease = 1 - Math.pow(1 - t, 3);

        const x = start.x + (end.x - start.x) * ease;
        const y = start.y + (end.y - start.y) * ease;

        line.setAttribute('x2', x);
        line.setAttribute('y2', y);

        if (t < 1) requestAnimationFrame(animate);
    }

    requestAnimationFrame(animate);
}

// ---------------- GAME LOGIC ----------------
function handlePositionClick(position) {
    if (gameOver) return;

    if (phase === 'placement') {
        if (board[position] === null) {
            saveState();

            board[position] = currentPlayer;
            piecesPlaced[currentPlayer]++;

            if (piecesPlaced[1] === 3 && piecesPlaced[2] === 3) {
                phase = 'movement';
            }

            const winCombo = checkWin();
            if (winCombo) {
                updateDisplay();

                gameOver = true;
                animateWinLine(winCombo);

                setTimeout(() => endGame(), 300);
                return;
            }

            currentPlayer = currentPlayer === 1 ? 2 : 1;
            updateDisplay();
        }
    }

    else {
        if (selectedPiece === null) {
            if (board[position] === currentPlayer) {
                selectedPiece = position;
                updateDisplay();
            }
        } else {
            if (position === selectedPiece) {
                selectedPiece = null;
                updateDisplay();
            }

            else if (ADJACENT[selectedPiece].includes(position) && board[position] === null) {
                const from = selectedPiece;
                const to = position;
                const player = currentPlayer;

                saveState();
                selectedPiece = null;
                gameOver = true;

                animateMove(from, to, player, () => {
                    // APPLY MOVE FIRST
                    board[to] = player;
                    board[from] = null;

                    const winCombo = checkWin();

                    if (winCombo) {
                        updateDisplay(); // 🔥 ensures piece shows

                        gameOver = true;
                        animateWinLine(winCombo);

                        setTimeout(() => endGame(), 300);
                        return;
                    }

                    currentPlayer = currentPlayer === 1 ? 2 : 1;
                    gameOver = false;

                    updateDisplay();
                });

                updateDisplay();
            }
        }
    }
}

// ---------------- WIN CHECK ----------------
function checkWin() {
    for (let combo of WINNING_COMBOS) {
        if (
            board[combo[0]] === currentPlayer &&
            board[combo[1]] === currentPlayer &&
            board[combo[2]] === currentPlayer
        ) {
            return combo;
        }
    }
    return null;
}

// ---------------- UI ----------------
function endGame() {
    statusDiv.textContent = `🎉 Player ${currentPlayer} Wins! 🎉`;
    statusDiv.classList.add('game-over');
}

function updateDisplay() {
    document.querySelectorAll('.piece').forEach(p => p.remove());

    POSITIONS.forEach((pos, i) => {
        if (board[i] !== null) {
            const g = document.createElementNS('http://www.w3.org/2000/svg', 'g');
            g.setAttribute('class', 'piece');

            const c = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
            c.setAttribute('cx', pos.x);
            c.setAttribute('cy', pos.y);

            const r = i === 8 ? 8 : 15;
            c.setAttribute('r', selectedPiece === i ? r + 7 : r);
            c.setAttribute('fill', board[i] === 1 ? '#1976d2' : '#c2185b');

            if (selectedPiece === i) {
                c.setAttribute('stroke', '#FFD700');
                c.setAttribute('stroke-width', '4');
            }

            g.appendChild(c);
            svg.appendChild(g);

            g.addEventListener('click', e => {
                e.stopPropagation();
                handlePositionClick(i);
            });
        }
    });

    if (!gameOver) {
        const name = currentPlayer === 1 ? 'Player 1 (Blue)' : 'Player 2 (Red)';
        const cls = currentPlayer === 1 ? 'player1' : 'player2';

        if (phase === 'placement') {
            statusDiv.textContent =
                `${name}: Place your piece (Remaining: P1=${3 - piecesPlaced[1]}, P2=${3 - piecesPlaced[2]})`;
        } else {
            statusDiv.textContent =
                `${name}: ${selectedPiece !== null ? 'Choose destination' : 'Select a piece to move'}`;
        }

        statusDiv.className = `status ${cls}`;
    }
}

// ---------------- STATE ----------------
function saveState() {
    moveHistory.push({
        board: [...board],
        currentPlayer,
        phase,
        piecesPlaced: {...piecesPlaced},
        selectedPiece
    });
}

function undoMove() {
    if (!moveHistory.length) return;

    const s = moveHistory.pop();
    board = s.board;
    currentPlayer = s.currentPlayer;
    phase = s.phase;
    piecesPlaced = s.piecesPlaced;
    selectedPiece = s.selectedPiece;
    gameOver = false;

    document.querySelectorAll('line').forEach(l => l.remove());

    updateDisplay();
}

function newGame() {
    board = new Array(9).fill(null);
    currentPlayer = 1;
    phase = 'placement';
    piecesPlaced = {1:0,2:0};
    selectedPiece = null;
    gameOver = false;
    moveHistory = [];

    document.querySelectorAll('line').forEach(l => l.remove());

    updateDisplay();
}

// ---------------- INIT ----------------
updateDisplay();
