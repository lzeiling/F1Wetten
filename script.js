let chooseRaceDivDesktop;
let chooseRaceDivMobile;
let chooseRaceDivMobileContent;
let selectBetRaceWinner;
let selectBetP10;
let selectBetFirstDnf;
let evaluationRaceSelect;
let raceList = [];
let driverList = [];
let currentDate = new Date(); // Erzeugt ein Date-Objekt
let userName = "";
let userEmail = "";
let userSub = "";

let pointDistribution = [25, 18, 15, 12, 10, 8, 6, 4, 2, 1];

document.addEventListener("DOMContentLoaded", function () {
    // Eigenen Button auswählen
    const customLoginButton = document.getElementById("customGoogleLoginButton");
    console.log(pointDistribution);
    // Event-Listener für den Klick hinzufügen
    customLoginButton.addEventListener("click", function () {
        // Google-Login-Prozess starten
        google.accounts.id.prompt();
    });

    chooseRaceDivDesktop = document.getElementById("chooseRaceDivDesktop");
    chooseRaceDivMobile = document.getElementById("chooseRaceDivMobile");
    chooseRaceDivMobileContent = document.getElementById("chooseRaceDivMobileContent");
    selectBetRaceWinner = document.getElementById("betRaceWinner");
    selectBetP10 = document.getElementById("betP10");
    selectBetFirstDnf = document.getElementById("betFirstDnf");
    evaluationRaceSelect = document.getElementById("evaluationRaceSelect");


    loadRaceList();
    loadDriverList();
    displayEvaluationData("wholeSeason");   //Benötigt da es nur "onchange" aufgerufen wird
});

// Rest deines Codes bleibt unverändert

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

        const chooseRaceBtn = document.createElement("div");
        chooseRaceBtn.className = "chooseRaceBtn";
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

        chooseRaceBtn.appendChild(input);
        chooseRaceBtn.appendChild(label);
        chooseRaceBtn.setAttribute("data-radio-id", "chosenRaceRadio" + race.number);

        //Fill Dropdown for evaluation Selection
        const evaluationRaceSelectOption = document.createElement("option");
        evaluationRaceSelectOption.value = race.number;
        evaluationRaceSelectOption.innerHTML = race.location;
        evaluationRaceSelect.appendChild(evaluationRaceSelectOption);


        if (screen.width < 768) {
            const p = document.createElement("p");
            p.textContent = race.location;
            chooseRaceBtn.appendChild(p);


            chooseRaceDivMobileContent.appendChild(chooseRaceBtn);
        } else {
            chooseRaceDivDesktop.appendChild(chooseRaceBtn);
        }

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

function getEvaluationData(selectedRace){
    if (selectedRace !== "wholeSeason") {
        var betResult;
        var raceResult;

        fetch('printRaceResults.php?raceNumber=' + selectedRace)
            .then(response => {
                if (!response.ok) {
                    throw new Error('Fehler beim Laden der Daten.');
                }
                return response.json();
            })
            .then(result => {
                betResult = result.betResults;
                raceResult = result.raceResults;
                console.log('Daten:', betResult);
                console.log('Daten:', raceResult);

                if (result.betResults === undefined) {
                    alert(result.message);
                } else {
                    displayEvaluationData(betResult, raceResult, selectedRace);
                }
            })
            .catch(error => {
                console.error('Fehler:', error);
            });
    }
}

function displayEvaluationData(betResult, raceResult, selectedRace) {
    const evaluationRaceResultDiv = document.getElementById("evaluationRaceResultDiv");
    const evaluationBetResultDiv = document.getElementById("evaluationBetResultDiv");



    if (selectedRace !== "wholeSeason") {
        evaluationRaceResultDiv.style.display = "table";
        evaluationBetResultDiv.style.display = "table";

        evaluationRaceResultDiv.innerHTML = "<tr>\n" +
            "<th>Position</th>\n" +
            "<th>Fahrer</th>\n" +
            "</tr>";

        evaluationBetResultDiv.innerHTML = "<tr>\n" +
            "<th>Spieler</th>\n" +
            "<th>Tipp DNF</th>\n" +
            "<th>Tipp 10ter</th>\n" +
            "<th>Tipp Sieger</th>\n" +
            "<th>Punkte</th>\n" +
            "</tr>";

        calculatePoints(betResult[0].firstDnfNum, betResult[0].tenthNum, raceResult);
        displayRaceResultTable(evaluationRaceResultDiv, raceResult);
        displayBetResultTable(evaluationBetResultDiv, raceResult, betResult);
    } else {
        evaluationRaceResultDiv.style.display = "none";
        evaluationBetResultDiv.style.display = "none";
    }
}

