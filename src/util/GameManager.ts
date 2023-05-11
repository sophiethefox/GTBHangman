import { client } from "./../index";
import { CommandInteraction, Message, TextChannel, ThreadChannel } from "discord.js";
import { Game } from "./Game";
let Games: Game[] = [];

async function createGame(
	hostId: string,
	privateGame: boolean,
	roundCount: number,
	difficulty: string,
	source: CommandInteraction
): Promise<string | null> {
	if (source.channel!.isThread()) return null;
	const thread: ThreadChannel = await (<TextChannel>source.channel!).threads.create({
		name: `GTB-${source.user.tag}-${Math.floor(Date.now() / 1000)}`
	});
	thread.send(`New GTB game started! Difficulty: \`${difficulty}\`, Rounds: \`${roundCount}\``);
	await thread.members.add(source.user);
	const game = new Game(hostId, privateGame, roundCount, difficulty, thread.id);
	Games.push(game);
	return thread.id;
}

async function startGame(threadId: string) {
	const game = Games.find((game) => game.threadId == threadId);
	game!.start();
}

function findFullGame(threadId: string) {
	return Games.find((game) => game.threadId == threadId);
}

function fullGuess(message: Message | CommandInteraction) {
	if (message instanceof Message) {
		const threadId = message.channel.id;
		const round = getCurrentRound(threadId);

		const correctGuess = round.guess(message.content);
		if (!round.guesses.includes(message.author.id)) {
			round.guesses.push(message.author.id);
		}
		return { correct: correctGuess, position: round.guesses.indexOf(message.author.id) };
	}

	if (message instanceof CommandInteraction) {
		const threadId = message.channel!.id;
		const round = getCurrentRound(threadId);

		const correctGuess = round.guess(<string>message.options.get("guess", true).value);
		if (!round.guesses.includes(message.user.id)) {
			round.guesses.push(message.user.id);
		}
		return { correct: correctGuess, position: round.guesses.indexOf(message.user.id) };
	}
}

function isInGame(message: Message | CommandInteraction) {
	if (message instanceof Message) {
		if (!message.channel.isThread()) return false;
		if (!Games.find((game) => game.threadId == message.channel.id)) return false;
	}
	if (message instanceof CommandInteraction) {
		if (!message.channel!.isThread()) return false;
		if (!Games.find((game) => game.threadId == message.channel!.id)) return false;
	}
	return true;
}

function addPoints(message: Message | CommandInteraction, points: number) {
	if (message instanceof Message) {
		const game = Games.find((game) => game.threadId == message.channel!.id);
		let player = game!.leaderboard.find((player) => player!.id == message.author.id);
		if (player) {
			game!.leaderboard[game!.leaderboard.indexOf(player)] = { ...player, points: player.points + points };
		} else {
			game!.leaderboard.push({ id: message.author.id, points: points });
		}
	}
	if (message instanceof CommandInteraction) {
		const game = Games.find((game) => game.threadId == message.channel!.id);
		let player = game!.leaderboard.find((player) => player!.id == message.user.id);
		if (player) {
			game!.leaderboard[game!.leaderboard.indexOf(player)] = { ...player, points: player.points + points };
		} else {
			game!.leaderboard.push({ id: message.user.id, points: points });
		}
	}
}

function getCurrentRound(threadId: string) {
	const game = findFullGame(threadId);
	return game!.rounds[game!.currentRound];
}

function isHostingGame(hostId: string) {
	return Games.find((game) => game.hostId == hostId) != null;
}

async function endGame(interaction: string | CommandInteraction) {
	let channel: ThreadChannel;

	if (typeof interaction == "string") {
		channel = <ThreadChannel>await client.channels.fetch(interaction);
	} else if (interaction instanceof CommandInteraction) {
		channel = <ThreadChannel>interaction.channel!;
	}

	const game = findFullGame(channel!.id)!;
	game.end();

	game.leaderboard.sort((a, b) => {
		return b!.points - a!.points;
	});
	let leaderboardString = "";
	game.leaderboard.forEach((player) => {
		leaderboardString += `${player?.id}: ${player?.points}`;
	});
	channel!.send(`Leaderboard: \n\`\`\`${leaderboardString}\`\`\``);
	channel!.send("Closing thread in 10s");

	// Remove game from list
	Games = Games.filter((g) => g.threadId != channel.id);

	await new Promise((r) => setTimeout(r, 10000));
	if (channel!.isThread()) {
		channel.delete();
	}
	// channel!.setArchived(true);
}

export { createGame, startGame, findFullGame, fullGuess, addPoints, isInGame, isHostingGame, getCurrentRound, endGame };
