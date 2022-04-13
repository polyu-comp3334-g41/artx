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
  if ((await Artwork.findById(makerTokenId).exec()) == null)
    throw new ApiError(httpStatus.NOT_FOUND, 'Maker token not found');
  if ((await Artwork.findById(takerTokenId).exec()) == null)
    throw new ApiError(httpStatus.NOT_FOUND, 'Taker token not found');

  // make sure the maker owns the token
  if ((await Artwork.findById(makerTokenId).exec()).author !== makerAddr)
    throw new ApiError(httpStatus.FORBIDDEN, `${makerAddr} does not own token ${makerTokenId}`);

  const order = await SwapOrder.create({
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
  const { user, action } = req.query;
  if (user !== req.user.addr) throw new ApiError(httpStatus.UNAUTHORIZED);

  let swapOrder = await SwapOrder.findById(req.params.id);
  if (swapOrder == null) throw new ApiError(httpStatus.NOT_FOUND, 'Order not found');
  if (swapOrder.status !== OrderStatus.PROPOSED)
    throw new ApiError(httpStatus.CONFLICT, 'Order already closed or cancelled');

  // populate tokens
  swapOrder = await SwapOrder.findById(req.params.id).populate('makerToken').populate('takerToken').exec();
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

  res.send(swapOrder);
});

module.exports = {
  proposeSwapOrder,
  getSwapOrders,
  getSwapOrder,
  deleteSwapOrder,
};
