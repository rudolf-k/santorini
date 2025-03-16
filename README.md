# Santorini web app

This is a web app version of the board game Santorini. There are 2 different kinds of AI implementations for playing solo. There is also an option to play multiplayer through a socket.io server implementation.

The 2 AI implementations are:
- Minimax with Alpha-Beta pruning
- Monte Carlo Tree Search


There is an explanation of the rules and the gameplay on the homescreen of the app.


The app used to be hosted but it is no longer available. Users can run it locally.

## How to run the app
- Download the files.
- Open a command prompt and run the following commands:
  - (If you want to run the server - for multiplayer) Run ```npm install``` while in the main directory. Then run ```npm run start```.
  - Go into the directory containing the implementation for the client (```cd ./client```) and run ```npm install```. After that run ```npm run dev```.
- The app should be running at this point and if no changes were made, it should be accessible on localhost:5173.
