const mongoose = require('mongoose');

// ############################# EJEMPLO #############################
// ########################## NO MODIFICAR ###########################

/**
 * Ejemplo de creacion de esquema para MongoDB utilizando Mongoose.
 * 
 * @typedef {Object} Producto
 * @property {String} nombre - El nombre del producto. Este campo es obligatorio.
 * @property {Number} precio - El precio del producto. Debe ser un número mayor o igual a 0.
 * @property {String[]} tags - Una lista de etiquetas asociadas con el producto.
 * @property {Boolean} cantidad - Indica si el producto está disponible en cantidad. Valor por defecto: true.
 */
const productoSchema = new mongoose.Schema({
    nombre: { type: String, required: true },
    precio: { type: Number, min: 0 },
    tags: [String],
    disponible: { type: Boolean, default: true },
});

/**
 * Modelo de Mongoose para la colección de productos.
 * 
 * @type {Model<Producto>}
 */
const Producto = mongoose.model('Producto', productoSchema);





// ############################# ESQUEMAS QUE SE VAN A EVALUAR #############################
// #################################### MODIFICAR ##########################################

/**
 * Schema para videojuegos.
 * 
 * @typedef {Object} Videojuego
 * @property {Number} id - Id, obligatorio.
 * @property {String} name - Nombre, obligatorio.
 * @property {Date} original_release_date - Fecha de estreno.
 * @property {Number} original_game_rating - Calificacion.
 * @property {String[]} genres - Generos.
 * @property {String[]} themes - Etiquetas.
 * @property {Number[]} platforms - Plataformas.
 * @property {Number[]} developers - Empresas creadoras.
 */
const videojuegoSchema = new mongoose.Schema({
  // Define las estructura de los documentos videojuegos aqui
  id: {type:Number,required:true},
  name: {type:String,required:true},
  original_release_date: Date,
  original_game_rating:{type:Number,min:0},
  genres: [String],
  themes: [String],
  platforms:[Number],
  developers: [Number],
});

/**
 * Modelo de Mongoose para la colección de videojuegos.
 * 
 * @type {Model<Videojuego>}
 */
const Videojuego = mongoose.model('Videojuego', videojuegoSchema);


/**
 * Schema para pataformas.
 * 
 * @typedef {Object} Plataforma
 * @property {Number} id - Id, obligatorio.
 * @property {String} name - Nombre, obligatorio.
 * @property {Number[]} games - Juegos asociados a la plataforma.
 */
const plataformaScheme = new mongoose.Schema({
  // Define las estructura de los documentos plataforma aqui
  id: {type:Number,required:true},
  name: {type:String,required:true},
  games: [Number]
});

/**
 * Modelo de Mongoose para la colección de plataformas.
 * 
 * @type {Model<Plataforma>}
 */
const Plataforma = mongoose.model('Plataforma', plataformaScheme);


/**
 * Schema para empresas.
 * 
 * @typedef {Object} Empresa
 * @property {Number} id - Id, obligatorio.
 * @property {String} name - Nombre, obligatorio.
 * @property {Number[]} games - Juegos asociados a la plataforma.
 */
const empresaScheme = new mongoose.Schema({
  // Define las estructura de los documentos empresa aqui
  id: {type:Number,required:true},
  name: {type:String,required:true},
  games: [Number]
});

/**
 * Modelo de Mongoose para la colección de empresas.
 * 
 * @type {Model<Empresa>}
 */
const Empresa = mongoose.model('Empresa', empresaScheme);

// Exportar todos los modelos
module.exports = {
  Producto,
  Videojuego,
  Plataforma,
  Empresa
};
