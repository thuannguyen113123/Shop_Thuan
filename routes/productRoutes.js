import express from "express";
import formidable from "express-formidable";
import {
  createProductController,
  getProductController,
  productPhotoController,
  getSingleProductController,
  deleteProductController,
  updateProductController,
  searchProductController,
  realtedProductController,
  productCategoryController,
  braintreeTokenController,
  brainTreePaymentController,
  productCountController,
  productListController,
  getBestSellingProductsController,
  //Thống kê doanh thu
  calculateTotalRevenueController,
} from "../controllers/productController.js";
import { isAdmin, requireSignIn } from "../middlewares/authMiddleware.js";

const router = express.Router();

//tạo sản phẩm
router.post(
  "/create-product",
  requireSignIn,
  isAdmin,
  formidable(),
  createProductController
);
//Lấy tất cả sản phẩm
router.get("/get-product", getProductController);
//Lấy 1 sản phẩm
router.get("/get-product/:slug", getSingleProductController);

//lấy ảnh (trường lấy 1 sản phẩm kết hợp vs này ms lấy được tất cả trường của sản phẩm)
router.get("/product-photo/:pid", productPhotoController);

//Xóa sản phẩm
router.delete("/delete-product/:pid", deleteProductController);

//Cập nhật sản phẩm
router.put(
  "/update-product/:pid",
  requireSignIn,
  isAdmin,
  formidable(),
  updateProductController
);
//Số sản phẩm
router.get("/product-count", productCountController);
//phân trang sản phẩm
router.get("/product-list/:page", productListController);
//Sản phẩm bán chạy
router.get("/product-hot", getBestSellingProductsController);

//Tìm kiếm sản phẩm
router.get("/search/:keyword", searchProductController);
//Sản phẩm cùng loại
router.get("/related-product/:pid/:cid", realtedProductController);
//Sản phẩm theo danh mục
router.get("/product-category/:slug", productCategoryController);
//Thanh toán (Token) routes
router.get("/braintree/token", braintreeTokenController);
//Thanh toán
router.post("/braintree/payment", requireSignIn, brainTreePaymentController);
//Thống kê
router.get("/revenueStatistics", calculateTotalRevenueController);

export default router;
