const board = document.querySelector('.board');
const startButton = document.querySelector('.btn-start');
const modal = document.querySelector('.modal');
const startGameModal = document.querySelector('.start-game');
const restartButton = document.querySelector('.btn-restart');
const gameOverModal = document.querySelector('.game-over');

const HighScoreElement = document.querySelector('#High-Score');
const ScoreElement = document.querySelector('#Score');
const TimeElement = document.querySelector('#Time');

/* ✅ GRID */
const rows = 20;
const cols = 20;

let HighScore = localStorage.getItem('HighScore') || 0;
let Score = 0;
let Time = `00:00`;

HighScoreElement.innerText = HighScore;

let interval = null;
let TimerInterval = null;

const blocks = [];

let snake = [{ x: 1, y: 3 }];
let direction = 'down';

/* 🔥 SAFE FOOD (never on snake) */
function generateFood() {
    let newFood;
    do {
        newFood = {
            x: Math.floor(Math.random() * rows),
            y: Math.floor(Math.random() * cols)
        };
    } while (snake.some(block => block.x === newFood.x && block.y === newFood.y));
    return newFood;
}

let food = generateFood();

/* ================= DIRECTION ================= */
function changeDirection(newDirection) {
    if (direction === 'up' && newDirection === 'down') return;
    if (direction === 'down' && newDirection === 'up') return;
    if (direction === 'left' && newDirection === 'right') return;
    if (direction === 'right' && newDirection === 'left') return;

    direction = newDirection;
}

/* ================= CREATE GRID ================= */
for (let row = 0; row < rows; row++) {
    for (let col = 0; col < cols; col++) {
        const block = document.createElement('div');
        block.classList.add('block');
        board.appendChild(block);
        blocks[`${row} - ${col}`] = block;
    }
}

let currentFoodBlock = null;

/* ================= RENDER ================= */
function render() {
    let head = null;

    /* FOOD RENDER */
    if (currentFoodBlock) {
        currentFoodBlock.classList.remove('food');
    }

    currentFoodBlock = blocks[`${food.x} - ${food.y}`];
    currentFoodBlock.classList.add('food');

    /* MOVEMENT */
    if (direction === 'left') {
        head = { x: snake[0].x, y: snake[0].y - 1 };
    } else if (direction === 'right') {
        head = { x: snake[0].x, y: snake[0].y + 1 };
    } else if (direction === 'down') {
        head = { x: snake[0].x + 1, y: snake[0].y };
    } else if (direction === 'up') {
        head = { x: snake[0].x - 1, y: snake[0].y };
    }

    /* WALL COLLISION */
    if (head.x < 0 || head.x >= rows || head.y < 0 || head.y >= cols) {
        gameOver();
        return;
    }

    /* ✅ FIXED SELF COLLISION */
    if (snake.slice(1).some(block => block.x === head.x && block.y === head.y)) {
        gameOver();
        return;
    }

    /* CLEAR SNAKE */
    snake.forEach(block => {
        blocks[`${block.x} - ${block.y}`].classList.remove('fill');
    });

    /* FOOD LOGIC */
    if (head.x === food.x && head.y === food.y) {
        snake.unshift(head);

        Score += 10;
        ScoreElement.innerText = Score;

        if (Score > HighScore) {
            HighScore = Score;
            localStorage.setItem('HighScore', HighScore.toString());
            HighScoreElement.innerText = HighScore;
        }

        /* 🔥 SPEED INCREASE */
        if (Score % 50 === 0) {
            clearInterval(interval);
            interval = setInterval(render, Math.max(80, 250 - Score));
        }

        food = generateFood();

    } else {
        snake.unshift(head);
        snake.pop();
    }

    /* DRAW SNAKE */
    snake.forEach(block => {
        blocks[`${block.x} - ${block.y}`].classList.add('fill');
    });
}

/* ================= GAME OVER ================= */
function gameOver() {
    clearInterval(interval);
    clearInterval(TimerInterval);

    modal.style.display = 'flex';
    startGameModal.style.display = 'none';
    gameOverModal.style.display = 'flex';
}

/* ================= START ================= */
startButton.addEventListener('click', () => {
    modal.style.display = 'none';
    startGameModal.style.display = "none";
    gameOverModal.style.display = "none";

    clearInterval(interval);
    clearInterval(TimerInterval);

    interval = setInterval(render, 250);

    TimerInterval = setInterval(() => {
        let [Minutes, Seconds] = Time.split(':').map(Number);

        if (Seconds === 59) {
            Seconds = 0;
            Minutes++;
        } else {
            Seconds++;
        }

        Time = `${String(Minutes).padStart(2, '0')}:${String(Seconds).padStart(2, '0')}`;
        TimeElement.innerText = Time;
    }, 1000);
});

/* ================= RESTART ================= */
restartButton.addEventListener('click', restartGame);

function restartGame() {
    clearInterval(interval);
    clearInterval(TimerInterval);

    if (currentFoodBlock) {
        currentFoodBlock.classList.remove('food');
    }

    snake.forEach(block => {
        blocks[`${block.x} - ${block.y}`].classList.remove('fill');
    });

    Score = 0;
    ScoreElement.innerText = Score;

    Time = `00:00`;
    TimeElement.innerText = Time;

    direction = 'down';
    snake = [{ x: 1, y: 3 }];

    food = generateFood();

    modal.style.display = 'none';
    gameOverModal.style.display = 'none';

    interval = setInterval(render, 250);

    TimerInterval = setInterval(() => {
        let [Minutes, Seconds] = Time.split(':').map(Number);

        if (Seconds === 59) {
            Seconds = 0;
            Minutes++;
        } else {
            Seconds++;
        }

        Time = `${String(Minutes).padStart(2, '0')}:${String(Seconds).padStart(2, '0')}`;
        TimeElement.innerText = Time;
    }, 1000);
}

/* ================= KEYBOARD ================= */
addEventListener('keydown', (e) => {
    if (e.key === 'ArrowUp') changeDirection('up');
    else if (e.key === 'ArrowDown') changeDirection('down');
    else if (e.key === 'ArrowLeft') changeDirection('left');
    else if (e.key === 'ArrowRight') changeDirection('right');
});