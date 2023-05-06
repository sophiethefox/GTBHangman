import { client } from "./../index";
import { ThreadChannel } from "discord.js";
import { GameRound } from "./GameRound";
import { endGame, getCurrentRound } from "./GameManager";

export class Game {
	privateGame: boolean;
	startTime: string;
	rounds: GameRound[] = [];
	currentRound: number = 0;
	hostId: string;
	threadId: string;
	ended = false;

	leaderboard: [{ id: string; points: number }?] = [];

	// roundCount: number;
	constructor(hostId: string, privateGame: boolean, roundCount: number, difficulty: string, threadId: string) {
		this.hostId = hostId;
		this.privateGame = privateGame;
		this.threadId = threadId;

		for (let i = 0; i < roundCount; i++) {
			let round: GameRound = new GameRound(threadId, difficulty, i);
			this.rounds.push(round);
		}
	}

	async start() {
		this.startTime = Date.now().toString();

		const queue: GameRound[] = [...this.rounds];
		while (queue.length > 0) {
			if (this.ended) {
				queue.length = 0;
				return;
			}
			const round: GameRound = <any>queue.shift();
			this.currentRound = round.index;
			await round!.start();
		}

		// ended can only be set to true from inside endGame.
		if (!this.ended) {
			await endGame(this.threadId);
		}

		// const channel = <ThreadChannel>await client.channels.fetch(this.threadId);
		// this.leaderboard.sort((a, b) => {
		// 	return b!.points - a!.points;
		// });
		// let leaderboardString = "";
		// this.leaderboard.forEach((player) => {
		// 	leaderboardString += `${player?.id}: ${player?.points}`;
		// });
		// channel.send(`Leaderboard: \n\`\`\`${leaderboardString}\`\`\``);
		// channel.send("Closing thread in 10s");
		// await new Promise((r) => setTimeout(r, 10000));
		// channel.setArchived(true);
	}

	end() {
		getCurrentRound(this.threadId).endRound();
		this.ended = true;
	}

	async updateGuesses() {
		this.rounds[this.currentRound].checkIfAllGuessed();
	}
}
