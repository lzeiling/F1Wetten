<?php
require 'vendor/autoload.php';  // Stelle sicher, dass der Autoloader geladen wird

use Google\Client;
use Google\Service\OAuth2;

if ($_SERVER['REQUEST_METHOD'] == 'POST') {
    // Google ID-Token vom Frontend erhalten (angenommen, es wird im POST-Request übermittelt)
    $idToken = $_POST['id_token'];  // Hier wird der ID-Token aus dem POST-Body abgerufen

    // Google Client erstellen
    $client = new Google_Client(['client_id' => '616726250308-1kqo663kkqup7shimcr41re03hqif15o.apps.googleusercontent.com']);  // Ersetze mit deiner Google Client ID
    $client->setAuthConfig('path_to_your_credentials.json'); // Optional, falls du ein Service Account verwendest
    $client->setAccessType('offline');

    // Token-Überprüfung
    $payload = $client->verifyIdToken($idToken);

    if ($payload) {
        // Token erfolgreich verifiziert
        $userId = $payload['sub'];  // Die Google-ID des Benutzers
        $userEmail = $payload['email']; // Die E-Mail des Benutzers (optional)

        // Hier kannst du den Benutzer in deiner Datenbank suchen oder die Session setzen
        echo "Token verifiziert! Benutzer-ID: " . $userId;
    } else {
        // Token ungültig
        echo "Ungültiger Token.";
    }
} else {
    echo "Ungültige Anfrage.";
}
