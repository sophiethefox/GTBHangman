import { CommandInteraction, SlashCommandBuilder } from "discord.js";
import { getCurrentRound, isInGame } from "../../util/GameManager";

module.exports = {
	data: new SlashCommandBuilder()
		.setName("revealhintfull")
		.setDescription("Reveals one letter of your current game. Restricted to host."),
	async execute(interaction: CommandInteraction) {
		if (!isInGame(interaction)) {
			await interaction.reply("Not in a game thread!");
			return;
		}

		const round = getCurrentRound(interaction.channel!.id);
		const hint = round.revealHint();
		interaction.reply(`Hint: \`${hint}\`.  \`${round.selectedTheme.length}\` characters.`);
	}
};
