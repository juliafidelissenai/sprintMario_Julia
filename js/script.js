
document.addEventListener('DOMContentLoaded', () => {
    const board = document.getElementById('game-board');
    const character = document.getElementById('character');
    const altCharacter = document.getElementById('alt-character');
    const pipe = document.querySelector('.pipe');
    const backgroundGame = document.querySelector('.background-game');
    const entitiesLayer = document.getElementById('entities-layer');

    const playerInput = document.getElementById('player-input');
    const characterChoice = document.getElementById('character-choice');
    const playerNameDisplay = document.getElementById('hud-player-name');
    const scoreDisplay = document.getElementById('score-display');
    const coinsDisplay = document.getElementById('coins-display');
    const levelDisplay = document.getElementById('level-display');
    const finalScore = document.getElementById('final-score-value');
    const finalLevel = document.getElementById('final-level-value');
    const finalCoins = document.getElementById('final-coins-value');
    const jumpTip = document.getElementById('jump-tip');

    const startModal = document.getElementById('start-modal');
    const gameoverModal = document.getElementById('gameover-modal');
    const startForm = document.getElementById('start-form');
    const btnRestart = document.getElementById('btn-restart');
    const btnChangePlayer = document.getElementById('btn-change-player');
    const btnViewRanking = document.getElementById('btn-view-ranking');
    const rankingBody = document.getElementById('ranking-body');
    const saveStatus = document.getElementById('save-status-msg');

    const levels = [
        { name: 'FÁCIL', threshold: 0, speed: 260 },
        { name: 'MÉDIO', threshold: 40, speed: 360 },
        { name: 'DIFÍCIL', threshold: 100, speed: 470 }
    ];

    let playerName = '';
    let score = 0;
    let coins = 0;
    let levelIndex = 0;
    let isPlaying = false;
    let animationId = null;
    let lastTime = 0;
    let elapsed = 0;
    let obstacleX = 0;
    let nextCoinTime = 1.5;
    let jumpTimeout = null;
    let coinItems = [];

    function updateHUD() {
        scoreDisplay.textContent = Math.floor(score);
        coinsDisplay.textContent = coins;
        levelDisplay.textContent = levels[levelIndex].name;
    }

    function chooseCharacter() {
        const choice = characterChoice.value;

        character.hidden = choice !== 'mario';
        altCharacter.hidden = choice !== 'boneca';
        

        if (choice === 'mario') {
            character.style.display = 'block';
            altCharacter.style.display = 'none';
        } else {
            character.style.display = 'none';
            altCharacter.style.display = 'block';
        }
    }

    function startGame() {
        stopGame();

        score = 0;
        coins = 0;
        levelIndex = 0;
        elapsed = 0;
        lastTime = 0;
        nextCoinTime = 1.5;
        obstacleX = board.clientWidth + 20;
        coinItems = [];
        entitiesLayer.replaceChildren();

        clearTimeout(jumpTimeout);
        character.classList.remove('jump');
        altCharacter.classList.remove('jump');

        pipe.style.animation = 'none';
        pipe.style.right = 'auto';
        pipe.style.left = obstacleX + 'px';

        chooseCharacter();
        updateHUD();

        playerNameDisplay.textContent = playerName || 'Jogador';
        startModal.classList.remove('active');
        gameoverModal.classList.remove('active');
        jumpTip.style.opacity = '1';

        isPlaying = true;
        board.classList.add('running');

        animationId = requestAnimationFrame(gameLoop);
    }

    function stopGame() {
        isPlaying = false;

        if (animationId !== null) {
            cancelAnimationFrame(animationId);
            animationId = null;
        }
    }

    function jump() {
        if (!isPlaying) return;

        const activeCharacter =
            characterChoice.value === 'mario'
                ? character
                : altCharacter;

        if (activeCharacter.classList.contains('jump')) return;

        activeCharacter.classList.add('jump');
        jumpTip.style.opacity = '0';

        clearTimeout(jumpTimeout);

        jumpTimeout = setTimeout(() => {
            activeCharacter.classList.remove('jump');
        }, 500);
    }

    function spawnCoin() {
        const coin = document.createElement('span');
        coin.className = 'coin';
        coin.textContent = '🪙';

        const ground = 35;
        const maxHeight = Math.max(100, board.clientHeight - 150);
        const height = ground + Math.random() * maxHeight;

        coin.style.left = board.clientWidth + 'px';
        coin.style.bottom = height + 'px';

        entitiesLayer.appendChild(coin);
        coinItems.push(coin);
    }

    function rectanglesOverlap(a, b) {
        return (
            a.left < b.right &&
            a.right > b.left &&
            a.top < b.bottom &&
            a.bottom > b.top
        );
    }

    function getActiveCharacter() {
        return characterChoice.value === 'mario'
            ? character
            : altCharacter;
    }

    function updateLevel() {
        let newLevel = 0;

        if (score >= levels[2].threshold || elapsed >= 60) {
            newLevel = 2;
        } else if (score >= levels[1].threshold || elapsed >= 25) {
            newLevel = 1;
        }

        if (newLevel !== levelIndex) {
            levelIndex = newLevel;
            updateHUD();
        }
    }

    function gameLoop(timestamp) {
        if (!isPlaying) return;

        if (!lastTime) lastTime = timestamp;

        // Delta de tempo em segundos para manter o movimento consistente.
        const delta = Math.min((timestamp - lastTime) / 1000, 0.05);
        lastTime = timestamp;
        elapsed += delta;

        // Pontos por sobrevivência.
        score += delta * 2;
       

        updateLevel();

        const speed = levels[levelIndex].speed;

        // Move o obstáculo sem depender de animações CSS.
        obstacleX -= speed * delta;

        if (obstacleX < -pipe.offsetWidth) {
            obstacleX = board.clientWidth + 20;
        }

        pipe.style.left = obstacleX + 'px';


        // Cria moedas periodicamente.
        nextCoinTime -= delta;

        if (nextCoinTime <= 0) {
            spawnCoin();
            nextCoinTime = 1.5 + Math.random() * 1.5;
        }

        const activeCharacter = getActiveCharacter();
        const characterRect = activeCharacter.getBoundingClientRect();
        const pipeRect = pipe.getBoundingClientRect();

        // Colisão com o obstáculo encerra a partida.
        if (rectanglesOverlap(characterRect, pipeRect)) {
            endGame();
            return;
        }

        // Move moedas e remove as que forem coletadas ou saírem da tela.
        coinItems = coinItems.filter(coin => {
            const x = parseFloat(coin.style.left) - speed * delta;
            coin.style.left = x + 'px';

            if (x < -coin.offsetWidth) {
                coin.remove();
                return false;
            }

            if (rectanglesOverlap(
                activeCharacter.getBoundingClientRect(),
                coin.getBoundingClientRect()
            )) {
                coins += 1;
                score += 10;
                coin.remove();
                updateHUD();
                return false;
            }

            return true;
        });

        updateHUD();
        animationId = requestAnimationFrame(gameLoop);
    }

    function endGame() {
        stopGame();
        board.classList.remove('running');

        finalScore.textContent = Math.floor(score);
        finalLevel.textContent = 'Nível: ' + levels[levelIndex].name;
        finalCoins.textContent = 'Moedas coletadas: ' + coins;

        saveStatus.textContent = 'Salvando pontuação...';
        gameoverModal.classList.add('active');

        saveScore(playerName, Math.floor(score));
    }

    function saveScore(name, points) {
        fetch('salvar_ranking.php', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ nome: name, pontos: points })
        })
        .then(response => response.json())
        .then(data => {
            if (data.status === 'success') {
                saveStatus.textContent = 'Pontuação registrada!';
                if (data.ranking) renderRanking(data.ranking);
            } else {
                saveStatus.textContent =
                    data.message || 'Não foi possível salvar a pontuação.';
            }
        })
        .catch(() => {
            saveStatus.textContent =
                'Erro ao conectar ao servidor. A partida foi concluída.';
        });
    }

    function fetchRanking() {
        fetch('obter_ranking.php')
            .then(response => response.json())
            .then(data => {
                if (data.status === 'success') {
                    renderRanking(data.ranking);
                }
            })
            .catch(console.error);
    }

    function renderRanking(list) {
        if (!rankingBody) return;

        rankingBody.replaceChildren();

        if (!list || list.length === 0) {
            const row = document.createElement('tr');
            const cell = document.createElement('td');
            cell.colSpan = 3;
            cell.textContent = 'Nenhuma pontuação registrada.';
            row.appendChild(cell);
            rankingBody.appendChild(row);
            return;
        }

        list.forEach((item, index) => {
            const row = document.createElement('tr');
            const position = document.createElement('td');
            const name = document.createElement('td');
            const points = document.createElement('td');

            position.textContent = (index + 1) + 'º';
            name.textContent = item.nome;
            points.textContent = Number(item.pontos) + ' pts';

            row.append(position, name, points);
            rankingBody.appendChild(row);
        });
    }

    startForm.addEventListener('submit', event => {
        event.preventDefault();

        const value = playerInput.value.trim();

        if (!value) {
            playerInput.focus();
            return;
        }

        playerName = value;
        localStorage.setItem('mario_jump_player', playerName);
        startGame();
    });

    btnRestart.addEventListener('click', () => {
        startGame();
    });

    btnChangePlayer.addEventListener('click', () => {
        stopGame();
        gameoverModal.classList.remove('active');
        startModal.classList.add('active');
        playerInput.value = '';
        playerInput.focus();
    });

    btnViewRanking.addEventListener('click', () => {
        fetchRanking();
        finalScore.textContent = '---';
        finalLevel.textContent = '';
        finalCoins.textContent = '';
        saveStatus.textContent = '';
        startModal.classList.remove('active');
        gameoverModal.classList.add('active');
    });

    board.addEventListener('click', jump);

    document.addEventListener('keydown', event => {
        if (event.code === 'Space' || event.code === 'ArrowUp') {
            if (isPlaying) {
                event.preventDefault();
                jump();
            }
        }
    });
});
