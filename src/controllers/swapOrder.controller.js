const httpStatus = require('http-status');
const pick = require('../utils/pick');
const ApiError = require('../utils/ApiError');
const catchAsync = require('../utils/catchAsync');
const { SwapOrder, OrderStatus } = require('../models/swapOrder.model');
const Artwork = require('../models/artwork.model');

const proposeSwapOrder = catchAsync(async (req, res) => {
  const makerAddr = req.query.maker;
  if (makerAddr !== req.user.addr) throw new ApiError(httpStatus.UNAUTHORIZED, 'Unauthorized proposal');
  const { makerTokenId, takerTokenId } = req.body;

  // exists
  const makerToken = await Artwork.findOne({ _id: makerTokenId }).exec();
  const takerToken = await Artwork.findOne({ _id: takerTokenId }).exec();

  if (makerToken == null) throw new ApiError(httpStatus.NOT_FOUND, 'Maker token not found');
  if (takerToken == null) throw new ApiError(httpStatus.NOT_FOUND, 'Taker token not found');

  // make sure the maker owns the token
  if (makerToken.author !== makerAddr)
    throw new ApiError(httpStatus.FORBIDDEN, `${makerAddr} does not own token ${makerTokenId}`);

  const order = await SwapOrder.create({
    makerToken: makerToken._id,
    takerToken: takerToken._id,
    status: OrderStatus.PROPOSED,
  });

  res.status(httpStatus.CREATED).send(order);
});

const getSwapOrders = catchAsync(async (req, res) => {
  const filter = pick(req.query, ['status']);
  const options = pick(req.query, ['sortBy', 'limit', 'page']);
  const swapOrders = await SwapOrder.paginate(filter, options);

  const populatedResults = [];

  for (const order of swapOrders.results) {
      const populated = await SwapOrder.findById(order._id).populate('makerToken').populate('takerToken').exec();

      populatedResults.push(populated);
  }


  let results;
  if (req.query.maker) results = populatedResults.filter((order) => order.makerToken.author === req.query.maker);
  if (req.query.taker) results = populatedResults.filter((order) => order.takerToken.author === req.query.taker);
  if (req.query.maker || req.query.taker) swapOrders.results = results;

  // cast down
  for (const order of swapOrders.results) {
    order.takerToken = order.takerToken._id;
    order.makerToken = order.makerToken._id;
  }

  res.send(swapOrders);
});

const getSwapOrder = catchAsync(async (req, res) => {
  const swapOrder = await SwapOrder.findById(req.params.id);
  if (swapOrder == null) throw new ApiError(httpStatus.NOT_FOUND, 'Order not found');

  res.send(swapOrder);
});

const deleteSwapOrder = catchAsync(async (req, res) => {
  const { user, action } = req.query;
  if (user !== req.user.addr) throw new ApiError(httpStatus.UNAUTHORIZED);

  let swapOrder = await SwapOrder.findById(req.params.id);
  if (swapOrder == null) throw new ApiError(httpStatus.NOT_FOUND, 'Order not found');
  if (swapOrder.status !== OrderStatus.PROPOSED)
    throw new ApiError(httpStatus.CONFLICT, 'Order already closed or cancelled');

  // populate tokens
  swapOrder = await SwapOrder.findById(req.params.id).populate('makerToken').populate('takerToken');
  const { makerToken, takerToken } = swapOrder;

  if (action === 'close') {
    // can only be closed by taker
    if (swapOrder.takerToken.author !== user) throw new ApiError(httpStatus.FORBIDDEN, 'Order can only be closed by taker');

    // exchange ownership
    const tmp = makerToken.author;
    makerToken.author = takerToken.author;
    takerToken.author = tmp;

    // change status
    swapOrder.status = OrderStatus.CLOSED;

    // save
    await makerToken.save();
    await takerToken.save();
    await swapOrder.save();
  } else {
    // action == "cancel"
    // can be both parties
    if (!(user === swapOrder.takerToken.author || user === swapOrder.makerToken.author))
      throw new ApiError(httpStatus.FORBIDDEN, 'Order can only by cancelled by maker or taker');

    // change status
    swapOrder.status = OrderStatus.CANCELLED;

    // save
    await swapOrder.save();
  }

  swapOrder.makerToken = swapOrder.makerToken._id;
  swapOrder.takerToken = swapOrder.takerToken._id;

  res.send(swapOrder);
});

module.exports = {
  proposeSwapOrder,
  getSwapOrders,
  getSwapOrder,
  deleteSwapOrder,
};
