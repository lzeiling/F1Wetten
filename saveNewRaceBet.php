<?php

header('Content-Type: application/json');

// Datenbankverbindungsdetails
$host = 'db5016947436.hosting-data.io';
$dbname = 'dbs13663781';
$username = 'dbu2703977';
$password = fgets(fopen("../pw.txt", "r")); // Passwort aus Datei lesen

// Verbindung zur Datenbank herstellen
try {
    $pdo = new PDO("mysql:host=$host;dbname=$dbname;charset=utf8mb4", $username, $password);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(['error' => 'Verbindung zur Datenbank fehlgeschlagen: ' . $e->getMessage()]);
    exit();
}

// JSON-Daten aus der Anfrage abrufen
$data = json_decode(file_get_contents('php://input'), true);

// Überprüfen, ob alle notwendigen Daten vorhanden sind
if (isset($data['raceNum'], $data['winnerNum'], $data['tenthNum'], $data['firstDnfNum'], $data['gamblerId'])) {
    // SQL-Abfrage: Einfügen oder Aktualisieren
    $sql = "INSERT INTO raceBet (raceNum, winnerNum, tenthNum, firstDnfNum, gamblerId)
            VALUES (:raceNum, :winnerNum, :tenthNum, :firstDnfNum, :gamblerId)
            ON DUPLICATE KEY UPDATE
                winnerNum = VALUES(winnerNum),
                tenthNum = VALUES(tenthNum),
                firstDnfNum = VALUES(firstDnfNum)";

    try {
        $stmt = $pdo->prepare($sql);
        $stmt->execute([
            ':raceNum' => $data['raceNum'],
            ':winnerNum' => $data['winnerNum'],
            ':tenthNum' => $data['tenthNum'],
            ':firstDnfNum' => $data['firstDnfNum'],
            ':gamblerId' => $data['gamblerId']
        ]);
        echo json_encode(['success' => 'Daten erfolgreich eingefügt oder aktualisiert.']);
    } catch (PDOException $e) {
        http_response_code(500);
        echo json_encode(['error' => 'Fehler beim Speichern der Daten: ' . $e->getMessage()]);
    }
} else {
    http_response_code(400);
    echo json_encode(['error' => 'Ungültige Eingabedaten.']);
}
?>
