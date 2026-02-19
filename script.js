// --- ОБЩАЯ ЛОГИКА ПЕРЕКЛЮЧЕНИЯ ---
function showGame(gameId) {
    document.querySelectorAll('.game-container').forEach(g => g.style.display = 'none');
    const target = document.getElementById(gameId);
    if (target) target.style.display = 'block';
    
    // Специфические инициализации
    if(gameId === 'maze') initMaze();
    if(gameId === 'reaction') resetReactionGame();
    if(gameId === 'rpg-todo') updateRPG_UI();
}

// --- ПРАКТИЧЕСКАЯ №4: RPG ПЛАНИРОВЩИК ---
class Character {
    constructor() {
        this.name = "Герой";
        this.level = 1;
        this.xp = 0;
        this.totalTasks = 0;
        this.totalXp = 0;
    }
    getNextLevelXp() { return this.level * 100; }
    addXp(amount) {
        this.xp += amount;
        this.totalXp += amount;
        while (this.xp >= this.getNextLevelXp()) {
            this.xp -= this.getNextLevelXp();
            this.level++;
            alert(`🏆 УРОВЕНЬ ПОВЫШЕН! Теперь вы ${this.level} уровня!`);
        }
        this.save();
    }
    save() { localStorage.setItem('rpg_char', JSON.stringify(this)); }
}

let character = new Character();
let quests = [];

function loadRPG() {
    const savedChar = localStorage.getItem('rpg_char');
    if(savedChar) Object.assign(character, JSON.parse(savedChar));
    else {
        const n = prompt("Введите имя вашего героя:", "Герой");
        character.name = n || "Герой";
        character.save();
    }
    const savedQuests = localStorage.getItem('rpg_quests');
    if(savedQuests) quests = JSON.parse(savedQuests);
    updateRPG_UI();
}

function addNewTask() {
    const nameInput = document.getElementById('task-name');
    const descInput = document.getElementById('task-desc');
    const diffInput = document.querySelector('input[name="diff"]:checked');
    
    if(!nameInput.value) return alert("Введите название квеста!");

    const newTask = {
        id: Date.now(),
        name: nameInput.value,
        desc: descInput.value,
        xp: parseInt(diffInput.value),
        completed: false,
        date: new Date().toLocaleDateString()
    };

    quests.push(newTask);
    localStorage.setItem('rpg_quests', JSON.stringify(quests));
    nameInput.value = '';
    descInput.value = '';
    updateRPG_UI();
}

function completeQuest(id) {
    const q = quests.find(t => t.id === id);
    if(q && !q.completed) {
        q.completed = true;
        character.totalTasks++;
        character.addXp(q.xp);
        localStorage.setItem('rpg_quests', JSON.stringify(quests));
        updateRPG_UI();
    }
}

function deleteQuest(id) {
    quests = quests.filter(t => t.id !== id);
    localStorage.setItem('rpg_quests', JSON.stringify(quests));
    updateRPG_UI();
}

function updateRPG_UI() {
    document.getElementById('display-name').innerText = character.name;
    document.getElementById('char-level').innerText = character.level;
    document.getElementById('current-xp').innerText = character.xp;
    document.getElementById('next-level-xp').innerText = character.getNextLevelXp();
    document.getElementById('xp-fill').style.width = (character.xp / character.getNextLevelXp() * 100) + "%";
    document.getElementById('stat-count').innerText = character.totalTasks;

    const activeList = document.getElementById('active-tasks-list');
    const doneList = document.getElementById('completed-tasks-list');
    activeList.innerHTML = ''; 
    doneList.innerHTML = '';

    quests.forEach(q => {
        const html = `
            <div class="quest-item ${q.completed ? 'completed' : ''}">
                <div>
                    <strong>${q.name}</strong> <span style="font-size:0.7rem; color:#eab308;">+${q.xp} XP</span>
                    <br><small>${q.desc}</small>
                </div>
                <div>
                    ${!q.completed ? `<button onclick="completeQuest(${q.id})" class="btn" style="padding:5px 10px; background:#10b981">✔️</button>` : ''}
                    <button onclick="deleteQuest(${q.id})" class="btn btn-reset" style="padding:5px 10px">🗑️</button>
                </div>
            </div>`;
        if(q.completed) doneList.innerHTML += html; 
        else activeList.innerHTML += html;
    });
}

function resetRPG() {
    if(confirm("Вы уверены, что хотите сбросить весь прогресс и удалить героя?")) {
        localStorage.removeItem('rpg_char');
        localStorage.removeItem('rpg_quests');
        location.reload();
    }
}

// --- 1. КЛИКЕР ---
let clickScore = 0;
let clickTimeLeft = 30;
let clickTimerId = null;

