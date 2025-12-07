import Order from "../models/orderModel.js";
import Product from "../models/productModel.js";
import ErrorHandler from "../utils/errorHandler.js";
import catchAsyncError from "../middleware/catchAsyncError.js";
import updateStock from "../utils/updateStock.js";


//Creating new order
export const newOrder = catchAsyncError(async(req,res,next)=>{
    const {shippingInfo,orderItems,
        paymentInfo,itemsPrice,taxPrice,
        shippingPrice,totalPrice} = req.body;
        
        const order = await Order.create({
        shippingInfo,orderItems,
        paymentInfo,itemsPrice,taxPrice,
        shippingPrice,totalPrice,
        paidAt:Date.now(),
        user:req.user._id
        });

        res.status(201).json({
            success:true,
            order
        });
});
//Get order details only for admin
export const orderDetails = catchAsyncError(async(req,res,next)=>{
    const order = await Order.findById(req.params.id).populate('user','name email');
    if(!order) return next(new ErrorHandler("Order not found"),404);


    res.status(200).json({
        success:true,
        order
    });
});
export const myOrders = catchAsyncError(async(req,res,next)=>{
    const orders = await Order.find({user:req.user._id});
    res.status(200).json({
        success:true,
        orders
    });
});
// Get all orders only for admin
export const getAllOrders = catchAsyncError(async(req,res,next)=>{
    const orders = await Order.find();
    let totalAmount = 0;
    orders.forEach(order=>totalAmount+=order.totalPrice);


    res.status(200).json({
        success:true,
        orders,
        totalAmount
    });
});
//Update order status only for admin
export const updateOrder = catchAsyncError(async(req,res,next)=>{
    const order = await Order.findById(req.params.id);
    if(!order) return next(new ErrorHandler("Order not found"),404);
    if(order.orderStatus==="Delivered")return next(new ErrorHandler("Order already delivered"),400);

    order.orderItems.forEach( async (order)=>await updateStock(order.product,order.quantity));
    order.orderStatus = req.body.status;
    if(req.body.status==="Delivered")
    order.deliveredAt = Date.now();
    await order.save();

    res.status(200).json({
        success:true
    });
});
export const deleteOrder = catchAsyncError(async(req,res,next)=>{
    const order = await Order.findById(req.params.id);
    if(!order) return next(new ErrorHandler("Order not found"),404);

    await order.remove();
    res.status(200).json({
        success:true
    });

});


