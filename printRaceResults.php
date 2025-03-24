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
$passwordFile = "../pw.txt";

$raceNumber = isset($_GET['raceNumber']) ? (int)$_GET['raceNumber'] : 1; // Standardwert 1

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

if($raceNumber >= 0){
    // SQL-Abfrage ausführen
    try {
        $sql = "
            SELECT winnerNum, tenthNum, firstDnfNum, users.nickname
            FROM raceBet
            INNER JOIN users ON raceBet.gamblerSub = users.sub
            WHERE raceBet.raceNum = " . $raceNumber . ";
        ";

        $stmt = $pdo->prepare($sql);
        $stmt->execute();

        // Ergebnisse abrufen
        $betResults = $stmt->fetchAll(PDO::FETCH_ASSOC);

        if (empty($betResults)) {
            echo json_encode(['message' => 'Keine Wettergebnisse für dieses Rennen gefunden.']);
            exit();
        }

        // Ergebnisse als JSON zurückgeben
        //echo json_encode(['success' => true, 'data' => $betResults]);
    } catch (PDOException $e) {
        error_log("SQL-Fehler: " . $e->getMessage());
        http_response_code(500);
        echo json_encode(['error' => 'Fehler bei der Datenbankabfrage: ' . $e->getMessage()]);
    }


/*
    // API aufrufen
    try {
        // API-URL
        $apiUrl = "https://ergast.com/api/f1/2025/" . $raceNumber . "/results/";


        $response = file_get_contents($apiUrl);
        if ($response === false) {
            throw new Exception("Fehler beim Abrufen der API-Daten.");
        }

        // API-Antwort (XML) in ein Objekt umwandeln
        $xml = simplexml_load_string($response);
        if ($xml === false) {
            throw new Exception("Fehler beim Parsen der API-Antwort.");
        }

        // Array zum Speichern der Endpositionen
        $raceResults = [];

        if($xml->RaceTable){

        }
        // Ergebnisse verarbeiten
        if (!empty($xml->RaceTable->Race->ResultsList->Result)) {
            foreach ($xml->RaceTable->Race->ResultsList->Result as $result) {
                // Fahrernummer (permanentNumber) extrahieren
                $driverNumber = isset($result->Driver->PermanentNumber) ? (int)$result->Driver->PermanentNumber : 0;
                $position = isset($result['position']) ? (int)$result['position'] : 0;

                if ($driverNumber == 33) {
                    $driverNumber = 1;  // Max Verstappen DriverNumber changed to 1
                }

                // Endposition unter der Fahrernummer speichern
                $raceResults[$position] = $driverNumber;
            }
        }


    } catch (Exception $e) {
        error_log("API-Fehler: " . $e->getMessage());
        http_response_code(500);
        echo json_encode(['error' => 'Fehler beim Abrufen oder Verarbeiten der API-Daten: ' . $e->getMessage()]);
    }
    // Ergebnisse als JSON zurückgeben
    echo json_encode(['success' => true, 'raceResults' => $raceResults, 'betResults' => $betResults]);
    */
    try {
            $sql = "SELECT `driverNum`,`finishPosition`,`dnfFirst` FROM `raceResults` WHERE raceNum =" . $raceNumber ." ORDER BY `raceResults`.`finishPosition` ASC";

            $stmt = $pdo->prepare($sql);
            $stmt->execute();

            // Ergebnisse abrufen
            $raceResults = $stmt->fetchAll(PDO::FETCH_ASSOC);

            if (empty($raceResults)) {
                echo json_encode(['message' => 'Keine Rennergebnisse für dieses Rennen gefunden.']);
                exit();
            }

            // Ergebnisse als JSON zurückgeben
            //echo json_encode(['success' => true, 'data' => $raceResults]);
        } catch (PDOException $e) {
            error_log("SQL-Fehler: " . $e->getMessage());
            http_response_code(500);
            echo json_encode(['error' => 'Fehler bei der Datenbankabfrage: ' . $e->getMessage()]);
        }

        echo json_encode(['success' => true, 'raceResults' => $raceResults, 'betResults' => $betResults]);
}else{
    //Gesamtwertung erstellen

}
?>