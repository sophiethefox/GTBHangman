import { Client, Collection, Events, GatewayIntentBits, REST, Routes } from "discord.js";
import { token, clientId, guildId, testtoken, testClientId, test } from "./config.json";
import * as fs from "fs";
import * as path from "path";
import { findGameOfPlayer, removeGame } from "./util/RoundManager";
import { addPoints, findFullGame, fullGuess, isInGame } from "./util/GameManager";
export const client = new Client({
	intents: [GatewayIntentBits.Guilds, GatewayIntentBits.MessageContent, GatewayIntentBits.GuildMessages]
});

client.commands = new Collection();
const commands = [];
const foldersPath = path.join(__dirname, "commands");
const commandFolders = fs.readdirSync(foldersPath);

for (const folder of commandFolders) {
	const commandsPath = path.join(foldersPath, folder);
	const commandFiles = fs.readdirSync(commandsPath).filter((file) => file.endsWith(".js"));
	for (const file of commandFiles) {
		const filePath = path.join(commandsPath, file);
		const command = require(filePath);
		if ("data" in command && "execute" in command) {
			client.commands.set(command.data.name, command);
			commands.push(command.data.toJSON());
		} else {
			console.log(`[WARNING] The command at ${filePath} is missing a required "data" or "execute" property.`);
		}
	}
}

// DEV ENV

if (test) {
	const rest = new REST().setToken(testtoken);
	(async () => {
		try {
			console.log(`Started refreshing ${commands.length} guild (/) commands.`);
			const data: any = await rest.put(Routes.applicationGuildCommands(testClientId, guildId), {
				body: commands
			});
			console.log(`Successfully reloaded ${data.length} guild (/) commands.`);
		} catch (error) {
			console.error(error);
		}
	})();
} else {
	const rest = new REST().setToken(testtoken);
	(async () => {
		try {
			console.log(`Started refreshing ${commands.length} application (/) commands.`);
			const data: any = await rest.put(Routes.applicationCommands(clientId), { body: commands });
			console.log(`Successfully reloaded ${data.length} application (/) commands.`);
		} catch (error) {
			console.error(error);
		}
	})();
}

// const rest = new REST().setToken(token);
// (async () => {
// 	try {
// 		console.log(`Started refreshing ${commands.length} application (/) commands.`);
// 		const data: any = await rest.put(Routes.applicationCommands(clientId), { body: commands });
// 		console.log(`Successfully reloaded ${data.length} application (/) commands.`);
// 	} catch (error) {
// 		console.error(error);
// 	}
// })();

// rest.get(Routes.applicationCommands(clientId)).then((data: any) => {
// 	const promises = [];
// 	for (const command of data) {
// 		const deleteUrl: any = `${Routes.applicationCommands(clientId)}/${command.id}`;
// 		promises.push(rest.delete(deleteUrl));
// 	}
// 	return Promise.all(promises);
// });

client.on(Events.InteractionCreate, async (interaction) => {
	if (!interaction.isChatInputCommand()) return;

	const command = interaction.client.commands.get(interaction.commandName);

	if (!command) {
		console.error(`No command matching ${interaction.commandName} was found.`);
		return;
	}

	try {
		await command.execute(interaction);
	} catch (error) {
		console.error(error);
		if (interaction.replied || interaction.deferred) {
			await interaction.followUp({
				content: "There was an error while executing this command!",
				ephemeral: true
			});
		} else {
			await interaction.reply({ content: "There was an error while executing this command!", ephemeral: true });
		}
	}
});

client.once(Events.ClientReady, (c) => {
	console.log(`Logged in as ${c.user.tag}`);
});

if (test) {
	client.login(testtoken);

	client.on("messageCreate", async (message) => {
		if (message.author.bot) return;
		if (isInGame(message)) {
			const guess = fullGuess(message);
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
				addPoints(message, points);

				await message.channel.send(`${message.author.tag} Guessed Correctly!`);
				message.reply(`Correct! +${points} points`);

				const game = findFullGame(message.channel.id);
				game?.updateGuesses();
			}
		}
	});
} else {
	client.login(token);

	client.on("messageCreate", (message) => {
		const senderId = message.author.id;
		const game = findGameOfPlayer(senderId);
		const guess = message.content;

		if (game == null) {
			return;
		}

		if (message.channelId != game.channelId) return;

		if (game!.guess(guess)) {
			message.reply({
				content: `<@${senderId}> guessed the theme correctly! The theme was: \`${
					game.selectedTheme
				}\`. Duration: ${game.getDuration()}s`,
				allowedMentions: { users: [] }
			});
			removeGame(game.hostId);
		} else {
			message.reply({ content: "Incorrect!", allowedMentions: { users: [] } });
			return;
		}
	});
}
