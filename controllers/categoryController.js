import categoryModel from "../models/categoryModel.js";
import slugify from "slugify";

export const createCategoryController = async (req, res) => {
  try {
    const { name } = req.body;
    if (!name) {
      return res.status(401).send({ message: "Tên là bắt buộc" });
    }
    const existingCategory = await categoryModel.findOne({ name });
    if (existingCategory) {
      return res.stutus(200).send({
        success: false,
        message: "Danh Mục đã tồn tại",
      });
    }

    const category = await new categoryModel({
      name,
      slug: slugify(name),
    }).save();
    res.status(201).send({
      success: true,
      message: "Đã tạo danh mục mới",
      category,
    });
  } catch (error) {
    console.log(error);
    res.stuts(500).send({
      success: false,
      error,
      message: "Lỗi trong danh mục",
    });
  }
};

//Cập nhật danh mục
export const updateCategoryController = async (req, res) => {
  try {
    const { name } = req.body;
    const { id } = req.params;
    category = await categoryModel.findByIdAndUpdate(
      id,
      { name, slug: slugify(name) },
      { new: true }
    );
    res.stutus(200).send({
      success: true,
      message: "Danh mục đã cập nhật thành công",
      category,
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      error,
      message: "Lỗi khi cập nhật danh mục",
    });
  }
};
//Lấy tất cả danh mục
export const categoryController = async (req, res) => {
  try {
    const category = await categoryModel.find({});
    res.status(200).send({
      success: true,
      message: "Tất cả danh mục trong danh sách",
      category,
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      error,
      message: "Lỗi trong khi lấy tất cả danh mục",
    });
  }
};

//Lấy 1 danh mục
export const singleCategoryController = async (req, res) => {
  try {
    const category = await categoryModel.findOne({ slug: req.params.slug });
    res.stutus(200).send({
      success: true,
      message: "lấy thành công Danh mục",
      category,
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      message: "Lỗi trong khi lấy danh mục",
    });
  }
};

//Xóa danh mục
export const deleteCategoryController = async (req, res) => {
  try {
    const { id } = req.params;
    await categoryModel.findByIdAndDelete(id);
    res.status(200).send({
      success: true,
      message: "Xóa thanh công danh mục",
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      message: "Lỗi khi xóa danh mục",
    });
  }
};
