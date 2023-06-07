import { CommandInteraction, SlashCommandBuilder } from "discord.js";
import { addPoints, findFullGame, fullGuess, isInGame } from "../../util/GameManager";

module.exports = {
	data: new SlashCommandBuilder()
		.setName("guess")
		.setDescription("Guesses a theme in your current game")
		.addStringOption((option) => option.setName("guess").setDescription("Theme to guess").setRequired(true)),
	async execute(interaction: CommandInteraction) {
		await interaction.deferReply({ ephemeral: true });
		if (!isInGame(interaction)) {
			await interaction.editReply("Not in a game thread!");
			return;
		}

		// if(interaction.user.id )
		const game = findFullGame(interaction.channel!.id);
		if (game!.privateGame && interaction.user.id != game!.hostId) {
			return await interaction.editReply(`This game is private.`);
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
			interaction.editReply(`Correct! +${points} points`);

			game?.updateGuesses();
		} else {
			interaction.editReply("Incorrect");
		}
	}
};
