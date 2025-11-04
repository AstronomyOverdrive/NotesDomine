# NotesDomine
NotesDomine is a simple note taking web app.<br>
[Try it online.](https://williampettersson.eu/previews/notesdomine.html) (Based on version 24.09c / outdated)<br>
<br>
**UPDATE 2025-11-04:**<br>
*NotesDomine V2* (25.11a) is now released with a new Express-based server and proper storage.<br>
Sadly this breaks compatibility with the previous system so old notes will have to be manually re-added when upgrading.
## Features
* Connect from any device on your local network
* Sort notes by assigning them to different categories
* Format your notes using a markdown-like syntax
## Setup
1. Change `serverUrl` in `webpage/script.js` to your servers IP and whatever port is free.
2. Rename `.env.example` to `.env` and change `PORT` to whatever you set in `webpage/script.js`.
3. Change the colours to your liking by editing the variables in `webpage/main.css`.
4. Install dependencies with `npm install`. (Express, MySQL2, CORS and dotenv)
## Usage
Run the server with `node server`.
## Use database instead of notes.tsv file
1. Install MariaDB/MySQL and setup a user.
2. Change the values in `.env` to match your database.
3. Run `node setupdb`.
4. In `server.js`, change `usingTsv` to `false`.
