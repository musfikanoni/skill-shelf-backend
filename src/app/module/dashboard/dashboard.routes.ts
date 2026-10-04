

import express from "express";
import { checkAuth } from "../../middlewares/checkAuth";
import { Role } from "../user/user.interface";
import { DashboardController } from "./dashboard.controller";

const router = express.Router();

router.get("/overview", checkAuth(Role.ADMIN, Role.SUPER_ADMIN), DashboardController.dashboardOverview);
router.get("/user", checkAuth(Role.USER), DashboardController.getUserDashboard);


export const DashboardRoutes = router;