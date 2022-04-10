const express = require('express');
const { v4: uuidv4 } = require('uuid');
const passport = require('passport');
const httpStatus = require('http-status');
const UserSession = require('../../models/userSession.model');
const { ensureAuthenticated } = require('../../controllers/auth.controller');

const router = express.Router();

router.get('/nonce', async function (req, res) {
  // TODO: validate addr in params
  const nonce = uuidv4();
  const session = await UserSession.findOne({ addr: req.query.addr }).exec();

  if (!session) {
    await UserSession.create({ addr: req.query.addr, nonce });
  } else {
    session.nonce = nonce;
    await session.save();
  }

  res.send({
    addr: req.query.addr,
    nonce,
  });
});

// TODO: remove redirection and use 200 or 403
router.post(
  '/nonce',
  passport.authenticate('local', {
    successRedirect: 'v1/auth/success',
    failureRedirect: 'v1/auth/failure',
  })
);

router.get('/success', ensureAuthenticated, function (req, res) {
  res.status(httpStatus.OK).end();
});

router.get('/failure', function (req, res) {
  res.status(httpStatus.OK).end();
});

// Testing endpoint
router.get('/secret', ensureAuthenticated, function (req, res) {
  res.send({ user: req.user });
});

module.exports = router;

/**
 * @swagger
 * tags:
 *   name: Auth
 *   description: Authentication
 */

/**
 * @swagger
 * /auth/secret:
 *   get:
 *     summary: Get a secret
 *     tags: [Auth]
 *     responses:
 *       "200":
 *         description: user
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 addr:
 *                   type: string
 *                 nonce:
 *                   type: integer
 *                   format: int64
 */

/**
 * @swagger
 * /auth/nonce:
 *   get:
 *     summary: Get a nonce for authentication
 *     tags: [Auth]
 *     parameters:
 *       - in: query
 *         name: addr
 *         schema:
 *           type: string
 *         description: address of the user to be authenticated
 *     responses:
 *       "200":
 *         description: Nonce
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 addr:
 *                   type: string
 *                 nonce:
 *                   type: integer
 *                   format: int64
 *   post:
 *     summary: Login with signature
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - addr
 *               - signature
 *             properties:
 *               addr:
 *                 type: string
 *                 format: addr
 *               signature:
 *                 type: string
 *                 format: signature
 *     responses:
 *       "200":
 *         description: Nonce
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 addr:
 *                   type: string
 *                 nonce:
 *                   type: integer
 *                   format: int64
 */
