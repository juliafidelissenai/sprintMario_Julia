
document.addEventListener('DOMContentLoaded', () => {
    const $ = (id) => document.getElementById(id);

    const board = $('game-board');
    const character = $('character');
    const altCharacter = $('alt-character');
    const pipe = document.querySelector('.pipe');
    const entitiesLayer = $('entities-layer');

    const playerInput = $('player-input');
    const characterChoice = $('character-choice');
    const playerNameDisplay = $('hud-player-name');

    const scoreDisplay = $('score-display');
    const coinsDisplay = $('coins-display');
    const levelDisplay = $('level-display');

    const finalScore = $('final-score-value');
    const finalCoins = $('final-coins-value');
    const finalLevel = $('final-level-value');

    const jumpTip = $('jump-tip');
    const boardBadge = $('board-badge');

    const startModal = $('start-modal');
    const gameoverModal = $('gameover-modal');
    const startForm = $('start-form');

    const btnRestart = $('btn-restart');
    const btnChangePlayer = $('btn-change-player');
    const btnViewRanking = $('btn-view-ranking');

    const rankingBody = $('ranking-body');
    const saveStatus = $('save-status-msg');

    const levels = [
        { name: 'FÁCIL', threshold: 0, speed: 270 },
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
    let nextCoinTime = 1.3;
    let coinItems = [];
    let jumpTimeout = null;

    function updateHUD() {
        scoreDisplay.textContent = Math.floor(score);
        coinsDisplay.textContent = coins;
        levelDisplay.textContent = levels[levelIndex].name;
    }

    function chooseCharacter() {
        const isMario = characterChoice.value === 'mario';

        character.hidden = !isMario;
        altCharacter.hidden = isMario;

        character.style.display = isMario ? 'flex' : 'none';
        altCharacter.style.display = isMario ? 'none' : 'flex';
    }

    function stopGame() {
        isPlaying = false;

        if (animationId !== null) {
            cancelAnimationFrame(animationId);
        }

        animationId = null;
    }

    function startGame() {
        stopGame();

        score = 0;
        coins = 0;
        levelIndex = 0;

        elapsed = 0;
        lastTime = 0;
        nextCoinTime = 1.3;

        obstacleX = board.clientWidth + 120;

        coinItems.forEach(coin => coin.remove());
        coinItems = [];

        entitiesLayer.replaceChildren();

        clearTimeout(jumpTimeout);

        character.classList.remove('jump');
        altCharacter.classList.remove('jump');

        pipe.style.left = obstacleX + 'px';

        chooseCharacter();
        updateHUD();

        playerNameDisplay.textContent = playerName;

        startModal.classList.remove('active');
        gameoverModal.classList.remove('active');

        jumpTip.style.opacity = '1';
        boardBadge.textContent = 'VAMOS LÁ!';

        $('gameover-heading').textContent = 'GAME OVER!';

        isPlaying = true;
        animationId = requestAnimationFrame(gameLoop);
    }

    function getActiveCharacter() {
        return characterChoice.value === 'mario'
            ? character
            : altCharacter;
    }

    function jump() {
        if (!isPlaying) return;

        const active = getActiveCharacter();

        // Impede que um novo pulo comece antes do anterior terminar.
        if (active.classList.contains('jump')) return;

        active.classList.add('jump');
        jumpTip.style.opacity = '0';

        clearTimeout(jumpTimeout);

        jumpTimeout = setTimeout(() => {
            active.classList.remove('jump');
        }, 650);
    }

    function spawnCoin() {
        const coin = document.createElement('span');

        coin.className = 'coin';
        coin.textContent = '🪙';
        coin.setAttribute('aria-label', 'Moeda');

        const minHeight = 38;
        const maxHeight = Math.max(
            minHeight + 10,
            board.clientHeight - 155
        );

        coin.style.left = (board.clientWidth + 10) + 'px';

        coin.style.bottom =
            (minHeight + Math.random() * (maxHeight - minHeight))
            + 'px';

        entitiesLayer.appendChild(coin);
        coinItems.push(coin);
    }

    function overlap(a, b) {
        return (
            a.left < b.right &&
            a.right > b.left &&
            a.top < b.bottom &&
            a.bottom > b.top
        );
    }

    function updateLevel() {
        let next = 0;

        if (score >= levels[2].threshold || elapsed >= 60) {
            next = 2;
        } else if (
            score >= levels[1].threshold ||
            elapsed >= 25
        ) {
            next = 1;
        }

        if (next !== levelIndex) {
            levelIndex = next;

            boardBadge.textContent =
                'NÍVEL ' + (levelIndex + 1) +
                ': ' + levels[levelIndex].name;

            updateHUD();
        }
    }

    function gameLoop(timestamp) {
        if (!isPlaying) return;

        if (!lastTime) {
            lastTime = timestamp;
        }

        // Limita o tempo de cada atualização para manter
        // o movimento estável quando o navegador fica lento.
        const delta = Math.min(
            (timestamp - lastTime) / 1000,
            0.05
        );

        lastTime = timestamp;
        elapsed += delta;


        updateLevel();

        const speed = levels[levelIndex].speed;

        // Movimento do obstáculo.
        obstacleX -= speed * delta;

        if (obstacleX < -pipe.offsetWidth) {
            obstacleX =
                board.clientWidth + 80 + Math.random() * 130;
        }

        pipe.style.left = obstacleX + 'px';

        // Criação de moedas ao longo da partida.
        nextCoinTime -= delta;

        if (nextCoinTime <= 0) {
            spawnCoin();

            nextCoinTime = 1.1 + Math.random() * 1.4;
        }

        const active = getActiveCharacter();

        const characterRect = active.getBoundingClientRect();
        const pipeRect = pipe.getBoundingClientRect();

        // Área de colisão do personagem.
        const hitbox = {
            left: characterRect.left + 12,
            right: characterRect.right - 12,
            top: characterRect.top + 10,
            bottom: characterRect.bottom - 5
        };

        // Área de colisão do obstáculo.
        const obstacleHitbox = {
            left: pipeRect.left + 5,
            right: pipeRect.right - 5,
            top: pipeRect.top + 4,
            bottom: pipeRect.bottom - 2
        };

        // Colisão encerra a partida.
        const activeStyle = getComputedStyle(active);

        if (
        overlap(hitbox, obstacleHitbox) &&
         !active.classList.contains('jump')
        ) {
         endGame();
            return;
        }

        // Move e verifica todas as moedas.
        coinItems = coinItems.filter(coin => {
            const x =
                parseFloat(coin.style.left) - speed * delta;

            coin.style.left = x + 'px';

            // Remove moedas que saíram da tela.
            if (x < -40) {
                coin.remove();
                return false;
            }

            // Coletar moeda adiciona 10 pontos.
            if (overlap(hitbox, coin.getBoundingClientRect())) {
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

        boardBadge.textContent = 'FIM DE JOGO';

        finalScore.textContent = Math.floor(score);
        finalCoins.textContent = coins;
        finalLevel.textContent = levels[levelIndex].name;

        saveStatus.textContent =
            'Salvando pontuação no ranking...';

        gameoverModal.classList.add('active');

        saveScore(playerName, Math.floor(score));
    }

    async function saveScore(name, points) {
        try {
            const response = await fetch('salvar_ranking.php', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    nome: name,
                    pontos: points
                })
            });

            const data = await response.json();

            if (!response.ok || data.status !== 'success') {
                throw new Error(
                    data.message || 'Falha ao salvar.'
                );
            }

            saveStatus.textContent =
                'Pontuação salva no banco de dados!';

            renderRanking(data.ranking);

        } catch (error) {
            saveStatus.textContent =
                'Não foi possível salvar. Confira a conexão com o MySQL.';
        }
    }

    async function fetchRanking() {
        try {
            const response = await fetch('obter_ranking.php');
            const data = await response.json();

            if (!response.ok || data.status !== 'success') {
                throw new Error('Falha no ranking.');
            }

            renderRanking(data.ranking);

        } catch (error) {
            rankingBody.replaceChildren();

            const row = document.createElement('tr');
            const cell = document.createElement('td');

            cell.colSpan = 4;
            cell.className = 'empty';
            cell.textContent =
                'Não foi possível carregar o ranking.';

            row.appendChild(cell);
            rankingBody.appendChild(row);
        }
    }

    function renderRanking(list) {
        rankingBody.replaceChildren();

        if (!Array.isArray(list) || list.length === 0) {
            const row = document.createElement('tr');
            const cell = document.createElement('td');

            cell.colSpan = 4;
            cell.className = 'empty';
            cell.textContent =
                'Ainda não há pontuações. Seja o primeiro!';

            row.appendChild(cell);
            rankingBody.appendChild(row);

            return;
        }

        list.forEach((item, index) => {
            const row = document.createElement('tr');

            const values = [
                String(index + 1),
                item.nome,
                Number(item.pontos) + ' pts',
                item.data || '—'
            ];

            values.forEach(value => {
                const cell = document.createElement('td');

                // textContent evita interpretar nomes como HTML.
                cell.textContent = value;

                row.appendChild(cell);
            });

            rankingBody.appendChild(row);
        });
    }

    // Iniciar partida com o nome escolhido.
    startForm.addEventListener('submit', event => {
        event.preventDefault();

        const value = playerInput.value.trim();

        if (!value) {
            playerInput.focus();
            return;
        }

        playerName = value.slice(0, 50);

        startGame();
    });

    // Reiniciar sem atualizar a página.
    btnRestart.addEventListener('click', startGame);

    // Permitir trocar o jogador.
    btnChangePlayer.addEventListener('click', () => {
        stopGame();

        gameoverModal.classList.remove('active');
        startModal.classList.add('active');

        playerInput.value = '';
        playerInput.focus();
    });

    // Abrir o ranking.
    btnViewRanking.addEventListener('click', () => {
        finalScore.textContent = '—';
        finalCoins.textContent = '—';
        finalLevel.textContent = '—';

        saveStatus.textContent = '';

        fetchRanking();

        startModal.classList.remove('active');
        gameoverModal.classList.add('active');

        $('gameover-heading').textContent = 'RANKING';
    });

    // Clique ou toque na área do jogo para pular.
    board.addEventListener('pointerdown', event => {
        if (isPlaying) {
            event.preventDefault();
            jump();
        }
    });

    // Espaço ou seta para cima também fazem o personagem pular.
    document.addEventListener('keydown', event => {
        if (
            (event.code === 'Space' ||
             event.code === 'ArrowUp') &&
            isPlaying
        ) {
            event.preventDefault();
            jump();
        }
    });
});

