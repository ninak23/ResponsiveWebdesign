namespace Client {

    export interface Player {
        _id: string;
        firstname: string;
        secondname: string;
        Playtime: string;
    }

    export interface Cards {
        _id: string;
        url: string;
        name: string;
    }


    let url: string = "https://ninakgissose2020.herokuapp.com";

    init();

    function init(): void {

        document.getElementById("insertButton")?.addEventListener("click", input2); // input 2 = fügt Spieler in der Datenbank hinzu 
        document.getElementById("responseButton")?.addEventListener("click", getData2); // getData2 = holt die 10 besten Spieler geordnet nach der Zeit aus der Datenbank

        document.getElementById("insertcard")?.addEventListener("click", insert); // insert = fügt neue Url + name in der Datenbank hinzu
        document.getElementById("removecard")?.addEventListener("click", removeCard); // löscht über den Name ein Bild 


        let elem: HTMLElement = document.getElementById("responseButton");
        document.getElementById("responseButton")?.addEventListener("click", remove); // Wenn see Ranking button gedrückt wird, wird er automatische entfernt 
        function remove(): void {
            elem.parentNode.removeChild(elem);
        }
        console.log("inserted");
    }


    // tslint:disable-next-line: no-any
    const cards: NodeListOf<any> = document.querySelectorAll(".memory-card"); // Code von hier übernommen https://github.com/code-sketch/memory-game/blob/master/video-11/scripts.js 
    //Liste mit allen Memorykarten
    let aktuelleSeite: string = window.location.href;
    let pos: number = aktuelleSeite.lastIndexOf("/"); //position der aktuellen Seite im String -> Suche nach dem letzten Slash
    aktuelleSeite = aktuelleSeite.substring(pos + 1); // 

    let cardCounter: number = 0;   //Code von hier übernommen https://github.com/code-sketch/memory-game/blob/master/video-11/scripts.js 
    let hasFlippedCard: boolean = false; //Code von hier übernommen https://github.com/code-sketch/memory-game/blob/master/video-11/scripts.js 
    let lockBoard: boolean = false; // Code von hier übernommen https://github.com/code-sketch/memory-game/blob/master/video-11/scripts.js 
    let firstCard: HTMLElement; // Code von hier übernommen https://github.com/code-sketch/memory-game/blob/master/video-11/scripts.js 
    let secondCard: HTMLElement; // Code von hier übernommen https://github.com/code-sketch/memory-game/blob/master/video-11/scripts.js 
    let actTime: Date = new Date;
    let startTime: number = 0;
    let playTime: number = 0;
    let keyTime: string = "playtime";
    let scoreTime: string = "";

    //writes the player name and time into the database collection ScoreList
    async function input2(_e: Event): Promise<void> {
        let formData: FormData = new FormData(document.forms[0]);
        console.log(formData);
        formData.append("Playtime", scoreTime);
        // tslint:disable-next-line: no-any
        let query: URLSearchParams = new URLSearchParams(<any>formData);
        console.log(query);
        url = url + "/insert?" + query.toString();
        let response: Response = await fetch(url);
        let answer: string = await response.text();  
        console.log(answer);
        window.location.href = "Ranking.html"; //wechsel auf ranking
    }

    // fetch the playtime from the gaming site
    if (aktuelleSeite == "Score.html") {
        scoreTime = sessionStorage.getItem(keyTime); //durch Seitenwechsel geht information der Playtime verloren, deswegen Sessionstorage, holt information und zeigt an 
        document.getElementById("Scoretime").innerHTML = "Gametime: " + scoreTime + " s";
    }

    // writes the url and name of a new image into the database collection MemoryCards
    async function insert(_e: Event): Promise<void> {
        let formData: FormData = new FormData(document.forms[0]); // eingabe erste element des Formulars
        console.log(formData);
        // tslint:disable-next-line: no-any
        let query: URLSearchParams = new URLSearchParams(<any>formData);
        console.log(query);
        url = url + "/Insert?" + query.toString();
        let response: Response = await fetch(url);
        let answer: string = await response.text();
        console.log(answer);
        window.location.href = "Admin.html"; //neu geladen 
    }

    // removes an image int the database collection MemoryCards about the image name
    async function removeCard(_e: Event): Promise<void> {
        let formData: FormData = new FormData(document.forms[1]); // remove 2te Element des formulars
        console.log(formData);
        // tslint:disable-next-line: no-any
        let query: URLSearchParams = new URLSearchParams(<any>formData);
        console.log(query);
        url = url + "/remove?" + query.toString();
        //let response2: Response = await fetch(url + "/remove?" + query.toString());
        let response: Response = await fetch(url);
        let answer: string = await response.text();
        console.log(answer);
        window.location.href = "Admin.html";
    }


    // start the function getCards2 when the admin site is called
    if (aktuelleSeite == "Admin.html") {
        window.addEventListener("load", getCards2);
    }

    // loads the images from the database for the admin site
    export async function getCards2(_e: Event): Promise<void> {
        console.log("cards");
        let response: Response = await fetch(url + "/Read");
        let cardsData: Cards[] = await response.json();
        let out: HTMLDivElement = <HTMLDivElement>document.getElementById("showCards");
        out.innerHTML = "";

        for (let cards of cardsData) {
            out.appendChild(showCards2(cards));
        }

    }

    // shows the images on the admin site
    export function showCards2(_cards: Cards): HTMLElement {

        console.log("zeig");

        let card: HTMLDivElement = document.createElement("div");
        card.classList.add("Card");
        card.setAttribute("_id", _cards._id); // name und Wert

        let img: HTMLImageElement = document.createElement("img");
        img.src = _cards.url;
        card.appendChild(img); //fügt Elemente am ende unseres DivElements ein, EventListener bleiben in Takt

        let cardname: HTMLElement = document.createElement("p");
        cardname.classList.add("name");
        cardname.innerText = _cards.name;
        card.appendChild(cardname);

        return card;
    }

    // start the function getCardstoPlay which loads the images for the cards and places them into the cards
    if (aktuelleSeite == "Spiel.html") {
        window.addEventListener("load", getCardstoPlay);
    }

    // loads the images for the cards from the database and calls the function to assign image to cards
    export async function getCardstoPlay(_e: Event): Promise<void> {
        console.log("cards");
        let response: Response = await fetch(url + "/Read");
        let cardsData: Cards[] = await response.json(); //enthält alle Bilder

        let maxCards: number = 8;
        let idx: number = 1;
        let cardIdc: number[] = [maxCards]; //Zufalsszahlen die ich prüf //Array 
        let noDuplicate: Boolean = true; //überprüft ob zahl doppelt vorkommt im Array CARDIdc
        let cardsUsed: Cards[] = [];  //die 8 zufällig ausgewählten bilder mit ihren Daten 

        while (noDuplicate == true) { //Duplicate == true
            for (let i: number = 0; i < maxCards; i++) {   // zufällige auswahl der Karten, generierung der zufalsszahlen 
                cardIdc[i] = Math.floor(Math.random() * cardsData.length); // 8 zufalsszahlen werden erstellt und ins Array geschrieben 
            }
            for (let i: number = 0; i < maxCards; i++) { //anzahl an karten wird durchgegangen 
                noDuplicate = false;
                for (let j: number = i + 1; j < maxCards; j++) {
                    if (cardIdc[i] == cardIdc[j]) {   //überprüfung der duplikate 
                        noDuplicate = true; //                                                           Solange ein duplicate vorhanden ist wird der Block durchlaufen 
                        break;
                    }
                }
                if (noDuplicate == true) {
                    break;
                }
            }
        }

        for (let i: number = 0; i < maxCards; i++) {
            cardsUsed.push(cardsData[cardIdc[i]]);  //Array wird mit 8 zufälliigen gefüllt
        }

        for (let cards of cardsUsed) {  //Zufällig ausgewählten Bilder werden den 16 Karten zugewiesen, immer ein Bild wird 2 Karten zugewiesen
            if (idx <= maxCards) {
                let idNumber: number = (idx * 2) - 1;  //ungerade Zahl der ID 
                let cardId: string = "Pair";
                cardId = cardId.concat(idNumber.toString()); // zum Beinspiel die Zahl 1 wird zum String umgewandelt und an Pair angehängt 
                let out: HTMLDivElement = <HTMLDivElement>document.getElementById(cardId);
                out.innerHTML = "";
                out.appendChild(showCards3(cards));
                idNumber = idx * 2; //Gerade Zahl der Pair ID -> 2 Karten mit gleichem Bild 
                cardId = "Pair";
                cardId = cardId.concat(idNumber.toString());
                out = <HTMLDivElement>document.getElementById(cardId);
                out.innerHTML = "";                       //erzeugt
                out.appendChild(showCards3(cards));
            }
            idx++;
        }
    }

    // makes the assignment of the image to the corresponding card
    export function showCards3(_cards: Cards): HTMLElement {

        console.log("zeig");

        let card: HTMLDivElement = document.createElement("div");
        card.classList.add("Card");
        card.setAttribute("_id", _cards._id);

        let img: HTMLImageElement = document.createElement("img");
        img.src = _cards.url;
        card.appendChild(img);

        return card;
    }

    // gets the player data from the database collection ScoreList, sorts them by time and calls the showing function
    export async function getData2(_e: Event): Promise<void> {
        console.log("Daten holen");
        let response: Response = await fetch(url + "/read");
        let playerData: Player[] = await response.json();
        let out: HTMLDivElement = <HTMLDivElement>document.getElementById("Response")!;
        out.innerHTML = "";

        let show: Player[] = [];

        // copy array from database
        for (let players of playerData) {
            show.push(players); //Daten werden ins Array show reingeschrieben 
        }

        //sort players by time
        let tmpPlayer: Player;
        if (show.length > 1) {
            for (let j: number = 0; j < show.length; j++) { // oft genug durchgehen, dass alle Daten sortiert werden, mit einer for schleife werden nur benachbarte getauscht 
                for (let i: number = 1; i < show.length; i++) { 
                    let time1: number = parseFloat(show[i - 1].Playtime);
                    let time2: number = parseFloat(show[i].Playtime); 
                    if (time1 > time2) {
                        tmpPlayer = show[i - 1]; 
                        show[i - 1] = show[i]; //0 und 1, 1 und 2 ... werden verglichen 
                        show[i] = tmpPlayer;
                    }
                }
            }
        }

        let maxRanking: number = 10;
        let idx: number = 0;
        for (let players of show) {  //show array wo alle spielzeiten drin sind //players 10 beste spieler
            if (idx < maxRanking) {
                out.appendChild(showPlayers2(players));
            }
            idx++;
        }
    }

    // shows a player on the ranking site
    export function showPlayers2(_players: Player): HTMLElement {

        let player: HTMLDivElement = document.createElement("div");
        player.classList.add("Player");
        player.setAttribute("_id", _players._id);


        let firstname: HTMLElement = document.createElement("p");
        firstname.classList.add("firstname");
        firstname.innerText = _players.firstname;
        player.appendChild(firstname);

        let secondname: HTMLElement = document.createElement("p");
        secondname.classList.add("secondname");
        secondname.innerText = _players.secondname;
        player.appendChild(secondname);

        let playtime: HTMLElement = document.createElement("p");
        playtime.classList.add("Playtime");
        playtime.innerText = _players.Playtime;
        player.appendChild(playtime);


        return player;
    }

    // check if all pairs have been found, calculate playtime and change to ranking site
    function checkEnd(): void {
        actTime = new Date;
        playTime = actTime.getTime();
        console.log(startTime);
        console.log(playTime);
        playTime = playTime - startTime;
        if (cardCounter == cards.length) {
            playTime = playTime / 1000;  // damit die Zeit in sek angezeigt/bzw. umgerechnet wird
            sessionStorage.setItem(keyTime, playTime.toString());
            console.log(playTime);
            document.getElementById("Playtime").innerHTML = "Gametime: " + playTime.toString() + " s";
            window.location.href = "Score.html";
        }
    }

    function flipCard(this: HTMLElement): void { // Code von hier übernommen https://github.com/code-sketch/memory-game/blob/master/video-11/scripts.js 
        if (startTime == 0) {                    // Kopie geht von Z. 308 bis Z.380
            actTime = new Date;                  // Allgemeiner Link zur komplette Repo des übernommenen Codes https://github.com/code-sketch/memory-game/ 
            startTime = actTime.getTime();
            playTime = actTime.getTime();
            playTime = playTime - startTime;
            console.log(startTime);
            console.log(playTime);
        }
        if (lockBoard) return;  // Solange 2 Karten aufgedeckt sind wird die Ausführung der <funktion gestoppt
        if (this == firstCard) { //verhindert das wenn 2 mal auf die erste Karte klickt  ein Match entsteht
            return; 
        }

        this.classList.add("flip"); // wird zur Liste hinzugefügt 

        if (!hasFlippedCard) {  // das erste mal das ein Spieler eine Karte angeklickt hat
            hasFlippedCard = true; // Flipcard gleich true gesetzt, da die erste Karte umgedreht wird
            firstCard = this; // Element, dass das Event auslöst ist in diesem Fall dann die Karte

            return; // Wenn hasFlippedCard ist true wird die ausführung der Funktion beendet
        }

        secondCard = this;
        checkForMatch();
    }
//mann kann dem Element etwas hinzufägen -> dataframework -> Karte werden namen hinzugefügt 
    function checkForMatch(): void {
        let isMatch: boolean = firstCard.dataset.framework == secondCard.dataset.framework; // Es wird überprüft ob die erste geklickte Karte mit der zweiten geclickten Karte übereinstimmt mithilfe des namens

        if (isMatch) {
            cardCounter = cardCounter + 2;
            console.log(cardCounter);
            disableCards(); // Funktion die Eventlistener entfernt wird aufgerufen
            checkEnd();
        }
        else { // wenn kein Match ist 
            unflipCards(); //Funktion die dafür sorgt das die Karten sich wieder umdrehen
        }
    }

    function disableCards(): void {
        firstCard.removeEventListener("click", flipCard); // wenn die Karten ein Match sind wird der EventListener entfernt, so dass die Karten aufgedeckt bleiben
        secondCard.removeEventListener("click", flipCard);

        resetBoard();
    }

    function unflipCards(): void { //sorgt dafür das nach 1000s die Karten wieder umgedreht werden und wird dann ausgeführt wenn die Karten kein Match sind
        lockBoard = true;   // Board wird gelockt und erst wenn die Karten die Kein Match sind wieder zurückgeflippt sind wird lockboard gleicht false gesetzt also entlockt -> verhindert das ein zweites Paar aufgedeckt wird bevor das erste sich wieder zurückgedreht hat

        setTimeout(() => {
            firstCard.classList.remove("flip"); 
            secondCard.classList.remove("flip");

            resetBoard(); 
        },         1000); //wird automatisch immer falsch eingerückt 
    }

    function resetBoard(): void { //setzt  Memory wieder zurück
        hasFlippedCard = false;
        lockBoard = false;
        firstCard = null;
        secondCard = null;
    }

    (function shuffle(): void { //Durch die extra Klammern wird die Funktion direkt nach ihrer Definition ausgeführt 
        cards.forEach(card => {
            let randomPos: number = Math.floor(Math.random() * cards.length); // wird mit der Anzahl der Karten multipliziert, so dass jede Karte eine Zahl zugewiesen bekommt //Math.floor -> Integer
            card.style.order = randomPos; // zufällige Anordnung der Karten 
        });
    })();

    cards.forEach(card => card.addEventListener("click", flipCard)); // Die Liste wird durchgegangen und jede Karte bekommt einen EventListener zugewiesen -> Bei Click ausführung der Funktion Flip card
}
