import JWT from "jsonwebtoken";
import userModel from "../models/userModel.js";

//Xác thực token để truy cấp vào web
export const requireSignIn = async (req, res, next) => {
  try {
    const decode = JWT.verify(
      req.headers.authorization,
      process.env.JWT_SECRET
    );
    req.user = decode;
    next();
  } catch (error) {
    console.log(error);
  }
};
// // Kiểm tra có phải admin k
// export const isAdmin = async (req, res, next) => {
//   try {
//     const user = await userModel.findById(req.user._id);
//     if (user.role !== 1 ) {
//       return res.status(401).send({
//         success: false,
//         message: "Không có quyền truy cập",
//       });
//     } else {
//       next();
//     }
//   } catch (error) {
//     console.log(error);
//     res.status(401).send({
//       success: false,
//       error,
//       message: "Lỗi trong phần mềm trung gian quản trị",
//     });
//   }
// };
// Kiểm tra có phải admin k
export const isAdmin = async (req, res, next) => {
  try {
    const user = await userModel.findById(req.user._id);
    if (user.role === 1 || user.role === 2 || user.role === 3) {
      next();
    } else {
      return res.status(401).send({
        success: false,
        message: "Không có quyền truy cập",
      });
    }
  } catch (error) {
    console.log(error);
    res.status(401).send({
      success: false,
      error,
      message: "Lỗi trong phần mềm trung gian quản trị",
    });
  }
};
