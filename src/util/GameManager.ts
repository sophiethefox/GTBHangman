import { Game } from "./Game";

let games: Game[] = [];

function removeGame(hostId: string) {
	console.log("GameManager.ts", "hostId", hostId);
	console.log("GameManager.ts", "games before filter", games);
	games = games.filter((g) => g.hostId != hostId);
	console.log("GameManager.ts", "games after filter", games);
}

function pushGame(game: Game) {
	games.push(game);
}

function findGame(hostId: string) {
	return games.find((game) => game.hostId == hostId);
}

function findGameOfPlayer(playerId: string) {
	return games.find((game) => game.players.includes(playerId));
}
const random = (min: number, max: number) => Math.floor(Math.random() * (max - min)) + min;

function revealHint(hostId: string) {
	const game = findGame(hostId);
	const theme = game!.selectedTheme;

	if (game!.revealedLetters.length == theme.replaceAll(" ", "").length - 1) {
		throw Error("Cannot reveal any more hints!");
	}

	// Spaces
	let excludedIndicies: Number[] = [];
	for (let i = 0; i < theme.length; i++) {
		if (theme[i] === " ") excludedIndicies.push(i);
	}

	let randomIndex = -1;

	while (randomIndex == -1 || excludedIndicies.includes(randomIndex) || game!.revealedLetters.includes(randomIndex)) {
		randomIndex = random(0, theme.length - 1);
	}

	game!.revealedLetters.push(randomIndex);

	return game!.getHint();
}

export { games, removeGame, pushGame, findGame, findGameOfPlayer, revealHint };
