############################
#                          #
#  Server for NotesDomine  #
#  Version 24.09c          #
#                          #
#  Written By:             #
#  William Pettersson      #
#                          #
############################

import http.server
import socketserver
import threading
import socket
from websockets.sync.server import serve

PortHTTP = 8000 # Feel free to replace this with any free port
PortSocket = 8001 # Feel free to replace this with any free port
IPAdress = "127.0.0.1" # Feel free to replace this with the actual IP of your actual server
SocketLogging = False

def SocketServer(WebSocket):
    global Logging
    try:
        for ClientData in WebSocket:
            if ClientData == "reqData":
                if SocketLogging:
                    print("Client requesting data.")
                Notes = open("notes", "r")
                Data = (Notes.read())
                Notes.close()
                WebSocket.send(Data)
            else:
                if SocketLogging:
                    print("Received data from client.")
                Notes = open("notes", "w")
                Notes.write(ClientData)
                Notes.close()
    except:
        if SocketLogging:
            print("Closing dead socket.")

def StartSocket():
    print("Serving websocket at " + IPAdress + ":" + str(PortSocket))
    with serve(SocketServer, IPAdress, PortSocket) as Server:
        Server.serve_forever()

def WebServer():
    print("Serving HTTP server at " + IPAdress + ":" + str(PortHTTP))
    Handler = http.server.SimpleHTTPRequestHandler
    with socketserver.TCPServer((IPAdress, PortHTTP), Handler) as HTTPd:
        HTTPd.serve_forever()

threadWebSocket = threading.Thread(target=StartSocket)
threadHTTPServer = threading.Thread(target=WebServer)
threadWebSocket.start()
threadHTTPServer.start()
