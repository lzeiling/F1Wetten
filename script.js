import OAuth2Client from 'google-auth-library';
const client = new OAuth2Client('616726250308-1kqo663kkqup7shimcr41re03hqif15o.apps.googleusercontent.com');

let chooseRaceDiv;
let selectBetRaceWinner;
let selectBetP10;
let selectBetFirstDnf;
let raceList = [];
let driverList = [];
let currentDate = new Date(); // Erzeugt ein Date-Objekt


document.addEventListener("DOMContentLoaded", function () {
    chooseRaceDiv = document.getElementById("chooseRaceDiv");
    selectBetRaceWinner = document.getElementById("betRaceWinner");
    selectBetP10 = document.getElementById("betP10");
    selectBetFirstDnf = document.getElementById("betFirstDnf");

    loadRaceList();
    loadDriverList();
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
            //console.log("Race list loaded:", data);
            // Verarbeite hier die geladene Race-Liste
            raceList = data;
            displayRaces();
            preSelectUpcomingRace();
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
            //console.log("Driver list loaded:", data);
            // Verarbeite hier die geladene Race-Liste
            driverList = data;
            fillDropdowns();
        })
        .catch(error => {
            console.error("Fehler beim Laden der raceList.json:", error);
        });
}

function displayRaces() {
    raceList.races.forEach(race => {
        // Durch Objekt iterieren

        const raceSelectionDiv = document.createElement("div");
        raceSelectionDiv.className = "chooseRaceBtn";
        //raceTd HTML Element erstellen

        const input = document.createElement("input");
        input.type = "radio";
        input.name = "chosenRace"; // Gruppe für Rennen-Auswahl
        input.value = race.number; // race.id wird für den Wert verwendet
        input.id = "chosenRaceRadio" + race.number;   // ID für das Rennen

        const label = document.createElement("label");
        label.setAttribute("for", "chosenRaceRadio" + race.number); // Verknüpfe Label mit der Input-ID

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
            //console.log(driver.name);
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
    //console.log(`Radio-Button mit Wert "${radioButton.value}" wurde gewählt.`);
    //console.log(raceList.races[radioButton.value - 1].country);
    let raceDayDate = new Date(raceList.races[radioButton.value - 1].endDate);

    document.getElementById('raceCountry').innerText = raceList.races[radioButton.value - 1].country;
    document.getElementById('raceDayDate').innerText = raceDayDate.toLocaleDateString("de-DE");
    document.getElementById('raceStartTime').innerText = raceList.races[radioButton.value - 1].start_time + " Uhr in Österreich";
    document.getElementById('locationName').innerText = raceList.races[radioButton.value - 1].location;
    document.getElementById('trackName').innerText = raceList.races[radioButton.value - 1].circuit;
    document.getElementById('trackLength').innerText = "Strecken Länge: " + raceList.races[radioButton.value - 1].length_km + " km";
}

function preSelectUpcomingRace() {
    let racesInPast = 1;
    raceList.races.forEach(race => {
        // Durch Objekt iterieren
        if (new Date(new Date(race.endDate).setHours(24, 0, 0, 0)) <= currentDate) {
            racesInPast++;
        }
    });

    //Radiobutton des aktuellen Rennen auswählen
    let radioToSelect = document.getElementById('chosenRaceRadio' + racesInPast);
    radioToSelect.click();
    handleRadioClick(radioToSelect);
    console.log("automatically changed selected Race");
}

function collectBetData() {
    const data = {
        raceNum: document.querySelector('input[name="chosenRace"]:checked').value,
        winnerNum: selectBetRaceWinner.value,
        tenthNum: selectBetP10.value,
        firstDnfNum: selectBetFirstDnf.value,
        gamblerId: 12
    };
    console.log(data);
    console.log(JSON.stringify(data));
    sendRaceBetData(data);
}

function sendRaceBetData(data) {
    fetch('saveNewRaceBet.php', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
    })
        .then(response => {
            if (!response.ok) {
                throw new Error('Fehler beim Speichern der Daten.');
            }
            return response.json();
        })
        .then(result => {
            console.log('Daten erfolgreich gespeichert:', result);
        })
        .catch(error => {
            console.error('Fehler:', error);
        });
}


//Google Login
async function verifyToken(idToken) {
    const ticket = await client.verifyIdToken({
        idToken: idToken,
        audience: '616726250308-1kqo663kkqup7shimcr41re03hqif15o.apps.googleusercontent.com',
    });
    const payload = ticket.getPayload();
    return payload; // Enthält User-Infos wie Name, Email, etc.
}

//Route für Google Login
app.post('/auth/callback', async (req, res) => {
    const { token } = req.body;
    try {
        const userData = await verifyToken(token);
        // Nutzer in der Datenbank speichern oder Session erstellen
        res.send(userData);
    } catch (error) {
        res.status(400).send('Ungültiges Token');
    }
});