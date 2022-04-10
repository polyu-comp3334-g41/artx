const mongoose = require('mongoose');
const { Schema } = mongoose;
const { ethers } = require('ethers');
const { toJSON, paginate } = require('./plugins');

const userSessionSchema = new Schema({
  addr: String,
  nonce: String,
});

userSessionSchema.plugin(toJSON);
userSessionSchema.plugin(paginate);

userSessionSchema.methods.verifySignature = async function (signature) {
  const signerAddr = await ethers.utils.verifyMessage(this.nonce, signature);
  console.log("Signer: " + signerAddr)
  console.log("Address: " + this.addr)
  if (signerAddr !== this.addr) {
    return false;
  }

  return true;
};

/**
 * @typedef UserSession
 */
const UserSession = mongoose.model('UserSession', userSessionSchema);

module.exports = UserSession;
