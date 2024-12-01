const { SlashCommandBuilder } = require("discord.js");
const { parseLetterboxd } = require("../utils/parseLetterboxd");
const { searchMoviePoster } = require("../utils/searchGoogle");
module.exports = {
  data: new SlashCommandBuilder()
    .setName("watch")
    .setDescription("Envia um filme aleatório de uma lista Letterboxd")
    .addStringOption((option) =>
      option
        .setName("link")
        .setDescription("Link da lista no Letterboxd")
        .setRequired(true),
    ),
  async execute(interaction) {
    const link = interaction.options.getString("link");

    if (!link.includes("letterboxd.com") || !link.includes("/list/")) {
      await interaction.reply(
        "Por favor, envie um link válido para uma lista do Letterboxd!",
      );
      return;
    }

    await interaction.deferReply();

    try {
      const filmes = await parseLetterboxd(link);
      async function enviarFilmeAleatorio(message = null) {
        const filmeAleatorio =
          filmes[Math.floor(Math.random() * filmes.length)];
        const poster = await searchMoviePoster(filmeAleatorio.nome);

        const embed = {
          color: 0x2f3136,
          title: `🎥 ${filmeAleatorio.nome}`,
          description: `⭐ Avaliação do dono da lista: ${filmeAleatorio.estrelas}`,
          image: { url: poster },
          footer: {
            text: "Clique em 🔄 para rolar outro filme!",
          },
        };

        if (message) {
          await message.edit({ embeds: [embed] });
        } else {
          return await interaction.editReply({ embeds: [embed] });
        }
      }

      const botMessage = await enviarFilmeAleatorio();

      // Adiciona a reação 🔄
      await botMessage.react("🔄");

      // Listener para capturar cliques no emoji
      const filter = (reaction, user) =>
        reaction.emoji.name === "🔄" && !user.bot;

      const collector = botMessage.createReactionCollector({
        filter,
        time: 10000,
      }); // 10 segundos de coleta

      collector.on("collect", async (reaction, user) => {
        await reaction.users.remove(user.id); // Remove a reação do usuário
        await enviarFilmeAleatorio(botMessage); // Atualiza a mensagem com outro filme
      });

      collector.on("end", () => {
        botMessage.reactions.removeAll().catch(console.error); // Remove todas as reações após o tempo
      });
    } catch (error) {
      console.error("Erro ao processar o comando:", error);
      await interaction.editReply(
        "Houve um erro ao processar sua lista. Por favor, tente novamente!",
      );
    }
  },
};
