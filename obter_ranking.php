
<?php

header('Content-Type: application/json; charset=utf-8');
require_once __DIR__ . '/conexao.php';

try {
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
        'message' => 'Não foi possível carregar o ranking.'
    ], JSON_UNESCAPED_UNICODE);
}
?>
