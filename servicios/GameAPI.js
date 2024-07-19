const axios = require('axios');

class GameAPI {

    constructor(apiKey, baseUrl, pageSize) {
        this.apiKey = apiKey;
        this.baseUrl = baseUrl;
        this.pageSize = pageSize;
    }

    async obtenerListaDeJuegos(page) {
        let allGames = [];
        let currentPage = page;

        const response = await axios.get(`https://www.giantbomb.com/api/games/?api_key=`+this.apiKey, {
            params: {
                format: 'json', // Request JSON response format
                offset: currentPage
              }
        });
        console.log(response.data.results);
        allGames=response.data.results;
        return allGames;
        
    }
    async obtenerJuego(id) {
        let game;
        const response = await axios.get(`https://www.giantbomb.com/api/game/`+id+`/?api_key=`+this.apiKey, {
            params: {
                format: 'json', // Request JSON response format
                }
        });
        console.log(response.data.results);
        game= response.data.results;
        return game;
        
        
    }
    async obtenerListaPlataformas(page) {
        let allPlatforms = [];
        let currentPage = page;

        const response = await axios.get(`https://www.giantbomb.com/api/platforms/?api_key=`+this.apiKey, {
            params: {
                format: 'json', // Request JSON response format
                offset: currentPage
              }
        });
        console.log(response.data.results);
        allPlatforms=response.data.results;
        return allPlatforms;
        
    }

    async obtenerListaEmpresas(page) {
        let allCompanies = [];
        let currentPage = page;

        const response = await axios.get(`https://www.giantbomb.com/api/companies/?api_key=`+this.apiKey, {
            params: {
                format: 'json', // Request JSON response format
                offset: currentPage
              }
        });
        console.log(response.data.results);
        allCompanies=response.data.results;
        return allCompanies;
    }

}

module.exports = GameAPI;
