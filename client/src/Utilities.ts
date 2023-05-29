export interface Coord {
  x: number;
  y: number;
};

export enum GameStage {
  Spawn,
  Move,
  Build,
  End,

  AiThinking,
};

export interface Piece {
  pieceHtml: HTMLElement;
  originalPos: Coord;
  originalCell: Coord;
  destinationCell: Coord | null;
};

export interface Action {
  fromCell: Coord,
  moveToCell: Coord,
  buildCell: Coord | null,
  player: number,
};

export enum EnteringRoom {
  AsOwner = "0",
  AsGuest = "1",
};

export interface Team {
	team: number,
	players: string[],
	playerToPlay: number,
};

export enum GameMode {
  Minimax,
  MCTS,
  Online,
}

export const adjacentList: Coord[] = [{y: -1, x: -1}, {y: -1, x: 0}, {y: -1, x: 1}, {y: 0, x: -1}, {y: 0, x: 1}, {y: 1, x: -1}, {y: 1, x: 0}, {y: 1, x: 1}];

export interface State {
  board: number[][],
  playerPawns: Coord[][],
  playerToPlay: number,
}

export function coordsEqual(a: Coord, b: Coord) {
  return a.x === b.x && a.y === b.y;
}

export function boardStringToInt(board: string[][]) {
  const newBoard = Array(5).fill(undefined).map(() => Array(5));
  for (let i = 0; i < 5; i++) {
    for (let j = 0; j < 5; j++) {
      newBoard[i][j] = parseInt(board[i][j]);
    }
  }
  return newBoard;
}

// export function boardIntToString(board: number[][]) {
  
// }