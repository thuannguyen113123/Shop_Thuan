import express from "express";
import dotenv from "dotenv";
import connectDB from "./config/db.js";
import authRoutes from "./routes/authRoute.js";
import categoryRoutes from "./routes/categoryRoutes.js";
import productRoutes from "./routes/productRoutes.js";
import cors from "cors";
import morgan from "morgan";
import { fileURLToPath } from "url";
import path from "path";

// Cấu hình env(môi trường)
dotenv.config();

// Lấy đường dẫn tới file đang thực thi
const __filename = fileURLToPath(import.meta.url);
// Xác định __dirname từ __filename
const __dirname = path.dirname(__filename);

const app = express();

// Kết nối cơ sở dữ liệu
connectDB();

app.use(cors());
app.use(express.json());
app.use(morgan("dev"));
app.use(express.static(path.join(__dirname, "./client/build")));

// Đường dẫn
// Xử lý đăng nhập
app.use("/api/v1/auth", authRoutes);
// Danh mục
app.use("/api/v1/category", categoryRoutes);
// Sản phẩm
app.use("/api/v1/product", productRoutes);
// REST API
app.get("/", (req, res) => {
  res.send("<h1>Welcome to ecommerce app</h1>");
});

app.use("*", function (req, res) {
  res.sendFile(path.join(__dirname, "./client/build/index.html"));
});
// Port
const PORT = process.env.PORT || 8080;

app.listen(PORT, () => {
  console.log(`Server chạy trên port ${PORT}`);
});
