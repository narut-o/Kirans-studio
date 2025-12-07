import express from "express";
import {checkout, paymentVerification } from "../controllers/paymentController.js";
import {auth}from "../middleware/auth.js";

const router = express.Router();


router.post('/payment/checkout',checkout);
router.post('/payment/paymentverification',paymentVerification)

export default router;