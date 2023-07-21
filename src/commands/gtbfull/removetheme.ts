import { CommandInteraction, SlashCommandBuilder } from "discord.js";

module.exports = {
	data: new SlashCommandBuilder()
		.setName("removetheme")
		.setDescription("Remove an old theme. Available to select users only.")
		.addStringOption((option) => option.setName("theme").setDescription("Theme to remove").setRequired(true)),
	async execute(interaction: CommandInteraction) {
		const userId = interaction.user.id;
		const permittedUsers = ["202666531111436288", "279741994908254209", "300533457598021632", "963506752706478090"];

		await interaction.deferReply();

		interaction.editReply("Removed command (Temporarily:tm:). Ping developer.");
	}
};
