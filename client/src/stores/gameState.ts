import { ref, computed, type Ref } from "vue";
import { defineStore } from "pinia";
import { GameStage, type Coord, type Action, GameMode, adjacentList } from "@/Utilities";

import { socket, state } from "@/socket";
import { MiniMax } from "@/ai/minimax";
import { MCTS } from "@/ai/mcts";
// import { MCTS2 } from "@/ai/mcts2";

export const useGameState = defineStore("gameState", () => {
  // 12 = player 1 on building 2
  // 03 = no player building 3
  // 30 = player 3 on building 0
  const board = ref([
    ["00", "00", "00", "00", "00"],
    ["00", "00", "00", "00", "00"],
    ["00", "00", "00", "00", "00"],
    ["00", "00", "00", "00", "00"],
    ["00", "00", "00", "00", "00"],
  ]);
  const boardAsList = computed(() => {
    const boardCells = [];
    for (let i = 0; i < 5; i++) {
      for (let j = 0; j < 5; j++) {
        boardCells.push({ y: i, x: j, content: board.value[i][j] });
      }
    }
    return boardCells;
  });

  const gameStateMessage = computed(() => {
    if (online.value) {
      if (gameStage.value !== GameStage.End) {
        const team = teams.value[teamToPlay.value-1];
        return `It's ${team.players[team.playerToPlay].username}'s turn to ${gameStage.value === GameStage.Spawn ? "spawn" : (gameStage.value === GameStage.Move ? "move" : "build")}...`;
      } else {
        return `${playerCount.value === 4 ? "Team" : "Player"} ${winner.value} won!`;
      }
    } else {
      switch (gameStage.value) {
        case GameStage.AiThinking:
          return "AI thinking...";
        case GameStage.Spawn:
          return "It's your turn to spawn.";
        case GameStage.Move:
          return "It's your turn to move.";
        case GameStage.Build:
          return "It's your turn to build.";
        case GameStage.End:
          return `${winner.value === 1 ? 'You' : "The AI"} won.`
      }
    }
  })

  const winner = ref(-1);
  const gameStage = ref(GameStage.Spawn);
  const playerCount = ref(2);
  const teamToPlay = ref(1);
  const teams: Ref<any | null> = ref(null);
  const online = ref(false);

  const playerPawnCount = [0, 0, 0];

  const ai = [new MiniMax(5), new MCTS(40000, 1.41)];

  function initialiseOnlineGame(initData: any) {
    updateBoard(initData.board);
    playerCount.value = initData.playerCount;
    teamToPlay.value = initData.teamToPlay;
    gameStage.value = initData.gameStage;
    teams.value = initData.teams;
    online.value = true;
  }

  function updateGameState(update: any) {
    updateBoard(update.board);
    gameStage.value = update.gameStage;
    teamToPlay.value = update.teamToPlay;
    teams.value = update.teams;

    if (update.gameStage === GameStage.End) {
      winner.value = teamToPlay.value;
    }
  }

  function updateBoard(updatedBoard: any) {
    for (let i = 0; i < updatedBoard.length; i++) {
      for (let j = 0; j < updatedBoard[i].length; j++) {
        if (updatedBoard[i][j] <= 4) {
          board.value[i][j] = "0" + updatedBoard[i][j].toString();
        } else {
          board.value[i][j] = updatedBoard[i][j].toString();
        }
      }
    }
  }

  function spawnPawn(row: number, col: number, gameMode: number = 10) {
    if (board.value[row][col][0] === "0") {
      if (gameMode === GameMode.Online) {
        const team = teams.value[teamToPlay.value-1];
        if (socket.id === team.players[team.playerToPlay].id) {
          socket.emit("spawn", { row: row, col: col });
        }
      } else {
        board.value[row][col] = `${teamToPlay.value}0`;
        playerPawnCount[teamToPlay.value - 1]++;
  
        if (playerPawnCount[teamToPlay.value - 1] === 2) {
          nextPlayer();
          if (gameMode === GameMode.Minimax || gameMode === GameMode.MCTS) {
            gameStage.value = GameStage.AiThinking;

            // first spawn:
            let spawn = ai[gameMode].bestSpawn(board.value);
            board.value[spawn.y][spawn.x] = `${teamToPlay.value}0`;
            playerPawnCount[teamToPlay.value - 1]++;
            // second spawn:
            spawn = ai[gameMode].bestSpawn(board.value);
            board.value[spawn.y][spawn.x] = `${teamToPlay.value}0`;
            playerPawnCount[teamToPlay.value - 1]++;
            
            nextPlayer();
          }
        }
  
        if (playerPawnCount[playerCount.value - 1] === 2) {
          gameStage.value = GameStage.Move;
        }
      }
    }
  }

  function makeMove(from: Coord, to: Coord, gameMode: number = 10) {
    if (
      board.value[from.y][from.x][0] === teamToPlay.value.toString() &&
      board.value[to.y][to.x][0] === "0" && parseInt(board.value[to.y][to.x][1]) < 4 &&
      Math.abs(from.x - to.x) <= 1 &&
      Math.abs(from.y - to.y) <= 1 &&
      parseInt(board.value[to.y][to.x][1]) - parseInt(board.value[from.y][from.x][1]) <= 1
    ) {
      if (gameMode === GameMode.Online) {
        const team = teams.value[teamToPlay.value-1];
        if (socket.id === team.players[team.playerToPlay].id) {
          socket.emit("move", {row: from.y, col: from.x}, {row: to.y, col: to.x});
        } else {
          return false;
        }
        return true;
      } else {
        board.value[from.y][from.x] = "0" + board.value[from.y][from.x][1];
        board.value[to.y][to.x] =
          teamToPlay.value.toString() + board.value[to.y][to.x][1];
  
        gameStage.value = GameStage.Build;
  
        return true;
      }
    }
    return false;
  }

  function build(to: Coord, from: Coord, gameMode: number = 10) {
    if (
      board.value[to.y][to.x][0] === "0" &&
      parseInt(board.value[to.y][to.x][1]) < 4 &&
      Math.abs(from.x - to.x) <= 1 &&
      Math.abs(from.y - to.y) <= 1
    ) {
      if (gameMode === GameMode.Online) {
        const team = teams.value[teamToPlay.value-1];
        if (socket.id === team.players[team.playerToPlay].id) {
          socket.emit("build", {row: to.y, col: to.x});
          return true;
        }
      } else {
        board.value[to.y][to.x] = `0${parseInt(board.value[to.y][to.x][1]) + 1}`;
        nextPlayer();

        if (gameMode === GameMode.Minimax || gameMode === GameMode.MCTS) {
          gameStage.value = GameStage.AiThinking;
          const worker = new Worker(new URL("./aiActionWorker.ts", import.meta.url), {type: "module"});
          worker.postMessage((JSON.stringify({gameMode: gameMode, board: board.value, playerToPlay: teamToPlay.value})));
          worker.addEventListener("message", (result) => {
            // console.log(result.data);
            if (applyAiAction(result.data) === GameStage.End) {
              gameStage.value = GameStage.End;
              winner.value = teamToPlay.value;
            } else {
              nextPlayer();
              gameStage.value = GameStage.Move;
            }
          });
        } else {
          gameStage.value = GameStage.Move;
        }
        return true;
      }
    }
    return false;
  }

  function nextPlayer() {
    teamToPlay.value = (teamToPlay.value + 1) % (playerCount.value + 1);
    if (teamToPlay.value === 0) teamToPlay.value++;
  }

  function noMoves(player: number) {
    for (let i = 0; i < 5; i++) {
      for (let j = 0; j < 5; j++) {
        if (board.value[i][j][0] === player.toString()) {
          for (let m = 0; m < 8; m++) {
            const ii = i + adjacentList[m].y;
            const jj = j + adjacentList[m].x;
            if (
              ii >= 0 && ii <= 4 && jj >= 0 && jj <= 4
              && board.value[ii][jj][0] === "0" && parseInt(board.value[ii][jj][1]) < 4
              && parseInt(board.value[ii][jj][1]) - parseInt(board.value[i][j][1]) <= 1
            ) {
              return false;
            }
          }
        }
      }
    }
    return true;
  }

  function gameEnd(action: Action | null) {
    if (action) {
      if (board.value[action.moveToCell.y][action.moveToCell.x][1] === '3' || noMoves(teamToPlay.value)) {
        return 1;
      }
    }
    return 0;
  }

  // function aiAction(gameMode: GameMode) {
  //   if (applyAiAction(ai[gameMode].bestMove(board.value, teamToPlay.value)) === GameStage.End) {
  //     gameStage.value = GameStage.End;
  //     winner.value = teamToPlay.value;
  //   } else {
  //     nextPlayer();
  //     gameStage.value = GameStage.Move;
  //   }
  // }

  function applyAiAction(action: Action | null) {
    // console.log(`from [${action?.fromCell.y}, ${action?.fromCell.x}] to [${action?.moveToCell.y}, ${action?.moveToCell.x}], build: [${action?.buildCell?.y}, ${action?.buildCell?.x}]`);
    if (action) {
      board.value[action.moveToCell.y][action.moveToCell.x] = (teamToPlay.value * 10 + parseInt(board.value[action.moveToCell.y][action.moveToCell.x])).toString();
      board.value[action.fromCell.y][action.fromCell.x] = "0" + (parseInt(board.value[action.fromCell.y][action.fromCell.x]) - teamToPlay.value * 10).toString();
      if (action.buildCell) {
        board.value[action.buildCell.y][action.buildCell.x] = "0" + (parseInt(board.value[action.buildCell.y][action.buildCell.x]) + 1).toString();
      }
    } else {
      console.log("AI error: action is null");
    }

    if (gameEnd(action)) {
      return GameStage.End;
    }
    return -1;
  }

  return {
    board,
    boardAsList,
    gameStateMessage,
    gameStage,
    playerToPlay: teamToPlay,
    spawnPawn,
    makeMove,
    build,
    updateGameState,
    initialiseOnlineGame,
  };
});
