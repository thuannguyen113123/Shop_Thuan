import productModel from "../models/productModel.js";
import categoryModel from "../models/categoryModel.js";
import orderModel from "../models/orderModel.js";
import fs from "fs";

import slugify from "slugify";
import braintree from "braintree";
import dotenv from "dotenv";

dotenv.config();

//Cổng thanh toán
var gateway = new braintree.BraintreeGateway({
  environment: braintree.Environment.Sandbox,
  merchantId: process.env.BRAINTREE_MERCHANT_ID,
  publicKey: process.env.BRAINTREE_PUBLIC_KEY,
  privateKey: process.env.BRAINTREE_PRIVATE_KEY,
});

//Tạo sản phẩm
export const createProductController = async (req, res) => {
  try {
    const { name, description, price, category, quantity, shipping } =
      req.fields;
    const { photo } = req.files;

    switch (true) {
      case !name:
        return res.status(500).send({ error: "Tên sản phẩm là bắt buộc" });
      case !description:
        return res.status(500).send({ error: "Mô tả là bắt buộc" });
      case !price:
        return res.status(500).send({ error: "Giá là bắt buộc" });
      case !category:
        return res.status(500).send({ error: "Danh mục là bắt buộc" });
      case !quantity:
        return res.status(500).send({ error: "Số lượng là bắt buộc" });
      case photo && photo.size > 1000000:
        return res
          .status(500)
          .send({ error: "Ảnh là bắt buộc và phải nhỏ hơn 1mb" });
    }

    const products = new productModel({
      ...req.fields,
      slug: slugify(name),
    });

    if (photo) {
      products.photo.data = fs.readFileSync(photo.path);
      products.photo.contentType = photo.type;
    }

    await products.save();

    res.status(201).send({
      success: true,
      message: "Tạo thành công sản phẩm",
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      error,
      message: "Lỗi khi tạo sản phẩm",
    });
  }
};
// Lấy tất cả sản phẩm
export const getProductController = async (req, res) => {
  try {
    const products = await productModel
      .find({})
      .populate("category")
      .select("-photo")
      .limit(12)
      .sort({ createdAt: -1 });
    res.status(200).send({
      success: true,
      counTotal: products.length,
      message: "Tất cả sản phẩm ",
      products,
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      message: "Xảy ra lỗi",
      error: error.message,
    });
  }
};
//Lấy 1 sản phẩm
export const getSingleProductController = async (req, res) => {
  try {
    const product = await productModel
      .findOne({ slug: req.params.slug })
      .select("-photo")
      .populate("category");

    res.status(200).send({
      success: true,
      message: "Đã lấy được sản phẩm",
      product,
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      message: "Lỗi trong lúc lấy sản phẩm",
      error,
    });
  }
};

// Lấy ảnh
export const productPhotoController = async (req, res) => {
  try {
    const product = await productModel.findById(req.params.pid).select("photo");
    if (product.photo.data) {
      res.set("Content-type", product.photo.contentType);
      return res.status(200).send(product.photo.data);
    }
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      message: "Lỗi khi lấy ảnh",
      error,
    });
  }
};

//Xóa sản phẩm
export const deleteProductController = async (req, res) => {
  try {
    await productModel.findByIdAndDelete(req.params.pid).select("-photo");
    res.status(200).send({
      success: true,
      message: "sản phẩm xóa thành công",
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      message: "Lỗi khi xóa",
      error,
    });
  }
};
//Cập nhật sản phẩm
export const updateProductController = async (req, res) => {
  try {
    const { name, description, price, category, quantity, shipping } =
      req.fields;
    const { photo } = req.files;
    switch (true) {
      case !name:
        return res.status(500).send({ error: "Tên sản phẩm là bắt buộc" });
      case !description:
        return res.status(500).send({ error: "Mô tả là bắt buộc" });
      case !price:
        return res.status(500).send({ error: "Giá là bắt buộc" });
      case !category:
        return res.status(500).send({ error: "Danh mục là bắt buộc" });
      case !quantity:
        return res.status(500).send({ error: "Số lượng là bắt buộc" });
      case photo && photo.size > 1000000:
        return res
          .status(500)
          .send({ error: "Ảnh là bắt buộc và phải nhỏ hơn 1mb" });
    }
    const products = await productModel.findByIdAndUpdate(
      req.params.pid,
      { ...req.fields, slug: slugify(name) },
      { new: true }
    );
    if (photo) {
      products.photo.data = fs.readFileSync(photo.path);
      products.photo.contentType = photo.type;
    }
    await products.save();
    res.status(201).send({
      success: true,
      message: "Cập nhật thành công sản phẩm",
      products,
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      error,
      message: "Lỗi trong khi cập nhật sản phẩm",
    });
  }
};
export const productCountController = async (req, res) => {
  try {
    //tính toán số lượng sản phẩm
    const total = await productModel.find({}).estimatedDocumentCount();
    res.status(200).send({
      success: true,
      total,
    });
  } catch (error) {
    console.log(error);
    res.status(400).send({
      message: "Lỗi khi đếm sản phẩm",
      error,
      success: false,
    });
  }
};

