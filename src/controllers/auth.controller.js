const ensureAuthenticated = (req, res, next) => {
  if (req.isAuthenticated()) {
    next();
  } else {
    res.redirect('/auth/nonce');
  }
};

module.exports = {
  ensureAuthenticated,
};
