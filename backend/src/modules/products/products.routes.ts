import { Router } from "express";
import { requireAuth, requireRole } from "../../middleware/auth";
import { validate } from "../../middleware/validate";
import { productSchema, productUpdateSchema, stockMovementSchema } from "./products.validation";
import {
  listProducts,
  getProduct,
  createProduct,
  updateProduct,
  recordStockMovement,
} from "./products.controller";

const router = Router();

router.use(requireAuth);

router.get("/", listProducts);
router.get("/:id", getProduct);
router.post("/", requireRole("ADMIN", "WAREHOUSE"), validate(productSchema), createProduct);
router.patch("/:id", requireRole("ADMIN", "WAREHOUSE"), validate(productUpdateSchema), updateProduct);
router.post(
  "/:id/stock-movements",
  requireRole("ADMIN", "WAREHOUSE"),
  validate(stockMovementSchema),
  recordStockMovement
);

export default router;
