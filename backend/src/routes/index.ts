import { Router } from "express";
import authRoutes from "../modules/auth/auth.routes";
import customerRoutes from "../modules/customers/customers.routes";
import productRoutes from "../modules/products/products.routes";
import challanRoutes from "../modules/challans/challans.routes";

const router = Router();

router.use("/auth", authRoutes);
router.use("/customers", customerRoutes);
router.use("/products", productRoutes);
router.use("/challans", challanRoutes);

export default router;
