
const { MongoClient } = require('mongodb');

class MongoDBClient {
 
    constructor(uri, dbName) {
        this.client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });
        this.dbName = dbName;
        this.db = undefined;
        this.uri = uri;
    }

    /**
     * No recomiendo tocar esta funcion
     */
    async connect() {
        try {
            await this.client.connect();
            this.db = this.client.db(this.dbName);
            console.log(`Conexión exitosa a MongoDB`);
            console.log(`Conectado a la base de datos: ${this.dbName}`);
            console.log(`URL de conexión: ${this.uri}`);
        } catch (error) {
            console.error('Error al conectar a MongoDB:', error);
        }
    }

    /**
     * No recomiendo tocar esta funcion
     */
    async close() {
        try {
            await this.client.close();
            console.log('Desconectado de MongoDB');
        } catch (error) {
            console.error('Error al desconectar de MongoDB:', error);
        }
    }


    /**
     * Consulta de ejemplo
     * 
     */

    async consultaEjemplo(){

        const productosCollection = this.db.collection('Productos');
        const productos = await productosCollection.find({}).toArray();

        return productos;
     
    }
    async consulta(coleccion){

        const productosCollection = this.db.collection(coleccion);
        const productos = await productosCollection.find({}).toArray();

        return productos;
     
    }
    async consultaEjemplo2(){
        try {
            
            const VideojuegoCollection = this.db.collection('Videojuego');
            // Realizar una consulta de agregación para obtener géneros únicos
            const generosUnicos = await VideojuegoCollection.aggregate([
            { $unwind: "$themes" }, 
            { $group: { _id: "$themes" } }, 
            { $project: { _id: 0, etiqueta: "$_id" } } 
        ]).toArray();

        // Mapear los resultados a un array de géneros
        const generos = generosUnicos.map(item => item.genero);

            return generos;
        } catch (error) {
            console.error('Error en la consulta de géneros:', error);
            return [];
        }
    }

    async Generos(cantidadDeGeneros){
        try {
            // Obtener la colección de videojuegos
            const videojuegosCollection = this.db.collection('Videojuego');
            const juegosConMasGeneros = await videojuegosCollection.aggregate([
                { $match: { genres: { $exists: true, $type: 'array' } } },
                { $addFields: { genresLength: { $size: "$genres" } } },
                { $match: { genresLength: { $gt: cantidadDeGeneros } } }
            ]).toArray();
            
            return juegosConMasGeneros;
        } catch (error) {
            console.error('Error en la consulta de géneros:', error);
            return [];
        }
    }

    //Abajo estan las funciones que pueden ser modificadas por usted. Si quiere agregar funciones extras como delete y update, no hay problema.


    /**
     * Inserta un documento en una colección específica en MongoDB. 
     *
     * @param {string} coleccion - El nombre de la colección en la cual se insertará el documento.
     * @param {Object} documento - El documento que se va a insertar en la colección.
     * @returns {Promise<void>} - Una promesa que se resuelve cuando la inserción es exitosa.
     * @throws {Error} - Lanza un error si la inserción falla.
     * 
     * Nota: Esta es una funcion basica para insertar, lo importante es el esquema de los modelos definidos y como los llames.
     * Pero si quieres la puedes modificar.
     */

    async insertar(coleccion, model) {
        try {
            const collection = this.db.collection(coleccion);
            const result = await collection.insertOne(model.toObject());
            console.log(`Documento insertado con éxito en la colección ${coleccion}:`, result.insertedId);
        } catch (error) {
            console.error(`Error al insertar el documento en la colección ${coleccion}:`, error);
        }
    }

    /**
     * Inserta varios objetos al mismo tiempo
     * 
     * Nota: Esta funcion es opcional. Te puede ser de utilidad.
     */

    async insertartVarios(coleccion, model){
        /**
        >>>>>>>>>>>>>>>>>>>>>>>>
        CODIGO AQUI
        >>>>>>>>>>>>>>>>>>>>>>>>
        */
        try {
            const collection = this.db.collection(coleccion);
            const result = await collection.insertMany(model);
            console.log(`Documentos insertados con éxito en la colección ${coleccion}:`, result.insertedId);
        } catch (error) {
            console.error(`Error al insertar el documento en la colección ${coleccion}:`, error);
        }
    }

    async update(coleccion,model){
        try {
            const collection = this.db.collection(coleccion);
            const result = await collection.updateOne(
                {
                    id:model.id
                },
                {
                    $addToSet:{
                        games:model.data
                    }
                });
            console.log(`Documento actualizado con éxito en la colección ${coleccion}:`, result.insertedId);
        } catch (error) {
            console.error(`Error al insertar el documento en la colección ${coleccion}:`, error);
        }
    }

    /**
     * Dado n géneros, buscar los juegos que contengan todos esos géneros.
     * 
     */

    async consulta1(generos){
        try {
            const VideojuegoCollection = this.db.collection('Videojuego');
            // Buscar videojuegos que contengan todos los géneros especificados
            const resultados = await VideojuegoCollection.find({
                genres: { $all: generos }
            }).toArray();
            
            return resultados;
        } catch (error) {
            console.error('Error en la consulta 1:', error);
            return [];
        }
    
    }

    /**
     * Buscar juegos lanzados dentro de un rango de fechas (xx/xx/xxxx -yy/yy/yyyy). de n companias. 
     * 
     */
    async consulta2(empresas, fechaInicio, fechaFin){
        try {

            // Función para convertir una fecha en formato dd/mm/yyyy a un objeto Date
            function convertirFecha(fechaStr) {
                const [dia, mes, anio] = fechaStr.split('/').map(Number);
                // Crear la fecha en UTC y ajustar la zona horaria local
                const fechaUTC = new Date(Date.UTC(anio, mes - 1, dia));
                // Crear una nueva fecha ajustada a la zona horaria local
                const fechaLocal = new Date(fechaUTC.getTime() - fechaUTC.getTimezoneOffset() * 60000);
                return fechaLocal;
            }

            //Convertir Fechas al formato ISO
            const fechaInicioDate = convertirFecha(fechaInicio);
            const fechaFinDate = convertirFecha(fechaFin);

            const empresaCollection = this.db.collection('Empresa');
        
            // Obtener los IDs de las empresas a partir de sus nombres
            const empresasName = await empresaCollection.find({
                name: { $in: empresas } // Buscar empresas cuyos nombres están en la lista proporcionada
            }).toArray();
            
            // Extraer los IDs de las empresas encontradas
            const idsEmpresas = empresasName.map(empresa => empresa.id);

            // Obtener la colección de videojuegos
            const videojuegoCollection = this.db.collection('Videojuego');
            
            // Buscar videojuegos dentro del rango de fechas y de las empresas especificadas
            const resultados = await videojuegoCollection.find({
                original_release_date: { $gte: fechaInicioDate, $lte: fechaFinDate }, // Filtra por rango de fechas
                developers: { $in: idsEmpresas } // Filtra por IDs de empresas
            }).toArray();
            
            return resultados;
        } catch (error) {
            console.error('Error en la consulta 2:', error);
            return [];
        }

    }

    /**
     * Buscar juegos que estén disponibles en más de n plataformas y mostrat tambien cuáles plataformas son.
     * 
     */

    async consulta3(cantidadDePlataformas){
        try {
        
        const videojuegosCollection = this.db.collection('Videojuego');

        // Buscar videojuegos con más de n plataformas
        const resultados = await videojuegosCollection.aggregate([
            {
                $match: {
                    platforms: { $exists: true, $type: 'array', $gt: { $size: cantidadDePlataformas } }
                }
            },
            {
                $lookup: {
                    from: 'Plataforma', 
                    localField: 'platforms', 
                    foreignField: 'id', 
                    as: 'plataformaDet' 
                }
            },
            {
                $project: {
                    name: 1,
                    platforms: '$plataformaDet.name' 
                }
            }
        ]).toArray();

        // Devolver los resultados encontrados
        return resultados;
        } catch (error) {
            console.error('Error en la consulta 3:', error);
            return [];
        }

    }

    /**
     * Contar juegos por n empresas desarrolladoras con valoración mayor a x.
     * 
     */

    async consulta4(empresas, valoracion){
        try {
            
            const videojuegosCollection = this.db.collection('Videojuego');
            const empresasCollection = this.db.collection('Empresa');
    
            // Buscar las empresas por nombre y obtener sus IDs
            const empresasData = await empresasCollection.find({ name: { $in: empresas } }).toArray();
            const empresasIDs = empresasData.map(empresa => empresa.id);
    
            // Realizar la consulta para encontrar videojuegos que cumplan con los criterios
            const resultados = await videojuegosCollection.aggregate([
                { $match: { developers: { $in: empresasIDs }, original_game_rating: { $gt: valoracion } } },
                { $group: { _id: null, totalJuegos: { $sum: 1 }, sumaValoraciones: { $sum: "$original_game_rating" } } }
            ]).toArray();
    
            // Si no hay resultados, devolver 0
            if (resultados.length === 0) {
                return { totalJuegos: 0, sumaValoraciones: 0 };
            }
    
            return resultados;
        } catch (error) {
            console.error('Error en la consulta 4:', error);
            return { totalJuegos: 0, sumaValoraciones: 0 };
        }

    }

    /**
     * Buscar juegos con una calificación mayor al promedio y que tengan mas de n generos
     * 
     */

    async consulta5(cantidadDeGeneros){
        try {
            
            const videojuegosCollection = this.db.collection('Videojuego');
    
            // Encontrar juegos con más de cantidadDeGeneros géneros
            const juegosConMasGeneros = await videojuegosCollection.aggregate([
                { $match: { genres: { $exists: true, $type: 'array' } } },
                { $addFields: { genresLength: { $size: "$genres" } } },
                { $match: { genresLength: { $gt: cantidadDeGeneros } } },
                { $project: { name: 1, original_game_rating: 1, genres: 1 } }  
            ]).toArray();
    
            // Si no hay juegos que cumplan con la condición, devolver una lista vacía
            if (juegosConMasGeneros.length === 0) {
                return { juegos: [], sumaTotal: 0, promedioValoracion: 0 };
            }
    
            // Calcular la suma total de valoraciones de estos juegos
            const totalValoraciones = juegosConMasGeneros.reduce((sum, juego) => sum + (juego.original_game_rating || 0), 0);
            const promedioValoracion = totalValoraciones / juegosConMasGeneros.length;
    
            // Filtrar juegos con una valoración mayor que el promedio calculado
            const juegosMayorPromedio = juegosConMasGeneros.filter(juego => juego.original_game_rating > promedioValoracion);
    
            // Sumar valoraciones de juegos que cumplen con la condición
            const sumaTotal = juegosConMasGeneros.reduce((sum, juego) => sum + (juego.original_game_rating || 0), 0);
    
            return juegosMayorPromedio;
        } catch (error) {
            // Manejo de errores
            console.error('Error en la consulta 5:', error);
            return { juegos: [], sumaTotal: 0, promedioValoracion: 0 };
        }
    }

    /**
     * Juegos con etiquetas específicas y ordenados por fecha de lanzamiento. 
     * 
     */

    async consulta6(etiquetas){
        try {
            
            const videojuegosCollection = this.db.collection('Videojuego');
            
            // Encontrar videojuegos con las etiquetas específicas
            const resultados = await videojuegosCollection.find({
                themes: { $all: etiquetas } 
            }).sort({ original_release_date: -1 }) 
            
            return resultados;
        } catch (error) {
            console.error('Error en la consulta 6:', error);
            return [];
        }

    }

    /**
     * Calificación promedio de juegos por género específico.
     * 
     */

    async consulta7(generos){
        try {
             const videojuegosCollection = this.db.collection('Videojuego');
    
            // Calcular la calificación promedio por género
            const resultado = await videojuegosCollection.aggregate([
                {
                    $match: {
                        genres: { $in: generos } 
                    }
                },
                {
                    $unwind: "$genres"  
                },
                {
                    $match: {
                        genres: { $in: generos }  // Filtrar de nuevo para asegurarnos que solo los géneros especificados sean considerados
                    }
                },
                {
                    $group: {
                        _id: "$genres",  // Agrupar por género
                        ValoracionProm: { $avg: "$original_game_rating" }  
                    }
                },
                {
                    $project: {
                        genero: "$_id",  
                        ValoracionProm: 1,  
                        _id: 0  
                    }
                }
            ]).toArray();
    
            return resultado;
        } catch (error) {
            console.error('Error en la consulta:', error);
            return [];
        }
    }

    /**
     * Buscar juegos por una palabra clave en el nombre. 
     * 
     */

    async consulta8(palabra){
        try {
            const videojuegosCollection = this.db.collection('Videojuego');
        
            const resultados = await videojuegosCollection.find({
                name: { $regex: palabra, $options: 'i' } // Buscar juegos cuyo nombre contenga la palabra clave, ignorando mayúsculas y minúsculas
            }).toArray();
            
            return resultados;
        } catch (error) {
            console.error('Error en la consulta 8:', error);
            return [];
        }

    }

    /**
     * Top 5 juegos mejor calificados por género específico y excluyendo ciertos empresas desarrolladoras
     * 
     */

    async consulta9(generos, empresas){
        try {
            const videojuegosCollection = this.db.collection('Videojuego');
            const empresasCollection = this.db.collection('Empresa');
    
            // IDs de las empresas a excluir
            const empresasData = await empresasCollection.find({ name: { $in: empresas } }).toArray();
            const idsEmpresasExcluir = empresasData.map(empresa => empresa.id);
    
            // obtener los 5 juegos mejor calificados por género
            const resultado = await videojuegosCollection.aggregate([
                {
                    $match: {
                        genres: { $in: generos },  //, Filtrar juegos que contengan al menos uno de los géneros especificados
                        developers: { $nin: idsEmpresasExcluir }  // Excluir juegos de las empresas desarrolladoras especificadas
                    }
                },
                {
                    $sort: { original_game_rating: -1 }  
                },
                {
                    $limit: 5  
                },
                {
                    $project: {
                        name: 1,  
                        original_game_rating: 1,  
                        genres: 1, 
                        developers: 1  
                    }
                }
            ]).toArray();
    
            return resultado;
        } catch (error) {
            console.error('Error en la consulta 9:', error);
            return [];
        }

    }

    /**
     *  Juegos por géneros y plataformas con proyección de campos. 
     * 
     */

    async consulta10(generos, plataformas){
        try {
            const videojuegosCollection = this.db.collection('Videojuego');
            const plataformasCollection = this.db.collection('Plataforma');
    
            // Obtener los IDs de las plataformas
            const plataformasData = await plataformasCollection.find({ name: { $in: plataformas } }).toArray();
            const idsPlataformas = plataformasData.map(plataforma => plataforma.id);
    
            // Buscar los juegos por géneros y plataformas 
            const resultado = await videojuegosCollection.aggregate([
                {
                    $match: {
                        genres: { $in: generos },  // Filtrar juegos que contengan al menos uno de los géneros especificados
                        platforms: { $in: idsPlataformas }  // Filtrar juegos que estén disponibles en al menos una de las plataformas 
                    }
                },
                {
                    $lookup: {
                        from: 'Plataforma', 
                        localField: 'platforms',  
                        foreignField: 'id',  
                        as: 'platformDetails'  
                    }
                },
                {
                    $project: {
                        name: 1,  
                        'platformDetails.name': 1 
                    }
                }
            ]).toArray();
    

            const juegos = resultado.map(juego => ({
                name: juego.name,
                platforms: juego.platformDetails.map(plataforma => plataforma.name)
            }));
    
            return juegos;
        } catch (error) {
            console.error('Error en la consulta 10:', error);
            return [];
        }

    }

}

module.exports = MongoDBClient;
