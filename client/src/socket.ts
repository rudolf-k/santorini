import { reactive } from "vue";
import { io } from "socket.io-client";

export const state = reactive({
  connected: false,
  room: {
    roomId: undefined,
    playerCount: null,
    teams: [],
    // players: [],
    gameStarted: false,
    gameState: null,
    initData: null,
  }
});

// "undefined" means the URL will be computed from the `window.location` object
// const URL = "http://localhost:3000";

export const socket = io(window.location.origin, { autoConnect: false });

socket.on("connect", () => {
  state.connected = true;
});

socket.on("disconnect", () => {
  state.connected = false;
});

socket.on("connect_error", (err) => {
  console.log(err.message);
});

socket.on("room-not-found", (roomId) => {
  console.log("Room " + roomId + " not found on server.");
});

socket.on("room-players-update", (teamList) => {
  // state.room.players = playerList;
  state.room.teams = teamList;
})

socket.on("new-room-created", (roomId, teamList, playerCount/*, username*/) => {
  state.room.roomId = roomId;
  state.room.playerCount = playerCount;
  // const teamSize = (state.room.playerCount === 4 ? 2 : 1);
  // state.room.provisionalTeams = Array((state.room.playerCount === 3 ? 3 : 2)).fill(undefined).map(() => Array(teamSize).fill(null));
  // state.room.provisionalTeams[0][0] = { id: socket.id, username: username }
  state.room.teams = teamList;
  // state.room.players = playerList;
});

socket.on("room-joined", (roomId) => {
  state.room.roomId = roomId;
});

socket.on("game-update", (update) => {
  state.room.gameState = update;
  console.log(update);
});

socket.on("game-started", (initUpdate) => {
  state.room.gameStarted = true;
  state.room.initData = initUpdate;
});