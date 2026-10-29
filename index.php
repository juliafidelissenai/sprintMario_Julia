
<?php
require_once __DIR__ . '/conexao.php';

$stmt = $pdo->query("
    SELECT id, nome_jogador, pontuacao,
           DATE_FORMAT(data_registro, '%d/%m/%Y %H:%i') AS data
    FROM ranking
    ORDER BY pontuacao DESC, id ASC
    LIMIT 10
");

$rankingInicial = $stmt->fetchAll();
?>
<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Jogo Mario-Venha se divertir</title>
    <link rel="stylesheet" href="css/styles.css">
    <script src="js/script.js" defer></script>
</head>
<body>
<main class="app">

    <header class="topbar">
        <div class="brand">
            <span class="brand-icon">★</span>
            <div>
                <h1>SE DIVIRTA</h1>
                <p>Uma aventura no Reino DO MARIO E FLURRY</p>
            </div>
        </div>

        <div class="hud">
            <div>
                <small>JOGADOR</small>
                <strong id="hud-player-name">---</strong>
            </div>
            <div>
                <small>PONTOS</small>
                <strong id="score-display">0</strong>
            </div>
            <div>
                <small>MOEDAS</small>
                <strong id="coins-display">0</strong>
            </div>
            <div>
                <small>NÍVEL</small>
                <strong id="level-display">FÁCIL</strong>
            </div>
        </div>
    </header>

    <section class="game-shell">
        <div class="game-board" id="game-board">

            <img src="assets/cenario%20pixels.jpg"
                 class="background-game" alt="Cenário do jogo">

            <div class="mario" id="character">
                <img src="assets/mario.gif" alt="Mario">
            </div>

            <div class="alt-character" id="alt-character" hidden>
                <img src="assets/boneca.gif.png" alt="Flurry">
            </div>

            <img src="assets/obstaculo.png"
                 class="pipe" alt="Obstáculo">

            <div id="entities-layer"></div>

            <div class="jump-tip" id="jump-tip">
                ESPAÇO / ↑ / CLIQUE PARA PULAR
            </div>

            <div class="board-badge" id="board-badge">
                PRONTO PARA JOGAR?
            </div>
        </div>

        <div class="controls">
            <span>⌨️ Espaço ou seta ↑ para pular</span>
            <span>🪙 Pegue moedas para ganhar pontos</span>
            <span>🚧 Não encoste nos obstáculos!</span>
        </div>
    </section>

</main>

<!-- TELA INICIAL -->
<div class="modal-overlay active" id="start-modal">
    <section class="modal-card">

        <div class="pixel-star">★</div>
        <p class="eyebrow">AVENTURA NO MUNDO DO MARIO E FLURRY</p>
        <h2>PIXEL RUN</h2>
        <p class="muted">
            Corra, pule os obstáculos e colete moedas!
        </p>

        <form id="start-form">

            <label for="player-input">NOME DO JOGADOR</label>
            <input
                id="player-input"
                name="nome"
                type="text"
                maxlength="50"
                placeholder="Digite seu nome"
                required
            >

            <label for="character-choice">ESCOLHA SEU PERSONAGEM</label>
            <select id="character-choice" name="personagem">
                <option value="mario">Mario</option>
                <option value="boneca">Flurry</option>
            </select>

            <button type="submit" class="btn primary">
                ▶ INICIAR JOGO
            </button>

            <button type="button" class="btn secondary"
                    id="btn-view-ranking">
                🏆 VER RANKING
            </button>
        </form>

        <p class="server-note">
            Pontuações salvas no ranking MySQL
        </p>

    </section>
</div>

<!-- TELA FINAL -->
<div class="modal-overlay" id="gameover-modal">
    <section class="modal-card results-card">

        <p class="eyebrow">FIM DE JOGO</p>
        <h2 id="gameover-heading">GAME OVER!</h2>

        <div class="result-stats">
            <div>
                <small>PONTUAÇÃO FINAL</small>
                <strong id="final-score-value">0</strong>
            </div>
            <div>
                <small>MOEDAS</small>
                <strong id="final-coins-value">0</strong>
            </div>
            <div>
                <small>NÍVEL ALCANÇADO</small>
                <strong id="final-level-value">FÁCIL</strong>
            </div>
        </div>

        <p class="save-status" id="save-status-msg"></p>

        <div class="ranking-container">
            <h3>🏆 TOP 10 JOGADORES</h3>

            <div class="table-wrapper">
                <table class="ranking-table">
                    <thead>
                        <tr>
                            <th>#</th>
                            <th>JOGADOR</th>
                            <th>PONTOS</th>
                            <th>DATA</th>
                        </tr>
                    </thead>

                    <tbody id="ranking-body">
                        <?php if ($rankingInicial): ?>
                            <?php foreach ($rankingInicial as $i => $row): ?>
                                <tr>
                                    <td><?= $i + 1 ?></td>
                                    <td><?= htmlspecialchars(
                                        $row['nome_jogador'],
                                        ENT_QUOTES,
                                        'UTF-8'
                                    ) ?></td>
                                    <td><?= (int)$row['pontuacao'] ?></td>
                                    <td><?= htmlspecialchars(
                                        (string)$row['data'],
                                        ENT_QUOTES,
                                        'UTF-8'
                                    ) ?></td>
                                </tr>
                            <?php endforeach; ?>
                        <?php else: ?>
                            <tr>
                                <td colspan="4" class="empty">
                                    Ainda não há pontuações. Seja o primeiro!
                                </td>
                            </tr>
                        <?php endif; ?>
                    </tbody>
                </table>
            </div>
        </div>

        <div class="modal-actions">
            <button type="button" class="btn primary" id="btn-restart">
                ↻ JOGAR NOVAMENTE
            </button>

            <button type="button" class="btn secondary"
                    id="btn-change-player">
                TROCAR JOGADOR
            </button>
        </div>

    </section>
</div>

</body>
</html>
