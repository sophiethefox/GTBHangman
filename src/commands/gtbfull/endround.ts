import { CommandInteraction, SlashCommandBuilder } from "discord.js";
import { getCurrentRound, isHostingGame, isInGame } from "../../util/GameManager";

module.exports = {
	data: new SlashCommandBuilder()
		.setName("endround")
		.setDescription("End your current round of GTB Hangman. Restricted to host."),
	async execute(interaction: CommandInteraction) {
		if (!isInGame(interaction)) {
			await interaction.reply("Not in a game thread!");
			return;
		}

		if (isHostingGame(interaction.user.id)) {
			getCurrentRound(interaction.channel!.id).endRound();
			interaction.reply("Ended round");
		}
	}
};
