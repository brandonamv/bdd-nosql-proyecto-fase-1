
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
                    $push:{
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
                original_release_date: { $gte: fechaInicio, $lte: fechaFin }, // Filtra por rango de fechas
                developers: { $in: idsEmpresas } // Filtra por IDs de empresas
            }).toArray();
            
            // Devolver los resultados encontrados
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
            // Obtener la colección de videojuegos
        const videojuegosCollection = this.db.collection('Videojuego');

        // Realizar la agregación para encontrar videojuegos con más de n plataformas y unir con la colección de plataformas
        const resultados = await videojuegosCollection.aggregate([
            {
                $match: {
                    platforms: { $exists: true, $type: 'array', $gt: { $size: cantidadDePlataformas } }
                }
            },
            {
                $lookup: {
                    from: 'Plataforma', // Colección a unir
                    localField: 'platforms', // Campo local (array de IDs de plataformas en Videojuego)
                    foreignField: 'id', // Campo en la colección Plataforma
                    as: 'plataformaDet' // Nombre del nuevo campo que contendrá los documentos de Plataforma
                }
            },
            {
                $project: {
                    name: 1,
                    platforms: '$plataformaDet.name' // Proyectar solo los nombres de las plataformas
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
        /**
        >>>>>>>>>>>>>>>>>>>>>>>>
        CODIGO AQUI
        >>>>>>>>>>>>>>>>>>>>>>>>
        */
        return []

    }

    /**
     * Buscar juegos con una calificación mayor al promedio y que tengan mas de n generos
     * 
     */

    async consulta5(cantidadDeGeneros){
        /**
        >>>>>>>>>>>>>>>>>>>>>>>>
        CODIGO AQUI
        >>>>>>>>>>>>>>>>>>>>>>>>
        */
        return []

    }

    /**
     * Juegos con etiquetas específicas y ordenados por fecha de lanzamiento. 
     * 
     */

    async consulta6(etiquetas){
        try {
            // Obtener la colección de videojuegos
            const videojuegosCollection = this.db.collection('Videojuego');
            
            // Realizar la consulta para encontrar videojuegos con las etiquetas específicas y ordenarlos por fecha de lanzamiento
            const resultados = await videojuegosCollection.find({
                themes: { $all: etiquetas } // Buscar juegos que tengan todas las etiquetas proporcionadas
            }).sort({ original_release_date: -1 }) // Ordenar por fecha de lanzamiento de más reciente a más antiguo
            .toArray();
            
            return resultados;
        } catch (error) {
            // Manejo de errores
            console.error('Error en la consulta 6:', error);
            return [];
        }
    }

    /**
     * Calificación promedio de juegos por género específico.
     * 
     */

    async consulta7(generos){
        /**
        >>>>>>>>>>>>>>>>>>>>>>>>
        CODIGO AQUI
        >>>>>>>>>>>>>>>>>>>>>>>>
        */
        return []

    }

    /**
     * Buscar juegos por una palabra clave en el nombre. 
     * 
     */

    async consulta8(palabra){
        try {
            // Obtener la colección de videojuegos
            const videojuegosCollection = this.db.collection('Videojuego');
        
            // Realizar la consulta para encontrar videojuegos cuyo nombre contenga la palabra clave
            const resultados = await videojuegosCollection.find({
                name: { $regex: palabra, $options: 'i' } // Buscar juegos cuyo nombre contenga la palabra clave, ignorando mayúsculas y minúsculas
            }).toArray();
            
            return resultados;
        } catch (error) {
            // Manejo de errores
            console.error('Error en la consulta 8:', error);
            return [];
        }
    }

    /**
     * Top 5 juegos mejor calificados por género específico y excluyendo ciertos empresas desarrolladoras
     * 
     */

    async consulta9(generos, empresas){
        /**
        >>>>>>>>>>>>>>>>>>>>>>>>
        CODIGO AQUI
        >>>>>>>>>>>>>>>>>>>>>>>>
        */
        return []

    }

    /**
     *  Juegos por géneros y plataformas con proyección de campos. 
     * 
     */

    async consulta10(generos, plataformas){
        /**
        >>>>>>>>>>>>>>>>>>>>>>>>
        CODIGO AQUI
        >>>>>>>>>>>>>>>>>>>>>>>>
        */
        return []

    }

}

module.exports = MongoDBClient;

