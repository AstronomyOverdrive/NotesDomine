//////////////////////////////
//                          //
//  Server for NotesDomine  //
//  Version 25.11a (V2)     //
//                          //
//  Written By:             //
//  William Pettersson      //
//                          //
//////////////////////////////

import fs from "node:fs/promises";
import mysql from "mysql2/promise"
import express from "express";
import cors from "cors";
import "dotenv/config";

// Activate database here
const usingTsv = true;
const usingDb = !usingTsv;

///////////////
// Setup app //
///////////////
const app = express();
app.use(express.json());
app.use(cors());

let connection;
if (usingDb) {
	try {
		connection = await mysql.createConnection({
			host: process.env.DB_HOST,
			user: process.env.DB_USER,
			port: process.env.DB_PORT,
			database: process.env.DB_NAME,
			password: process.env.DB_PASS
		});
	} catch (err) {
		console.log(err);
	}
}

/////////////
// Routing //
/////////////
// Serve index.html
app.get("/", async (req, res) => {
	try {
		const html = await fs.readFile("./webpage/index.html", { encoding: "utf8" });
		res.set("Content-Type", "text/html");
		res.status(200).send(html);
	} catch (err) {
		res.status(404);
	}
});
// Serve JS / CSS files
app.get("/web/:file", async (req, res) => {
	try {
		const reqFile = req.params.file;
		let contentType = "";
		const file = await fs.readFile(`./webpage/${reqFile}`, { encoding: "utf8" });
		if (reqFile.substring(reqFile.length - 4, reqFile.length) === ".css") {
			contentType = "text/css";
		} else if (reqFile.substring(reqFile.length - 3, reqFile.length) === ".js") {
			contentType = "text/javascript";
		}
		if (contentType !== "") {
			res.set("Content-Type", contentType);
			res.status(200).send(file);
		}
	} catch (err) {
		res.status(404);
	}
});

// Get notes
app.get("/notes", async (req, res) => {
	try {
		const notes = await (readNotes());
		if (notes !== null) {
			res.status(200).json(notes);
		}
		else {
			res.status(400);
		}
	} catch (err) {
		res.status(400);
	}
});
// Create new note
app.post("/note", async (req, res) => {
	try {
		if (addNote(req.body.text, req.body.category)) {
			res.status(201).json(req.body);
		} else {
			res.status(400);
		}
	} catch (err) {
		res.status(400);
	}
});
// Update existing note
app.put("/note", async (req, res) => {
	try {
		if (updateNote(req.body.id, req.body.text, req.body.category, req.body.updateModified)) {
			res.status(201).json(req.body);
		} else {
			res.status(400);
		}
	} catch (err) {
		res.status(400);
	}
});
// Delete note
app.delete("/note", async (req, res) => {
	try {
		if (deleteNote(req.body.id)) {
			res.status(200).json(req.body);
		} else {
			res.status(400);
		}
	} catch (err) {
		res.status(400);
	}
});

///////////////////
// Note handling //
///////////////////
async function readNotes() {
	try {
		if (usingTsv) {
			const data = await fs.readFile("./notes.tsv", { encoding: "utf8" });
			const converted = tsvToJson(data);
			return converted;
		} else if (usingDb) {
			const sql = "SELECT * FROM notes ORDER BY modified";
			const [rows, fields] = await connection.query(sql);
			return rows;
		}
	} catch (err) {
		console.error(err);
		return null;
	}
}

async function addNote(text, category) {
	const newNote = {
		id: generateId(),
		category: Number(category),
		modified: getDateTime(),
		text: text
	}
	try {
		if (usingTsv) {
			let notes = await readNotes();
			notes.push(newNote);
			await fs.writeFile("notes.tsv", jsonToTsv(notes));
			return true;
		} else if (usingDb) {
			const sql = "INSERT INTO notes (category, modified, text) VALUES (?, ?, ?)";
			const values = [newNote.category, newNote.modified, newNote.text];
			const [result, fields] = await connection.execute(sql, values);
			return true;
		}
	} catch (err) {
		console.log(err);
		return false;
	}
}

async function updateNote(id, text, category, updateModified) {
	try {
		if (usingTsv) {
			let notes = await readNotes();
			const index = getNoteIndex(id, notes);
			notes[index].text = text;
			notes[index].category = category;
			if (updateModified) {
				notes[index].modified = getDateTime();
			}
			await fs.writeFile("notes.tsv", jsonToTsv(notes));
			return true;
		} else if (usingDb) {
			let sql;
			let values;
			if (updateModified) {
				sql = "UPDATE notes SET category = ?, modified = ?, text = ? WHERE id = ?";
				values = [Number(category), getDateTime(), text, id];
			} else {
				sql = "UPDATE notes SET category = ?, text = ? WHERE id = ?";
				values = [Number(category), text, id];
			}
			const [result, fields] = await connection.execute(sql, values);
			return true;
		}
	} catch (err) {
		console.log(err);
		return false;
	}
}

async function deleteNote(id) {
	try {
		if (usingTsv) {
			let notes = await readNotes();
			const index = getNoteIndex(id, notes);
			notes.splice(index, 1);
			await fs.writeFile("notes.tsv", jsonToTsv(notes));
			return true;
		} else if (usingDb) {
			const sql = "DELETE FROM notes WHERE id = ?";
			const values = [id];
			const [result, fields] = await connection.execute(sql, values);
			return true;
		}
	} catch (err) {
		return false;
	}
}

//////////////
// TSV file //
//////////////
function tsvToJson(data) {
	const notes = [];
	const rows = data.split("\n");
	rows.forEach(row => {
		const fields = row.split("\t");
		if (fields.length === 4) {
			const object = {
				id: fields[0],
				category: fields[1],
				modified: fields[2],
				text: fields[3].replaceAll("\\n", "\n").replaceAll("\\t", "\t")
			}
			notes.push(object);
		}
	});
	return notes;
}

function jsonToTsv(data) {
	let notes = "";
	data.forEach(note => {
		const cleanText = note.text.replaceAll("\n", "\\n").replaceAll("\t", "\\t");
		notes += `${note.id}\t${note.category}\t${note.modified}\t${cleanText}\n`;
	});
	return notes;
}

function getNoteIndex(id, notes) {
	let editIndex = -1;
	for (let i = 0; i < notes.length; i++) {
		if (notes[i].id == id) {
			editIndex = i;
			i = notes.length;
		}
	}
	return editIndex;
}

/////////////
// Utility //
/////////////
function generateId() {
	return new Date().getTime();
}

function getDateTime() {
	const date = new Date();
	const dateISO = date.toISOString();
	const cleanString = dateISO
		.replace("T", " ")
		.substring(0, 19);
	return cleanString;
}

app.listen(process.env.PORT, () => {
	console.log("Server live on port", process.env.PORT);
});