function displayRaceResultTable(evaluationRaceResultDiv, raceResult) {
    for (let key in raceResult) {
    const evaluationRaceResultTd1 = document.createElement("td");
    const evaluationRaceResultTd2 = document.createElement("td");

    evaluationRaceResultTd1.innerHTML = key + ".";
    evaluationRaceResultTd2.innerHTML = findDriverNameByNumber(raceResult[key]);

    let evaluationRaceResultTr = document.createElement("tr");
    evaluationRaceResultTr.appendChild(evaluationRaceResultTd1);
    evaluationRaceResultTr.appendChild(evaluationRaceResultTd2);
    evaluationRaceResultDiv.appendChild(evaluationRaceResultTr);
    }
}

function displayBetResultTable(evaluationBetResultDiv, raceResult, betResult) {

    for (let key in betResult) {
        let evaluationBetResultTdPlayer = document.createElement("td");
        let evaluationBetResultTdDNF = document.createElement("td");
        let evaluationBetResultTd10th = document.createElement("td");
        let evaluationBetResultTdWinner = document.createElement("td");
        let evaluationBetResultTdPoints = document.createElement("td");

        let points = 0;
        //console.log(key);
        //console.log(betResult[key]);
        points = calculatePoints(betResult[key].firstDnfNum, betResult[key].tenthNum, raceResult);

        evaluationBetResultTdPlayer.innerHTML = betResult[key].nickname;
        evaluationBetResultTdDNF.innerHTML = betResult[key].firstDnfNum;
        evaluationBetResultTd10th.innerHTML = betResult[key].tenthNum;
        evaluationBetResultTdWinner.innerHTML = betResult[key].winnerNum;
        evaluationBetResultTdPoints.innerHTML = points;

        let evaluationBetResultTr = document.createElement("tr");
        evaluationBetResultTr.appendChild(evaluationBetResultTdPlayer);
        evaluationBetResultTr.appendChild(evaluationBetResultTdDNF);
        evaluationBetResultTr.appendChild(evaluationBetResultTd10th);
        evaluationBetResultTr.appendChild(evaluationBetResultTdWinner);
        evaluationBetResultTr.appendChild(evaluationBetResultTdPoints);

        evaluationBetResultDiv.appendChild(evaluationBetResultTr);
    }
}

function calculatePoints(firstDnfNum, tenthNum, raceResult) {
    //console.log("FirstDnfNum: ", firstDnfNum);
    //console.log("TenthNum: ", tenthNum);
    //console.log("RaceResult: ", raceResult);

    var points = 0;
    var posOfGuessedTenth;

    // Durchlaufe das raceResult-Objekt
    for (let key in raceResult) {
        //console.log(key);
        //console.log(raceResult[key]);

        // Vergleiche den Wert mit tenthNum
        if (raceResult[key] === tenthNum) {
            posOfGuessedTenth = key; // Speichere den Schlüssel (Position)
            break; // Beende die Schleife, sobald der Wert gefunden wurde
        }
    }

    console.log("posOfGuessedTenth: ", posOfGuessedTenth);
    var distanceFromTenth = Math.abs(10 - posOfGuessedTenth);
    if (distanceFromTenth < 10) {   //Wenn 11 oder mehr pos. daneben => keine Punkte
        points += pointDistribution[distanceFromTenth];
    }
    console.log("User scored:", points, "points.");
    return points;
}

