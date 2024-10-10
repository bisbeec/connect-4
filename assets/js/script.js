const ROWS = 6;
const COLS = 7;
const PLAYER = 1; // Human player
const COMPUTER = 2; // Computer player
let currentPlayer = PLAYER; // Player starts first
let board = [];
let gameOver = false;
let winningCells = []; // To store the cells that form the winning sequence

// Initialize the game board
function initBoard() {
    board = [];
    for (let r = 0; r < ROWS; r++) {
        board.push(new Array(COLS).fill(0));
    }
    winningCells = [];
}

// Create the HTML grid
function createGrid() {
    const boardDiv = document.getElementById('board');
    boardDiv.innerHTML = ''; // Clear previous grid if any
    for (let r = 0; r < ROWS; r++) {
        for (let c = 0; c < COLS; c++) {
            const cell = document.createElement('div');
            cell.classList.add('cell');
            cell.dataset.row = r;
            cell.dataset.col = c;
            cell.addEventListener('click', handleCellClick);
            boardDiv.appendChild(cell);
        }
    }
}

// Update the visual cell
function updateCell(row, col) {
    const index = row * COLS + col;
    const cell = document.querySelectorAll('.cell')[index];
    cell.classList.add(`player${board[row][col]}`);
}

// Handle cell click
function handleCellClick(e) {
    if (gameOver || currentPlayer !== PLAYER) return;

    const col = parseInt(e.currentTarget.dataset.col);
    if (dropDisc(col, PLAYER)) {
        const lastRow = getLastRow(col);
        animateDisc(col, lastRow, PLAYER);
    }
}

// Computer makes a move
function computerMove() {
    console.log("Computer's turn to move");
    if (gameOver) {
        console.log("Game is over. Computer cannot move.");
        return;
    }

    const availableCols = getAvailableColumns();
    console.log("Available columns:", availableCols);
    if (availableCols.length === 0) {
        console.log("No available columns. Computer cannot move.");
        return;
    }

    // 1. Check if computer can win in the next move
    for (let col of availableCols) {
        if (canWin(col, COMPUTER)) {
            console.log(`Computer can win by placing in column ${col}`);
            if (dropDisc(col, COMPUTER)) {
                const lastRow = getLastRow(col);
                animateDisc(col, lastRow, COMPUTER);
                return;
            }
        }
    }

    // 2. Block player's winning move
    for (let col of availableCols) {
        if (canWin(col, PLAYER)) {
            console.log(`Computer is blocking player's win by placing in column ${col}`);
            if (dropDisc(col, COMPUTER)) {
                const lastRow = getLastRow(col);
                animateDisc(col, lastRow, COMPUTER);
                return;
            }
        }
    }

    // 3. Choose a random available column
    const randomIndex = Math.floor(Math.random() * availableCols.length);
    const col = availableCols[randomIndex];
    console.log(`Computer is placing in random column ${col}`);

    if (dropDisc(col, COMPUTER)) {
        const lastRow = getLastRow(col);
        animateDisc(col, lastRow, COMPUTER);
    }
}

// Check if dropping a disc in the given column by the player would result in a win
function canWin(col, player) {
    // Clone the board
    let tempBoard = board.map(row => row.slice());

    // Simulate dropping the disc
    for (let r = ROWS - 1; r >= 0; r--) {
        if (tempBoard[r][col] === 0) {
            tempBoard[r][col] = player;
            return checkWinSimulated(tempBoard, r, col, player);
        }
    }
    return false; // Column is full
}

// Simulate win check on a hypothetical board
function checkWinSimulated(boardState, row, col, player) {
    // Directions: horizontal, vertical, diagonal /, diagonal \
    const directions = [
        { dr: 0, dc: 1 }, // Horizontal
        { dr: 1, dc: 0 }, // Vertical
        { dr: 1, dc: 1 }, // Diagonal /
        { dr: 1, dc: -1 } // Diagonal \
    ];

    for (let { dr, dc } of directions) {
        let count = 1;

        // Check in the positive direction
        let r = row + dr;
        let c = col + dc;
        while (r >= 0 && r < ROWS && c >= 0 && c < COLS && boardState[r][c] === player) {
            count++;
            r += dr;
            c += dc;
        }

        // Check in the negative direction
        r = row - dr;
        c = col - dc;
        while (r >= 0 && r < ROWS && c >= 0 && c < COLS && boardState[r][c] === player) {
            count++;
            r -= dr;
            c -= dc;
        }

        if (count >= 4) {
            return true;
        }
    }

    return false;
}

// Get list of available columns
function getAvailableColumns() {
    const available = [];
    for (let c = 0; c < COLS; c++) {
        if (board[0][c] === 0) {
            available.push(c);
        }
    }
    return available;
}

// Drop a disc into the board
function dropDisc(col, player) {
    for (let r = ROWS - 1; r >= 0; r--) {
        if (board[r][col] === 0) {
            board[r][col] = player;
            return true;
        }
    }
    return false; // Column is full
}

// Get the last row where a disc was placed in a column
function getLastRow(col) {
    for (let r = 0; r < ROWS; r++) {
        if (board[r][col] !== 0) {
            return r;
        }
    }
    return -1;
}

