import { boardStringToInt, type Action, type Coord, type Team, adjacentList, coordsEqual, type State } from "@/Utilities";

let maxDepth = 0;

////////////////////////////////////
function weightedRandomAction(options: any[]) {
    let i;

    let weights = [options[0].weight];

    for (i = 1; i < options.length; i++) {
        weights[i] = options[i].weight + weights[i - 1];
    }

    let random = Math.random() * weights[weights.length - 1];

    for (i = 0; i < weights.length; i++) {
        if (weights[i] >= random) {
            break;
        }
    }
    return options[i].action;
}
////////////////////////////////////

function evaluation(state: State) {
    let evaluation = 0;
    state.playerPawns.forEach((pawnPositions: Coord[], player_index: number) => {
        const multiplier = player_index === state.playerToPlay - 1 ? 1 : -1;
        pawnPositions.forEach((piecePos: Coord, index: number) => {
            evaluation += multiplier * state.board[piecePos.y][piecePos.x] % 10 / 10;
        });
    });
    return evaluation;
}

function copyState(state: State): State {
    const boardCopy = state.board.map((row) => row.slice());
    const playerPawnsCopy = state.playerPawns.map((pp) => pp.slice());
    return {
        board: boardCopy,
        playerPawns: playerPawnsCopy,
        playerToPlay: state.playerToPlay,
    }
}

function getWinningAction(state: State): Action | null {
    for (const [index, piecePos] of state.playerPawns[state.playerToPlay - 1].entries()) {
        for (let m = 0; m < 8; m++) {
            const moveDest: Coord = {y: piecePos.y + adjacentList[m].y, x: piecePos.x + adjacentList[m].x};
            if (moveDest.y >= 0 && moveDest.y <= 4 && moveDest.x >= 0 && moveDest.x <= 4    // valid cell
                && state.board[moveDest.y][moveDest.x] < 4 && state.board[moveDest.y][moveDest.x] - state.board[piecePos.y][piecePos.x] % 10 <= 1   // not occupied / dome, not too tall
            ) {
                if (state.board[moveDest.y][moveDest.x] === 3) {
                    return {
                        fromCell: piecePos,
                        moveToCell: moveDest,
                        buildCell: piecePos,
                        player: index,
                    };
                }
                // MAYBE CHECK IF ENEMY CAN BE FULLY BLOCKED
                // for (let b = 0; b < 8; b++) {
                //     const buildPos: Coord = {y: moveDest.y + adjacentList[b].y, x: moveDest.x + adjacentList[b].x};
                //     if (buildPos.y >= 0 && buildPos.y <= 4 && buildPos.x >= 0 && buildPos.x <= 4    // valid cell
                //         && (state.board[buildPos.y][buildPos.x] <= 3 || coordsEqual(piecePos, buildPos))    // not domed or same as 'from' pos
                //     ) {
                //         if (noMoves())
                //     }
                // }
            }
        }
    }
    return null;
}

