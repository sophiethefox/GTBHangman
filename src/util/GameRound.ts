import { ThreadChannel } from "discord.js";
import { resolve } from "path/posix";
import { client, getWordList } from "./../index";

export class GameRound {
	threadId: string;
	index: number;
	selectedTheme: string;
	revealedLetters: Number[] = [];
	startTime: string;
	difficulty: string;
	ended: boolean = false;

	guesses: string[] = [];

	constructor(threadId: string, difficulty: string, index: number) {
		this.threadId = threadId;
		this.difficulty = difficulty;
		this.index = index;
	}

	async start() {
		this.startTime = Date.now().toString();
		const wordList = await getWordList();
		const easyThemes = wordList.filter((word: string) => word.length <= 5);
		const mediumThemes = wordList.filter((word: string) => word.length > 5 && word.length < 9);
		const hardThemes = wordList.filter((word: string) => word.length >= 9);

		switch (this.difficulty) {
			case "easy":
				this.selectedTheme = getRandomTheme(easyThemes);
				break;
			case "medium":
				this.selectedTheme = getRandomTheme(mediumThemes);
				break;
			case "hard":
				this.selectedTheme = getRandomTheme(hardThemes);
				break;
			default:
				this.selectedTheme = getRandomTheme(wordList);
		}

		const channel = <ThreadChannel>await client.channels.fetch(this.threadId);

		let step = 0;

		while (this.ended == false) {
			if (step == 4) {
				channel.send(`Ran out of time!`);
				this.endRound();
				return;
			}

			if (step == 0) {
				channel.send(
					`Hint: \`${this.revealHint()}\`. \`${this.selectedTheme.length}\` characters. \`${
						120 - step * 30
					}s\` remaining`
				);
			} else {
				channel.send(
					`Hint: \`${this.revealHint()}\`. \`${this.selectedTheme.length}\` characters. \`${
						120 - step * 30
					}s\` remaining`
				);
			}

			console.log(this.selectedTheme);
			step++;

			try {
				await this.sleepOrCancel();
			} catch (e) {
				console.log(e);
			}
		}

		resolve();
	}

	// ChatGPT :)
	async sleepOrCancel() {
		// Set a timeout to resolve the promise after 30 seconds
		const sleepPromise = new Promise((resolve) => setTimeout(resolve, 30000));

		// Create a promise that resolves when the variable changes
		const variablePromise = new Promise((resolve) => {
			const intervalId = setInterval(() => {
				if (this.ended) {
					clearInterval(intervalId);
					resolve(variablePromise);
				}
			}, 10);
		});

		// Wait for either the sleep timeout or the variable change
		await Promise.race([sleepPromise, variablePromise]);
	}

	async checkIfAllGuessed() {
		const channel = <ThreadChannel>await client.channels.fetch(this.threadId);
		if (channel.memberCount! >= 1 && this.guesses.length == channel.memberCount!) {
			channel.send(`Everyone has guessed! Took \`${this.getDuration()}s\``);
			this.endRound();
			return;
		}
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

	revealHint() {
		if (this.revealedLetters.length == minimise(this.selectedTheme).length - 1) {
			return "ERROR: MAX HINTS REVEALED";
		}

		let excludedIndicies: Number[] = [];
		for (let i = 0; i < this.selectedTheme.length; i++) {
			if (this.selectedTheme[i] === " ") excludedIndicies.push(i);
		}

		let randomIndex = -1;

		while (
			randomIndex == -1 ||
			excludedIndicies.includes(randomIndex) ||
			this!.revealedLetters.includes(randomIndex)
		) {
			randomIndex = random(0, this.selectedTheme.length - 1);
		}

		this.revealedLetters.push(randomIndex);

		return this.getHint();
	}

	getDuration() {
		return Math.floor((Date.now() - Number(this.startTime)) / 1000);
	}

	async endRound() {
		this.ended = true;
		const channel = <ThreadChannel>await client.channels.fetch(this.threadId);

		channel.send(`The theme was: \`${this.selectedTheme}\``);
	}
}

function getRandomTheme(words: string[]): string {
	const randomIndex = Math.floor(Math.random() * words.length);
	return titleCase(words[randomIndex]);
}

function titleCase(str: string) {
	return str
		.toLowerCase()
		.split(" ")
		.map((word) => word.charAt(0).toUpperCase() + word.substring(1))
		.join(" ");
}

export function minimise(str: string) {
	return str.toLowerCase().replaceAll(" ", "").trim();
}

const random = (min: number, max: number) => Math.floor(Math.random() * (max - min)) + min;
