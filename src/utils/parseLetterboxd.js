const axios = require("axios");
const cheerio = require("cheerio");

async function parseLetterboxd(link) {
  try {
    const response = await axios.get(link);
    const html = response.data;
    const $ = cheerio.load(html);

    const filmes = [];

    // Itera sobre cada item da lista de filmes
    $(".poster-container").each((_, elemento) => {
      const nome = $(elemento).find("[data-film-slug]").attr("data-film-slug"); // Slug do filme
      const estrelas = $(elemento).attr("data-owner-rating") || "Não avaliado"; // Estrelas (nota do dono da lista)

      if (nome) {
        filmes.push({
          nome: nome
            .replace(/-/g, " ")
            .replace(/(?:^|\s)\S/g, (a) => a.toUpperCase()), // Converte slug para título
          estrelas,
        });
      }
    });

    if (filmes.length === 0) {
      throw new Error("Nenhum filme encontrado na lista.");
    }

    return filmes;
  } catch (error) {
    console.error("Erro ao fazer parsing da lista:", error);
    throw error;
  }
}

module.exports = { parseLetterboxd };
