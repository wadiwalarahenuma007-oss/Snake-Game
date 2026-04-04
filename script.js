const board = document.querySelector('.board');
const startButton = document.querySelector('.btn-start');
const restartButton = document.querySelector('.btn-restart');
const modal = document.querySelector('.modal');
const startGameModal = document.querySelector('.start-game');
const gameOverModal = document.querySelector('.game-over');

const ScoreElement = document.querySelector('#Score');
const HighScoreElement = document.querySelector('#High-Score');
const TimeElement = document.querySelector('#Time');

let HighScore = parseInt(localStorage.getItem('HighScore')) || 0;
let Score = 0;
let Time = '00:00';
HighScoreElement.innerText = HighScore;

const blockSize = 50;

// -----------------------------
// CALCULATE ROWS AND COLS BASED ON BOARD SIZE
// -----------------------------
let rows = Math.floor(board.clientHeight / blockSize);
let cols = Math.floor(board.clientWidth / blockSize);

// -----------------------------
// INITIALIZE BLOCKS
// -----------------------------
const blocks = {};
board.innerHTML = '';
for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
        const block = document.createElement('div');
        block.classList.add('block');
        board.appendChild(block);
        blocks[`${r}-${c}`] = block;
    }
}

// -----------------------------
// SNAKE & FOOD
// -----------------------------
let snake = [{ x: 1, y: 3 }];
let direction = 'down';

function generateFood() {
    let newFood;
    do {
        newFood = {
            x: Math.floor(Math.random() * rows),
            y: Math.floor(Math.random() * cols)
        };
    } while (snake.some(s => s.x === newFood.x && s.y === newFood.y));
    return newFood;
}

let food = generateFood();
blocks[`${food.x}-${food.y}`].classList.add('food');

// -----------------------------
// CHANGE DIRECTION
// -----------------------------
function changeDirection(newDir) {
    if (direction === 'up' && newDir === 'down') return;
    if (direction === 'down' && newDir === 'up') return;
    if (direction === 'left' && newDir === 'right') return;
    if (direction === 'right' && newDir === 'left') return;
    direction = newDir;
}

// -----------------------------
// RENDER FUNCTION
// -----------------------------
function render() {
    let head;
    if (direction === 'up') head = { x: snake[0].x - 1, y: snake[0].y };
    if (direction === 'down') head = { x: snake[0].x + 1, y: snake[0].y };
    if (direction === 'left') head = { x: snake[0].x, y: snake[0].y - 1 };
    if (direction === 'right') head = { x: snake[0].x, y: snake[0].y + 1 };

    // WALL OR SELF COLLISION
    if (
        head.x < 0 || head.x >= rows ||
        head.y < 0 || head.y >= cols ||
        snake.some(s => s.x === head.x && s.y === head.y)
    ) {
        clearInterval(interval);
        clearInterval(timerInterval);
        modal.style.display = 'flex';
        startGameModal.style.display = 'none';
        gameOverModal.style.display = 'flex';
        return;
    }

    // REMOVE OLD SNAKE
    snake.forEach(b => blocks[`${b.x}-${b.y}`].classList.remove('fill'));

    // FOOD LOGIC
    if (head.x === food.x && head.y === food.y) {
        snake.unshift(head);
        Score += 10;
        ScoreElement.innerText = Score;

        if (Score > HighScore) {
            HighScore = Score;
            localStorage.setItem('HighScore', HighScore);
            HighScoreElement.innerText = HighScore;
        }

        food = generateFood();
    } else {
        snake.unshift(head);
        snake.pop();
    }

    // DRAW SNAKE
    snake.forEach(b => blocks[`${b.x}-${b.y}`].classList.add('fill'));
    // DRAW FOOD
    blocks[`${food.x}-${food.y}`].classList.add('food');
}

// -----------------------------
// START & RESTART
// -----------------------------
let interval = null;
let timerInterval = null;

function startGame() {
    modal.style.display = 'none';
    startGameModal.style.display = 'none';
    gameOverModal.style.display = 'none';

    clearInterval(interval);
    clearInterval(timerInterval);

    interval = setInterval(render, 300);

    timerInterval = setInterval(() => {
        let [m, s] = Time.split(':').map(Number);
        s++;
        if (s === 60) { s = 0; m++; }
        Time = `${String(m).padStart(2,'0')}:${String(s).padStart(2,'0')}`;
        TimeElement.innerText = Time;
    }, 1000);
}

function restartGame() {
    clearInterval(interval);
    clearInterval(timerInterval);

    // REMOVE SNAKE & FOOD FROM BOARD
    snake.forEach(b => blocks[`${b.x}-${b.y}`].classList.remove('fill'));
    blocks[`${food.x}-${food.y}`].classList.remove('food');

    Score = 0;
    Time = '00:00';
    ScoreElement.innerText = Score;
    TimeElement.innerText = Time;
    HighScoreElement.innerText = HighScore;

    snake = [{ x: 1, y: 3 }];
    direction = 'down';
    food = generateFood();

    startGame();
}

// -----------------------------
// EVENT LISTENERS
// -----------------------------
startButton.addEventListener('click', startGame);
restartButton.addEventListener('click', restartGame);

addEventListener('keydown', e => {
    if (e.key === 'ArrowUp') changeDirection('up');
    if (e.key === 'ArrowDown') changeDirection('down');
    if (e.key === 'ArrowLeft') changeDirection('left');
    if (e.key === 'ArrowRight') changeDirection('right');
});

// MOBILE BUTTONS
window.changeDirection = changeDirection;