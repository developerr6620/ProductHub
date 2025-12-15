import mongoose from "mongoose";
import { Product, ProductCategory } from "../models/product.model";
import * as fs from "fs";
import * as path from "path";
import * as https from "https";
import * as http from "http";

const MONGODB_URI =
  process.env.MONGODB_URI || "mongodb://localhost:27017/product_catalog";
const products = [
  {
    title: "Sneakers",
    description:
      "Classic white canvas sneakers with comfortable cushioning and durable rubber sole. Perfect for everyday casual wear.",
    category: ProductCategory.SHOES,
    price: 49.0,
    availability: true,
    slug: "sneakers",
    imageUrl:
      "https://images.unsplash.com/photo-1549298916-b41d501d3772?w=800&q=80",
  },
  {
    title: "T-Shirt",
    description:
      "Premium cotton t-shirt in burnt orange color. Soft, breathable fabric with a relaxed fit for maximum comfort.",
    category: ProductCategory.CLOTHING,
    price: 13.0,
    availability: true,
    slug: "t-shirt",
    imageUrl:
      "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=800&q=80",
  },
  {
    title: "Headphones",
    description:
      "High-quality over-ear wireless headphones with active noise cancellation and premium sound quality. Up to 30 hours battery life.",
    category: ProductCategory.ELECTRONICS,
    price: 38.0,
    availability: true,
    slug: "headphones",
    imageUrl:
      "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&q=80",
  },
  {
    title: "Smartphone",
    description:
      "Latest generation smartphone with stunning display, powerful processor, and advanced camera system. Available in white.",
    category: ProductCategory.ELECTRONICS,
    price: 699.0,
    availability: true,
    slug: "smartphone",
    imageUrl:
      "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=800&q=80",
  },
  {
    title: "Watch",
    description:
      "Elegant minimalist analog watch with black dial and premium leather strap. Water-resistant and scratch-proof glass.",
    category: ProductCategory.ACCESSORIES,
    price: 149.0,
    availability: true,
    slug: "watch",
    imageUrl:
      "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&q=80",
  },
  {
    title: "Bag",
    description:
      "Stylish leather crossbody bag in camel color. Compact design with adjustable strap and secure magnetic closure.",
    category: ProductCategory.ACCESSORIES,
    price: 89.0,
    availability: true,
    slug: "bag",
    imageUrl:
      "https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=800&q=80",
  },
  {
    title: "Jeans",
    description:
      "Classic blue denim jeans with comfortable stretch fabric. Modern slim fit design suitable for any occasion.",
    category: ProductCategory.CLOTHING,
    price: 59.0,
    availability: true,
    slug: "jeans",
    imageUrl:
      "https://images.unsplash.com/photo-1542272604-787c3835535d?w=800&q=80",
  },
  {
    title: "Laptop",
    description:
      "Powerful laptop with high-resolution display, fast processor, and all-day battery life. Perfect for work and entertainment.",
    category: ProductCategory.ELECTRONICS,
    price: 999.0,
    availability: true,
    slug: "laptop",
    imageUrl:
      "https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=800&q=80",
  },
  {
    title: "Wireless Earbuds",
    description:
      "High-quality wireless earbuds with noise cancellation and long battery life. Comfortable fit for extended listening sessions.",
    category: ProductCategory.ELECTRONICS,
    price: 99.99,
    availability: true,
    slug: "wireless-earbuds",
    imageUrl:
      "https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=800&q=80",
  },
];

async function downloadImage(url: string, filename: string): Promise<string> {
  const uploadsDir = path.join(__dirname, "../../uploads");

  if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
  }

  const filepath = path.join(uploadsDir, filename);
  const relativePath = `/uploads/${filename}`;

  return new Promise((resolve, reject) => {
    const protocol = url.startsWith("https") ? https : http;

    protocol
      .get(url, (response) => {
        if (response.statusCode === 301 || response.statusCode === 302) {
          const redirectUrl = response.headers.location;
          if (redirectUrl) {
            downloadImage(redirectUrl, filename).then(resolve).catch(reject);
            return;
          }
        }

        if (response.statusCode !== 200) {
          reject(new Error(`Failed to download: ${response.statusCode}`));
          return;
        }

        const fileStream = fs.createWriteStream(filepath);
        response.pipe(fileStream);

        fileStream.on("finish", () => {
          fileStream.close();
          console.log(`  ✓ Downloaded: ${filename}`);
          resolve(relativePath);
        });

        fileStream.on("error", (err) => {
          fs.unlink(filepath, () => {}); 
          reject(err);
        });
      })
      .on("error", reject);
  });
}

export async function seedDatabase() {
  try {
    await Product.deleteMany({});
    console.log("✅ Cleared existing products\n");

    for (const productData of products) {
      try {
        const filename = `${productData.slug}.jpg`;
        const imagePath = await downloadImage(productData.imageUrl, filename);

        const product = new Product({
          title: productData.title,
          description: productData.description,
          category: productData.category,
          price: productData.price,
          availability: productData.availability,
          slug: productData.slug,
          image: imagePath,
        });

        await product.save();
        console.log(`  ✅ Created product: ${productData.title}`);
      } catch (error) {
        console.error(`  ❌ Failed to create ${productData.title}:`, error);
      }
    }

    console.log(`📦 Total products created: ${products.length}`);

    process.exit(0);
  } catch (error) {
    console.error("❌ Seed failed:", error);
    process.exit(1);
  }
}

seedDatabase();