function handleOnClick() {
    if (clickTimeLeft <= 0) return;
    if (!clickTimerId) {
        clickTimerId = setInterval(() => {
            clickTimeLeft--;
            document.getElementById('timer').innerText = clickTimeLeft;
            if (clickTimeLeft <= 0) {
                clearInterval(clickTimerId);
                alert("Финиш! Очков: " + clickScore);
                let record = localStorage.getItem('clickRecord') || 0;
                if (clickScore > record) {
                    localStorage.setItem('clickRecord', clickScore);
                    document.getElementById('high-score').innerText = clickScore;
                }
            }
        }, 1000);
    }
    clickScore++;
    document.getElementById('score').innerText = clickScore;
}

if(document.getElementById('click-btn')) {
    document.getElementById('click-btn').onclick = handleOnClick;
    document.getElementById('high-score').innerText = localStorage.getItem('clickRecord') || 0;
}

function resetClicker() {
    clearInterval(clickTimerId);
    clickScore = 0; clickTimeLeft = 30; clickTimerId = null;
    document.getElementById('score').innerText = 0; 
    document.getElementById('timer').innerText = 30;
}

// --- 2. ГЕНЕРАТОР ПРИКЛЮЧЕНИЙ ---
const heroes = ['рыцарь', 'маг', 'гном-кузнец', 'вор'];
const locations = ['в заброшенном замке', 'в древних руинах', 'в темном лесу', 'в подземелье'];
const enemies = ['коварным вампиром', 'ордой гоблинов', 'демоном хаоса', 'драконом'];

function generateAdventure() {
    const h = heroes[Math.floor(Math.random() * heroes.length)];
    const l = locations[Math.floor(Math.random() * locations.length)];
    const e = enemies[Math.floor(Math.random() * enemies.length)];
    const text = `Ваш персонаж - ${h} находится ${l} и сражается с ${e}.`;
    document.getElementById('adventure-text').innerText = text;
    let history = JSON.parse(localStorage.getItem('advHistory') || "[]");
    history.unshift({ text: text, date: new Date().toLocaleString() });
    localStorage.setItem('advHistory', JSON.stringify(history.slice(0, 10)));
    renderHistory();
}

function renderHistory() {
    const list = document.getElementById('adventure-history-list');
    if(!list) return;
    const history = JSON.parse(localStorage.getItem('advHistory') || "[]");
    list.innerHTML = history.map(item => `
        <div class="history-item">
            <div class="history-date">${item.date}</div>
            <div>${item.text}</div>
        </div>`).join('');
}

function clearAdventureHistory() {
    localStorage.removeItem('advHistory');
    renderHistory();
}

// --- 3. УГАДАЙ ЧИСЛО ---
let secretNum = Math.floor(Math.random() * 100) + 1;
let tries = 10;

function checkGuess() {
    if (tries <= 0) return;
    const val = parseInt(document.getElementById('guess-input').value);
    const msg = document.getElementById('guess-message');
    if (isNaN(val)) return msg.innerText = "Введите число!";
    tries--;
    document.getElementById('attempts').innerText = tries;
    if (val === secretNum) {
        msg.innerText = "Победа! 🎉";
        tries = 0;
    } else if (tries <= 0) {
        msg.innerText = "Попытки кончились. Было: " + secretNum;
    } else {
        msg.innerText = val > secretNum ? "Меньше" : "Больше";
    }
}

function resetGuessGame() {
    secretNum = Math.floor(Math.random() * 100) + 1;
    tries = 10;
    document.getElementById('attempts').innerText = 10;
    document.getElementById('guess-message').innerText = "";
    document.getElementById('guess-input').value = "";
}

// --- 4. РЕАКЦИЯ ---
let reactScore = 0;
let reactTimeLeft = 30;
let reactTimerId = null;

function startReactionGame() {
    resetReactionGame();
    document.getElementById('react-hint').style.display = 'none';
    reactTimerId = setInterval(() => {
        reactTimeLeft--;
        document.getElementById('react-timer').innerText = reactTimeLeft;
        if (reactTimeLeft <= 0) {
            clearInterval(reactTimerId);
            document.getElementById('target').style.display = 'none';
            alert("Игра окончена! Нажатий: " + reactScore);
        }
    }, 1000);
    moveTarget();
}

function moveTarget() {
    const target = document.getElementById('target');
    const area = document.getElementById('reaction-area');
    target.style.display = 'block';
    target.style.top = Math.random() * (area.offsetHeight - 50) + 'px';
    target.style.left = Math.random() * (area.offsetWidth - 80) + 'px';
}

if(document.getElementById('target')) {
    document.getElementById('target').onclick = function() {
        if (reactTimeLeft > 0) {
            reactScore++;
            document.getElementById('react-score').innerText = reactScore;
            moveTarget();
        }
    };
}

function resetReactionGame() {
    clearInterval(reactTimerId);
    reactScore = 0; reactTimeLeft = 30;
    document.getElementById('react-score').innerText = "0";
    document.getElementById('react-timer').innerText = "30";
}

// --- 5. КРЕСТИКИ-НОЛИКИ ---
let tttBoard = Array(9).fill(null);
let pWin = 0, bWin = 0;

