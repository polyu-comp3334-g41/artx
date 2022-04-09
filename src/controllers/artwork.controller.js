const httpStatus = require('http-status');
const pick = require('../utils/pick');
const ApiError = require('../utils/ApiError');
const catchAsync = require('../utils/catchAsync');
const { userService } = require('../services');
const Artwork = require('../models/artwork.model');

const createArtwork = catchAsync(async (req, res) => {
  Object.defineProperty(req.body, "_id", Object.getOwnPropertyDescriptor(req.body, "id"));
  delete req.body['id'];
  const artwork = await Artwork.create(req.body);
  res.status(httpStatus.CREATED).send(artwork);
});

const getArtworks = catchAsync(async (req, res) => {
  // TODO: apply filters
  const artworks = await Artwork.find({});
  res.send(artworks);
});

const getArtwork = catchAsync(async (req, res) => {
  const artwork = await Artwork.findById(req.params.id);
  res.send(artwork);
});

module.exports = {
  createArtwork,
  getArtworks,
  getArtwork,
};
