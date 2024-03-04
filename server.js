import express from "express";
import dotenv from "dotenv";
import connectDB from "./config/db.js";
import authRoutes from "./routes/authRoute.js";
import categoryRoutes from "./routes/categoryRoutes.js";
import productRoutes from "./routes/productRoutes.js";
import cors from "cors";
import morgan from "morgan";
import path from "path";
import { fileURLToPath } from "url";

//Cấu hình env(môi trường)
dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename); // Di chuyển đây

const app = express();

// //Kết nối cơ sở dữ liệu
connectDB();

app.use(cors());
app.use(express.json());
app.use(morgan("dev"));
app.use(express.static(path.join(__dirname, "./client/build")));


//đường dẫn
//xứ lý đăng nhập
app.use("/api/v1/auth", authRoutes);
// danh mục
app.use("/api/v1/category", categoryRoutes);
//sản phẩm
app.use("/api/v1/product", productRoutes);
//rest api
app.get("/", (req, res) => {
  res.send("<h1>Welcome to ecommerce app</h1>");
});

app.use("*", function (req, res) {
  res.sendFile(path.join(__dirname, "./client/build/index.html"));
});
//Port
const PORT = process.env.PORT || 8080;

app.listen(PORT, () => {
  console.log(`Server chạy trên port ${PORT}`);
});
