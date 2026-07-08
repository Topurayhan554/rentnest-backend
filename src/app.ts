import express, { Application, Request, Response } from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import config from "./config";
import { notFound } from "./middlewares/notFound";
import { globalErrorHandler } from "./middlewares/globalErrorHandler";
import { authRoutes } from "./modules/auth/auth.route";
import { userRoutes } from "./modules/user/user.route";

const app: Application = express();

// Stripe webhook needs raw body — MUST be registered BEFORE express.json()
app.use("/api/payments/confirm", express.raw({ type: "application/json" }));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(
  cors({
    origin: config.app_url,
    credentials: true,
  }),
);

app.get("/", (req: Request, res: Response) => {
  res.send("RentNest API is running");
});

app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
// app.use("/api/categories", categoryRoutes);
// app.use("/api/properties", propertyRoutes);
// app.use("/api/rentals", rentalRequestRoutes);
// app.use("/api/payments", paymentRoutes);
// app.use("/api/reviews", reviewRoutes);

app.use(notFound);
app.use(globalErrorHandler);

export default app;
