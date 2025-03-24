import csv
import json
import re
import requests

# Mapping Fahrername → Nummer
DRIVER_MAPPING = {
    "Max Verstappen": 1, "Liam Lawson": 30, "Oscar Piastri": 81, "Lando Norris": 4,
    "Charles Leclerc": 16, "Lewis Hamilton": 44, "George Russell": 63, "Valtteri Bottas": 77,
    "Andrea Kimi Antonelli": 12, "Lance Stroll": 18, "Fernando Alonso": 14, "Pierre Gasly": 10,
    "Paul Aron": 7, "Jack Doohan": 26, "Esteban Ocon": 31, "Oliver Bearman": 87,
    "Isack Hadjar": 6, "Yuki Tsunoda": 22, "Alexander Albon": 23, "Carlos Sainz Jr.": 55,
    "Nico Hülkenberg": 27, "Gabriel Bortoleto": 5
}

# URL des Servers (anpassen)
SERVER_URL = "https://f1wetten.com/upload_results.php"

def get_driver_number(name):
    """Gibt die Fahrernummer zurück oder None, falls nicht gefunden."""
    return DRIVER_MAPPING.get(name, None)

def extract_race_number(filename):
    """Extrahiert die Rennnummer aus dem Dateinamen, z. B. 'RaceResults1.csv' → 1."""
    match = re.search(r"RaceResults(\d+)", filename)
    return int(match.group(1)) if match else None

def read_csv(filename):
    """Liest die CSV-Datei und wandelt sie in eine Liste von Dictionaries um."""
    race_num = extract_race_number(filename)
    if race_num is None:
        print("Fehler: Rennnummer konnte nicht aus dem Dateinamen extrahiert werden.")
        return []

    results = []
    dnf_driver = None  # DNF-Fahrer initialisieren

    with open(filename, newline='', encoding='utf-8') as csvfile:
        reader = csv.reader(csvfile, delimiter=';')
        finish_position = 1

        for row in reader:
            if len(row) != 2:
                continue  # Überspringt fehlerhafte Zeilen

            position, name = row
            driver_num = get_driver_number(name.strip())

            if driver_num is None:
                print(f"Warnung: Fahrer '{name}' nicht gefunden.")
                continue

            if position == "DNF":
                dnf_driver = driver_num  # Setze den DNF-Fahrer, wenn dieser in der CSV steht
                continue  # DNF-Fahrer werden nicht in den Finish-Positionen aufgenommen

            results.append({
                "driverNum": driver_num,
                "raceNum": race_num,
                "finishPosition": finish_position,
                "dnfFirst": 1 if driver_num == dnf_driver else 0
            })
            finish_position += 1

    # Wenn kein DNF-Fahrer vorhanden, setzen wir "dnfFirst" für alle auf 0
    if dnf_driver is None:
        for result in results:
            result["dnfFirst"] = 0

    return results

def send_data(data):
    """Sendet die Renndaten per POST-Request an den Server."""
    if not data:
        print("Keine Daten zum Senden.")
        return

    headers = {"Content-Type": "application/json"}
    response = requests.post(SERVER_URL, data=json.dumps(data), headers=headers)

    print("Antwort vom Server:", response.status_code, response.text)
# CSV-Datei einlesen & senden
filename = "RaceResults2.CSV"  # Anpassen oder per Argument übergeben
data = read_csv(filename)
print("Sende folgende Daten:", json.dumps(data, indent=4))
send_data(data)
