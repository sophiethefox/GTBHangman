import { CommandInteraction, SlashCommandBuilder } from "discord.js";
import { addPoints, findFullGame, fullGuess, isInGame } from "../../util/GameManager";

module.exports = {
	data: new SlashCommandBuilder()
		.setName("guessfull")
		.setDescription("Guesses a theme in your current game")
		.addStringOption((option) => option.setName("guess").setDescription("Theme to guess").setRequired(true)),
	async execute(interaction: CommandInteraction) {
		if (!isInGame(interaction)) {
			await interaction.reply("Not in a game thread!");
			return;
		}

		const guess = fullGuess(interaction);
		if (guess?.correct) {
			let points = 0;
			if (guess.position == 0) {
				points = 3;
			}
			if (guess.position == 1) {
				points = 2;
			}
			if (guess.position >= 2) {
				points = 1;
			}
			addPoints(interaction, points);

			await interaction.channel?.send(`${interaction.user.tag} Guessed Correctly!`);
			interaction.reply({ content: `Correct! +${points} points`, ephemeral: true });

			const game = findFullGame(interaction.channel!.id);
			game?.updateGuesses();
		} else {
			interaction.reply({ content: "Incorrect", ephemeral: true });
		}
	}
};
