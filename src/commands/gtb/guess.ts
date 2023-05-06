import { findGameOfPlayer, removeGame } from "../../util/RoundManager";
import { CommandInteraction, SlashCommandBuilder } from "discord.js";

module.exports = {
	data: new SlashCommandBuilder()
		.setName("guess")
		.setDescription("Guesses a theme in your current game")
		.addStringOption((option) => option.setName("guess").setDescription("Theme to guess").setRequired(true)),
	async execute(interaction: CommandInteraction) {
		const senderId = interaction.user.id;
		const guess = <string>interaction.options.get("guess", true).value;

		const game = findGameOfPlayer(senderId);

		if (game == null) {
			return await interaction.reply("You are not in a game! Use `/join <host>` to join a game.");
		}

		if (interaction.channelId != game.channelId) return;

		if (game!.guess(guess)) {
			interaction.reply(
				`<@${senderId}> guessed the theme correctly! The theme was: \`${
					game.selectedTheme
				}\`. Duration: ${game.getDuration()}s`
			);
			removeGame(game.hostId);
		} else {
			await interaction.reply("Incorrect!");
		}
	}
};
