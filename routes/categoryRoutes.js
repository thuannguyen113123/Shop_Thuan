import express from "express";
import { isAdmin, requireSignIn } from "../middlewares/authMiddleware.js";
import {
  categoryController,
  createCategoryController,
  singleCategoryController,
  updateCategoryController,
  deleteCategoryController,
} from "../controllers/categoryController.js";

const router = express.Router();

//Tạo danh mục
router.post(
  "/create-category",
  requireSignIn,
  isAdmin,
  createCategoryController
);
//Cập nhật danh mục
router.put(
  "/update-category/:id",
  requireSignIn,
  isAdmin,
  updateCategoryController
);

//Lấy tất cả danh mục
router.get("/get-category", categoryController);

//Lấy danh mục
router.get("/single-category/:slug", singleCategoryController);
// Xóa danh mục
router.delete(
  "/delete-category/:id",
  requireSignIn,
  isAdmin,
  deleteCategoryController
);

export default router;
