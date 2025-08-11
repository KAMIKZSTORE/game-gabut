<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');

// Simple DB config - ubah sesuai environment Anda
$DB_HOST = '127.0.0.1';
$DB_USER = 'your_db_user';
$DB_PASS = 'your_db_pass';
$DB_NAME = 'your_db_name';

// Konek
$db = new mysqli($DB_HOST, $DB_USER, $DB_PASS, $DB_NAME);
if ($db->connect_error) {
    echo json_encode(["error" => "DB error: " . $db->connect_error]);
    exit;
}

$action = $_GET['action'] ?? '';

if ($action === 'save_score') {
    $player = $_POST['player'] ?? '';
    $score = intval($_POST['score'] ?? 0);
    if ($player && $score >= 0) {
        $stmt = $db->prepare("INSERT INTO scores (player, score) VALUES (?, ?)");
        $stmt->bind_param("si", $player, $score);
        $stmt->execute();
        echo json_encode(["status" => "success"]);
    } else {
        echo json_encode(["status" => "failed", "reason" => "invalid input"]);
    }
}
elseif ($action === 'get_leaderboard') {
    $result = $db->query("SELECT player, MAX(score) as highscore FROM scores GROUP BY player ORDER BY highscore DESC LIMIT 10");
    $data = [];
    while ($row = $result->fetch_assoc()) {
        $data[] = $row;
    }
    echo json_encode($data);
}
else {
    echo json_encode(["status" => "error", "reason" => "unknown action"]);
}

$db->close();
