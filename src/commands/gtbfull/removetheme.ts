import { CommandInteraction, SlashCommandBuilder } from "discord.js";
import { readFileSync, writeFileSync } from "fs";
import { minimise } from "../../util/GameRound";
import { resolve } from "path";

module.exports = {
	data: new SlashCommandBuilder()
		.setName("removetheme")
		.setDescription("Remove an old theme. Available to select users only.")
		.addStringOption((option) => option.setName("theme").setDescription("Theme to remove").setRequired(true)),
	async execute(interaction: CommandInteraction) {
		const userId = interaction.user.id;
		const permittedUsers = ["202666531111436288", "279741994908254209", "300533457598021632", "963506752706478090"];

		if (permittedUsers.includes(userId)) {
			const theme = <string>interaction.options.get("theme", true).value;
			const json = readFileSync("words.json", "utf8");
			const jsonObj = JSON.parse(json);
			jsonObj.words = jsonObj.words.filter((word: string) => word.toLowerCase() !== theme.toLowerCase());
			writeFileSync("words.json", JSON.stringify(jsonObj));
			interaction.reply("Removed theme!");
		} else {
			interaction.reply({ content: `No permission.`, ephemeral: true });
		}
	}
};
