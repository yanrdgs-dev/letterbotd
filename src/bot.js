const { Client, GatewayIntentBits, REST, Routes } = require("discord.js");
const { loadCommands } = require("./commands");
const config = require("../config/config.json");

// Inicializa o cliente do Discord
const client = new Client({
  intents: [GatewayIntentBits.Guilds],
});

// Registra comandos
client.once("ready", async () => {
  console.log(`Bot online como ${client.user.tag}`);

  const commands = loadCommands();
  const rest = new REST({ version: "10" }).setToken(config.token);

  try {
    console.log("Registrando comandos...");
    await rest.put(
      Routes.applicationGuildCommands(config.clientId, config.guildId),
      {
        body: commands,
      },
    );
    console.log("Comandos registrados com sucesso!");
  } catch (error) {
    console.error("Erro ao registrar comandos:", error);
  }
});

// Gerencia interações com comandos
client.on("interactionCreate", async (interaction) => {
  if (!interaction.isCommand()) return;

  const command = require(`./commands/${interaction.commandName}`);
  try {
    await command.execute(interaction);
  } catch (error) {
    console.error("Erro ao executar o comando:", error);
    await interaction.reply("Houve um erro ao executar este comando.");
  }
});

// Loga o bot
client.login(config.token);
