const express = require('express');
const swapOrderController = require('../../controllers/swapOrder.controller');
const { ensureAuthenticated } = require('../../controllers/auth.controller');

const router = express.Router();

router.route('/').post(ensureAuthenticated, swapOrderController.proposeSwapOrder);

router.route('/').get(swapOrderController.getSwapOrders);

router.route('/:id').get(swapOrderController.getSwapOrder);

router.route('/:id').delete(ensureAuthenticated, swapOrderController.deleteSwapOrder);

module.exports = router;

/**
 * @swagger
 * tags:
 *   name: SwapOrder
 *   description: SwapOrder management and retrieval
 */

/**
 * @swagger
 * /swap-orders/:
 *   post:
 *     summary: Propose an order
 *     description: Only authenticated user can propose an order. The maker token must be owned by the authenticated user.
 *     tags: [SwapOrder]
 *     parameters:
 *       - in: query
 *         name: maker
 *         schema:
 *           type: string
 *         description: order maker address
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               makerTokenId:
 *                 type: integer
 *                 format: int64
 *               takerTokenId:
 *                 type: integer
 *                 format: int64
 *     responses:
 *       "201":
 *         description: Created
 *         content:
 *           application/json:
 *             schema:
 *                $ref: '#/components/schemas/SwapOrder'
 *
 *   get:
 *     summary: list orders
 *     description: based on the query string
 *     tags: [SwapOrder]
 *     parameters:
 *       - in: query
 *         name: maker
 *         schema:
 *           type: string
 *         description: maker address
 *       - in: query
 *         name: taker
 *         schema:
 *           type: string
 *         description: taker address
 *       - in: query
 *         name: status
 *         schema:
 *           type: integer
 *           enum: [1, 2, 3]
 *         default: 1
 *         description: order status
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
 *                     $ref: '#/components/schemas/SwapOrder'
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
 * /swap-orders/{id}:
 *   get:
 *     summary: Get a swap order
 *     description: Get a particular order
 *     tags: [SwapOrder]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: order id
 *     responses:
 *       "200":
 *         description: OK
 *         content:
 *           application/json:
 *             schema:
 *                $ref: '#/components/schemas/SwapOrder'
 *       "404":
 *         $ref: '#/components/responses/NotFound'
 *
 *   delete:
 *     summary: Delete order
 *     description: Remove or cancel an order
 *     tags: [SwapOrder]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: order id
 *       - in: query
 *         name: action
 *         required: true
 *         schema:
 *           type: string
 *           enum: ["close", "cancel"]
 *         description: close or cancel
 *       - in: query
 *         name: user
 *         required: true
 *         schema:
 *           type: string
 *         description: current user, for dev use
 *     responses:
 *       "200":
 *         description: OK
 *         content:
 *           application/json:
 *             schema:
 *                $ref: '#/components/schemas/SwapOrder'
 *       "404":
 *         $ref: '#/components/responses/NotFound'
 */
