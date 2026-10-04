import express from "express";
import { CostController } from "./cost.controller";
import { checkAuth } from "../../middlewares/checkAuth";
import { Role } from "../user/user.interface";

const router = express.Router();

router.post(
    "/", 
    checkAuth(Role.USER, Role.ADMIN, Role.SUPER_ADMIN),    
    CostController.createCost);
router.get(
    "/", 
    checkAuth(Role.USER, Role.ADMIN, Role.SUPER_ADMIN),
    CostController.getAllCosts);
router.get(
    "/:id", 
    checkAuth(Role.USER, Role.ADMIN, Role.SUPER_ADMIN),
    CostController.getSingleCost);
router.patch(
    "/:id", 
    checkAuth(Role.USER, Role.ADMIN, Role.SUPER_ADMIN),
    CostController.updateCost);
router.delete(
    "/:id", 
    checkAuth(Role.USER, Role.ADMIN, Role.SUPER_ADMIN),
    CostController.deleteCost);

export const CostRoutes = router;