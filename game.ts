enum GameStage {
	Spawn,
	Move,
	Build,
	End,
};

export interface Cell {
	row: number,
	col: number,
}

interface Player {
	username: string,
	id: string,
}

interface Team {
	team: number,
	players: Player[],
	playerToPlay: number,
	pawnCount: number,
	lost: boolean,
};

const adjacentList: Cell[] = [{row: -1, col: -1}, {row: -1, col: 0}, {row: -1, col: 1}, {row: 0, col: -1}, {row: 0, col: 1}, {row: 1, col: -1}, {row: 1, col: 0}, {row: 1, col: 1}];

export class Game {
	board: number[][];
	gameStage: GameStage;
	teamToPlay: number;	// 1, 2 or 3
	teams: Team[]
	playerCount: number;

	pawnMovedCell: Cell | null;

	constructor(teams: any) {
		this.board = Array(5).fill(undefined).map(() => Array(5).fill(0));
		this.playerCount = teams[0].length > 1 ? 4 : teams.length;
		this.gameStage = GameStage.Spawn;
		this.teamToPlay = 1;
		this.teams = teams.map((t:any, i: number) => { return { team: i+1, players: t, playerToPlay: 0, pawnCount: 0, lost: false } });

		this.pawnMovedCell = null;
	}

	private noMoves(team: number) {
		const pawnPositions: Cell[] = [];
		for (let i = 0; i < 5; i++) {
			for (let j = 0; j < 5; j++) {
			  	if (Math.floor(this.board[i][j] / 10) === team) {
					for (let m = 0; m < 8; m++) {
						const ii = i + adjacentList[m].row;
				  		const jj = j + adjacentList[m].col;
						if (
							ii >= 0 && ii <= 4 && jj >= 0 && jj <= 4
							&& this.board[ii][jj] < 4 && this.board[ii][jj] - this.board[i][j] % 10 <= 1
						) {
							return null;
						}
					}
					pawnPositions.push({row: i, col: j});
				}
			}
		}
		return pawnPositions;
	}

	private gameOver() {
		if (this.pawnMovedCell) {
			if (this.board[this.pawnMovedCell.row][this.pawnMovedCell.col] % 10 === 3) {
				return true;
			}
		}
		if (this.playerCount === 3) {
			const nextPlayer = this.teamToPlay % 3 + 1;
			const loserPawns = this.noMoves(nextPlayer);
			if (loserPawns) {	// next player has no moves -> delete their pawns
				console.log(loserPawns);
				if (this.teams[nextPlayer % 3].lost) {	// if the next next player is also already lost, it means only one remains -> they win
					return true;
				}

				for (const pos of loserPawns) {
					this.board[pos.row][pos.col] = this.board[pos.row][pos.col] % 10;
				}
				this.teams[nextPlayer-1].lost = true;
			}
		} else {
			if (this.noMoves(this.teamToPlay % 2 + 1)) {
				return true;
			}
		}
		return false;
	}

	spawn(cell: Cell, id: string) {
		let team = this.teams[this.teamToPlay-1];
		if (this.gameStage === GameStage.Spawn
			&& team.players[team.playerToPlay].id === id && team.pawnCount < 2		// player's turn
			&& cell.row >= 0 && cell.row <= 4 && cell.col >= 0 && cell.col <= 4		// valid cell
			&& this.board[cell.row][cell.col] === 0		// empty cell
		) {
			this.board[cell.row][cell.col] = this.teamToPlay * 10;
			this.teams[this.teamToPlay-1].pawnCount++;

			if (this.playerCount === 3 && this.teams.length === this.teamToPlay) {
				this.gameOver(); // edge case - if player gets squeezed into corner by the two others -> remove the loser's pawns
			}

			if (this.playerCount === 4) {
				this.teams[this.teamToPlay-1].playerToPlay = (team.playerToPlay + 1) % 2;
			}
			if (this.teams[this.teamToPlay-1].pawnCount === 2) {
				if (this.teamToPlay === this.teams.length) {
					this.gameStage = GameStage.Move;
				}
				this.teamToPlay = this.teamToPlay % this.teams.length + 1;
				if (this.teams[this.teamToPlay-1].lost) {	// for the edge case mentioned above
					this.teamToPlay = this.teamToPlay % this.teams.length + 1;
				}
			}
			return true;
		} else {
			return false;
		}
	}

	move(from: Cell, to: Cell, id: string) {
		let team = this.teams[this.teamToPlay-1];
		// console.log(this.board);
		// for (let i = 0; i < this.teams.length; i++) {
		// 	console.log(this.teams[i]);
		// 	console.log(this.teams[i].players);
		// }
		// console.log(`gameStage: ${this.gameStage}\nteamToPlay: ${this.teamToPlay}`);
		// console.log(`from: [${from.row},${from.col}]\tto: [${to.row},${to.col}]\tid: ${id}`);
		if (this.gameStage === GameStage.Move
			&& team.players[team.playerToPlay].id === id								// player's turn
			&& to.row >= 0 && to.row <= 4 && to.col >= 0 && to.col <= 4					// valid to cell
			&& from.row >= 0 && from.row <= 4 && from.col >= 0 && from.col <= 4			// valid from cell
			&& Math.floor(this.board[from.row][from.col] / 10) === this.teamToPlay		// current player on it
			&& Math.abs(from.row - to.row) <= 1 && Math.abs(from.col - to.col) <= 1		// not too far
			&& this.board[to.row][to.col] < 4 && this.board[to.row][to.col] - this.board[from.row][from.col] % 10 <= 1	// not occupied / domed, not too tall
		) {
			this.board[to.row][to.col] = this.teamToPlay * 10 + this.board[to.row][to.col];
			this.board[from.row][from.col] = this.board[from.row][from.col] - this.teamToPlay * 10;
			this.gameStage = GameStage.Build;
			this.pawnMovedCell = to;
			return true;
		} else {
			return false;
		}
	}

	build(to: Cell, id: string) {
		let team = this.teams[this.teamToPlay-1];
		if (this.gameStage === GameStage.Build && this.pawnMovedCell !== null
			&& team.players[team.playerToPlay].id === id					// player's turn
			&& to.row >= 0 && to.row <= 4 && to.col >= 0 && to.col <= 4		// valid cell
			&& this.board[to.row][to.col] < 4								// buildable
			&& Math.abs(this.pawnMovedCell.row - to.row) <= 1 && Math.abs(this.pawnMovedCell.col - to.col) <= 1		// not too far
		) {
			this.board[to.row][to.col] += 1;

			if (this.gameOver()) {
				this.gameStage = GameStage.End;
				return true;
			}
			
			this.pawnMovedCell = null;

			if (this.playerCount === 4) {
				this.teams[this.teamToPlay-1].playerToPlay = (team.playerToPlay + 1) % 2;
			}
			this.teamToPlay = this.teamToPlay % this.teams.length + 1;
			if (this.teams[this.teamToPlay-1].lost) {
				this.teamToPlay = this.teamToPlay % this.teams.length + 1;
			}

			this.gameStage = GameStage.Move;
			return true;
		} else {
			return false;
		}
	}

	getInitialState() {
		return {
			board: this.board,
			playerCount: this.playerCount,
			teamToPlay: this.teamToPlay,
			gameStage: this.gameStage,
			teams: this.teams,
		};
	}

	getGameState() {
		return {
			board: this.board,
			gameStage: this.gameStage,
			teamToPlay: this.teamToPlay,
			teams: this.teams,
		};
	}
}