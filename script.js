let chooseRaceDiv;
let selectBetRaceWinner;
let selectBetP10;
let selectBetFirstDnf;
let raceList = [];
let driverList = [];

document.addEventListener("DOMContentLoaded", function () {
    loadRaceList();
    loadDriverList();

    chooseRaceDiv = document.getElementById("chooseRaceDiv");
    selectBetRaceWinner = document.getElementById("betRaceWinner");
    selectBetP10 = document.getElementById("betP10");
    selectBetFirstDnf = document.getElementById("betFirstDnf");
});



function loadRaceList() {
    fetch('assets/raceList.json') // Pfad zur Datei
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP-Fehler! Status: ${response.status}`);
            }
            return response.json();
        })
        .then(data => {
            console.log("Race list loaded:", data);
            // Verarbeite hier die geladene Race-Liste
            raceList=data;
            displayRaces();
            addRadioClickListeners();
        })
        .catch(error => {
            console.error("Fehler beim Laden der raceList.json:", error);
        });
}

function loadDriverList() {
    fetch('assets/driverList.json') // Pfad zur Datei
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP-Fehler! Status: ${response.status}`);
            }
            return response.json();
        })
        .then(data => {
            console.log("Driver list loaded:", data);
            // Verarbeite hier die geladene Race-Liste
            driverList=data;
            fillDropdowns();
        })
        .catch(error => {
            console.error("Fehler beim Laden der raceList.json:", error);
        });
}

function displayRaces(){
    raceList.races.forEach(race => {
        // Durch Objekt iterieren

        const raceSelectionDiv = document.createElement("div");
        raceSelectionDiv.className = "chooseRaceBtn";
        //raceTd HTML Element erstellen

        const input = document.createElement("input");
        input.type = "radio";
        input.name = "chosenRace"; // Gruppe für Rennen-Auswahl
        input.value = race.number; // race.id wird für den Wert verwendet
        input.id = race.number;   // ID für das Rennen

        const label = document.createElement("label");
        label.setAttribute("for", race.number); // Verknüpfe Label mit der Input-ID

        const img = document.createElement("img");
        img.src = "assets/graphics/flag-icons/" + race.country_imgPath.toLowerCase() + ".svg"; // Annahme: `race.flagIcon` enthält den Pfad zur Flaggen-Grafik des Rennens
        img.alt = race.location;     // Annahme: `race.name` beschreibt den Namen des Rennens

        label.appendChild(img);  // img zu einem Bestandteil des labels machen

        raceSelectionDiv.appendChild(input);
        raceSelectionDiv.appendChild(label);

        chooseRaceDiv.appendChild(raceSelectionDiv);
    });
}

function fillDropdowns() {
    driverList.teams.forEach(team => {
        team.drivers.forEach(driver => {
            console.log(driver.name);
            selectBetRaceWinner.appendChild(new Option(driver.name + " " + driver.number, driver.number));
            selectBetP10.appendChild(new Option(driver.name + " " + driver.number, driver.number));
            selectBetFirstDnf.appendChild(new Option(driver.name + " " + driver.number, driver.number));
        })
    })
}

function addRadioClickListeners() {
    // Alle Radio-Buttons auswählen
    const radioButtons = document.querySelectorAll('input[type="radio"]');

    // Event-Listener für jeden Radio-Button hinzufügen
    radioButtons.forEach(radio => {
        radio.addEventListener("change", function (event) {
            // Aufruf der Funktion bei Klick
            handleRadioClick(event.target);
        });
    });
}

// Funktion, die bei jedem Klick auf einen Radiobutton ausgeführt wird
function handleRadioClick(radioButton) {
    console.log(`Radio-Button mit Wert "${radioButton.value}" wurde gewählt.`);
    console.log(raceList.races[radioButton.value-1].country);
    document.getElementById('raceCountry').innerText = raceList.races[radioButton.value-1].country;
    document.getElementById('raceDayDate').innerText = raceList.races[radioButton.value-1].endDate;
    document.getElementById('raceStartTime').innerText = raceList.races[radioButton.value-1].start_time + " Uhr in Österreich";
    document.getElementById('locationName').innerText = raceList.races[radioButton.value-1].location;
    document.getElementById('trackName').innerText = raceList.races[radioButton.value-1].circuit;
    document.getElementById('trackLength').innerText = "Strecken Länge: " + raceList.races[radioButton.value-1].length_km + " km";
}