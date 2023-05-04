import { findGameOfPlayer } from "../../util/GameManager";
import { CommandInteraction, SlashCommandBuilder } from "discord.js";

module.exports = {
	data: new SlashCommandBuilder().setName("leave").setDescription("Leave your current game of GTB Hangman"),
	async execute(interaction: CommandInteraction) {
		const senderId = interaction.user.id;
		const currentGame = findGameOfPlayer(senderId);

		if (currentGame == null) {
			return await interaction.reply("You are not in a game!");
		}

		if (currentGame.hostId == senderId) {
			return await interaction.reply("You are the host of this game! Use `/end` to end the game.");
		}

		currentGame.players.splice(currentGame.players.indexOf(senderId));
		await interaction.reply({ content: `Left <@${currentGame.hostId}'s game>`, allowedMentions: { users: [] } });
	}
};
