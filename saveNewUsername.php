<?php

ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);
ini_set('log_errors', 1);
ini_set('error_log', __DIR__ . '/php-error.log');

header('Content-Type: application/json');

// Datenbankverbindungsdetails
$host = 'db5016947436.hosting-data.io';
$dbname = 'dbs13663781';
$username = 'dbu2703977';

// Passwort aus Datei lesen
$pwFile = fopen("../pw.txt", "r");
if (!$pwFile) {
    http_response_code(500);
    echo json_encode(['error' => 'Passwortdatei konnte nicht geöffnet werden.']);
    exit();
}
$password = trim(fgets($pwFile));
fclose($pwFile);

// Verbindung zur Datenbank herstellen
try {
    $pdo = new PDO("mysql:host=$host;dbname=$dbname;charset=utf8mb4", $username, $password);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
} catch (PDOException $e) {
    error_log("DB-Fehler: " . $e->getMessage());
    http_response_code(500);
    echo json_encode(['error' => 'Verbindung zur Datenbank fehlgeschlagen.']);
    exit();
}

try {
    // JSON-Daten aus der Anfrage abrufen
    $json = file_get_contents('php://input');
    if (!$json) {
        http_response_code(400);
        echo json_encode(['error' => 'Leere Anfrage erhalten.']);
        exit();
    }

    $data = json_decode($json, true);
    if ($data === null && json_last_error() !== JSON_ERROR_NONE) {
        http_response_code(400);
        echo json_encode(['error' => 'Ungültige JSON-Daten.']);
        exit();
    }

    // Überprüfen, ob alle notwendigen Daten vorhanden sind
    if (isset($data['newUsername']) && isset($data['userSub'])) {
        // SQL-Abfrage: Update des Benutzernamens
        try {
            $stmt = $pdo->prepare("UPDATE user SET nickname = :newUsername WHERE sub = :userSub");
            $stmt->execute([
                ':newUsername' => $data['newUsername'],
                ':userSub' => $data['userSub'],
            ]);

            error_log("SQL-Debug: newUsername=" . $data['newUsername'] . ", userSub=" . $data['userSub']);

            if ($stmt->rowCount() === 0) {
                echo json_encode(['error' => 'Kein Eintrag mit dieser userSub gefunden.']);
                exit();
            }

            echo json_encode(['success' => 'Nutzername erfolgreich aktualisiert.']);
        } catch (PDOException $e) {
            error_log("SQL-Fehler: " . $e->getMessage());
            http_response_code(500);
            echo json_encode(['error' => 'Fehler beim Speichern der Daten: ' . $e->getMessage()]);
        }

    } else {
        http_response_code(400);
        echo json_encode(['error' => 'Ungültige Eingabedaten.']);
    }
} catch (Exception $e) {
    error_log("Fehler: " . $e->getMessage());
    http_response_code(500);
    echo json_encode(['error' => 'Ein unbekannter Fehler ist aufgetreten.']);
}

?>
