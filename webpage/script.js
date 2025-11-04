///////////////////////////////
//                           //
//  NotesDomine Client code  //
//  Version 25.11a           //
//                           //
//  Written By:              //
//  William Pettersson       //
//                           //
///////////////////////////////

"use strict";

const ServerUrl = "http://127.0.0.1:8000";
let Notes = [];
let Hidden = false;
let Sorting = 0;
let CurrentNote = 0;

getNotes();

async function getNotes() {
    const data = await sendToServer("notes", { method: "GET" })
    if (data !== null) {
        Notes = data;
        updateHTML();
    }
}

async function sendToServer(sEndpoint, oExtras) {
    document.getElementById("header").style.borderColor = "blue";
    try {
        const response = await fetch(`${ServerUrl}/${sEndpoint}`, oExtras);
        if (response.status === 200 || response.status === 201) {
            document.getElementById("header").style.borderColor = "var(--trim)";
            if (sEndpoint == "notes") {
                const responseData = await response.json();
                return responseData;
            } else {
                getNotes(); // Refresh notes
            }
        } else {
            document.getElementById("header").style.borderColor = "red";
            updateHTML();
            return null;
        }
    } catch (err) {
        console.error(err);
        document.getElementById("header").style.borderColor = "red";
        updateHTML();
        return null;
    }
}

function updateHTML() {
    Notes.sort((a, b) => new Date(b.modified) - new Date(a.modified));
    const NoteContainer = document.getElementById("notes");
    NoteContainer.innerHTML = "";
    for (let i = 0; i < Notes.length; i++) {
        const Category = Number(Notes[i].category);
        let Sort = ["!selected", "!selected", "!selected", "!selected"];
        if (Category !== 0) {
            Sort[Category - 1] = "selected";
        }
        if (Sorting === 0 || Sort[Sorting - 1] === "selected") {
            NoteContainer.innerHTML +=
                `<div class="note">
                <span class="buttons">
                    <button onclick="sortAdd('1', '${i}')" class="${Sort[0]}" id="n{Index}c1">&spades;</button>
                    <button onclick="sortAdd('2', '${i}')" class="${Sort[1]}" id="n{Index}c2">&clubs;</button>
                    <button onclick="sortAdd('3', '${i}')" class="${Sort[2]}" id="n{Index}c3">&hearts;</button>
                    <button onclick="sortAdd('4', '${i}')" class="${Sort[3]}" id="n{Index}c4">&diams;</button>
                    <button class="remove" onclick="deleteNote(${i})">X</button>
                </span>
                <div id="index${i}" onclick="editNote(${i})">${toHTML(Notes[i].text)}</div>
            </div>`;
        }
    }
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
        document.getElementById("sort" + Sorting + "").className = "selected";
    }
    updateHTML();
}

function sortAdd(sCategory, iIndex) {
    if (Notes[iIndex].category == sCategory) {
        Notes[iIndex].category = "0";
    } else {
        Notes[iIndex].category = sCategory;
    }
    updateHTML();
    sendToServer("note", {
        method: "PUT",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            "id": Notes[iIndex].id,
            "text": Notes[iIndex].text,
            "category": Notes[iIndex].category,
            "updateModified": false
        })
    });
}

function editNote(nNote) {
    CurrentNote = nNote;
    if (CurrentNote !== true) {
        document.getElementById("message").value = toMarkdown(document.getElementById("index" + nNote + "").innerHTML);
    } else {
        document.getElementById("message").value = "";
    }
    document.getElementById("edit").style = "display: block";
}

