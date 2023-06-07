import { CommandInteraction, SlashCommandBuilder } from "discord.js";
import { endGame, isHostingGame, isInGame } from "../../util/GameManager";

module.exports = {
	data: new SlashCommandBuilder()
		.setName("endgame")
		.setDescription("End your current game of GTB Hangman. Restricted to host."),
	async execute(interaction: CommandInteraction) {
		await interaction.deferReply();
		if (!isInGame(interaction)) {
			await interaction.editReply("Not in a game thread!");
			return;
		}

		if (isHostingGame(interaction.user.id)) {
			endGame(interaction);
			interaction.editReply("Ended game");
		}
	}
};
