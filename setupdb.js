////////////////////////////////
//                            //
//  DB setup for NotesDomine  //
//  Version 25.11a (V2)       //
//                            //
//  Written By:               //
//  William Pettersson        //
//                            //
////////////////////////////////

const mysql = require("mysql2");
require("dotenv").config();

const dbName = process.env.DB_NAME;
const connection = mysql.createConnection({
	host: process.env.DB_HOST,
	user: process.env.DB_USER,
	port: process.env.DB_PORT,
	password: process.env.DB_PASS
});

connection.addListener("error", (err) => {
	console.log(err);
});

const sqlCommands = [
	// Create database
	`DROP DATABASE IF EXISTS ${dbName}`,
	`CREATE DATABASE ${dbName} CHARACTER SET = 'utf8mb4' COLLATE = 'utf8mb4_uca1400_ai_ci'`,
	`USE ${dbName}`,
	// Create table
	`CREATE TABLE notes (
		id INT NOT NULL AUTO_INCREMENT,
		category INT,
		modified DATETIME,
		text TEXT,
		PRIMARY KEY (id)
	)`,
	// Insert data
	`INSERT INTO notes (id, category, modified, text)
	VALUES (
		0,
		0,
		'1970-01-01 12:00:00',
		'__**Welcome to NotesDomine!**__\\n• To create new notes, simply click **"Create Note"**.\\n• To delete notes or add them to categories, use the buttons in the upper-right corner.\\n• To sort notes, use the **"Sort"** buttons above.\\n• To edit notes, simply click on the note you want to edit.\\n• Available formatting: **bold**, *italics*, ~~strikethrough~~ & __underscore__, escape formatting with a backslash.'
	)`
];

sqlCommands.forEach(command => {
	connection.execute(command, (error, result, fields) => {
		if (error instanceof Error) {
			console.log(error);
			return;
		}
		console.log(result);
		console.log(fields);
	});
});

connection.end();
