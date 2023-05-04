const WordList = require("../../words.json");

export class Game {
	hostId: string;
	privateGame: boolean;
	channelId: string;
	selectedTheme: string;
	revealedLetters: Number[] = [];
	started = false;
	players: string[];
	starttime: string;

	constructor(hostID: string, privateGame: boolean, channelId: string) {
		this.hostId = hostID;
		this.privateGame = privateGame;
		this.players = [hostID];
		this.channelId = channelId;
	}

	start(difficulty: string) {
		if (difficulty == "any") {
			this.selectedTheme = titleCase(WordList.words[Math.floor(Math.random() * WordList.words.length)]);
		} else if (difficulty == "easy") {
			let easyThemes = WordList.words.filter((word: string) => word.length <= 5);
			this.selectedTheme = titleCase(easyThemes[Math.floor(Math.random() * easyThemes.length)]);
		} else if (difficulty == "medium") {
			let easyThemes = WordList.words.filter((word: string) => word.length > 5 && word.length < 9);
			this.selectedTheme = titleCase(easyThemes[Math.floor(Math.random() * easyThemes.length)]);
		} else if (difficulty == "hard") {
			let easyThemes = WordList.words.filter((word: string) => word.length >= 9);
			this.selectedTheme = titleCase(easyThemes[Math.floor(Math.random() * easyThemes.length)]);
		}

		this.started = true;
		this.starttime = Date.now().toString();

		return this.selectedTheme;
	}

	guess(guess: string) {
		let formattedGuess = minimise(guess);
		let formattedTheme = minimise(this.selectedTheme);

		return formattedGuess == formattedTheme;
	}

	getHint() {
		let hintArray = this.selectedTheme.split("");
		for (let i = 0; i < hintArray.length; i++) {
			if (this.revealedLetters.includes(i)) {
				continue;
			}
			if (hintArray[i] != " ") {
				hintArray[i] = "_";
			}
		}
		return hintArray.join(" ");
	}

	getDuration() {
		return Math.floor((Date.now() - Number(this.starttime)) / 1000);
	}
}

function titleCase(str: string) {
	return str
		.toLowerCase()
		.split(" ")
		.map((word) => word.charAt(0).toUpperCase() + word.substring(1))
		.join(" ");
}

function minimise(str: string) {
	return str.toLowerCase().replaceAll(" ", "").trim();
}
