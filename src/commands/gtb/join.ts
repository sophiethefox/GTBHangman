import { findGame, findGameOfPlayer, games } from "../../util/RoundManager";
import { CommandInteraction, SlashCommandBuilder } from "discord.js";

module.exports = {
	data: new SlashCommandBuilder()
		.setName("join")
		.setDescription("Joins game of GTB Hangman")
		.addUserOption((option) => option.setName("host").setDescription("Users game to join").setRequired(true)),
	async execute(interaction: CommandInteraction) {
		const senderId = interaction.user.id;
		const hostId = interaction.options.getUser("host", true).id;

		const isInGame = findGameOfPlayer(senderId) != null;

		if (isInGame) {
			return await interaction.reply("You are already in a game! Use `/leave` to leave your current game.");
		}

		const game = findGame(hostId);

		if (game == null) {
			await interaction.reply("This user is not hosting a game!");
		} else {
			if (game!.privateGame) return await interaction.reply("This game is private!");

			game.players.push(senderId);
			await interaction.reply({ content: `Joined <@${hostId}>'s game`, allowedMentions: { users: [] } });
		}
	}
};
