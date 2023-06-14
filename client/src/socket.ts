import { reactive } from "vue";
import { io } from "socket.io-client";

export const state = reactive({
  connected: false,
  room: {
    roomId: undefined,
    playerCount: null,
    teams: [],
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

socket.on("room-full", (roomId) => {
  console.log("Room " + roomId + " is full.");
});

socket.on("room-players-update", (teamList) => {
  state.room.teams = teamList;
})

socket.on("new-room-created", (roomId, teamList, playerCount/*, username*/) => {
  state.room.roomId = roomId;
  state.room.playerCount = playerCount;
  state.room.teams = teamList;
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