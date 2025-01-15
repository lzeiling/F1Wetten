<?php
require_once 'vendor/autoload.php'; // Google API-Client laden

// Datenbankverbindungsdetails
$host = 'db5016947436.hosting-data.io';
$dbname = 'dbs13663781';
$username = 'dbu2703977';
$password = fgets(fopen("../pw.txt", "r")); // Passwort aus Datei lesen

// Google-Client-ID (von Google Cloud Console)
$googleClientId = '616726250308-1kqo663kkqup7shimcr41re03hqif15o.apps.googleusercontent.com';

// Funktion zur Überprüfung des Google-Tokens
function verifyGoogleToken($idToken, $googleClientId) {
    $client = new Google_Client(['client_id' => $googleClientId]);
    try {
        $payload = $client->verifyIdToken($idToken);
        if ($payload) {
            return $payload; // Enthält die Nutzerinformationen
        } else {
            return null; // Token ungültig
        }
    } catch (Exception $e) {
        error_log('Token-Fehler: ' . $e->getMessage());
        return null;
    }
}

// Verbindung zur Datenbank herstellen
function connectToDatabase($host, $dbname, $username, $password) {
    try {
        $pdo = new PDO("mysql:host=$host;dbname=$dbname;charset=utf8mb4", $username, $password);
        $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
        return $pdo;
    } catch (PDOException $e) {
        die('Datenbankverbindung fehlgeschlagen: ' . $e->getMessage());
    }
}

// Nutzerdaten speichern oder aktualisieren
function saveUser($pdo, $googleId, $name) {
    $sql = "INSERT INTO users (googleId, name) VALUES (:googleId, :name)
            ON DUPLICATE KEY UPDATE name = :name";
    $stmt = $pdo->prepare($sql);
    $stmt->execute(['googleId' => $googleId, 'name' => $name]);
}

// Hauptlogik
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $idToken = $_POST['token'] ?? null;

    if (!$idToken) {
        http_response_code(400);
        echo json_encode(['error' => 'Token fehlt']);
        exit;
    }

    // Token überprüfen
    $payload = verifyGoogleToken($idToken, $googleClientId);

    if ($payload) {
        $googleId = $payload['sub']; // Google-ID
        $name = $payload['name']; // Nutzername

        // Nutzer speichern
        $pdo = connectToDatabase($host, $dbname, $username, $password);
        saveUser($pdo, $googleId, $name);

        echo json_encode(['message' => 'Login erfolgreich', 'user' => ['googleId' => $googleId, 'name' => $name]]);
    } else {
        http_response_code(401);
        echo json_encode(['error' => 'Ungültiges Token']);
    }
}
?>