function findDriverNameByNumber(driverNumber) {
    // Durchlaufe alle Teams
    for (const team of driverList.teams) {
        // Durchlaufe alle Fahrer des aktuellen Teams
        for (const driver of team.drivers) {
            // Überprüfe, ob die Fahrernummer übereinstimmt
            if (driver.number === driverNumber) {
                return driver.name; // Gib den Namen des Fahrers zurück
            }
        }
    }
    return null; // Gib null zurück, wenn kein Fahrer mit der Nummer gefunden wurde
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

    document.querySelectorAll('.chooseRaceBtn').forEach((div) => {
        div.addEventListener('click', function () {
            // Hole die ID des zugehörigen Radio-Buttons aus dem data-radio-id-Attribut
            const radioId = this.getAttribute('data-radio-id');
            // Finde den Radio-Button anhand der ID
            const radioButton = document.getElementById(radioId);
            // Simuliere den Klick auf den Radio-Button
            radioButton.click();
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
    if (userSub !== "") {
        const data = {
            raceNum: document.querySelector('input[name="chosenRace"]:checked').value,
            winnerNum: selectBetRaceWinner.value,
            tenthNum: selectBetP10.value,
            firstDnfNum: selectBetFirstDnf.value,
            gamblerSub: userSub,
        };
        console.log(data);
        sendRaceBetData(data);
    } else {
        alert("Bitte zuerst anmelden und Benutzernamen festlegen!");
    }
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
            alert('Wette erfolgreich abgegeben');
            console.log('Daten erfolgreich gespeichert:', result);
        })
        .catch(error => {
            console.error('Fehler:', error);
        });
}


// Google Login
window.onload = function () {
    google.accounts.id.initialize({
        client_id: '616726250308-1kqo663kkqup7shimcr41re03hqif15o.apps.googleusercontent.com',
        callback: handleCredentialResponse
    });
    google.accounts.id.prompt(); // Automatischer Login-Versuch (optional)
};

function handleCredentialResponse(response) {
    console.log("Encoded JWT ID Token: " + response.credential);

    // Den ID-Token an dein Backend senden (callback.php)
    fetch('auth/callback.php', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            token: response.credential  // Der ID-Token wird hier übermittelt
        })
    })
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json();
        })
        .then(data => {
            console.log("Erfolgreich angemeldet:", data);
            processLoginCallbackData(data);
            // Weiterleitung nach erfolgreicher Anmeldung
            // Beispiel: window.location.href = '/dashboard';
        })
        .catch(error => {
            console.error("Fehler beim Anmelden:", error);
            // Benutzerfeedback bei Fehlern
            alert("Anmeldung fehlgeschlagen. Bitte versuchen Sie es erneut.");
        });
}

function swapOptionOverlay() {
    if (document.getElementById("optionsOverlay").style.display === "block") {
        document.getElementById("optionsOverlay").style.display = "none";
        document.getElementById("settingsGear").style.display = "block";
    } else {
        document.getElementById("optionsOverlay").style.display = "block";
        document.getElementById("settingsGear").style.display = "none";
    }
}

function swapEvaluationOverlay() {
    if (document.getElementById("evaluationOverlay").style.display === "block") {
        document.getElementById("evaluationOverlay").style.display = "none";
    } else {
        document.getElementById("evaluationOverlay").style.display = "block";
    }
}

function swapRaceDivVisMobile() {
    if (document.getElementById("chooseRaceDivMobile").style.display === "flex") {
        document.getElementById("chooseRaceDivMobile").style.display = "none";
    } else {
        document.getElementById("chooseRaceDivMobile").style.display = "flex";
    }
}

function processLoginCallbackData(userdata) {
    userName = userdata['username'];
    userEmail = userdata['email'];
    userSub = userdata['sub'];
    if (userName !== null) {
        document.getElementById("usernameSpan").innerText = userName;
    } else {
        document.getElementById("usernameSpan").innerText = "kein Benutzername festgelegt";
    }

    document.getElementById("loggedInAs").innerHTML = userEmail;
}

function changeUsername() {
    var newUserName = document.getElementById("newUsername").value;
    console.log(newUserName);

    var data = {
        newUsername: newUserName,
        userSub: userSub
    }

    fetch('saveNewUsername.php', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
    }).then(response => {
        if (!response.ok) {
            throw new Error('Fehler beim Speichern der Daten.');
        }
        return response.json();
    })
        .then(result => {
            document.getElementById("usernameSpan").innerText = result['newUsername'];
            alert("Username auf ,," + result['newUsername'] + "'' geändert");
            console.log('Daten erfolgreich gespeichert:', result);
        })
        .catch(error => {
            console.error('Fehler:', error);
        });
}