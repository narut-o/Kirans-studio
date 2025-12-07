import mongoose from "mongoose";


const orderSchema = new mongoose.Schema({
    shippingInfo:{
        address:{
            type:String,
            required:true
        },
        city:{
            type:String,
            required:true
        },
        state:{
            type:String,
            required:true
        },
        pinCode:{
            type:Number,
            required:true
        },
        phoneNo:{
            type:Number,
            required:true
        }
    },
    orderItems:[{
        name:{
            type:String,
            required:true
        },
        price:{
            type:Number,
            required:true
        },
        quantity:{
            type:Number,
            required:true
        },
        image:{
            type:String,
            required:true
        },
        product:{
            type:mongoose.Schema.ObjectId,
            ref:'Product',
            required:true
        },
       

    }],
    user:{
        type:mongoose.Schema.ObjectId,
        ref:'User',
        required:true
    },
    paymentInfo:{
       
        
        
        
        razorpay:{
            razorpay_order_id:{
                type:String,
                required:true
            },
            razorpay_payment_id:{
                type:String,
               
            },
            razorpay_signature:{
                type:String,
              
            },
            
        },
      status: {
      type: String,
      enum: ["PENDING", "PAID", "FAILED"],
      default: "PENDING",
    },
       

    },
    paidAt:{
        type:Date,
        required:true
    },
    itemsPrice:{
        type:Number,
        default:0,
        required:true
    },
    taxPrice:{
        type:Number,
        default:0,
        
    },
    shippingPrice:{
        type:Number,
        default:0,
       
    },
    totalPrice:{
        type:Number,
        default:0,
        required:true
    },
    orderStatus:{
        type:String,
        default:'Processing',
        required:true
    },
    deliveredAt:Date,
    createdAt:{
        type:Date,
        default:Date.now
    }
});

const Order = mongoose.model("Order",orderSchema);
export default Order;