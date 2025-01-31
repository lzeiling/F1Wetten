<?php
ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);

require_once '../../vendor/autoload.php';

use Google\Client;

$client = new Client();
$client->setAuthConfig('client_secret.json');

try {
    // JSON-Daten empfangen
    $data = json_decode(file_get_contents('php://input'), true);
    if (!isset($data['token'])) {
        throw new Exception("Token fehlt!");
    }

    // Das Token aus den JSON-Daten extrahieren
    $token = $data['token'];

    // ID-Token verifizieren
    $payload = $client->verifyIdToken($token);

    if (!$payload) {
        throw new Exception("Ungültiges ID-Token!");
    }

    // Erfolgreiche Anmeldung
    echo json_encode([
        'success' => true,
        'email' => htmlspecialchars($payload['email']) // Gebe die E-Mail-Adresse des Benutzers aus
    ]);
} catch (Exception $e) {
    // Fehlerbehandlung
    http_response_code(500); // Interner Serverfehler
    echo json_encode([
        'success' => false,
        'error' => $e->getMessage() // Fehlernachricht zurückgeben
    ]);
}
?>
