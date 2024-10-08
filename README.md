# NotesDomine
NotesDomine is a simple note taking web app meant to be self-hosted. It comes with a basic python server running http.server and websockets.<br>
[Try it online.](https://williampettersson.eu/previews/notesdomine.html) (Based on version 24.09c)
## Features
* Connect from any device on your local network
* Sort notes by assigning them to different categories
* Format your notes using HTML tags
## Setup
1. If you want to use the included python server you will need to install websockets. [GitHub](https://github.com/python-websockets/websockets) | [PyPI](https://pypi.org/project/websockets)
2. Change the IP in server.py & script.js if you want to connect from other devices. (default IP is 127.0.0.1)
3. Change the port(s) in server.py & script.js if you already have other services running on port 8000 and/or 8001.
4. Change the colours to your liking by editing the variables in main.css.
## Usage
Simply run server.py and connect to it from your web browser of choice.