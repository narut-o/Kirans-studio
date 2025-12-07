// backend/app.js
import express from "express";
import productRoute from "./routes/productRoute.js";
import userRoute from "./routes/userRoute.js";
import orderRoute from "./routes/orderRoute.js";
import paymentRoute from "./routes/paymentRoute.js";
import errorMiddleWare from "./middleware/error.js";   // 🔥 FIXED: no "backend" here

import cookieParser from "cookie-parser";
import bodyParser from "body-parser";
import fileUpload from "express-fileupload";
import cors from "cors";
import * as dotenv from "dotenv";

// Load env from backend/.env
dotenv.config({ path: "./.env" });    // ✅ because .env is inside backend

const app = express();

// CORS
app.use(
  cors({
    credentials: true,
    origin: process.env.FRONT_END_URL,
  })
);

// JSON body with rawBody for Razorpay (or Stripe)
app.use(
  express.json({
    limit: "5mb",
    verify: (req, res, buf) => {
      req.rawBody = buf.toString();
    },
  })
);

app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(fileUpload());

// Routes
app.use("/api/v1", productRoute);
app.use("/api/v1", userRoute);
app.use("/api/v1", orderRoute);
app.use("/api/v1", paymentRoute);

// Error middleware
app.use(errorMiddleWare);

export default app;