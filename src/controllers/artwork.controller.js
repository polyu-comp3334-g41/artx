const httpStatus = require('http-status');
const pick = require('../utils/pick');
const ApiError = require('../utils/ApiError');
const catchAsync = require('../utils/catchAsync');
const Artwork = require('../models/artwork.model');

const createArtwork = catchAsync(async (req, res) => {
  // TODO: authentication
  const artwork = req.body;
  if (req.user.addr !== artwork.author) throw new ApiError(httpStatus.UNAUTHORIZED, `Unauthorized create`);

  if ((await Artwork.findById(artwork._id).exec()) != null)
    throw new ApiError(httpStatus.CONFLICT, `Artwork with id ${artwork._id} already exists`);

  await Artwork.create(artwork);
  res.status(httpStatus.CREATED).send(artwork);
});

const getArtworks = catchAsync(async (req, res) => {
  const filter = pick(req.query, ['author']);
  const options = pick(req.query, ['sortBy', 'limit', 'page']);
  const artworks = await Artwork.paginate(filter, options);

  res.send(artworks);
});

const getArtwork = catchAsync(async (req, res) => {
  const artwork = await Artwork.findById(req.params.id).exec();
  if (artwork == null) throw new ApiError(httpStatus.NOT_FOUND, 'Artwork not found');

  res.send(artwork);
});

module.exports = {
  createArtwork,
  getArtworks,
  getArtwork,
};
