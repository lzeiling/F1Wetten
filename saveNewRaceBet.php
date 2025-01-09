<?php
// Datenbankverbindungsdetails
$host = 'db5016947436.hosting-data.io'; // Ersetze durch deinen Host
$dbname = 'dbs13663781'; // Name der Datenbank
$username = 'dbu2703977'; // Datenbank-Benutzername
$password = fgets(fopen("pw.txt", "r"));// Datenbank-Passwort aus file einlesen
echo $firstLine;;

// Verbindung zur MariaDB herstellen
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
    // SQL-Abfrage zum Einfügen der Daten
    $sql = "INSERT INTO RaceResults (raceNum, winnerNum, tenthNum, firstDnfNum, gamblerId)
            VALUES (:raceNum, :winnerNum, :tenthNum, :firstDnfNum, :gamblerId)";

    try {
        $stmt = $pdo->prepare($sql);
        $stmt->execute([
            ':raceNum' => $data['raceNum'],
            ':winnerNum' => $data['winnerNum'],
            ':tenthNum' => $data['tenthNum'],
            ':firstDnfNum' => $data['firstDnfNum'],
            ':gamblerId' => $data['gamblerId']
        ]);
        echo json_encode(['success' => 'Daten erfolgreich gespeichert.']);
    } catch (PDOException $e) {
        http_response_code(500);
        echo json_encode(['error' => 'Fehler beim Speichern der Daten: ' . $e->getMessage()]);
    }
} else {
    http_response_code(400);
    echo json_encode(['error' => 'Ungültige Eingabedaten.']);
}
?>
