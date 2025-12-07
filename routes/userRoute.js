import express from "express";
import { deleteUser, forgotPassword, getAllUsers, getSingleUser, getUserDetails, loginUser, logout, registerUser, resetPassword, updatePassword, updateProfile, updateUserRole } from "../controllers/userController.js";
import { auth,authorizeRoles } from "../middleware/auth.js";

const router = express.Router();
router.post('/register',registerUser);
router.post('/login',loginUser);
router.get('/logout',logout);
router.post('/password/forgot',forgotPassword);
router.put('/password/reset/:token',resetPassword);
router.get('/profile',auth,getUserDetails);
router.put('/password/update',auth,updatePassword);
router.put('/me/update',auth,updateProfile);
router.get('/admin/users',auth,authorizeRoles('admin'),getAllUsers);
router.get('/admin/user/:id',auth,authorizeRoles('admin'),getSingleUser);
router.put('/admin/user/:id',auth,authorizeRoles('admin'),updateUserRole);
router.delete('/admin/user/:id',auth,authorizeRoles('admin'),deleteUser);





export default router;