function getLegalActions(state: State) {
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

function noMoves(board: number[][], pawnPositions: Coord[]) {
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

function playAction(state: State, action: Action): State {
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

function getValueAndTerminated(state: State, action: Action | null) {
    if (action === null) {
        return [0, false];
    }

    if (state.board[action.moveToCell.y][action.moveToCell.x] % 10 === 3) {
        return [1000, true];
    } else if (noMoves(state.board, state.playerPawns[state.playerToPlay - 1])) {
        return [-1000, true];
    }

    return [0, false];
}

class Node {
    cVal: number;
    state: State;
    parent: Node | null;
    actionTaken: Action | null;

    expendableMoves: Action[];
    
    children: Node[] = [];
    visitCount: number = 0;
    valueSum: number = 0;

    depth: number = 0;

    // MAX_SIM_DEPTH = 150;

    constructor(cVal: number, state: State, parent: Node | null=null, actionTaken: Action | null=null, depth: number = 0) {
        this.cVal = cVal;
        this.state = state;
        this.parent = parent;
        this.actionTaken = actionTaken;

        this.expendableMoves = getLegalActions(state);

        this.depth = depth;
    }

    isFullyExpanded() {
        return this.expendableMoves.length === 0 && this.children.length > 0;
    }

    getUcb(child: Node) {
        return (child.valueSum / child.visitCount) + this.cVal * Math.sqrt(Math.log(this.visitCount) / child.visitCount);
    }

    select() {
        let bestChild = null;
        let bestUcb = -Infinity;

        for (const child of this.children) {
            const ucb = this.getUcb(child);
            if (ucb > bestUcb) {
                bestChild = child;
                bestUcb = ucb;
            }
        }
        return bestChild;
    }

    expand() {
        const actionIndex = Math.floor(Math.random() * this.expendableMoves.length);
        const action = this.expendableMoves.splice(actionIndex, 1)[0];

        const childState = playAction(this.state, action);
        // @ts-ignore
        const child = new Node(this.cVal, childState, this, {fromCell: {x: action.fromCell.x, y: action.fromCell.y}, buildCell: {x: action.buildCell.x, y: action.buildCell.y}, moveToCell: {x: action.moveToCell.x, y: action.moveToCell.y}, player: action.player}, this.depth + 1);
        this.children.push(child);
        return child;
    }

    simulate() {
        let [value, isTerminal] = getValueAndTerminated(this.state, this.actionTaken);
        value = -value;

        if (isTerminal) {
            return value;
        }

        let rolloutState = copyState(this.state);
        // let depth = 0;
        while (true) {
            const validActions = getLegalActions(rolloutState).map((a: Action) => {
                return {
                    action: a,
                    weight: rolloutState.board[a.moveToCell.y][a.moveToCell.x] % 10 === 3 ? 1000 : 2 - (rolloutState.board[a.fromCell.y][a.fromCell.x] % 10 - rolloutState.board[a.moveToCell.y][a.moveToCell.x] % 10),
                }
            });
            const action = weightedRandomAction(validActions);
            // const action = validActions[Math.floor(Math.random() * validActions.length)];
            rolloutState = playAction(rolloutState, action);
            [value, isTerminal] = getValueAndTerminated(rolloutState, action);
            // depth++;
            if (isTerminal/* || depth === this.MAX_SIM_DEPTH*/) {
                // value = (isTerminal ? value : evaluation(rolloutState));
                if (rolloutState.playerToPlay !== this.state.playerToPlay) {
                    value = -value;
                }
                return value;
            }
            
        }
    }

    backpropagate(value: number) {
        this.valueSum += value;
        this.visitCount += 1;

        value = -value;
        if (this.parent !== null) {
            this.parent.backpropagate(value);
        }
    }
}

export class MCTS {
    private MAX_DEPTH = 15;

    private preferredSpawns: Coord[] = [{y: 2, x: 2}, {y: 1, x: 2}, {y: 2, x: 1}, {y: 2, x: 3}, {y: 3, x: 2}, {y: 1, x: 1}, {y: 1, x: 3}, {y: 3, x: 1}, {y: 3, x: 3}];
    private numSearches: number;
    private cVal: number;

    constructor(numSearches: number, cVal: number = 1.41) {
        this.numSearches = numSearches;
        this.cVal = cVal;
    }

    search(state: State) {
        //// check if there is a 1 move win ////
        const winningAction = getWinningAction(state);
        if (winningAction) {
            return winningAction;
        }
        ////////////////////////////////////////

        const root = new Node(this.cVal, state);

        for (let i = 0; i < this.numSearches; i++) {
            let node = root;

            while (node.isFullyExpanded()) {
                // @ts-ignore
                node = node.select();

                // if (node.depth > maxDepth) {
                //     maxDepth = node.depth;
                // }
            }

            let [value, isTerminal] = getValueAndTerminated(node.state, node.actionTaken);
            value = -value;

            if (!isTerminal) {
                if (node.depth === this.MAX_DEPTH) {
                    value = evaluation(node.state);
                } else {
                    node = node.expand();
                    value = node.simulate();
                }
            }
            // @ts-ignore
            node.backpropagate(value);
        }

        let actionWithMaxVisitCount: Action | null = null;
        let maxVisitCount = -1;
        for (const child of root.children) {
            if (child.visitCount > maxVisitCount) {
                maxVisitCount = child.visitCount;
                actionWithMaxVisitCount = child.actionTaken;
            }
        }

        // console.log(maxDepth);

        return actionWithMaxVisitCount;
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

        return this.search({board, playerPawns, playerToPlay});
    }
}