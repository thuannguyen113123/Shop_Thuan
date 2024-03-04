import mongoose from "mongoose";

const orderSchema = new mongoose.Schema(
  {
    products: [
      {
        type: mongoose.ObjectId,
        ref: "Products",
      },
    ],
    payment: {},
    buyer: {
      type: mongoose.ObjectId,
      ref: "users",
    },
    status: {
      type: String,
      default: "Không xử lý",
      enum: ["Không xử lý", "Đang Xử lý", "Đã vận chuyển", "Giao hàng", "Hủy"],
    },
  },
  { timestamps: true }
);

export default mongoose.model("Order", orderSchema);
