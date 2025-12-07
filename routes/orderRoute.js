import express from "express";
import { deleteOrder, getAllOrders, myOrders, newOrder, orderDetails, updateOrder } from "../controllers/orderController.js";
import { auth, authorizeRoles } from "../middleware/auth.js";


const router = express.Router();

router.post('/order/new',auth,newOrder);
router.get('/order/:id',auth,orderDetails);
router.get('/orders/myorders',auth,myOrders);
router.get('/admin/orders',auth,authorizeRoles('admin'),getAllOrders);
router.put('/admin/order/:id',auth,authorizeRoles('admin'),updateOrder);
router.delete('/admin/order/:id',auth,authorizeRoles('admin'),deleteOrder);

export default router;