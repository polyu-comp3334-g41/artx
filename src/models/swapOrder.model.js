const mongoose = require('mongoose');

const { Schema } = mongoose;
const { toJSON, paginate } = require('./plugins');

const OrderStatus = {
  PROPOSED: 1,
  CLOSED: 2,
  CANCELLED: 3,
};

const swapOrderSchema = new Schema({
  makerToken: {
    type: Schema.Types.Number,
    ref: 'Artwork',
  },
  takerToken: {
    type: Schema.Types.Number,
    ref: 'Artwork',
  },
  status: Number, // Order status
});

// add plugin that converts mongoose to json
swapOrderSchema.plugin(toJSON);
swapOrderSchema.plugin(paginate);

/**
 * @typedef SwapOrder
 */
const SwapOrder = mongoose.model('SwapOrder', swapOrderSchema);

module.exports = {
  SwapOrder,
  OrderStatus,
};
