const config = require("../../config/config.json");
const axios = require("axios");

const GOOGLE_API_KEY = config.apiKey;
const GOOGLE_CSE_ID = config.cseId;

async function searchMoviePoster(movieName) {
  const url = `https://www.googleapis.com/customsearch/v1`;
  try {
    const response = await axios.get(url, {
      params: {
        key: GOOGLE_API_KEY,
        cx: GOOGLE_CSE_ID,
        q: `${movieName} movie poster`,
        searchType: "image",
        num: 1,
      },
    });

    const items = response.data.items;
    if (!items || items.length === 0) {
      throw new Error("Nenhuma imagem encontrada.");
    }

    return items[0].link;
  } catch (error) {
    console.error("Erro ao buscar imagem no Google:", error);
    throw error;
  }
}

module.exports = { searchMoviePoster };
