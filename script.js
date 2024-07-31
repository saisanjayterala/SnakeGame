const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const scoreElement = document.getElementById('scoreValue');
const highScoreElement = document.getElementById('highScoreValue');
const levelElement = document.getElementById('levelValue');
const startScreen = document.getElementById('start-screen');
const gameOverScreen = document.getElementById('game-over-screen');
const pauseScreen = document.getElementById('pause-screen');
const finalScoreElement = document.getElementById('final-score');
const startButton = document.getElementById('start-button');
const restartButton = document.getElementById('restart-button');
const resumeButton = document.getElementById('resume-button');
const difficultySelect = document.getElementById('difficulty');

const gridSize = 20;
const tileCount = canvas.width / gridSize;

let snake = [{ x: 10, y: 10 }];
let food = { x: 15, y: 15 };
let obstacles = [];
let dx = 0;
let dy = 0;
let score = 0;
let highScore = 0;
let level = 1;
let gameSpeed = 100;
let gameLoop;
let isPaused = false;

const difficulties = {
    easy: { initialSpeed: 120, speedIncrease: 1, obstaclesPerLevel: 1 },
    medium: { initialSpeed: 100, speedIncrease: 2, obstaclesPerLevel: 2 },
    hard: { initialSpeed: 80, speedIncrease: 3, obstaclesPerLevel: 3 }
};

function drawGame() {
    clearCanvas();
    moveSnake();
    drawSnake();
    drawFood();
    drawObstacles();
    checkCollision();
    updateScore();
    updateLevel();
}

function clearCanvas() {
    ctx.fillStyle = 'white';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
}

function moveSnake() {
    const head = { x: snake[0].x + dx, y: snake[0].y + dy };
    snake.unshift(head);

    if (head.x === food.x && head.y === food.y) {
        score++;
        generateFood();
        increaseSpeed();
        if (score % 5 === 0) {
            levelUp();
        }
    } else {
        snake.pop();
    }
}

function drawSnake() {
    snake.forEach((segment, index) => {
        const hue = (index * 10) % 360;
        ctx.fillStyle = `hsl(${hue}, 100%, 50%)`;
        ctx.fillRect(segment.x * gridSize, segment.y * gridSize, gridSize - 2, gridSize - 2);
    });
}

function drawFood() {
    ctx.fillStyle = 'red';
    ctx.beginPath();
    ctx.arc((food.x * gridSize) + (gridSize / 2), (food.y * gridSize) + (gridSize / 2), gridSize / 2 - 2, 0, 2 * Math.PI);
    ctx.fill();
}

function drawObstacles() {
    ctx.fillStyle = 'gray';
    obstacles.forEach(obstacle => {
        ctx.fillRect(obstacle.x * gridSize, obstacle.y * gridSize, gridSize - 2, gridSize - 2);
    });
}

function generateFood() {
    do {
        food.x = Math.floor(Math.random() * tileCount);
        food.y = Math.floor(Math.random() * tileCount);
    } while (isColliding(food) || isOnObstacle(food));
}

function isColliding(position) {
    return snake.some(segment => segment.x === position.x && segment.y === position.y);
}

function isOnObstacle(position) {
    return obstacles.some(obstacle => obstacle.x === position.x && obstacle.y === position.y);
}

function checkCollision() {
    const head = snake[0];
    if (head.x < 0 || head.x >= tileCount || head.y < 0 || head.y >= tileCount) {
        gameOver();
    }

    for (let i = 1; i < snake.length; i++) {
        if (head.x === snake[i].x && head.y === snake[i].y) {
            gameOver();
        }
    }

    if (isOnObstacle(head)) {
        gameOver();
    }
}

function gameOver() {
    clearInterval(gameLoop);
    updateHighScore();
    finalScoreElement.textContent = score;
    gameOverScreen.classList.remove('hidden');
}

function resetGame() {
    snake = [{ x: 10, y: 10 }];
    food = { x: 15, y: 15 };
    obstacles = [];
    dx = 0;
    dy = 0;
    score = 0;
    level = 1;
    updateScore();
    updateLevel();
    setInitialSpeed();
}

function updateScore() {
    scoreElement.textContent = score;
}

function updateLevel() {
    levelElement.textContent = level;
}

function updateHighScore() {
    if (score > highScore) {
        highScore = score;
        highScoreElement.textContent = highScore;
        saveHighScore();
    }
}

function changeDirection(e) {
    if (isPaused) return;

    const LEFT_KEY = 37;
    const RIGHT_KEY = 39;
    const UP_KEY = 38;
    const DOWN_KEY = 40;

    const newDx = e.keyCode === LEFT_KEY ? -1 : e.keyCode === RIGHT_KEY ? 1 : dx;
    const newDy = e.keyCode === UP_KEY ? -1 : e.keyCode === DOWN_KEY ? 1 : dy;

    if ((newDx !== -dx || newDy !== -dy) && (newDx !== dx || newDy !== dy)) {
        dx = newDx;
        dy = newDy;
    }
}

function increaseSpeed() {
    const difficulty = difficulties[difficultySelect.value];
    if (gameSpeed > 50) {
        gameSpeed -= difficulty.speedIncrease;
        clearInterval(gameLoop);
        gameLoop = setInterval(drawGame, gameSpeed);
    }
}

function levelUp() {
    level++;
    updateLevel();
    addObstacles();
}

function addObstacles() {
    const difficulty = difficulties[difficultySelect.value];
    for (let i = 0; i < difficulty.obstaclesPerLevel; i++) {
        let obstacle;
        do {
            obstacle = {
                x: Math.floor(Math.random() * tileCount),
                y: Math.floor(Math.random() * tileCount)
            };
        } while (isColliding(obstacle) || isOnObstacle(obstacle) || (obstacle.x === food.x && obstacle.y === food.y));
        obstacles.push(obstacle);
    }
}

function startGame() {
    resetGame();
    startScreen.classList.add('hidden');
    gameOverScreen.classList.add('hidden');
    pauseScreen.classList.add('hidden');
    setInitialSpeed();
    generateFood();
    gameLoop = setInterval(drawGame, gameSpeed);
}

function pauseGame() {
    if (!isPaused) {
        clearInterval(gameLoop);
        pauseScreen.classList.remove('hidden');
        isPaused = true;
    }
}

function resumeGame() {
    if (isPaused) {
        pauseScreen.classList.add('hidden');
        gameLoop = setInterval(drawGame, gameSpeed);
        isPaused = false;
    }
}

function setInitialSpeed() {
    const difficulty = difficulties[difficultySelect.value];
    gameSpeed = difficulty.initialSpeed;
}

function saveHighScore() {
    localStorage.setItem('snakeHighScore', highScore);
}

// Event listeners
document.addEventListener('keydown', (e) => {
    if (e.keyCode === 80) { // 'P' key
        if (isPaused) {
            resumeGame();
        } else {
            pauseGame();
        }
    } else {
        changeDirection(e);
    }
});

startButton.addEventListener('click', startGame);
restartButton.addEventListener('click', startGame);
resumeButton.addEventListener('click', resumeGame);

// Initialize high score from localStorage
highScore = localStorage.getItem('snakeHighScore') || 0;
highScoreElement.textContent = highScore;

// Show start screen initially
startScreen.classList.remove('hidden');