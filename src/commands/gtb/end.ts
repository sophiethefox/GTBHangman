import { findGame, removeGame } from "../../util/GameManager";
import { CommandInteraction, SlashCommandBuilder } from "discord.js";

module.exports = {
	data: new SlashCommandBuilder().setName("end").setDescription("End your current game of GTB Hangman"),
	async execute(interaction: CommandInteraction) {
		const senderId = interaction.user.id;
		const game = findGame(senderId);
		if (game == null) {
			await interaction.reply(`You are not hosting a game.`);
		} else {
			removeGame(senderId);
			await interaction.reply(`Ended game! The theme was \`${game.selectedTheme}\``);
		}
	}
};
