const mongoose = require('mongoose');

const { Schema } = mongoose;
const { toJSON, paginate } = require('./plugins');

const artworkSchema = new Schema({
  tokenId: Number, // on-chain token id
  title: String,
  author: String,
  description: String,
  imageUrl: String,
});

// add plugin that converts mongoose to json
artworkSchema.plugin(toJSON);
artworkSchema.plugin(paginate);

/**
 * @typedef Artwork
 */
const Artwork = mongoose.model('Artwork', artworkSchema);

module.exports = Artwork;
