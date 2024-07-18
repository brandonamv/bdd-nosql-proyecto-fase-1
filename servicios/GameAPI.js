const axios = require('axios');

class GameAPI {

    constructor(apiKey, baseUrl, pageSize) {
        this.apiKey = apiKey;
        this.baseUrl = baseUrl;
        this.pageSize = pageSize;
    }

    async obtenerListaDeJuegos() {
        let allGames = [];
        let currentPage = 1;

        const response = await axios.get(`https://www.giantbomb.com/api/games/?api_key=`+this.apiKey, {
            params: {
                format: 'json' // Request JSON response format
              }
        });
        console.log(response.data.results);
        allGames=response.data.results;
        return allGames;
        
    }
    async obtenerJuego(id) {
        let game;
        let currentPage = 1;
        const response = await axios.get(`https://www.giantbomb.com/api/game/`+id+`/?api_key=`+this.apiKey, {
            params: {
                format: 'json' // Request JSON response format
                }
        });
        console.log(response.data.results);
        game= response.data.results;
        return game;
        
        
    }
    async obtenerListaPlataformas() {
        let allPlatforms = [];
        let currentPage = 1;

        const response = await axios.get(`https://www.giantbomb.com/api/platforms/?api_key=`+this.apiKey, {
            params: {
                format: 'json' // Request JSON response format
              }
        });
        console.log(response.data.results);
        allPlatforms=response.data.results;
        return allPlatforms;
        
    }
    async obtenerListaEmpresas() {
        let allCompanies = [];
        let currentPage = 1;

        const response = await axios.get(`https://www.giantbomb.com/api/companies/?api_key=`+this.apiKey, {
            params: {
                format: 'json' // Request JSON response format
                
              }
        });
        console.log(response.data.results);
        allCompanies=response.data.results;
        return allCompanies;
        
    }
}

module.exports = GameAPI;