function makeMove(i) {
    if (tttBoard[i] || checkWinner(tttBoard)) return;
    tttBoard[i] = 'X';
    renderTTT();
    if (checkWinner(tttBoard)) {
        pWin++;
        finishTTT("Вы выиграли!");
    } else if (tttBoard.every(c => c)) {
        finishTTT("Ничья!");
    } else {
        setTimeout(botTurn, 400);
    }
}

function botTurn() {
    let empty = tttBoard.map((v, i) => v === null ? i : null).filter(v => v !== null);
    if (empty.length > 0) {
        let move = empty[Math.floor(Math.random() * empty.length)];
        tttBoard[move] = 'O';
        renderTTT();
        if (checkWinner(tttBoard)) {
            bWin++;
            finishTTT("Бот победил!");
        }
    }
}

function renderTTT() {
    const cells = document.querySelectorAll('.cell');
    tttBoard.forEach((v, i) => { if(cells[i]) cells[i].innerText = v || ''; });
}

function finishTTT(m) {
    document.getElementById('ttt-status').innerText = `Игрок: ${pWin} | Бот: ${bWin}`;
    alert(m);
}

function checkWinner(b) {
    const wins = [[0,1,2],[3,4,5],[6,7,8],[0,3,6],[1,4,7],[2,5,8],[0,4,8],[2,4,6]];
    return wins.some(l => b[l[0]] && b[l[0]] === b[l[1]] && b[l[0]] === b[l[2]]);
}

function resetTTT() { tttBoard.fill(null); renderTTT(); }

// --- 6. ЛАБИРИНТ ---
const mazeLayout = [
    [0, 0, 1, 0, 0, 0, 1, 0, 0, 0],
    [1, 0, 1, 0, 1, 0, 1, 1, 1, 0],
    [0, 0, 0, 0, 1, 0, 0, 0, 1, 0],
    [0, 1, 1, 1, 1, 1, 1, 0, 1, 0],
    [0, 0, 0, 0, 0, 0, 1, 0, 0, 0],
    [1, 1, 1, 1, 1, 0, 1, 1, 1, 1],
    [0, 0, 0, 0, 1, 0, 0, 0, 0, 0],
    [0, 1, 1, 0, 1, 1, 1, 1, 1, 0],
    [0, 0, 1, 0, 0, 0, 0, 0, 1, 0],
    [1, 0, 0, 0, 1, 1, 1, 0, 0, 2]
];

let playerPos = { x: 0, y: 0 };
let mazeTimer = 0;
let mazeInterval;

function initMaze() {
    const container = document.getElementById('maze-container');
    if(!container) return;
    container.innerHTML = '';
    playerPos = { x: 0, y: 0 };
    clearInterval(mazeInterval);
    mazeTimer = 0;
    document.getElementById('maze-timer').innerText = mazeTimer;
    mazeInterval = setInterval(() => {
        mazeTimer++;
        document.getElementById('maze-timer').innerText = mazeTimer;
    }, 1000);

    for (let y = 0; y < 10; y++) {
        for (let x = 0; x < 10; x++) {
            const cell = document.createElement('div');
            cell.classList.add('maze-cell');
            if (mazeLayout[y][x] === 1) cell.classList.add('maze-wall');
            if (mazeLayout[y][x] === 2) cell.classList.add('maze-exit');
            if (x === playerPos.x && y === playerPos.y) cell.classList.add('maze-player');
            cell.id = `cell-${x}-${y}`;
            container.appendChild(cell);
        }
    }
}

window.addEventListener('keydown', (e) => {
    if (document.getElementById('maze').style.display !== 'block') return;
    let nextPos = { ...playerPos };
    if (e.key === 'ArrowUp') nextPos.y--;
    if (e.key === 'ArrowDown') nextPos.y++;
    if (e.key === 'ArrowLeft') nextPos.x--;
    if (e.key === 'ArrowRight') nextPos.x++;

    if (nextPos.x >= 0 && nextPos.x < 10 && nextPos.y >= 0 && nextPos.y < 10) {
        const targetType = mazeLayout[nextPos.y][nextPos.x];
        if (targetType !== 1) {
            document.getElementById(`cell-${playerPos.x}-${playerPos.y}`).classList.remove('maze-player');
            playerPos = nextPos;
            document.getElementById(`cell-${playerPos.x}-${playerPos.y}`).classList.add('maze-player');
            if (targetType === 2) {
                clearInterval(mazeInterval);
                alert(`Победа! Время: ${mazeTimer} сек.`);
                initMaze();
            }
        }
    }
});

// ФОРМА И ЗАПУСК
window.onload = () => {
    loadRPG();
    renderHistory();
    if(document.getElementById('contactForm')) {
        document.getElementById('contactForm').onsubmit = function(e) {
            e.preventDefault();
            alert("Сообщение отправлено!");
            this.reset();
        };
    }
};