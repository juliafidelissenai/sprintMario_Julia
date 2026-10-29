
<?php

$host = 'localhost';
$port = '3306';
$user = 'root';
$pass = 'mysql';
$dbname = 'jogo_mario';

try {
    $pdo = new PDO(
        "mysql:host=$host;port=$port;charset=utf8mb4",
        $user,
        $pass,
        [
            PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
            PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
            PDO::ATTR_EMULATE_PREPARES => false
        ]
    );

    $pdo->exec(
        "CREATE DATABASE IF NOT EXISTS `$dbname`
         CHARACTER SET utf8mb4
         COLLATE utf8mb4_unicode_ci"
    );

    $pdo->exec("USE `$dbname`");

    $pdo->exec("
        CREATE TABLE IF NOT EXISTS ranking (
            id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
            nome_jogador VARCHAR(50) NOT NULL,
            pontuacao INT NOT NULL,
            data_registro TIMESTAMP NULL
                DEFAULT CURRENT_TIMESTAMP
        ) ENGINE=InnoDB
          DEFAULT CHARSET=utf8mb4
    ");

} catch (PDOException $e) {
    http_response_code(500);
    header('Content-Type: application/json; charset=utf-8');

    echo json_encode([
        'status' => 'error',
        'message' => 'Erro na conexão com o MySQL. Confira as configurações.'
    ], JSON_UNESCAPED_UNICODE);

    exit;
}
?>
