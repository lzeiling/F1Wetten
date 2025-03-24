<?php
session_start(); // Session starten

ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);

header('Content-Type: application/json'); // JSON-Header setzen

require_once '../../vendor/autoload.php';

use Google\Client;

// Google-Client initialisieren
$client = new Client();
$client->setAuthConfig('client_secret.json');

try {
    // JSON-Daten empfangen
    $data = json_decode(file_get_contents('php://input'), true);
    if (!isset($data['token'])) {
        throw new Exception("Token fehlt!");
    }

    // ID-Token verifizieren
    $payload = $client->verifyIdToken($data['token']);
    if (!$payload) {
        throw new Exception("Ungültiges ID-Token!");
    }

    // Nutzer-Session setzen
    $_SESSION['user_sub'] = $payload['sub'];
    $email = $payload['email'] ?? null; // Falls vorhanden

    // Datenbankverbindungsdetails
    $host = 'db5016947436.hosting-data.io';
    $dbname = 'dbs13663781';
    $dbUsername = 'dbu2703977';


    // Passwort sicher aus Datei lesen
    $pw_file_path = realpath(__DIR__ . "/../../pw.txt");
    if (!$pw_file_path || !is_readable($pw_file_path)) {
        throw new Exception("Passwortdatei konnte nicht gelesen werden!");
    }

    $password = trim(file_get_contents($pw_file_path));

    // Verbindung zur Datenbank herstellen
    $pdo = new PDO("mysql:host=$host;dbname=$dbname;charset=utf8mb4", $dbUsername, $password, [
        PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
        PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC
    ]);

    // Nutzer in die Datenbank einfügen oder Email aktualisieren
    $sql = "INSERT INTO users (sub, email) VALUES (:sub, :email)
            ON DUPLICATE KEY UPDATE email = VALUES(email)";
    $stmt = $pdo->prepare($sql);
    $stmt->execute([
        ':sub' => $_SESSION['user_sub'],
        ':email' => $email
    ]);

    // Nutzername aus der Datenbank abrufen
    $sql = "SELECT nickname FROM users WHERE sub = :sub";
    $stmt = $pdo->prepare($sql);
    $stmt->execute([':sub' => $_SESSION['user_sub']]);

    // Daten abrufen
    $userData = $stmt->fetch(PDO::FETCH_ASSOC);
    $username = $userData['nickname'] ?? null; // 'nickname' aus der Datenbank holen

    // Erfolgreiche Anmeldung zurückgeben
    echo json_encode([
        'success' => true,
        'sub' => $_SESSION['user_sub'],
        'username' => $username,
        'email' => $email
    ]);

} catch (Exception $e) {
    error_log("Fehler: " . $e->getMessage());
    http_response_code(400);
    echo json_encode(['success' => false, 'error' => $e->getMessage()]);
    exit();
}