import { CommandInteraction, SlashCommandBuilder } from "discord.js";
import { createGame, isHostingGame, startGame } from "../../util/GameManager";

module.exports = {
	data: new SlashCommandBuilder()
		.setName("startfull")
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
		)
		.addNumberOption((option) =>
			option.setName("rounds").setDescription("Amount of rounds").setMinValue(3).setMaxValue(20).setRequired(true)
		),
	async execute(interaction: CommandInteraction) {
		const senderId = interaction.user.id;

		if (interaction.channel!.isThread()) {
			interaction.reply("In a game thread!");
			return;
		}

		if (isHostingGame(senderId)) {
			interaction.reply("You are already hosting a game!");
			return;
		}

		const privateGame = <boolean>interaction.options.get("private", true).value;
		const difficulty: string = <any>interaction.options.get("difficulty", true).value;
		const rounds: number = <any>interaction.options.get("rounds", true).value;

		const game = await createGame(senderId, privateGame, rounds, difficulty, interaction);
		if (game == null) throw "Already in a thread";
		interaction.reply(`Created game <#${game}>`);
		startGame(game);
	}
};
