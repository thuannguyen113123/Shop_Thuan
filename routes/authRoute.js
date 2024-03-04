import express from "express";
import {
  registerController,
  loginController,
  forgotPasswordController,
  updateProfileController,
  getOrdersController,
  getAllOrdersController,
  orderStatusController,
  getUsersController,
} from "../controllers/authController.js";
import { isAdmin, requireSignIn } from "../middlewares/authMiddleware.js";

//router
const router = express.Router();

//Đăng ký
router.post("/register", registerController);

//Đăng nhập
router.post("/login", loginController);

//Quên mật khẩu
router.post("/forgot-password", forgotPasswordController);

//Người dùng có đăng nhập
router.get("/user-auth", requireSignIn, (req, res) => {
  res.status(200).send({ ok: true });
});

//Xữ lý truy cập  admin
router.get("/admin-auth", requireSignIn, isAdmin, (req, res) => {
  res.status(200).send({ ok: true });
});

//Cập nhật thông tin
router.put("/profile", requireSignIn, updateProfileController);

//Đặt hàng
router.get("/orders", requireSignIn, getOrdersController);
//Tất cả đơn đặt hàng
router.get("/all-orders", requireSignIn, isAdmin, getAllOrdersController);
//Cập nhật trang thái đơn hàng
router.put(
  "/order-status/:orderId",
  requireSignIn,
  isAdmin,
  orderStatusController
);

//Lấy danh sách tài khoản Nhân viên admin và quản lý
router.get("/users", getUsersController);

export default router;
