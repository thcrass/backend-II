import { Router } from 'express';
import { productDBManager } from '../dao/productDBManager.js';
import { cartDBManager } from '../dao/cartDBManager.js';
import { passportCall } from '../middleware/auth.js';
import { isUser, isAuthenticated } from '../middleware/authorization.js';
import { TicketRepository } from '../repositories/TicketRepository.js';
import { emailService } from '../services/emailService.js';

const router = Router();
const ProductService = new productDBManager();
const CartService = new cartDBManager(ProductService);
const ticketRepository = new TicketRepository();

router.get('/:cid', passportCall('current'), isAuthenticated, async (req, res) => {

    try {
        const result = await CartService.getProductsFromCartByID(req.params.cid);
        res.send({
            status: 'success',
            payload: result
        });
    } catch (error) {
        res.status(400).send({
            status: 'error',
            message: error.message
        });
    }
});

router.post('/', passportCall('current'), isUser, async (req, res) => {

    try {
        const result = await CartService.createCart();
        res.send({
            status: 'success',
            payload: result
        });
    } catch (error) {
        res.status(400).send({
            status: 'error',
            message: error.message
        });
    }
});

router.post('/:cid/product/:pid', passportCall('current'), isUser, async (req, res) => {

    try {
        const result = await CartService.addProductByID(req.params.cid, req.params.pid)
        res.send({
            status: 'success',
            payload: result
        });
    } catch (error) {
        res.status(400).send({
            status: 'error',
            message: error.message
        });
    }
});

router.delete('/:cid/product/:pid', passportCall('current'), isUser, async (req, res) => {

    try {
        const result = await CartService.deleteProductByID(req.params.cid, req.params.pid)
        res.send({
            status: 'success',
            payload: result
        });
    } catch (error) {
        res.status(400).send({
            status: 'error',
            message: error.message
        });
    }
});

router.put('/:cid', passportCall('current'), isUser, async (req, res) => {

    try {
        const result = await CartService.updateAllProducts(req.params.cid, req.body.products)
        res.send({
            status: 'success',
            payload: result
        });
    } catch (error) {
        res.status(400).send({
            status: 'error',
            message: error.message
        });
    }
});

router.put('/:cid/product/:pid', passportCall('current'), isUser, async (req, res) => {

    try {
        const result = await CartService.updateProductByID(req.params.cid, req.params.pid, req.body.quantity)
        res.send({
            status: 'success',
            payload: result
        });
    } catch (error) {
        res.status(400).send({
            status: 'error',
            message: error.message
        });
    }
});

router.delete('/:cid', passportCall('current'), isUser, async (req, res) => {

    try {
        const result = await CartService.deleteAllProducts(req.params.cid)
        res.send({
            status: 'success',
            payload: result
        });
    } catch (error) {
        res.status(400).send({
            status: 'error',
            message: error.message
        });
    }
});

// Endpoint para finalizar compra
router.post('/:cid/purchase', passportCall('current'), isUser, async (req, res) => {
    try {
        const cartId = req.params.cid;
        const userEmail = req.user.email;

        // Obtener productos del carrito
        const cart = await CartService.getProductsFromCartByID(cartId);
        
        if (!cart || !cart.products || cart.products.length === 0) {
            return res.status(400).send({
                status: 'error',
                message: 'El carrito está vacío'
            });
        }

        // Verificar stock y calcular total
        const availableProducts = [];
        const unavailableProducts = [];
        let totalAmount = 0;

        for (let item of cart.products) {
            const product = await ProductService.getProductByID(item.product._id);
            
            if (product.stock >= item.quantity) {
                // Producto disponible
                availableProducts.push(item);
                totalAmount += product.price * item.quantity;
                
                // Reducir stock
                await ProductService.updateProduct(product._id, {
                    stock: product.stock - item.quantity
                });
            } else {
                // Producto no disponible por falta de stock
                unavailableProducts.push({
                    product: item.product,
                    requestedQuantity: item.quantity,
                    availableStock: product.stock
                });
            }
        }

        if (availableProducts.length === 0) {
            return res.status(400).send({
                status: 'error',
                message: 'No hay productos con stock suficiente',
                unavailableProducts
            });
        }

        // Generar ticket
        const ticketCode = await ticketRepository.generateUniqueCode();
        const ticket = await ticketRepository.create({
            code: ticketCode,
            purchase_datetime: new Date(),
            amount: totalAmount,
            purchaser: userEmail
        });

        // Actualizar carrito: remover productos comprados
        const remainingProducts = cart.products.filter(item => 
            unavailableProducts.some(unavailable => 
                unavailable.product._id.toString() === item.product._id.toString()
            )
        );
        
        await CartService.updateAllProducts(cartId, remainingProducts);

        // Enviar email de confirmación
        try {
            await emailService.sendPurchaseConfirmation(userEmail, ticket);
        } catch (emailError) {
            console.error('Error enviando email de confirmación:', emailError);
        }

        res.send({
            status: 'success',
            message: 'Compra procesada exitosamente',
            ticket: {
                code: ticket.code,
                purchase_datetime: ticket.purchase_datetime,
                amount: ticket.amount,
                purchaser: ticket.purchaser
            },
            purchasedProducts: availableProducts.length,
            unavailableProducts: unavailableProducts.length > 0 ? unavailableProducts : undefined
        });

    } catch (error) {
        console.error('Error en purchase:', error);
        res.status(500).send({
            status: 'error',
            message: 'Error al procesar la compra: ' + error.message
        });
    }
});

export default router;