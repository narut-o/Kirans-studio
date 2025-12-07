import catchAsyncError from "../middleware/catchAsyncError.js";
import * as dotenv from 'dotenv';
import Order from "../models/orderModel.js";
import { instance } from "../server.js";
import crypto from "crypto";





export const checkout = catchAsyncError(async(req,res,next)=>{

  
   const{shippingInfo,cartItems,user,amount} = req.body;
  const options = {
    amount:Number(req.body.amount * 100),
    currency:'INR'
  };
  const order = await instance.orders.create(options);
   
  await Order.create({
   shippingInfo,
  
   orderItems:cartItems,
   itemsPrice:amount,
   taxPrice:Math.round(amount*0.18),
   shippingPrice:0,
   totalPrice:amount,
   paidAt:Date.now(),
   user,
   paymentInfo:{
     razorpay:{
      razorpay_order_id:order.id,
     },
     status:'PENDING'
   },
   paidAt: new Date(),
  
 });
  res.status(200).json({
    success:true,
    order,
  })

});
export const paymentVerification = async (req,res)=>{

const {razorpay_order_id,razorpay_payment_id,razorpay_signature} = req.body;

const body  = razorpay_order_id + "|" +razorpay_payment_id;
const expectedSignature = crypto.createHmac('sha256',process.env.RAZORPAY_API_SECRET).update(body.toString()).digest('hex');
const isAuthentic = expectedSignature===razorpay_signature;
if(isAuthentic){
       // save to database
       //updating payment status to paid
      const updatedOrder = await Order.findOneAndUpdate(
  { "paymentInfo.razorpay.razorpay_order_id": razorpay_order_id }, // filter
  {
    $set: {
      "paymentInfo.status": "PAID",
      "paymentInfo.razorpay.razorpay_payment_id": razorpay_payment_id,
      "paymentInfo.razorpay.razorpay_signature": razorpay_signature,
    },
  },
  {
    new: true,          // return the updated doc
    runValidators: true // optional but good practice
  }
);


       res.redirect(`${process.env.FRONT_END_URL}/razorpay/success`)
}else{
  res.status(400).json({success:false}); 
}
}
// var response = {'signatureIsValid':'false'}
// if(expectedSignature===razorpay_signature){
//   response={'signatureIsValid':'true'}
//   res.send(response);
// }
 
  


// export const processPayment = catchAsyncError(async(req,res,next)=>{
//      const myPayment =  await stripe.paymentIntents.create({
//          amount:req.body.amount,
//          currency:'inr',
//          metadata:{
//              company:'Electrosphere inc',
             
//          }
//      });
//      res.status(200).json({
//          success:true,
//          client_secret: myPayment.client_secret
//      })
// });
// export const sendStipePublishableKey = catchAsyncError(async(req,res,next)=>{
//     res.status(200).json({
//         stripe_publishable_key:process.env.STRIPE_PUBLISHABLE_KEY
//     })
// });

// export const processRazorPayment = catchAsyncError(async(req,res,next)=>{
//    const {shippingInfo,user,cartItems} = req.body;
//    const amount = cartItems.map((item)=>{amount+=item.price})
//          const options = {
          
//     key:process.env.RAZORPAY_API_KEY, // Enter the Key ID generated from the Dashboard
//     amount:Number(amount*100), // Amount is in currency subunits. 
//     currency: "INR",
//     name: "Kiran wax studio", //your business name
//     description: "Test Transaction",
//     image: "https://res.cloudinary.com/dlozyi9yd/image/upload/v1764971605/WhatsApp_Image_2025-11-18_at_18.17.20_yjftfa.jpg",
//     order_id: order.id, // This is a sample Order ID. Pass the `id` obtained in the response of Step 1
//     callback_url: "http://localhost:4000/api/v1/payment/paymentverification",
//     prefill: { //We recommend using the prefill parameter to auto-fill customer's contact information especially their phone number
//         "name": user.name, //your customer's name
//         "email":user.email,
//         "contact": "+919876543210" //Provide the customer's phone number for better conversion rates 
//     },
//     notes: {
//         "address": "Razorpay Corporate Office"
//     },
//     theme: {
//         "color": "#3399cc"
//     }
    
// };
// const razor = new window.Razorpay(options);
// razor.open();
// })

// export const createPayment = catchAsyncError(async(req,res,next)=>{

//     const {shippingInfo,user,cartItems} = req.body;
     
//        const customer = await stripe.customers.create({
//          email:user.email,
//          name:user.name,
//          metadata:{
//            cart:JSON.stringify(cartItems),
//             userId:user._id,
//             shipping:JSON.stringify(shippingInfo)
//          }
//        });
   
//     const params = {
//         submit_type: 'pay',
//         mode: 'payment',
//         payment_method_types: ['card'],
//         billing_address_collection: 'auto',
        
//         shipping_options: [
//           { shipping_rate: 'shr_1Ls97rSDdRNXOkkShu2lHE89' },
//           {shipping_rate:'shr_1Ls96cSDdRNXOkkS6VZXtoq6'}
//         ],

//         line_items: req.body.cartItems.map((item) => {
//             const img = item.image;
  
//             return {
//               price_data: { 
//                 currency: 'inr',
//                 product_data: { 
//                   name: item.name,
//                   images: [img],
//                 },
//                 unit_amount: item.price * 100,
//               },
//               adjustable_quantity: {
//                 enabled:true,
//                 maximum:item.stock
//               },
//               quantity: item.quantity
//             }
//           }),
      
//         mode: 'payment',
//         customer:customer.id,

//     success_url: `http://localhost:3000/success`,
//     cancel_url: 'http://localhost:3000/cancel',

//       }
     
//       const session = await stripe.checkout.sessions.create(params);
      
//       res.status(200).json(session);
// });

// const fulfillOrder = (session) => {
//   // TODO: fill me in
//   console.log("Fulfilling order", session);
//  }

// const createOrder = catchAsyncError(async(customer,data)=>{
//  const cartItems = JSON.parse(customer.metadata.cart);
//  const shippingInfo =JSON.parse(customer.metadata.shipping);
//  const order = await Order.create({
//    shippingInfo,
//    orderItems:cartItems,
//    itemsPrice:data.amount_subtotal,
//    taxPrice:Math.round(data.amount_subtotal*0.18),
//    shippingPrice:199,
//    totalPrice:data.amount_total,
//    paidAt:Date.now(),
//    user:customer.metadata.userId,
//    paymentInfo:{
//      id:data.payment_intent,
//      status:data.payment_status
//    }
//  });
 

// })
// export const webHookEndpoint = catchAsyncError(async(req,res,next)=>{

//     const payload = req.rawBody;

//     const sig = req.headers['stripe-signature'];


//      let event; 
  

//     try {
//      event = stripe.webhooks.constructEvent(payload,sig,endpointSecret);


//     } catch (err) {
//       return res.status(400).send(`Webhook Error: ${err.message}`);
//     }
//     if (event.type === 'checkout.session.completed') {
//       const session = event.data.object;
//       stripe.customers.retrieve(session.customer).then(customer=>{
      

//         createOrder(customer,session); 
//       }).catch(err=>console.log(err.message));
     
//     }
  
//     res.status(200);
    
// });