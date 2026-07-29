import { Router } from "express";
import { requireAuth, requireRole } from "../../middleware/auth";
import { validate } from "../../middleware/validate";
import { customerSchema, customerUpdateSchema, followUpSchema } from "./customers.validation";
import {
  listCustomers,
  getCustomer,
  createCustomer,
  updateCustomer,
  addFollowUp,
} from "./customers.controller";

const router = Router();

router.use(requireAuth);

router.get("/", listCustomers);
router.get("/:id", getCustomer);
router.post("/", requireRole("ADMIN", "SALES"), validate(customerSchema), createCustomer);
router.patch("/:id", requireRole("ADMIN", "SALES"), validate(customerUpdateSchema), updateCustomer);
router.post("/:id/follow-ups", requireRole("ADMIN", "SALES"), validate(followUpSchema), addFollowUp);

export default router;
