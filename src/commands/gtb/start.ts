import { Game } from "../../util/Game";
import { findGame, findGameOfPlayer, games, pushGame, removeGame, revealHint } from "../../util/GameManager";
import { CommandInteraction, SlashCommandBuilder } from "discord.js";
import { TaskTimer } from "tasktimer";

module.exports = {
	data: new SlashCommandBuilder()
		.setName("start")
		.setDescription("Start a game of GTB Hangman")
		.addStringOption((option) =>
			option
				.setName("difficulty")
				.setDescription("Difficulty of the theme")
				.setRequired(true)
				.addChoices(
					{ name: "Any", value: "any" },
					{ name: "Easy", value: "easy" },
					{ name: "Medium", value: "medium" },
					{ name: "Hard", value: "hard" }
				)
		)
		.addBooleanOption((option) =>
			option.setName("private").setDescription("Play the game by yourself").setRequired(true)
		),
	async execute(interaction: CommandInteraction) {
		const senderId = interaction.user.id;
		if (findGame(senderId) == null && findGameOfPlayer(senderId) == null) {
			const privateGame = <boolean>interaction.options.get("private", true).value;
			const difficulty: string = <any>interaction.options.get("difficulty", true).value;
			let game = new Game(senderId, privateGame, interaction.channelId);

			pushGame(game);
			game.start(difficulty);

			await interaction.reply(
				`Started game! Hint: \`${game.getHint()}\` Length: \`${game.selectedTheme.length} characters\``
			);

			console.log("Created game with theme", game.selectedTheme);

			let timerStep = 1;

			const hintRevealer = new TaskTimer(1000);
			hintRevealer.add({
				id: "hintRevealer",
				tickInterval: 30,
				totalRuns: 4,
				callback(task) {
					let timeStart = Date.now();

					let foundGame = findGame(senderId);
					console.log(timeStart, "Found Game", foundGame);
					// wtf is this workaround
					if (
						!games.find((g) => g.selectedTheme == game.selectedTheme && g.hostId == senderId) ||
						games.find((g) => g.selectedTheme == game.selectedTheme) == null ||
						foundGame == null
						// foundGame?.selectedTheme != game.selectedTheme ||
						// games.find((g) => g.selectedTheme == game.selectedTheme) ||
						// foundGame == null
					) {
						console.log(timeStart, "No game found! Removing");
						hintRevealer.remove(task.id);
						return;
					} else if (games.find((g) => g.selectedTheme == game.selectedTheme && g.hostId == senderId)) {
						if (timerStep == 4) {
							console.log(timeStart, "Ran out of time on", game.selectedTheme);
							removeGame(senderId);
							hintRevealer.remove(task.id);
							interaction.followUp(`Timer ran out! The theme was \`${game.selectedTheme}\``);
							return;
						} else {
							try {
								console.log(timeStart, "Sending hint for game", game.selectedTheme);
								let hint = revealHint(senderId);
								interaction.followUp(`Hint: \`${hint}\`. ${120 - 30 * timerStep}s remain`);
							} catch (e) {}
						}
					}
					timerStep++;
				}
			});
			hintRevealer.start();
		}
	}
};
