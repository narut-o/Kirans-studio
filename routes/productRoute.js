import express from "express";
import { createProduct, getAllProducts, updateProduct,deleteProduct,getProduct, createProductReview, getProductReviews, deleteProductReview } from "../controllers/productController.js";
import {auth,authorizeRoles} from "../middleware/auth.js";

const router = express.Router();

router.post('/admin/product/new',auth,authorizeRoles("admin"),createProduct);
router.get('/products',getAllProducts);
router.get('/product/:id',getProduct);
router.put('/admin/product/:id',auth,authorizeRoles("admin"),updateProduct);
router.delete('/admin/product/:id',auth,authorizeRoles("admin"),deleteProduct);
router.put('/review',auth,createProductReview);
router.get('/reviews',getProductReviews);
router.delete('/reviews',auth,deleteProductReview);


export default router;
