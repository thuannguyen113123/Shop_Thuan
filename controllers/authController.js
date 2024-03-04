import userModel from "../models/userModel.js";
import orderModel from "../models/orderModel.js";

import { comparePassword, hashPassword } from "./../helpers/authHelper.js";
import JWT from "jsonwebtoken";

export const registerController = async (req, res) => {
  try {
    const { name, email, password, phone, address, answer } = req.body;

    // Xử lý các trường hợp người dùng không nhập gì
    if (!name) {
      return res.send({ error: "Tên người dùng là bắt buộc" });
    }
    if (!email) {
      return res.send({ error: "Email là bắt buộc" });
    }
    if (!password) {
      return res.send({ error: "Mật khẩu là bắt buộc" });
    }
    if (!phone) {
      return res.send({ error: "Số điện thoại là bắt buộc" });
    }
    if (!address) {
      return res.send({ error: "Địa chỉ là bắt buộc" });
    }

    // Kiểm tra email của người dùng trong quá trình đăng ký
    const existingUser = await userModel.findOne({ email });
    if (existingUser) {
      return res.status(200).send({
        success: false,
        message: "Đăng ký không thành công. Email đã tồn tại.",
      });
    }

    const hashedPassword = await hashPassword(password);

    // Lưu lại trong cơ sở dữ liệu
    const user = await new userModel({
      name,
      email,
      phone,
      address,
      password: hashedPassword,
      answer,
    }).save();

    res.status(201).send({
      success: true,
      message: "Đăng ký thành công tài khoản",
      user,
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      message: "Lỗi khi đăng ký",
      error,
    });
  }
};

// // Đăng nhập
export const loginController = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Kiểm tra
    if (!email || !password) {
      return res.status(404).send({
        success: false,
        message: "Email hoặc mật khẩu không hợp lệ",
      });
    }

    // Kiểm tra email đã được đăng ký chưa
    const user = await userModel.findOne({ email });
    if (!user) {
      return res.status(404).send({
        success: false,
        message: "Email chưa được đăng ký",
      });
    }

    // Kiểm tra mật khẩu mã hóa và mật khẩu
    const match = await comparePassword(password, user.password);
    if (!match) {
      return res.status(200).send({
        success: false,
        message: "Mật khẩu không hợp lệ",
      });
    }

    // Gắn token khi đăng nhập vào web
    const token = await JWT.sign({ _id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "7d",
    });

    res.status(200).send({
      success: true,
      message: "Đăng nhập thành công",
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        address: user.address,
        role: user.role,
      },
      token,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).send({
      success: false,
      message: "Lỗi đăng nhập",
      error,
    });
  }
};

//Quên Mật khẩu
export const forgotPasswordController = async (req, res) => {
  try {
    const { email, answer, newPassword } = req.body;
    if (!email) {
      res.status(400).send("Email là bắt buộc");
    }
    if (!answer) {
      res.status(400).send("Câu trả lời là bắt buộc");
    }
    if (!newPassword) {
      res.status(400).send("Mật khẩu mới là bắt buộc");
    }
    // kiểm tra có tồn tại email và câu trả lời
    const user = await userModel.findOne({ email, answer });

    if (!user) {
      return res.status(404).send({
        success: false,
        message: "Sai Email hoặc câu trả lời",
      });
    }
    const hashed = await hashPassword(newPassword);
    await userModel.findByIdAndUpdate(user._id, { password: hashed });
    res.status(200).send({
      success: true,
      message: "Mật khẩu cập nhật thành công",
    });
  } catch (error) {
    console.error(error);
    res.status(500).send({
      success: false,
      message: "Xảy ra lỗi",
      error,
    });
  }
};
//Cập nhật thông tin
export const updateProfileController = async (req, res) => {
  try {
    const { name, email, password, address, phone } = req.body;
    //Tìm kiếm người dùng đang yêu cầu
    const user = await userModel.findById(req.user._id);
    //kiểm tra Mật khẩu
    if (password && password.length < 6) {
      return res.json({ error: "Mật khẩu là bắt buộc và dài hơn 6 ký tự" });
    }
    const hashedPassword = password ? await hashPassword(password) : undefined;

    //Cập nhật nếu người dùng không đổi gì thì vẩn giữ trong csdl(user)
    const updatedUser = await userModel.findByIdAndUpdate(
      req.user._id,
      {
        name: name || user.name,
        password: hashedPassword || user.password,
        phone: phone || user.phone,
        address: address || user.address,
      },
      { new: true }
    );
    res.status(200).send({
      success: true,
      message: "Cập nhật thông tin thành công",
      updatedUser,
    });
  } catch (error) {
    console.log(error);
    res.status(400).send({
      success: false,
      message: "Lỗi khi cập nhật thông tin",
      error,
    });
  }
};
//Đặt hàng
export const getOrdersController = async (req, res) => {
  try {
    const orders = await orderModel
      .find({ buyer: req.user._id })
      .populate("products", "-photo")
      .populate("buyer", "name");
    res.json(orders);
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      message: "Lỗi khi lấy đơn đặt hàng",
      error,
    });
  }
};
//Tất cả đơn đặt hàng
export const getAllOrdersController = async (req, res) => {
  try {
    const orders = await orderModel
      .find({})
      .populate("products", "-photo")
      .populate("buyer", "name")
      .sort({ createdAt: "-1" });
    res.json(orders);
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      message: "Lỗi trong khi lấy tất cả đơn hàng",
      error,
    });
  }
};
//Xữ lý cập nhật đơn hàng
export const orderStatusController = async (req, res) => {
  try {
    const { orderId } = req.params;
    const { status } = req.body;
    console.log(typeof status);
    const orders = await orderModel.findByIdAndUpdate(
      orderId,
      { status },
      { new: true }
    );
    res.json(orders);
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      message: "Lỗi khi cập nhật đơn hàng",
      error,
    });
  }
};
//Lấy danh sách tài khoản
export const getUsersController = async (req, res) => {
  try {
    const users = await userModel
      .find({ role: { $in: [1, 2, 3] } })
      .select("-password -answer"); // Loại bỏ trường "password" và "answer" khỏi kết quả truy vấn

    res.status(200).send({
      success: true,
      message: "Lấy Admin, Quản lý và nhân viên trong danh sách",
      users,
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      error,
      message: "Lỗi trong khi lấy tất cả tài khoản",
    });
  }
};
