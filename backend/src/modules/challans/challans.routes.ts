import { Router } from "express";
import { requireAuth, requireRole } from "../../middleware/auth";
import { validate } from "../../middleware/validate";
import { createChallanSchema } from "./challans.validation";
import { listChallans, getChallan, createChallan, confirmChallan, cancelChallan } from "./challans.controller";

const router = Router();

router.use(requireAuth);

router.get("/", listChallans);
router.get("/:id", getChallan);
router.post("/", requireRole("ADMIN", "SALES"), validate(createChallanSchema), createChallan);
router.post("/:id/confirm", requireRole("ADMIN", "SALES", "WAREHOUSE"), confirmChallan);
router.post("/:id/cancel", requireRole("ADMIN", "SALES"), cancelChallan);

export default router;
