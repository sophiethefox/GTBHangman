import { Client, Collection, Events, GatewayIntentBits, REST, Routes } from "discord.js";
import { token, clientId } from "./config.json";
import * as fs from "fs";
import * as path from "path";
import { addPoints, findFullGame, fullGuess, getCurrentRound, isInGame } from "./util/GameManager";
export const client = new Client({
	intents: [GatewayIntentBits.Guilds, GatewayIntentBits.MessageContent, GatewayIntentBits.GuildMessages]
});

let wordList: string[] = [];

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

const rest = new REST().setToken(token);
(async () => {
	try {
		console.log(`Started refreshing ${commands.length} application (/) commands.`);
		const data: any = await rest.put(Routes.applicationCommands(clientId), {
			body: commands
		});
		console.log(`Successfully reloaded ${data.length} application (/) commands.`);
	} catch (error) {
		console.error(error);
	}
})();

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

client.login(token);

client.on("messageCreate", async (message) => {
	if (message.author.bot) return;
	if (isInGame(message)) {
		const game = findFullGame(message.channel!.id);
		const threadId = message.channel.id;
		const round = getCurrentRound(threadId);

		if ((game!.privateGame && message.author.id == game!.hostId) || !game?.privateGame) {
			if (round.guesses.includes(message.author.id)) return;

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

				game?.updateGuesses();
			}
		}
	}
});

export async function getWordList(): Promise<string[]> {
	if (wordList.length > 0) {
		return wordList;
	} else {
		let getThemesRes = await fetch("https://gtb.regexmc-noirlskills.workers.dev/getAllThemes", {
			body: "{}",
			method: "POST"
		});
		let getThemesJson = await getThemesRes.json();
		wordList = getThemesJson.map((theme: any) => theme.theme);
		console.log(wordList);
		console.log("Fetched new WordList");
		return wordList;
	}
}

export async function reloadWordList() {
	let getThemesRes = await fetch("https://gtb.regexmc-noirlskills.workers.dev/getAllThemes", {
		body: "{}",
		method: "POST"
	});
	let getThemesJson = await getThemesRes.json();
	let oldWordlist = wordList;
	wordList = getThemesJson.map((theme: any) => theme.theme);
	// Prints Difference
	console.log(
		oldWordlist.filter((x) => !wordList.includes(x)).concat(wordList.filter((x) => !oldWordlist.includes(x)))
	);
	console.log("Reloaded WordList");
}
