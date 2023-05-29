import { boardStringToInt, type Action, type Coord, type Team, adjacentList, coordsEqual, type State } from "@/Utilities";

export class MiniMax {
    private preferredSpawns: Coord[] = [{y: 2, x: 2}, {y: 1, x: 2}, {y: 2, x: 1}, {y: 2, x: 3}, {y: 3, x: 2}, {y: 1, x: 1}, {y: 1, x: 3}, {y: 3, x: 1}, {y: 3, x: 3}];
    private depth: number;

    constructor(depth: number) {
        this.depth = depth;
    }

    private getLegalActions(state: State) {
        const actions: Action[] = [];
        state.playerPawns[state.playerToPlay - 1].forEach((piecePos: Coord, index: number) => {
            for (let m = 0; m < 8; m++) {
                const moveDest: Coord = {y: piecePos.y + adjacentList[m].y, x: piecePos.x + adjacentList[m].x};
                if (moveDest.y >= 0 && moveDest.y <= 4 && moveDest.x >= 0 && moveDest.x <= 4    // valid cell
                    && state.board[moveDest.y][moveDest.x] < 4 && state.board[moveDest.y][moveDest.x] - state.board[piecePos.y][piecePos.x] % 10 <= 1   // not occupied / dome, not too tall
                ) {
                    for (let b = 0; b < 8; b++) {
                        const buildPos: Coord = {y: moveDest.y + adjacentList[b].y, x: moveDest.x + adjacentList[b].x};
                        if (buildPos.y >= 0 && buildPos.y <= 4 && buildPos.x >= 0 && buildPos.x <= 4    // valid cell
                            && (state.board[buildPos.y][buildPos.x] <= 3 || coordsEqual(piecePos, buildPos))    // not domed or same as 'from' pos
                        ) {
                            actions.push({
                                fromCell: piecePos,
                                moveToCell: moveDest,
                                buildCell: buildPos,
                                player: index,  // index of piece among player's pawns
                            });
                        }
                    }
                }
            }
        });
        return actions;
    }

    private noMoves(board: number[][], pawnPositions: Coord[]) {
        for (const piecePos of pawnPositions) {
            for (let m = 0; m < 8; m++) {
                const moveDest: Coord = {y: piecePos.y + adjacentList[m].y, x: piecePos.x + adjacentList[m].x};
                if (moveDest.y >= 0 && moveDest.y <= 4 && moveDest.x >= 0 && moveDest.x <= 4    // valid cell
                    && board[moveDest.y][moveDest.x] < 4 && board[moveDest.y][moveDest.x] - board[piecePos.y][piecePos.x] % 10 <= 1 // not occupied / dome, not too tall
                ) {
                    return false;
                }
            }
        }
        return true;
    }

    private playAction(state: State, action: Action): State {
        const nextBoard = state.board.map((row) => row.slice());
        nextBoard[action.moveToCell.y][action.moveToCell.x] = state.playerToPlay * 10 + nextBoard[action.moveToCell.y][action.moveToCell.x];
        nextBoard[action.fromCell.y][action.fromCell.x] = nextBoard[action.fromCell.y][action.fromCell.x] - state.playerToPlay * 10;
        if (action.buildCell) {
            nextBoard[action.buildCell.y][action.buildCell.x] = nextBoard[action.buildCell.y][action.buildCell.x] + 1;
        }
        const nextPlayerPawns = state.playerPawns.map((pp) => pp.slice());
        nextPlayerPawns[state.playerToPlay - 1][action.player] = action.moveToCell;
        
        return {
            board: nextBoard,
            playerPawns: nextPlayerPawns,
            playerToPlay: state.playerToPlay % 2 + 1,
        }
    }

    private minimaxRoot(board: number[][], playerPawns: Coord[][], playerToPlay: number, isMaximizing: boolean) {
        const state: State = {
            board: board,
            playerPawns: playerPawns,
            playerToPlay: playerToPlay,
        };
        
        const possibleActions = this.getLegalActions(state);
        let bestActionValue = -9999;
        let bestActionFinal: Action|null = null;
        
        for (const action of possibleActions) {
            const stateAfterAction = this.playAction(state, action);
            const value = Math.max(bestActionValue, this.minimax(this.depth - 1, stateAfterAction, -10000, 10000, !isMaximizing));
            if (value > bestActionValue) {
                bestActionValue = value;
                bestActionFinal = action;
            }
        }
        console.log(bestActionValue);
        return bestActionFinal;
    }

    private minimax(depth: number, state: State, alpha: number, beta: number, isMaximizing: boolean) {        
        const terminalScore = this.terminalScore(state);
        if (terminalScore !== 0) {
            return (isMaximizing ? 1 : -1) * terminalScore;
        }
        if (depth === 0) {
            return -this.evaluation(state);
        }

        const possibleActions = this.getLegalActions(state);

        if (isMaximizing) {
            let bestActionValue = -9999;
            for (const action of possibleActions) {
                const stateAfterAction = this.playAction(state, action);
                bestActionValue = Math.max(bestActionValue, this.minimax(depth - 1, stateAfterAction, alpha, beta, !isMaximizing))
                alpha = Math.max(alpha, bestActionValue)
                if (beta <= alpha) {
                    return bestActionValue;
                }
            }
            return bestActionValue;
        } else {
            let bestActionValue = 9999;
            for (const action of possibleActions) {
                const stateAfterAction = this.playAction(state, action);
                bestActionValue = Math.min(bestActionValue, this.minimax(depth - 1, stateAfterAction, alpha, beta, !isMaximizing))
                beta = Math.min(beta, bestActionValue)
                if (beta <= alpha) {
                    return bestActionValue;
                }
            }
            return bestActionValue;
        }
    }

    private evaluation(state: State) {
        let evaluation = 0;
        state.playerPawns.forEach((pawnPositions: Coord[], player_index: number) => {
            const multiplier = player_index === state.playerToPlay - 1 ? 1 : -1;
            pawnPositions.forEach((piecePos: Coord, index: number) => {
                evaluation += multiplier * state.board[piecePos.y][piecePos.x] % 10 / 10;
            });
        });
        return evaluation;
    }

    private terminalScore(state: State) {
        let value = 0;
        for (const [player_index, pawnPositions] of state.playerPawns.entries()) {
            const multiplier = player_index === state.playerToPlay - 1 ? 1 : -1;
            for (const piecePos of pawnPositions) {
                if (state.board[piecePos.y][piecePos.x] % 10 === 3) {
                    value = multiplier * 1000;
                    break;
                    // return multiplier * 1000000;
                }
            }
            if (value !== 0) {
                break;
            }
            if (multiplier === 1 && this.noMoves(state.board, pawnPositions)) {
                value = -multiplier * 1000;
                break;
                // return -multiplier * 1000000;
            }
        }
        return value;
    }

    bestSpawn(board: string[][]) {
        for (let spawn of this.preferredSpawns) {
            if (board[spawn.y][spawn.x] === "00") {
                return spawn;
            }
        }
        return {x: -1, y: -1};
    }

    bestMove(stringBoard: string[][], playerToPlay: number) {
        const board: number[][] = boardStringToInt(stringBoard);

        const playerPawns: Coord[][] = Array(2).fill(undefined).map((p) => Array(0));
        for (let i = 0; i < 5; i++) {
            for (let j = 0; j < 5; j++) {
                if (board[i][j] > 4) {
                    playerPawns[Math.floor(board[i][j] / 10)-1].push({y: i, x: j});
                }
            }
        }

        return this.minimaxRoot(board, playerPawns, playerToPlay, true);
    }
}