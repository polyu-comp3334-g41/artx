const Joi = require('joi');
const { objectId } = require('./custom.validation');

const createArtwork = {
  body: Joi.object().keys({
    _id: Joi.number().required(),
    title: Joi.string().required(),
    description: Joi.string().required(),
    author: Joi.string().required(),
    imageUrl: Joi.string().uri().required(),
  }),
};

const getArtworks = {
  query: Joi.object().keys({
    sortBy: Joi.string(),
    limit: Joi.number().integer(),
    page: Joi.number().integer(),
  }),
};

const getArtwork = {
  params: Joi.object().keys({
    id: Joi.string().custom(objectId),
  }),
};

module.exports = {
  createArtwork,
  getArtworks,
  getArtwork,
};
