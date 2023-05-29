import express from "express";
import { Cell, Game } from "./game";
import { Server } from "socket.io";
import http from "http";
import path from "path";

const app = express();
const server = http.createServer(app);

app.use(express.static("./dist"));
server.listen(process.env.PORT ?? 4000);

app.use((req, resp)=> {
  resp.sendFile(path.join(__dirname, "dist", "index.html"));
});

const io = new Server(server/*{
   cors: {
     origin: ["http://localhost:5173",  "http://127.0.0.1:5173"]
   }

}*/);

var clients: any[] = [];
var rooms: any[] = [];

io.use((client: any, next: any) => {
  const username = client.handshake.auth.username;
  if (!username) {
    return next(new Error("Invalid username."));
  }
  client.username = username;
  next();
})

io.on("connection", (client: any) => {
    console.log(`${client.id} has connected (username: ${client.username}).`);
    clients.push(client);
    
    client.on("new-room", (playerCount: number) => {
      if ([2, 3, 4].includes(playerCount)) {
        // let teams = Array((playerCount === 3 ? 3 : 2)).fill(undefined).map(() => Array((playerCount === 4 ? 2 : 1)).fill(null));
        // teams[0][0] = client;
        rooms.push({
          owner: client.id,
          playerCount: playerCount,
          teams: Array((playerCount === 3 ? 3 : 2)).fill(undefined).map(() => Array((playerCount === 4 ? 2 : 1)).fill(null)),
          game: null,
        });
        rooms[rooms.length-1].teams[0][0] = client;
        // const playerListToSend = playerList.filter((p) => p !== null).map((p) => p.username);
        const teamListToSend = rooms[rooms.length-1].teams.map((t: any) => t.map((p: any) => (p !== null ? p.username : null)));
        client.roomJoined = client.id;
        client.join(client.id);
        client.emit("new-room-created", client.id, teamListToSend, playerCount/*, client.username*/);
        console.log(`New room with ${playerCount} players created for user: ${client.id}`);
      }
    });

    client.on("join-room", (roomId: string) => {
      const roomIndex = rooms.findIndex((r) => r.owner === roomId);
      if (roomIndex != -1) {
        let team = -1;
        let indexInTeam = -1;
        teamFinder: for (let i = 0; i < rooms[roomIndex].teams.length; i++) {
          for (let j = 0; j < rooms[roomIndex].teams[i].length; j++) {
            if (rooms[roomIndex].teams[i][j] === null) {
              team = i;
              indexInTeam = j;
              break teamFinder;
            }
          }
        }

        if (team !== -1) {
          rooms[roomIndex].teams[team][indexInTeam] = client;
          client.roomJoined = roomId;
          client.join(roomId);
          client.emit("room-joined", roomId, team, indexInTeam);
          console.log(`User ${client.id} joined room: ${roomId}`);
  
          // const playerList = rooms[roomIndex].players.filter((p: any) => p !== null).map((p: any) => p.username);
          const teamListToSend = rooms[roomIndex].teams.map((t: any) => t.map((p: any) => (p !== null ? p.username : null)));
          io.to(roomId).emit("room-players-update", teamListToSend);
        } else {
          /////////
          console.log("Room full: " + roomId);
          /////////
        }
      } else {
        client.emit("room-not-found", roomId);
        console.log(`Room not found: ${roomId} (user: ${client.id}).`);
      }
    });

    client.on("join-team", (teamIndex: number, indexInTeam: number) => {
      console.log(`Client ${client.id} attempting to join team ${teamIndex+1}.`);
      if (client.roomJoined) {
        const roomIndex = rooms.findIndex((r) => r.owner === client.roomJoined);
        if (roomIndex != -1) {
          if (teamIndex >= 0 && teamIndex < rooms[roomIndex].teams.length && indexInTeam >= 0 && indexInTeam < rooms[roomIndex].teams[0].length) {
            if (rooms[roomIndex].teams[teamIndex][indexInTeam] === null) {
              for (let i = 0; i < rooms[roomIndex].teams.length; i++) {
                for (let j = 0; j < rooms[roomIndex].teams[i].length; j++) {
                  if (rooms[roomIndex].teams[i][j] && rooms[roomIndex].teams[i][j].id === client.id) {
                    rooms[roomIndex].teams[i][j] = null;
                  }
                }
              }
              rooms[roomIndex].teams[teamIndex][indexInTeam] = client;
              const teamListToSend = rooms[roomIndex].teams.map((t: any) => t.map((p: any) => (p !== null ? p.username : null)));
              io.to(rooms[roomIndex].owner).emit("room-players-update", teamListToSend);
            } else {
              console.log(`Join team failed for client ${client.id}: Selected spot occupied.`);
            }
          } else {
            console.log(`Join team failed for client ${client.id}: Invalid indexes.`);
          }
        } else {
          console.log(`Join team failed: Client ${client.id}'s joined room wasn't found.`);
        }
      } else {
        console.log(`Join team failed: Client ${client.id} isn't in a room.`);
      }
    });

    client.on("start-game", (roomId: string) => {
      console.log(`Attempting to start game for room: ${roomId}.`);
      const roomIndex = rooms.findIndex((r) => r.owner === roomId);
      if (roomIndex !== -1) {
        for (let i = 0; i < rooms[roomIndex].teams.length; i++) {
          for (let j = 0; j < rooms[roomIndex].teams[i].length; j++) {
            if (rooms[roomIndex].teams[i][j] === null) {
              console.log(`Game start failed for room: ${roomId}. Teams not full.`);
              return;
            }
          }
        }

        const teamList = rooms[roomIndex].teams.map((t: any) => { return t.map((p: any) => (p !== null ? {username: p.username, id: p.id} : null)) });
        rooms[roomIndex].game = new Game(teamList);
        // const initUpdate = {
        //   board: rooms[roomIndex].game.board,
        //   playerCount: rooms[roomIndex].game.playerCount,
        //   teamToPlay: rooms[roomIndex].game.teamToPlay,
        //   gameStage: rooms[roomIndex].game.gameStage,
        //   teams: teamList,
        // };
        io.to(roomId).emit("game-started", rooms[roomIndex].game.getInitialState());
        console.log(`Game started for room: ${roomId}.`);
      } else {
        console.log(`No such room: ${roomId}.`);
      }

    })

    client.on("spawn", (cell: Cell) => {
      // console.log(`User ${client.id} attempting to spawn to [${cell.row},${cell.col}] in room: ${client.roomJoined}.`);
      const roomIndex = rooms.findIndex((r) => r.owner === client.roomJoined);
      if (roomIndex !== -1) {
        if (rooms[roomIndex].game.spawn(cell, client.id)) {
          // const teamList = rooms[roomIndex].teams.map((t: any) => { return { players: t.map((p: any) => (p !== null ? {username: p.username, id: p.id} : null)), playerToPlay: 0 }; });
          // const update = {
          //   board: rooms[roomIndex].game.board,
          //   playerCount: rooms[roomIndex].game.playerCount,
          //   playerToPlay: rooms[roomIndex].game.teamToPlay,
          //   gameStage: rooms[roomIndex].game.gameStage,
          //   teams: teamList,
          // };
          io.to(client.roomJoined).emit("game-update", rooms[roomIndex].game.getGameState());
        } else {
          console.log(`User ${client.id} tried to spawn - INVALID.`)
        }
      } else {
        console.log(`User ${client.id} tried to spawn while not in a room.`)
      }
    });

    client.on("move", (from: Cell, to: Cell) => {
      const roomIndex = rooms.findIndex((r) => r.owner === client.roomJoined);
      if (roomIndex !== -1) {
        if (rooms[roomIndex].game.move(from, to, client.id)) {
          io.to(client.roomJoined).emit("game-update", rooms[roomIndex].game.getGameState());
        } else {
          console.log(`User ${client.id} tried to move - INVALID.`)
        }
      } else {
        console.log(`User ${client.id} tried to move while not in a room.`)
      }
    });

    client.on("build", (to: Cell) => {
      const roomIndex = rooms.findIndex((r) => r.owner === client.roomJoined);
      if (roomIndex !== -1) {
        if (rooms[roomIndex].game.build(to, client.id)) {
          io.to(client.roomJoined).emit("game-update", rooms[roomIndex].game.getGameState());
        } else {
          console.log(`User ${client.id} tried to build - INVALID.`)
        }
      } else {
        console.log(`User ${client.id} tried to build while not in a room.`)
      }
    });

    client.on("disconnect", () => {
      console.log(`${client.id} has disconnected (username: ${client.username}).`);
      let i = clients.indexOf(client);
      clients.splice(i, 1);
      i = rooms.findIndex((r) => r.owner === client.id);
      if (i != -1) {
        rooms.splice(i, 1);
        // TODO ?
        // handle disconnect from room
        return;
      }
      const roomIndex = rooms.findIndex((r) => r.owner === client.roomJoined);
      if (roomIndex != -1) {
        teamFinder: for (let i = 0; i < rooms[roomIndex].teams.length; i++) {
          for (let j = 0; j < rooms[roomIndex].teams[i].length; j++) {
            if (rooms[roomIndex].teams[i][j] !== null && rooms[roomIndex].teams[i][j].id === client.id) {
              rooms[roomIndex].teams[i][j] = null;
            }
          }
          console.log(`User ${client.id} left room: ${rooms[roomIndex].owner}`);
          
          const teamListToSend = rooms[roomIndex].teams.map((t: any) => t.map((p: any) => (p !== null ? p.username : null)));
          io.to(client.roomJoined).emit("room-players-update", teamListToSend);
        }
      }
    });

});

io.listen(3000);