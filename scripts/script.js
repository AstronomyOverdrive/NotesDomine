///////////////////////////////
//                           //
//  NotesDomine Client code  //
//  Version 24.10b           //
//                           //
//  Written By:              //
//  William Pettersson       //
//                           //
///////////////////////////////

"use strict";

/* * * * * * * * * * *
 *  Websocket Stuff  *
 * * * * * * * * * * */
 
const Adress = "ws://127.0.0.1:8001"; // Feel free to replace this with the IP and websocket port of your actual server
const Socket = new WebSocket(Adress);

Socket.addEventListener("open", (event) => {
	Socket.send("reqData");
});

Socket.addEventListener("message", (event) => {
    ServerData = event.data;
    syncNotes(ServerData);
});

/* * * * * * * * * * *
 *   Note Handling   *
 * * * * * * * * * * */

let ServerData = "";
let Notes = [];
let Hidden = false;
let Sorting = 0;
let CurrentNote = 0;

function syncNotes(sNotes) {
    let Line = "";
    Notes = [];
    for (let i = 0; i < sNotes.length; i++) {
        if (ServerData[i] === "§" || i == sNotes.length) {
            Notes.push(Line);
            Line = "";
        } else {
            Line += ServerData[i];
        }
    }
    updateHTML(Notes);
}

function reformatNotes() {
    let reformatedNotes = "";
    Notes.forEach((sNote) => {
        reformatedNotes += sNote + "§";
    });
    ServerData = reformatedNotes;
    sendToServer(ServerData);
}

function sendToServer(sData) {
    Socket.send(sData);
    syncNotes(sData);
}

function updateHTML(aNotes) {
    let Divs = "";
    for (let i = 0; i < aNotes.length; i++) {
        let Index = aNotes.length - i;
        let Sort = ["!selected", "!selected", "!selected", "!selected"];
        if (aNotes[i][0] !== 0) {
            Sort[aNotes[i][0]-1] = "selected";
        }
        if (Sorting === 0 || Sort[Sorting-1] === "selected") {
            Divs += '<div class="note"><span class="buttons"><button onclick="sortAdd(1'+i+')" class="'+Sort[0]+'" id="n'+Index+'c1">&spades;</button> <button onclick="sortAdd(2'+i+')" class="'+Sort[1]+'" id="n'+Index+'c2">&clubs;</button> <button onclick="sortAdd(3'+i+')" class="'+Sort[2]+'" id="n'+Index+'c3">&hearts;</button> <button onclick="sortAdd(4'+i+')" class="'+Sort[3]+'" id="n'+Index+'c4">&diams;</button> <button class="remove" onclick="deleteNote('+i+')">X</button></span><div id="index'+i+'" onclick="editNote('+i+')">'+Notes[i].substring(1)+'</div></div>';
        }
    }
    document.getElementById("notes").innerHTML = Divs;
    Hidden = false;
}

function sortBy(nCategory) {
    document.getElementById("sort1").className = "!selected";
    document.getElementById("sort2").className = "!selected";
    document.getElementById("sort3").className = "!selected";
    document.getElementById("sort4").className = "!selected";
    if (nCategory == Sorting) {
        Sorting = 0;
    } else {
        Sorting = nCategory;
        document.getElementById("sort"+Sorting+"").className = "selected";
    }
    updateHTML(Notes);
}

function sortAdd(nNoteCategory) {
    let NoteIndex = nNoteCategory%10;
    let Category = Math.floor(nNoteCategory/10);
    if (Category == Notes[NoteIndex][0]) {
        Category = 0;
    }
    Notes[NoteIndex] = Category + Notes[NoteIndex].substring(1);
    reformatNotes();
}

function editNote(nNote) {
    CurrentNote = nNote;
    if (CurrentNote !== true) {
        document.getElementById("message").value = document.getElementById("index"+nNote+"").innerHTML;
    } else {
        document.getElementById("message").value = "";
    }
    document.getElementById("edit").style = "display: block";
}

function cancelAction() {
    document.getElementById("edit").style = "display: none";
    document.getElementById("remove").style = "display: none";
}

function saveNote() {
    document.getElementById("edit").style = "display: none";
    let Contents = document.getElementById("message").value;
    if (Contents){
        if (CurrentNote === true) { // Create new note
            ServerData = Sorting + Contents + "§" + ServerData;
            sendToServer(ServerData);
        } else { // Edit existing note
            Notes[CurrentNote] = Notes[CurrentNote][0] + Contents;
            reformatNotes();
        }
    }
}

function deleteNote(nNote) {
    if (nNote === true) { // Delete the note
        document.getElementById("remove").style = "display: none";
        delete Notes[CurrentNote];
        reformatNotes();
    } else { // Open confirm screen and select the note
        document.getElementById("remove").style = "display: block";
        CurrentNote = nNote;
    }
}

function hideButtons() {
    let Buttons = document.querySelectorAll(".buttons");
    if (Hidden){
        Buttons.forEach((oButton) => {
            oButton.style = "display: block";
        });
    } else {
        Buttons.forEach((oButton) => {
            oButton.style = "display: none";
        });
    }
    Hidden = !Hidden;
}

/* * * * * * * * * * *
 *  Header Messages  *
 * * * * * * * * * * */

let Time = new Date().getHours();

if (Time > 3 && Time < 11) {
    document.getElementById("header").innerHTML = "Good Morning!";
} else if (Time > 10 && Time < 17) {
    document.getElementById("header").innerHTML = "Good Day!";
} else if (Time > 16 && Time < 24) {
    document.getElementById("header").innerHTML = "Good Evening!";
} else {
    document.getElementById("header").innerHTML = "Good Night!";
}
