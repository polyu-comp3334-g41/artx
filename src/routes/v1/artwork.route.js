const express = require('express');
const passport = require('passport');
const auth = require('../../middlewares/auth');
const validate = require('../../middlewares/validate');
const userValidation = require('../../validations/user.validation');
const userController = require('../../controllers/user.controller');
const artworkController = require('../../controllers/artwork.controller');
const artworkValidation = require('../../validations/artwork.validation');

const router = express.Router();

router.route('/').post(artworkController.createArtwork).get(artworkController.getArtworks);

router.route('/:id').get(artworkController.getArtwork);

module.exports = router;

/**
 * @swagger
 * tags:
 *   name: Artwork
 *   description: Artwork management and retrieval
 */

/**
 * @swagger
 * /artworks:
 *   post:
 *     summary: Create an artwork
 *     description: Only authenticated user can create an artwork.
 *     tags: [Artwork]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *              $ref: '#/components/schemas/Artwork'
 *     responses:
 *       "201":
 *         description: Created
 *         content:
 *           application/json:
 *             schema:
 *                $ref: '#/components/schemas/User'
 *
 *   get:
 *     summary: Get all artworks
 *     description: based on the query string
 *     tags: [Artwork]
 *     parameters:
 *       - in: query
 *         name: author
 *         schema:
 *           type: string
 *         description: filter by artwork's owner
 *       - in: query
 *         name: sortBy
 *         schema:
 *           type: string
 *         description: sort by query in the form of field:desc/asc (ex. name:asc)
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *         default: 10
 *         description: Maximum number of users
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           minimum: 1
 *           default: 1
 *         description: Page number
 *     responses:
 *       "200":
 *         description: OK
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 results:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Artwork'
 *                 page:
 *                   type: integer
 *                   example: 1
 *                 limit:
 *                   type: integer
 *                   example: 10
 *                 totalPages:
 *                   type: integer
 *                   example: 1
 *                 totalResults:
 *                   type: integer
 *                   example: 1
 */

/**
 * @swagger
 * /artworks/{id}:
 *   get:
 *     summary: Get an artwork
 *     description: Get metadata for an artwork
 *     tags: [Artwork]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *           format: int64
 *         description: NFT id
 *     responses:
 *       "200":
 *         description: OK
 *         content:
 *           application/json:
 *             schema:
 *                $ref: '#/components/schemas/Artwork'
 *       "404":
 *         $ref: '#/components/responses/NotFound'
 *
 */
