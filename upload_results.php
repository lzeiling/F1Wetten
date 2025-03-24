<?php
header("Content-Type: application/json");

error_reporting(E_ALL);
ini_set('display_errors', 1);

// MariaDB-Verbindungsdaten (anpassen)
$host = 'db5016947436.hosting-data.io';
$username = 'dbu2703977';
$dbname = 'dbs13663781';
$passwordFile = "../pw.txt";

// Passwort aus Datei lesen
if (!file_exists($passwordFile)) {
    http_response_code(500);
    echo json_encode(['error' => 'Passwortdatei nicht gefunden.']);
    exit();
}
$password = trim(file_get_contents($passwordFile)); // Passwort aus Datei lesen und Leerzeichen entfernen
if (empty($password)) {
    http_response_code(500);
    echo json_encode(['error' => 'Fehler beim Lesen der Passwortdatei.']);
    exit();
}

try {
    $pdo = new PDO("mysql:host=$host;dbname=$dbname;charset=utf8mb4", $username, $password);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
} catch (PDOException $e) {
    error_log("DB-Fehler: " . $e->getMessage());
    http_response_code(500);
    echo json_encode(['error' => 'Verbindung zur Datenbank fehlgeschlagen.']);
    exit();
}

// JSON-Daten empfangen und dekodieren
$data = json_decode(file_get_contents("php://input"), true);

if (!$data) {
    echo json_encode(['error' => 'Keine Daten empfangen.']);
    exit();
}

// Daten in die Datenbank einfügen
try {
    $sql = "INSERT INTO raceResults (driverNum, raceNum, finishPosition, dnfFirst) VALUES (:driverNum, :raceNum, :finishPosition, :dnfFirst)";
    $stmt = $pdo->prepare($sql);

    foreach ($data as $row) {
        if (!isset($row["raceNum"]) || !isset($row["driverNum"]) || !isset($row["dnfFirst"])) {
            continue;
        }

        $raceNum = (int)$row["raceNum"];
        $driverNum = isset($row["driverNum"]) ? (int)$row["driverNum"] : null;
        $dnfFirst = (int)$row["dnfFirst"];
        $finishPosition = (int)$row["finishPosition"];

        if ($driverNum === null) {
            continue;
        }

        $stmt->execute([
            ':driverNum' => $driverNum,
            ':raceNum' => $raceNum,
            ':finishPosition' => $finishPosition,
            ':dnfFirst' => $dnfFirst
        ]);
    }

    echo json_encode(['success' => true, 'message' => 'Daten erfolgreich gespeichert']);
} catch (PDOException $e) {
    error_log("SQL-Fehler: " . $e->getMessage());
    http_response_code(500);
    echo json_encode(['error' => 'Fehler bei der Datenbankabfrage: ' . $e->getMessage()]);
}
?>