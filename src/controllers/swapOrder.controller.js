const httpStatus = require('http-status');
const pick = require('../utils/pick');
const ApiError = require('../utils/ApiError');
const catchAsync = require('../utils/catchAsync');
const { userService } = require('../services');
const { SwapOrder, OrderStatus } = require('../models/swapOrder.model');
const Artwork = require('../models/artwork.model')

const proposeSwapOrder = catchAsync(async (req, res) => {
  const makerAddr = req.query.maker
  const makerTokenId = req.body.makerTokenId
  const takerTokenId = req.body.takerTokenId

  console.log(`maker: ${makerTokenId}, taker: ${takerTokenId}`)
  
  // exists
  // [makerTokenId, takerTokenId].forEach((id) =>
  //   Artwork.findById(id, function (err, artwork) {
  //     if (err) throw new ApiError(httpStatus.NOT_FOUND, `Token not found: ${id}`);
  //   })
  // );

  // make sure the maker owns the token
  Artwork.findById(makerTokenId, function (err, artwork) {
    if (artwork.author != makerAddr) throw new ApiError(httpStatus.UNAUTHORIZED, `${makerAddr} does not own token ${makerTokenId}`)
  })

  order = await SwapOrder.create({
    makerToken: makerTokenId,
    takerToken: takerTokenId,
    status: OrderStatus.PROPOSED
  });

  res.status(httpStatus.CREATED).send(order);
});

const getSwapOrders = catchAsync(async (req, res) => {
  const filter = pick(req.query, ['maker', 'taker', 'status'])
  const options = pick(req.query, ['sortBy', 'limit', 'page']);
  const swapOrders = await SwapOrder.paginate(filter, options);
  res.send(swapOrders);
});

const getSwapOrder = catchAsync(async (req, res) => {
  const swapOrder = await SwapOrder.findById(req.params.id);
  res.send(swapOrder);
});

const deleteSwapOrder = catchAsync(async (req, res) => {
  const user = req.query.user
  const swapOrder = await SwapOrder.findById(req.params.id).populate('makerToken').populate('takerToken');
  const action = req.query.action

  if (action == "close") {
    // can only be closed by taker
    
    // exchange ownership
    makerToken = swapOrder.makerToken
    takerToken = swapOrder.takerToken

    tmp = makerToken.author
    makerToken.author = takerToken.author
    takerToken.author = tmp

    // change status
    swapOrder.status = OrderStatus.CLOSED

    // save
    swapOrder.save(function (err) {
      makerToken.save(err => {})
      takerToken.save(err => {})
    })
  } else { // action == "cancel"
    // can be both parties

    // change status
    swapOrder.status = OrderStatus.CANCELLED;

    // save
    swapOrder.save(function (err) {
      console.log(err)
    });
  }

  res.send(swapOrder);
});

module.exports = {
  proposeSwapOrder,
  getSwapOrders,
  getSwapOrder,
  deleteSwapOrder
};
