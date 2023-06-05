import { GameMode, type Action } from "@/Utilities";
import { MiniMax } from "@/ai/minimax";
import { MCTS } from "@/ai/mcts";

self.addEventListener("message", function(e) {
    const data = JSON.parse(e.data);
    // console.log(data);
    let ai = null;
    switch (data.gameMode) {
        case GameMode.Minimax:
            ai = new MiniMax(5);
            break;
        case GameMode.MCTS:
            ai = new MCTS(40000, 1.41);
    }
    const action = ai?.bestMove(data.board, data.playerToPlay);
    postMessage(action);
}, false);
