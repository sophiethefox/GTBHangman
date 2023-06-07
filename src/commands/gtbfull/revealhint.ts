import { CommandInteraction, SlashCommandBuilder } from "discord.js";
import { getCurrentRound, isInGame } from "../../util/GameManager";

module.exports = {
	data: new SlashCommandBuilder()
		.setName("revealhint")
		.setDescription("Reveals one letter of your current game. Restricted to host."),
	async execute(interaction: CommandInteraction) {
		await interaction.deferReply();
		if (!isInGame(interaction)) {
			await interaction.editReply("Not in a game thread!");
			return;
		}

		const round = getCurrentRound(interaction.channel!.id);
		const hint = round.revealHint();
		interaction.editReply(`Hint: \`${hint}\`.  \`${round.selectedTheme.length}\` characters.`);
	}
};
