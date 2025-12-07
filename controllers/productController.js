import Product from "../models/productModel.js"
import ErrorHandler from "../utils/errorHandler.js";
import catchAsyncError from "../middleware/catchAsyncError.js";
import ApiFeatures from "../utils/apifeatures.js";



//Only admin can access
export const createProduct = catchAsyncError(async (req,res,next)=>{
    req.body.user = req.user.id;
    const product = await Product.create(req.body);
    res.status(201).json({
        success:true,
        product
    });
    next();
});


export const getAllProducts = catchAsyncError(async(req,res)=>{
     
    const resultPerPage = 9;
    const productsCount = await Product.countDocuments();
    const apiFeature = new ApiFeatures(Product.find(),req.query).search().filter()
    let products = await apiFeature.query;
    const filteredProductCount = products.length;
    apiFeature.pagination(resultPerPage);
    products = await apiFeature.query.clone();
   
    res.status(200).json({
        success:true,
        products,
        productsCount,
        resultPerPage,
        filteredProductCount
    });
});
//Only admin can access
export const updateProduct = catchAsyncError(async (req,res,next)=>{
    const {id} = req.params;
    let product = await Product.findById(id);
    if(!product) return next(new ErrorHandler("Product not found",404));
    product = await Product.findByIdAndUpdate(id,req.body,{new:true,runValidators:true});
    res.status(200).json({
        success:true,
        product
    })
});
export const getProduct = catchAsyncError(async(req,res,next)=>{
    const {id} = req.params;
    const product = await Product.findById(id);
    if(!product) return next(new ErrorHandler("Product not found",404));
    
    res.status(200).json({
        success:true,
        product
    });
});
export const deleteProduct = catchAsyncError(async(req,res,next)=>{
    const {id} = req.params;
    const product = await Product.findById(id);
    if(!product) return next(new ErrorHandler("Product not found",404));
    await product.remove();
    res.status(200).json({
        success:true,
        message:"Product deleted successfully"
    })
});

export const createProductReview = catchAsyncError(async(req,res,next)=>{
    const {rating,comment,productId} = req.body;
    const review = {
        user:req.user._id,
        name:req.user.name,
        rating:Number(rating),
        comment
    }
    const product = await Product.findById(productId);
    //Checking if the product has been reviewed by the current user
    const isReviewed = product.reviews.find((review)=>review.user.toString()===req.user._id.toString());
    if(isReviewed){
          product.reviews.forEach((review)=>{
              if(review.user.toString()===req.user._id.toString())
              {
                  review.rating = rating;
                  review.comment = comment;
              }
          });
    }else{
           product.reviews.push(review);
           product.numberOfReviews = product.reviews.length;
    }

    let total = 0;
    product.reviews.forEach((review)=>{
        total+=review.rating;
    });
    product.ratings = total/product.reviews.length;
    await product.save();
    res.status(200).json({
        success:true,
        message:"Review added successfully"
    });
});

export const getProductReviews = catchAsyncError(async(req,res,next)=>{
    const product = await Product.findById(req.query.productId);
    if(!product) return next(new ErrorHandler("Product not found",404));

    res.status(200).json({
        success:true,
        reviews:product.reviews
    });

});
export const deleteProductReview = catchAsyncError(async(req,res,next)=>{
     const product = await Product.findById(req.query.productId);
     if(!product) return next(new ErrorHandler("Product not found",404));
     //query.id is review id
     const reviews =  product.reviews.filter((review)=>(review._id.toString()!==req.query.id.toString()));
     let total = 0; 
     reviews.forEach((review)=>{
         total+=review.rating;
     });
     const ratings = total/reviews.length;
     const numberOfReviews = reviews.length;
     await Product.findByIdAndUpdate(req.query.productId,{reviews,ratings,numberOfReviews},{new:true,runValidators:true});
     
     res.status(200).json({
         success:true,
         message:"Review deleted successfully"
     });

});