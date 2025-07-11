const authDiv = document.getElementById('auth');
const lobbyDiv = document.getElementById('lobby');
const gameDiv = document.getElementById('game');
const questionModal = document.getElementById('questionModal');
const shopDiv = document.getElementById('shop');
const leaderboardDiv = document.getElementById('leaderboard');

const createBtn = document.getElementById('createBtn');
const joinBtn = document.getElementById('joinBtn');
const startGameBtn = document.getElementById('startGameBtn');

const openShopBtn = document.getElementById('openShopBtn');
const closeShopBtn = document.getElementById('closeShopBtn');

const showLeaderboardBtn = document.getElementById('showLeaderboardBtn');
const closeLeaderboardBtn = document.getElementById('closeLeaderboardBtn');

const submitAnswerBtn = document.getElementById('submitAnswerBtn');
const skipQuestionBtn = document.getElementById('skipQuestionBtn');

const playerListUl = document.getElementById('playerList');
const leaderboardList = document.getElementById('leaderboardList');
const shopItemsUl = document.getElementById('shopItems');

const gameCodeDisplay = document.getElementById('gameCodeDisplay');

const playerNameStat = document.getElementById('playerNameStat');
const energyStat = document.getElementById('energyStat');
const cashStat = document.getElementById('cashStat');
const xpStat = document.getElementById('xpStat');
const timerStat = document.getElementById('timerStat');

const questionText = document.getElementById('questionText');
const answerInput = document.getElementById('answerInput');
const feedback = document.getElementById('feedback');

const nameInput = document.getElementById('nameInput');
const joinCodeInput = document.getElementById('joinCodeInput');

const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

const TILE_SIZE = 30;
const MAP_WIDTH = 20;
const MAP_HEIGHT = 15;

let gameInterval;
let questionTimeout;
let gameTimerInterval;

let gameCode = '';
let playerName = '';
let players = [];
let currentPlayer = null;

let energy = 100;
let cash = 0;
let xp = 0;
let level = 1;

let timer = 300;

let questionActive = false;
let currentQuestion = null;

let keysPressed = {};

function randomCode() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

function generateQuestion() {
  const operations = ['+', '-', '×', '÷'];
  const op = operations[Math.floor(Math.random() * operations.length)];
  let a, b, answer;
  switch(op) {
    case '+':
      a = Math.floor(Math.random() * 50) + 1;
      b = Math.floor(Math.random() * 50) + 1;
      answer = a + b; break;
    case '-':
      a = Math.floor(Math.random() * 50) + 20;
      b = Math.floor(Math.random() * 20) + 1;
      answer = a - b; break;
    case '×':
      a = Math.floor(Math.random() * 12) + 1;
      b = Math.floor(Math.random() * 12) + 1;
      answer = a * b; break;
    case '÷':
      b = Math.floor(Math.random() * 12) + 1;
      answer = Math.floor(Math.random() * 12) + 1;
      a = b * answer;
      break;
  }
  return { question: `${a} ${op} ${b}`, answer };
}

function initGame() {
  players = [{
    id: '1',
    name: playerName,
    color: '#00c6ff',
    x: Math.floor(MAP_WIDTH/2),
    y: Math.floor(MAP_HEIGHT/2),
    energy,
    cash,
    xp,
    level,
  }];
  currentPlayer = players[0];
  updateStats();
  drawMap();
  timer = 300;
  timerStat.textContent = timer;
  gameTimerInterval = setInterval(() => {
    timer--;
    timerStat.textContent = timer;
    if (timer <= 0) {
      clearInterval(gameTimerInterval);
      alert('Game Over! Final score: ' + cash + ' cash, XP: ' + xp);
      location.reload();
    }
  }, 1000);
  gameInterval = setInterval(() => {
    if (energy > 0 && !questionActive) {
      energy--;
      updateStats();
    }
  }, 300);
  function questionCycle() {
    if (!questionActive && energy > 0) {
      currentQuestion = generateQuestion();
      showQuestion(currentQuestion);
    }
    questionTimeout = setTimeout(questionCycle, 10000 + Math.random() * 10000);
  }
  questionCycle();
}

function updateStats() {
  energyStat.textContent = energy;
  cashStat.textContent = cash;
  xpStat.textContent = xp;
  playerNameStat.textContent = playerName + ' (Level ' + level + ')';
}

function drawMap() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.strokeStyle = '#0ff';
  for(let x=0;x<=MAP_WIDTH;x++) {
    ctx.beginPath();
    ctx.moveTo(x*TILE_SIZE, 0);
    ctx.lineTo(x*TILE_SIZE, MAP_HEIGHT*TILE_SIZE);
    ctx.stroke();
  }
  for(let y=0;y<=MAP_HEIGHT;y++) {
    ctx.beginPath();
    ctx.moveTo(0, y*TILE_SIZE);
    ctx.lineTo(MAP_WIDTH*TILE_SIZE, y*TILE_SIZE);
    ctx.stroke();
  }
  ctx.fillStyle = currentPlayer.color;
  ctx.fillRect(currentPlayer.x * TILE_SIZE, currentPlayer.y * TILE_SIZE, TILE_SIZE, TILE_SIZE);
}

