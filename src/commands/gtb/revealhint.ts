import { findGame, revealHint } from "../../util/RoundManager";
import { CommandInteraction, SlashCommandBuilder } from "discord.js";

module.exports = {
	data: new SlashCommandBuilder()
		.setName("revealhint")
		.setDescription("Reveals one letter of your current game. Restricted to host."),
	async execute(interaction: CommandInteraction) {
		const senderId = interaction.user.id;
		const game = findGame(senderId);
		if (game == null) {
			await interaction.reply(`You are not hosting a game.`);
		} else {
			if (interaction.channelId != game.channelId) return;
			try {
				const hint = revealHint(senderId);
				await interaction.reply(`Hint: \`${hint}\``);
			} catch (e) {
				await interaction.reply(`Max hints revealed!`);
			}
		}
	}
};