// Animate the disc dropping
function animateDisc(col, row, player) {
    console.log(`Animating disc for ${player === PLAYER ? 'Player' : 'Computer'} in column ${col}, row ${row}`);
    const animatedDisc = document.getElementById('animated-disc');
    const boardDiv = document.getElementById('board');
    const cellHeight = 60; // Height of each cell in pixels
    const gap = 10; // Gap between cells

    // Calculate the left position based on the column
    const left = col * (60 + gap) + gap; // 60px cell width + 5px gap
    animatedDisc.style.left = `${left}px`;
    animatedDisc.style.backgroundColor = player === PLAYER ? '#fe6687' : '#ffcc69';
    animatedDisc.style.display = 'block';
    animatedDisc.style.transition = 'top 0.5s ease-in';
    animatedDisc.style.top = '-30px'; // Reset to top before animation

    // Force reflow to ensure the transition applies
    void animatedDisc.offsetWidth;

    // Calculate the final top position based on the row
    const finalTop = (row * (60 + gap)) + gap; // row index * (cell height + gap)

    // Start the animation
    animatedDisc.style.top = `${finalTop}px`;

    // Listen for the end of the animation
    animatedDisc.addEventListener('transitionend', function handleAnimationEnd(e) {
        if (e.propertyName !== 'top') return; // Ensure it's the 'top' property

        animatedDisc.removeEventListener('transitionend', handleAnimationEnd);
        // Place the disc in the board visually
        updateCell(row, col);
        // Hide the animated disc
        animatedDisc.style.display = 'none';

        const statusBox = document.getElementById("status");

        // Check for win or draw
        if (checkWin(row, col, player)) {
            updateStatus(player === PLAYER ? 'You win!' : 'Computer wins!');
            highlightWinningDiscs();
            gameOver = true;
            removeClickListeners();
            statusBox.classList.add("status-win");
            return;
        } else if (isDraw()) {
            updateStatus("It's a draw!");
            gameOver = true;
            statusBox.classList.remove("status-win");
            return;
        }

        // Switch turns

        if (player === PLAYER) {
            currentPlayer = COMPUTER;
            updateStatus("Computer's Turn");
            setTimeout(computerMove, 1500); // Delay for better UX
            statusBox.classList.add("comp-turn");

        } else {
            currentPlayer = PLAYER;
            updateStatus("Your Turn");
            statusBox.classList.remove("comp-turn");
        }
    });
}

// Check for a win condition
function checkWin(row, col, player) {
    // Directions: horizontal, vertical, diagonal /
    // and diagonal \
    const directions = [
        { dr: 0, dc: 1 }, // Horizontal
        { dr: 1, dc: 0 }, // Vertical
        { dr: 1, dc: 1 }, // Diagonal /
        { dr: 1, dc: -1 } // Diagonal \
    ];

    for (let { dr, dc } of directions) {
        let count = 1;
        let cells = [{ row, col }];

        // Check in the positive direction
        let r = row + dr;
        let c = col + dc;
        while (r >= 0 && r < ROWS && c >= 0 && c < COLS && board[r][c] === player) {
            count++;
            cells.push({ row: r, col: c });
            r += dr;
            c += dc;
        }

        // Check in the negative direction
        r = row - dr;
        c = col - dc;
        while (r >= 0 && r < ROWS && c >= 0 && c < COLS && board[r][c] === player) {
            count++;
            cells.push({ row: r, col: c });
            r -= dr;
            c -= dc;
        }

        if (count >= 4) {
            winningCells = cells.slice(0, 4); // Store the first four for highlighting
            return true;
        }
    }

    return false;
}

// Highlight the winning discs
function highlightWinningDiscs() {
    winningCells.forEach(cell => {
        const index = cell.row * COLS + cell.col;
        const cellDiv = document.querySelectorAll('.cell')[index];
        cellDiv.classList.add('highlight');
    });
}

// Check for a draw
function isDraw() {
    return board[0].every(cell => cell !== 0);
}

// Remove all click listeners after game ends
function removeClickListeners() {
    const cells = document.querySelectorAll('.cell');
    cells.forEach(cell => {
        cell.removeEventListener('click', handleCellClick);
    });
}

// Update the game status message
function updateStatus(message) {
    document.getElementById('status-message').innerText = message;
}

// Reset the game
function resetGame() {
    initBoard();
    createGrid();
    currentPlayer = PLAYER;
    gameOver = false;
    document.getElementById("status").classList.remove("comp-turn");
    document.getElementById("status").classList.remove("status-win");
    updateStatus('Your Turn');
    const cells = document.querySelectorAll('.cell');
    cells.forEach(cell => {
        cell.classList.remove('player1', 'player2', 'highlight');
        cell.addEventListener('click', handleCellClick);
    });
    // Reset animated disc
    const animatedDisc = document.getElementById('animated-disc');
    animatedDisc.style.display = 'none';
    animatedDisc.style.transition = 'none';
    animatedDisc.style.top = '-30px';
}

// Initialize the game on page load
window.onload = () => {
    resetGame();
    document.getElementById('reset').addEventListener('click', resetGame);
};