//Danh sách sản phẩm dựa trên trang
export const productListController = async (req, res) => {
  try {
    const perPage = 8;
    //Nhận tham số trang trên url web
    const page = req.params.page ? req.params.page : 1;
    const products = await productModel
      .find({})
      .select("-photo")
      .skip((page - 1) * perPage)
      .limit(perPage)
      .sort({ createdAt: -1 });
    res.status(200).send({
      success: true,
      products,
    });
  } catch (error) {
    console.log(error);
    res.status(400).send({
      success: false,
      message: "Lỗi server",
      error,
    });
  }
};
//Tìm kiếm sản phẩm
export const searchProductController = async (req, res) => {
  try {
    const { keyword } = req.params;
    const resutls = await productModel
      .find({
        $or: [
          { name: { $regex: keyword, $options: "i" } },
          { description: { $regex: keyword, $options: "i" } },
        ],
      })
      .select("-photo");
    res.json(resutls);
  } catch (error) {
    console.log(error);
    res.status(400).send({
      success: false,
      message: "Lỗi không thể tìm kím sản phẩm",
      error,
    });
  }
};
//Xữ lý sản phẩm cùng loại
export const realtedProductController = async (req, res) => {
  try {
    const { pid, cid } = req.params;
    const products = await productModel
      .find({
        category: cid,
        //Tìm id của sản phẩm không bằng với pid
        _id: { $ne: pid },
      })
      .select("-photo")
      .limit(3)
      .populate("category");
    res.status(200).send({
      success: true,
      products,
    });
  } catch (error) {
    console.log(error);
    res.status(400).send({
      success: false,
      message: "Lỗi khi lấy sản phẩm cùng loại",
      error,
    });
  }
};
//Load sản phẩm theo danh mục
export const productCategoryController = async (req, res) => {
  try {
    const category = await categoryModel.findOne({ slug: req.params.slug });
    const products = await productModel.find({ category }).populate("category");
    res.status(200).send({
      success: true,
      category,
      products,
    });
  } catch (error) {
    console.log(error);
    res.status(400).send({
      success: false,
      error,
      message: "Lỗi khi lấy sản phẩm trong danh mục",
    });
  }
};
//api cổng thanh toán
export const braintreeTokenController = async (req, res) => {
  try {
    //token từ braintree
    gateway.clientToken.generate({}, function (err, response) {
      if (err) {
        res.status(500).send(err);
      } else {
        res.send(response);
      }
    });
  } catch (error) {
    console.log(error);
  }
};
//Thanh toán
export const brainTreePaymentController = async (req, res) => {
  try {
    const { nonce, cart } = req.body;
    let total = 0;
    cart.map((i) => {
      total += i.price;
    });
    // tạo và xử lý một giao dịch thanh toán.
    let newTransaction = gateway.transaction.sale(
      {
        amount: total,
        paymentMethodNonce: nonce,
        options: {
          submitForSettlement: true,
        },
      },
      function (error, result) {
        if (result) {
          const order = new orderModel({
            products: cart,
            payment: result,
            buyer: req.user._id,
          }).save();
          res.json({ ok: true });
        } else {
          res.status(500).send(error);
        }
      }
    );
  } catch (error) {
    console.log(error);
  }
};
//Sản phẩm bán chạy

export const getBestSellingProductsController = async (req, res) => {
  try {
    const products = await productModel
      .find({})
      .populate("category")
      .select("-photo")
      .limit(12)
      .sort({ sold: -1 }); // Sắp xếp theo số lượng đã bán giảm dần

    res.status(200).send({
      success: true,
      count: products.length,
      message: "Danh sách sản phẩm bán chạy",
      products,
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      message: "Xảy ra lỗi",
      error: error.message,
    });
  }
};

//hàm lấy đơn hàng thanh toán trên sanbox
export const getAllPaidTransactions = async () => {
  const transactions = await gateway.transaction.search(async (search) => {
    await search
      .status()
      .in([
        braintree.Transaction.Status.Authorized,
        braintree.Transaction.Status.SubmittedForSettlement,
        braintree.Transaction.Status.Settled,
      ]);
  });

  return transactions;
};

export const calculateTotalRevenueController = async () => {
  const transactions = await getAllPaidTransactions();

  const totalRevenue = transactions.reduce((sum, transaction) => {
    return sum + parseFloat(transaction.amount);
  }, 0);

  return totalRevenue;
};
