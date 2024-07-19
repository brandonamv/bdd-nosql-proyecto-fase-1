require('dotenv').config();
const axios = require('axios');

const Empresa = require('./schemas').Empresa
const Videojuego = require('./schemas').Videojuego
const Plataforma = require('./schemas').Plataforma
const API_KEY = process.env.GB_APIKEY;
const BASE_URL = process.env.GB_API_ENDPOINT;
const PAGE_SIZE = process.env.PAGE_SIZE;
const MONGO_URI = process.env.MONGO_URI;
const MONGO_DB_NAME = process.env.MONGO_DB_NAME;

const MongoDBClient = require('./servicios/MongoDBClient');
const GameAPI = require('./servicios/GameAPI');

(async () => {

    const mongoClient = new MongoDBClient(MONGO_URI, MONGO_DB_NAME);
    const gameAPI = new GameAPI(API_KEY, BASE_URL, PAGE_SIZE);

    await mongoClient.connect();

    //AYUDA: Ejemplo de como insertar un documento haciendo uso del esquema Producto

    // const response = {
    //     name: "Leather Jacket",
    //     price: 120.00,
    //     tags: ["clothing", "outerwear", "leather"],
    //     available: true
    // };

    // const nuevoProducto = new Producto({
    //     nombre: response.name,
    //     precio: response.price,
    //     tags: response.tags,
    //     disponible: response.available
    // });

    // await mongoClient.insertar('Productos', nuevoProducto);
    
    // Realice las operaciones para insertar los datos aqui y mostrar consultas
    // >>>>>>>>>>>>

    const empresasInsert=[];
    const empresas= await mongoClient.consulta('Empresa');
    await gameAPI.obtenerListaEmpresas(empresas.length).then((res)=>{
        console.log(res);
        res.forEach(empresa => {
            const nuevaEmpresa = new Empresa({
                name:empresa.name,
                id:empresa.id
            });
            empresasInsert.push(nuevaEmpresa);
        });
        
    });
    if (empresasInsert.length>0) {
        await mongoClient.insertartVarios('Empresa',empresasInsert);
    }
    

    const plataformasInsert=[];
    const plataformas= await mongoClient.consulta('Plataforma');
    await gameAPI.obtenerListaPlataformas(plataformas.length).then((res)=>{
        console.log(res);
        res.forEach(plataforma => {
            const nuevaPlataforma = new Plataforma({
                name:plataforma.name,
                id:plataforma.id
            });
            plataformasInsert.push(nuevaPlataforma);
        });
        
    });

    if (plataformasInsert.length>0) {
        await mongoClient.insertartVarios('Plataforma',plataformasInsert);
    }

    
    

    const gamesInsert=[];
    const games= await mongoClient.consulta('Videojuego');
    await gameAPI.obtenerListaDeJuegos(games.length).then(async (res)=>{
        // let i=0;
        // while (i<res.length) {
        //     setTimeout((game) => {
        //         gameAPI.obtenerJuego(game.id).then(res=>{
        //             console.log(res);
        //         });
                
        //     }, 1000,res[i]);
        // }
        let count = 0;
        const intervalId = setInterval(async () => {
            count++;
            if (res[count]) {
                await gameAPI.obtenerJuego(res[count].id).then(async (resp)=>{
                    console.log(resp);
                    const genres=[];
                    const platforms=[];
                    const themes=[];
                    const developers=[];
                    if (resp.platforms) {
                        resp.platforms.forEach(async (p)=>{
                            await mongoClient.update('Plataforma',{id:p.id,data:resp.id});
                            platforms.push(p.id);
                        });
                    }
                    if (resp.genres) {
                        resp.genres.forEach((p)=>{
                            genres.push(p.name);
                        });
                    }
                    if (resp.developers) {
                        resp.developers.forEach(async (p)=>{
                            await mongoClient.update('Empresa',{id:p.id,data:resp.id});
                            developers.push(p.id);
                        });
                    }
                    if (resp.themes) {
                        resp.themes.forEach((p)=>{
                            themes.push(p.name);
                        });
                    }
    
                    const nuevoJuego= new Videojuego({
                        id: resp.id,
                        name: resp.name,
                        original_release_date: resp.original_release_date,
                        original_game_rating:Math.random()*10,
                        genres: genres,
                        themes: themes,
                        platforms:platforms,
                        developers: developers,
                    });
                    await mongoClient.insertar('Videojuego',nuevoJuego);
                    gamesInsert.push(nuevoJuego);
                });
            }
            
            if (count >= 100) {
                console.log(gamesInsert);
                
                await mongoClient.close();
                clearInterval(intervalId); // Stop the interval after 5 iterations
            }
        }, 1000);
        
    });
    


    // >>>>>>>>>>>>

    
    
})();




// obtenerListaDeJuegos();
