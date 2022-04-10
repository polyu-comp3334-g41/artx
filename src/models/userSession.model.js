const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcryptjs');
const { ethers } = require('ethers');
const { toJSON, paginate } = require('./plugins');
const { roles } = require('../config/roles');

const userSessionSchema = mongoose.Schema({
  addr: String,
  nonce: Number,
});

userSessionSchema.methods.verifySignature = async function (signature) {
  const signerAddr = await ethers.utils.verifyMessage(this.nonce, signature);
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
