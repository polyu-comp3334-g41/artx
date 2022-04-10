const httpStatus = require('http-status');
const pick = require('../utils/pick');
const ApiError = require('../utils/ApiError');
const catchAsync = require('../utils/catchAsync');
const { SwapOrder, OrderStatus } = require('../models/swapOrder.model');
const Artwork = require('../models/artwork.model');

const proposeSwapOrder = catchAsync(async (req, res) => {
  // TODO: auth
  
  const makerAddr = req.query.maker;
  const { makerTokenId } = req.body;
  const { takerTokenId } = req.body;

  // exists
  for (const id of [makerTokenId, takerTokenId]) {
    if ((await Artwork.findById(id).exec()) == null) throw new ApiError(httpStatus.NOT_FOUND, `Token not found: ${id}`);
  }

  // make sure the maker owns the token
  if ((await Artwork.findById(makerTokenId).exec()).author != makerAddr)
    throw new ApiError(httpStatus.FORBIDDEN, `${makerAddr} does not own token ${makerTokenId}`);

  order = await SwapOrder.create({
    makerToken: makerTokenId,
    takerToken: takerTokenId,
    status: OrderStatus.PROPOSED,
  });

  res.status(httpStatus.CREATED).send(order);
});

const getSwapOrders = catchAsync(async (req, res) => {
  const filter = pick(req.query, ['maker', 'taker', 'status']);
  const options = pick(req.query, ['sortBy', 'limit', 'page']);
  const swapOrders = await SwapOrder.paginate(filter, options);
  res.send(swapOrders);
});

const getSwapOrder = catchAsync(async (req, res) => {
  const swapOrder = await SwapOrder.findById(req.params.id);
  if (swapOrder == null) throw new ApiError(httpStatus.NOT_FOUND, 'Order not found');

  res.send(swapOrder);
});

const deleteSwapOrder = catchAsync(async (req, res) => {
  const { user } = req.query;
  const { action } = req.query;

  swapOrder = await SwapOrder.findById(req.params.id);
  if (swapOrder == null) throw new ApiError(httpStatus.NOT_FOUND, 'Order not found');
  if (swapOrder.status != OrderStatus.PROPOSED) throw new ApiError(httpStatus.CONFLICT, 'Order already closed or cancelled');

  swapOrder = await SwapOrder.findById(req.params.id).populate('makerToken').populate('takerToken').exec();

  if (action == 'close') {
    // can only be closed by taker
    if (swapOrder.takerToken.author != user) throw new ApiError(httpStatus.FORBIDDEN, 'Order can only be closed by taker');

    // exchange ownership
    makerToken = swapOrder.makerToken;
    takerToken = swapOrder.takerToken;

    tmp = makerToken.author;
    makerToken.author = takerToken.author;
    takerToken.author = tmp;

    // change status
    swapOrder.status = OrderStatus.CLOSED;

    // save
    swapOrder.save(function (err) {
      makerToken.save((err) => {});
      takerToken.save((err) => {});
    });
  } else {
    // action == "cancel"
    // can be both parties
    if (!(user == swapOrder.takerToken.author || user == swapOrder.makerToken.author))
      throw new ApiError(httpStatus.FORBIDDEN, 'Order can only by cancelled by maker or taker');

    // change status
    swapOrder.status = OrderStatus.CANCELLED;

    // save
    swapOrder.save(function (err) {
      console.log(err);
    });
  }

  res.send(swapOrder);
});

module.exports = {
  proposeSwapOrder,
  getSwapOrders,
  getSwapOrder,
  deleteSwapOrder,
};
