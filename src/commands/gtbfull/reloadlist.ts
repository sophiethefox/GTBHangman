import { CommandInteraction, SlashCommandBuilder } from "discord.js";
import { reloadWordList } from "../..";

module.exports = {
	data: new SlashCommandBuilder().setName("reloadlist").setDescription("Reloads wordlist"),
	async execute(interaction: CommandInteraction) {
		const userId = interaction.user.id;

		await interaction.deferReply();

		if (userId == "202666531111436288") {
			await reloadWordList();
			interaction.editReply("Reloaded word list");
		}
	}
};
