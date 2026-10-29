
<?php

header('Content-Type: application/json; charset=utf-8');
require_once __DIR__ . '/conexao.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);

    echo json_encode([
        'status' => 'error',
        'message' => 'Método não permitido.'
    ], JSON_UNESCAPED_UNICODE);

    exit;
}

$input = json_decode(file_get_contents('php://input'), true);

$nome = trim((string)($input['nome'] ?? ''));
$pontos = filter_var(
    $input['pontos'] ?? null,
    FILTER_VALIDATE_INT
);

if (
    $nome === '' ||
    mb_strlen($nome) > 50 ||
    $pontos === false ||
    $pontos === null ||
    $pontos < 0
) {
    http_response_code(422);

    echo json_encode([
        'status' => 'error',
        'message' => 'Nome ou pontuação inválidos.'
    ], JSON_UNESCAPED_UNICODE);

    exit;
}

try {
    $insert = $pdo->prepare(
        'INSERT INTO ranking (nome_jogador, pontuacao)
         VALUES (:nome, :pontos)'
    );

    $insert->execute([
        ':nome' => $nome,
        ':pontos' => $pontos
    ]);

    $stmt = $pdo->query("
        SELECT nome_jogador AS nome,
               pontuacao AS pontos,
               DATE_FORMAT(
                   data_registro, '%d/%m/%Y %H:%i'
               ) AS data
        FROM ranking
        ORDER BY pontuacao DESC, id ASC
        LIMIT 10
    ");

    echo json_encode([
        'status' => 'success',
        'ranking' => $stmt->fetchAll()
    ], JSON_UNESCAPED_UNICODE);

} catch (PDOException $e) {
    http_response_code(500);

    echo json_encode([
        'status' => 'error',
        'message' => 'Não foi possível salvar a pontuação.'
    ], JSON_UNESCAPED_UNICODE);
}
?>