function toHTML(sNote) {
    let formatedNote = sNote.replaceAll("&", "&amp;")
        .replaceAll("§", "&sect;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll("\n", "<br>")
        .replaceAll(" ", "&nbsp;")
        .replaceAll("\\\*", "<span>&ast;</span>")
        .replaceAll("\\_", "<span>_</span>")
        .replaceAll("\\~", "<span>~</span>");
    const boldItalics = [...formatedNote.matchAll(/\*\*\*/gs)];
    for (let i = 0; i < boldItalics.length; i++) {
        if (i % 2 === 0) {
            formatedNote = formatedNote.replace("***", "<i><b>");
        } else {
            formatedNote = formatedNote.replace("***", "</b></i>");
        }
    }
    const bold = [...formatedNote.matchAll(/\*\*/gs)];
    for (let i = 0; i < bold.length; i++) {
        if (i % 2 === 0) {
            formatedNote = formatedNote.replace("**", "<b>");
        } else {
            formatedNote = formatedNote.replace("**", "</b>");
        }
    }
    const italics = [...formatedNote.matchAll(/\*/gs)];
    for (let i = 0; i < italics.length; i++) {
        if (i % 2 === 0) {
            formatedNote = formatedNote.replace("*", "<i>");
        } else {
            formatedNote = formatedNote.replace("*", "</i>");
        }
    }
    const underscore = [...formatedNote.matchAll(/__/gs)];
    for (let i = 0; i < underscore.length; i++) {
        if (i % 2 === 0) {
            formatedNote = formatedNote.replace("__", "<u>");
        } else {
            formatedNote = formatedNote.replace("__", "</u>");
        }
    }
    const strikethrough = [...formatedNote.matchAll(/~~/gs)];
    for (let i = 0; i < strikethrough.length; i++) {
        if (i % 2 === 0) {
            formatedNote = formatedNote.replace("~~", "<strike>");
        } else {
            formatedNote = formatedNote.replace("~~", "</strike>");
        }
    }
    return formatedNote;
}

function toMarkdown(sNote) {
    let formatedNote = sNote.replaceAll("<br>", "\n")
        .replaceAll("<span>\*</span>", "\\\*")
        .replaceAll("<span>_</span>", "\\_")
        .replaceAll("<span>~</span>", "\\~")
        .replaceAll("</b>", "**")
        .replaceAll("<b>", "**")
        .replaceAll("</i>", "*")
        .replaceAll("<i>", "*")
        .replaceAll("</strike>", "~~")
        .replaceAll("<strike>", "~~")
        .replaceAll("</u>", "__")
        .replaceAll("<u>", "__")
        .replaceAll("&amp;", "&")
        .replaceAll("&nbsp;", " ")
        .replaceAll("&lt;", "<")
        .replaceAll("&gt;", ">");
    return formatedNote;
}

function previewFormat() {
    let Contents = toHTML(document.getElementById("message").value);
    document.getElementById("preview").innerHTML = "<p style='color:red;font-weight:bold;'>Previewing note, click to enter edit mode</p>" + Contents;
    document.getElementById("preview").style = "display: block";
}

function closePreview() {
    document.getElementById("preview").style = "display: none";
}

function cancelAction() {
    document.getElementById("edit").style = "display: none";
    document.getElementById("remove").style = "display: none";
}

function saveNote() {
    document.getElementById("edit").style = "display: none";
    let Contents = document.getElementById("message").value;
    if (Contents) {
        if (CurrentNote === true) { // Create new note
            // - Will get shown if request fails
            Notes.push({
                id: new Date().getTime(),
                category: Sorting,
                modified: getDateTime(),
                text: `**!!!**\n${Contents}`
            });
            // -
            sendToServer("note", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    "text": Contents,
                    "category": Sorting
                })
            });
        } else { // Edit existing note
            // - Will get shown if request fails
            Notes[CurrentNote].text = `**!!!**\n${Contents}`;
            Notes[CurrentNote].modified = getDateTime();
            // -
            sendToServer("note", {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    "id": Notes[CurrentNote].id,
                    "text": Contents,
                    "category": Notes[CurrentNote].category,
                    "updateModified": true
                })
            });
        }
    }
}

function deleteNote(nNote) {
    if (nNote === true) { // Delete the note
        document.getElementById("remove").style = "display: none";
        sendToServer("note", {
            method: "DELETE",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                "id": Notes[CurrentNote].id
            })
        });
    } else { // Open confirm screen and select the note
        document.getElementById("remove").style = "display: block";
        CurrentNote = nNote;
    }
}

function hideButtons() {
    let Buttons = document.querySelectorAll(".buttons");
    if (Hidden) {
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

function getDateTime() {
    const CurrentDate = new Date();
    const DateISO = CurrentDate.toISOString();
    const CleanString = DateISO
        .replace("T", " ")
        .substring(0, 19);
    return CleanString;
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