function movePlayer(dx, dy) {
  if (energy <= 0 || questionActive) return;
  const nx = currentPlayer.x + dx;
  const ny = currentPlayer.y + dy;
  if (nx < 0 || nx >= MAP_WIDTH || ny < 0 || ny >= MAP_HEIGHT) return;
  currentPlayer.x = nx;
  currentPlayer.y = ny;
  energy = Math.max(0, energy - 1);
  updateStats();
  drawMap();
}

document.addEventListener('keydown', e => {
  if(['ArrowUp', 'w'].includes(e.key)) movePlayer(0, -1);
  else if(['ArrowDown', 's'].includes(e.key)) movePlayer(0, 1);
  else if(['ArrowLeft', 'a'].includes(e.key)) movePlayer(-1, 0);
  else if(['ArrowRight', 'd'].includes(e.key)) movePlayer(1, 0);
});

function showQuestion(q) {
  questionActive = true;
  questionText.textContent = q.question;
  answerInput.value = '';
  feedback.textContent = '';
  questionModal.classList.add('visible');
}

function hideQuestion() {
  questionModal.classList.remove('visible');
  questionActive = false;
  currentQuestion = null;
}

submitAnswerBtn.onclick = () => {
  const answer = parseInt(answerInput.value);
  if(isNaN(answer)) {
    feedback.textContent = 'Please enter a number';
    return;
  }
  if(answer === currentQuestion.answer) {
    feedback.textContent = '✅ Correct!';
    cash += 10;
    energy = Math.min(100, energy + 10);
    xp += 10;
    if(xp >= 100) {
      level++;
      xp -= 100;
      alert(`Level Up! You are now level ${level}! 🎉`);
    }
    updateStats();
  } else {
    feedback.textContent = '❌ Wrong!';
    energy = Math.max(0, energy - 5);
    updateStats();
  }
  setTimeout(() => {
    hideQuestion();
  }, 1500);
};

skipQuestionBtn.onclick = () => {
  feedback.textContent = 'Question Skipped';
  setTimeout(() => {
    hideQuestion();
  }, 500);
};

const upgrades = [
  { id: 'cash', name: 'Cash Per Correct', cost: 50, level: 0 },
  { id: 'energy', name: 'Energy Drain Resistance', cost: 100, level: 0 },
  { id: 'xp', name: 'XP Boost', cost: 75, level: 0 }
];

openShopBtn.onclick = () => {
  shopDiv.classList.add('visible');
  renderShop();
};

closeShopBtn.onclick = () => {
  shopDiv.classList.remove('visible');
};

function renderShop() {
  shopItemsUl.innerHTML = '';
  upgrades.forEach(upg => {
    const li = document.createElement('li');
    li.textContent = `${upg.name} (Level ${upg.level}) - Cost: $${upg.cost}`;
    const buyBtn = document.createElement('button');
    buyBtn.textContent = 'Buy';
    buyBtn.onclick = () => buyUpgrade(upg.id);
    li.appendChild(buyBtn);
    shopItemsUl.appendChild(li);
  });
}

function buyUpgrade(id) {
  const upg = upgrades.find(u => u.id === id);
  if (!upg) return;
  if (cash < upg.cost) {
    alert('Not enough cash!');
    return;
  }
  cash -= upg.cost;
  upg.level++;
  upg.cost = Math.floor(upg.cost * 1.5);
  alert(`Bought ${upg.name} level ${upg.level}!`);
  updateStats();
  renderShop();
}

showLeaderboardBtn.onclick = () => {
  leaderboardDiv.classList.add('visible');
  renderLeaderboard();
};
closeLeaderboardBtn.onclick = () => {
  leaderboardDiv.classList.remove('visible');
};
function renderLeaderboard() {
  leaderboardList.innerHTML = '';
  const li = document.createElement('li');
  li.textContent = `${playerName} - Cash: ${cash} - XP: ${xp} - Level: ${level}`;
  leaderboardList.appendChild(li);
}

createBtn.onclick = () => {
  if (!nameInput.value.trim()) {
    alert('Please enter your name');
    return;
  }
  playerName = nameInput.value.trim();
  gameCode = randomCode();
  gameCodeDisplay.textContent = gameCode;
  authDiv.style.display = 'none';
  lobbyDiv.style.display = 'block';
  players = [{name: playerName, id: '1'}];
  renderLobbyPlayers();
};

joinBtn.onclick = () => {
  if (!nameInput.value.trim()) {
    alert('Please enter your name');
    return;
  }
  if (!joinCodeInput.value.trim()) {
    alert('Please enter a game code');
    return;
  }
  playerName = nameInput.value.trim();
  gameCode = joinCodeInput.value.trim();
  gameCodeDisplay.textContent = gameCode;
  authDiv.style.display = 'none';
  lobbyDiv.style.display = 'block';
  players = [{name: playerName, id: '1'}];
  renderLobbyPlayers();
};

startGameBtn.onclick = () => {
  lobbyDiv.style.display = 'none';
  gameDiv.style.display = 'block';
  initGame();
};

function renderLobbyPlayers() {
  playerListUl.innerHTML = '';
  players.forEach(p => {
    const li = document.createElement('li');
    li.textContent = p.name;
    playerListUl.appendChild(li);
  });
}
