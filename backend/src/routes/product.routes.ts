import { Router } from "express";
import {
  getProducts,
  getProductBySlug,
  getRelatedProducts,
  createProduct,
  updateProduct,
  deleteProduct,
  getCategories,
} from "../controllers/product.controller";
import { upload } from "../middleware/upload.middleware";


const router = Router();

router.get("/categories", getCategories);
router.get("/", getProducts);
router.get("/:slug", getProductBySlug);
router.get("/:slug/related", getRelatedProducts);
router.post("/", upload.single("image"), createProduct);
router.put("/:slug", upload.single("image"), updateProduct);
router.delete("/:slug", deleteProduct);

export default router;
