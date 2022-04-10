const mongoose = require('mongoose');

const { Schema } = mongoose;
const { ethers } = require('ethers');
const { toJSON, paginate } = require('./plugins');

const userSessionSchema = new Schema({
  addr: String,
  nonce: String, // UUID
});

userSessionSchema.plugin(toJSON);
userSessionSchema.plugin(paginate);

userSessionSchema.methods.verifySignature = async function (signature) {
  // TODO: check signature is valid
  const signerAddr = await ethers.utils.verifyMessage(this.nonce, signature);
  return signerAddr === this.addr;
};

/**
 * @typedef UserSession
 */
const UserSession = mongoose.model('UserSession', userSessionSchema);

module.exports = UserSession;
