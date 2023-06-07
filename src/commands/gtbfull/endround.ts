import { CommandInteraction, SlashCommandBuilder } from "discord.js";
import { getCurrentRound, isHostingGame, isInGame } from "../../util/GameManager";

module.exports = {
	data: new SlashCommandBuilder()
		.setName("endround")
		.setDescription("End your current round of GTB Hangman. Restricted to host."),
	async execute(interaction: CommandInteraction) {
		await interaction.deferReply();
		if (!isInGame(interaction)) {
			await interaction.editReply("Not in a game thread!");
			return;
		}

		if (isHostingGame(interaction.user.id)) {
			getCurrentRound(interaction.channel!.id).endRound();
			interaction.editReply("Ended round");
		}
	}
};
