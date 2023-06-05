import { boardStringToInt, type Action, type Coord, type Team, adjacentList, coordsEqual, type State } from "@/Utilities";

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

function newStateAfterAction(state: State, action: Action) {
    const nextState: State = structuredClone(state);
    nextState.board[action.moveToCell.y][action.moveToCell.x] = state.playerToPlay * 10 + nextState.board[action.moveToCell.y][action.moveToCell.x];
    nextState.board[action.fromCell.y][action.fromCell.x] = nextState.board[action.fromCell.y][action.fromCell.x] - state.playerToPlay * 10;
    if (action.buildCell) {
        nextState.board[action.buildCell.y][action.buildCell.x] = nextState.board[action.buildCell.y][action.buildCell.x] + 1;
    }
    nextState.playerPawns[state.playerToPlay - 1][action.player] = structuredClone(action.moveToCell);
    nextState.playerToPlay = (state.playerToPlay === 1 ? 2 : 1);
    return nextState;
}

function applyActionOnState(state: State, action: Action) {
    state.board[action.moveToCell.y][action.moveToCell.x] = state.playerToPlay * 10 + state.board[action.moveToCell.y][action.moveToCell.x];
    state.board[action.fromCell.y][action.fromCell.x] = state.board[action.fromCell.y][action.fromCell.x] - state.playerToPlay * 10;
    if (action.buildCell) {
        state.board[action.buildCell.y][action.buildCell.x] = state.board[action.buildCell.y][action.buildCell.x] + 1;
    }
    state.playerPawns[state.playerToPlay - 1][action.player] = structuredClone(action.moveToCell);
    state.playerToPlay = (state.playerToPlay === 1 ? 2 : 1);
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

function getStateValue(state: State) {
    const previousPlayer = (state.playerToPlay === 1 ? 2 : 1);
    for (let i = 0; i < 2; i++) {
        const [ii, jj] = [state.playerPawns[previousPlayer-1][i].y, state.playerPawns[previousPlayer-1][i].x]
        if (state.board[ii][jj] % 10 === 3) {
            return 1;
        }
    }
    if (noMoves(state.board, state.playerPawns[state.playerToPlay-1])) {
        return 1;
    }
    return 0;
}

function chooseRolloutAction(state: State) {
    const actions = getLegalActions(state);
    let weights = Array(actions.length);
    let s = 0;
    let i;
    for (i = 0; i < actions.length; i++) {
        s = (i === 0 ? 0 : weights[i-1]);
        if (state.board[actions[i].moveToCell.y][actions[i].moveToCell.x] === 3) {
            weights[i] = 1000 + s;
        } else {
            weights[i] = 3 + (state.board[actions[i].moveToCell.y][actions[i].moveToCell.x] - state.board[actions[i].fromCell.y][actions[i].fromCell.x] % 10) + s;
        }
    }
    const random = Math.random() * weights[weights.length - 1];
    for (i = 0; i < weights.length; i++) {
        if (weights[i] >= random) {
            break;
        }
    }
    return actions[i];
}

class Node {
    cVal: number;
    state: State;
    expandableMoves: Action[];
    children: Node[];
    parent: Node | null;
    actionTaken: Action | null;

    valueSum: number;
    visitCount: number;
    
    constructor(cVal: number = 1.41, state: State, parent: Node | null, actionTaken: Action | null) {
        this.cVal = cVal;
        this.state = state;
        this.expandableMoves = getLegalActions(state);
        this.children = [];
        this.parent = parent;
        this.actionTaken = actionTaken;
        this.valueSum = 0;
        this.visitCount = 0;
    }

    isFullyExpanded() {
        return this.expandableMoves.length === 0 && this.children.length > 0;
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
        const actionIndex = Math.floor(Math.random() * this.expandableMoves.length);
        const action = structuredClone(this.expandableMoves[actionIndex]);
        this.expandableMoves.splice(actionIndex, 1);

        const childState = newStateAfterAction(this.state, action);
        const child = new Node(this.cVal, childState, this, action);
        this.children.push(child);
        return child;
    }

    rollout() {
        let value = getStateValue(this.state);
        let rolloutState: State = structuredClone(this.state);
        while (value === 0) {
            const action = chooseRolloutAction(rolloutState);
            applyActionOnState(rolloutState, action);
            value = getStateValue(rolloutState);
        }
        return (rolloutState.playerToPlay !== this.state.playerToPlay ? -value : value);
    }

    backpropagate(value: number) {
        this.valueSum += value;
        this.visitCount += 1;
        
        if (this.parent) {
            this.parent.backpropagate(-value);
        }
    }
}

export class MCTS {
    private preferredSpawns: Coord[] = [{y: 2, x: 2}, {y: 1, x: 2}, {y: 2, x: 1}, {y: 2, x: 3}, {y: 3, x: 2}, {y: 1, x: 1}, {y: 1, x: 3}, {y: 3, x: 1}, {y: 3, x: 3}];

    private numSearches: number;
    private cVal: number;
    
    constructor(numSearches: number, cVal: number = 1.41) {
        this.numSearches = numSearches;
        this.cVal = cVal;
    }

    private search(state: State) {
        const root = new Node(this.cVal, structuredClone(state), null, null);

        for (let i = 0; i < this.numSearches; i++) {
            let node = root;

            while (node.isFullyExpanded()) {
                // @ts-ignore
                node = node.select();
            }

            let value = getStateValue(node.state);
            if (value === 0) {
                node = node.expand();
                value = node.rollout();
            }
            node.backpropagate(value);
        }

        let bestAction = null;
        let maxVisitCount = -1;
        for (const child of root.children) {
            if (child.visitCount > maxVisitCount) {
                maxVisitCount = child.visitCount;
                bestAction = child.actionTaken;
            }
        }
        return bestAction;
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
