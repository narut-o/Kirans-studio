import User from "../models/userModel.js";
import ErrorHandler from "../utils/errorHandler.js";
import catchAsyncError from "../middleware/catchAsyncError.js";
import sendToken from "../utils/jwtToken.js";
import sendEmail from "../utils/sendEmail.js";
import cloudinary from "cloudinary";
import crypto from "crypto";
 


export const registerUser  = catchAsyncError(async(req,res,next)=>{
    const myCloud = await cloudinary.v2.uploader.upload(req.body.avatar,{
        folder:'avatars',
        width:150,
        crop:'scale'
    });
    const {name,email,password} = req.body;
    const user = await User.create({
        name,
        email,
        password,
        avatar:{
            public_id:myCloud.public_id,
            url:myCloud.secure_url
        }
    });
   sendToken(user,201,res);
});

export const loginUser = catchAsyncError(async(req,res,next)=>{
    const {email,password} = req.body;
    if(!email||!password)return next(new ErrorHandler("Please enter email & password",400));
    
    const user = await User.findOne({email}).select("+password");
    if(!user)return next(new ErrorHandler("Invalid email or password",401));
    
    const isPasswordMatched = await user.comparePassword(password);
    if(!isPasswordMatched)return next(new ErrorHandler("Invalid email or password",401));

     sendToken(user,200,res);
    
});
export const logout = catchAsyncError(async(req,res,next)=>{

   res.cookie('token',null,{
       expires:new Date(Date.now()),
       httpOnly:true
   });

    res.status(200).json({
        success:true,
        message:"Logged out"
    })
});

export const forgotPassword = catchAsyncError(async(req,res,next)=>{
    const user = await User.findOne({email:req.body.email});
    if(!user)return next(new ErrorHandler("User not found",404));
    //Get reset token
    const resetToken = user.getResetPasswordToken();
    //Saved user because after calling getresettoken user token is generated but not saved in the database
  await user.save({validateBeforeSave:false});
  const resetPasswordUrl1 = `${req.protocol}://${req.get('host')}/api/v1/password/reset/${resetToken}`;
  const resetPasswordUrl = `http://localhost:3000/password/reset/${resetToken}`;
  const message = `Click Here To Reset Your Password :-   ${resetPasswordUrl}`;

  try {
      await sendEmail({
          email:user.email,
          subject:'Eccomerce password recovery',
          message
      });
      res.status(200).json({
          success:true,
          message:`Email sent to ${user.email} successfully`
      });
      
  } catch (error) {
      user.resetPasswordToken = undefined;
      user.resetPasswordExpire = undefined;
      await user.save({validateBeforeSave:false});
      return next(new ErrorHandler(error.message,500));
  }

});

export const resetPassword = catchAsyncError( async(req,res,next)=>{
    
    //Creating token hash from url params
   const resetPasswordToken = crypto.createHash('sha256').update(req.params.token).digest('hex');
   const user = await User.findOne({
       resetPasswordToken,
       resetPasswordExpire:{$gt:Date.now()},
   });
   if(!user)return next(new ErrorHandler("Reset password link has expired",400));

   if(req.body.password !== req.body.confirmPassword)
   return next(new ErrorHandler("Password does not match",400));
   
   user.password = req.body.password;
   user.resetPasswordToken=undefined;
   user.resetPasswordExpire=undefined;
   await user.save();

   sendToken(user,200,res);
  
    
});
export const getUserDetails = catchAsyncError(async(req,res,next)=>{
    const user = await User.findById(req.user.id);
    res.status(200).json({
        success:true,
        user
    });
}
);

export const updatePassword = catchAsyncError(async(req,res,next)=>{
    const user = await User.findById(req.user.id).select('+password');
    const isPasswordMatched = await user.comparePassword(req.body.oldPassword);

    if(!isPasswordMatched)return (next(new ErrorHandler("Old password does not match "),400));
    if(req.body.newPassword!==req.body.confirmPassword)return (next(new ErrorHandler(" Password does not match "),400));

    user.password = req.body.newPassword;
    await user.save();
    sendToken(user,200,res);
});

export const updateProfile = catchAsyncError(async(req,res,next)=>{
    const {name,email} = req.body;
    const updatedUser = {
        name,
        email,
    };
    if(req.body.avatar)
    {
        const user = await User.findById(req.user.id);
        const image = user.avatar.public_id
        await cloudinary.v2.uploader.destroy(image); 
        const myCloud = await cloudinary.v2.uploader.upload(req.body.avatar,{
        folder:'avatars',
        width:150,
        crop:'scale'
    });
       updatedUser.avatar={
       
            public_id:myCloud.public_id,
            url:myCloud.secure_url
        
       }
    }
   
    const user = await User.findByIdAndUpdate(req.user.id,updatedUser,{new:true,runValidators:true});
    res.status(200).json({
     success:true,
     user
    });
});

//Get all users for admin only
export const getAllUsers = catchAsyncError(async(req,res,next)=>{
    const users = await User.find();
    res.status(200).json({
        success:true,
        users
    });
});

//Get single user for admin only
export const getSingleUser = catchAsyncError(async(req,res,next)=>{
    const user = await User.findById(req.params.id);
    if(!user)return next(new ErrorHandler(`User not exist with id ${req.params.id}`,404));

    res.status(200).json({
      success:true,
      user
    });
});
export const updateUserRole = catchAsyncError(async(req,res,next)=>{
    const {name,email,role} = req.body;
    const updatedUser = {
        name,
        email,
        role
    };
    const user = await User.findByIdAndUpdate(req.params.id,updatedUser,{new:true,runValidators:true});
    if(!user)return next(new ErrorHandler(`User not exist with id ${req.params.id}`,404));

    res.status(200).json({
     success:true,
     user
    });
});
export const deleteUser = catchAsyncError(async(req,res,next)=>{
    const user = await User.findById(req.params.id);
    if(!user)return next(new ErrorHandler(`User not exist with id ${req.params.id}`,404));
    
    await user.remove();
    res.status(201).json({
        success:true,
        message:"User removed successfully"
    });

});
