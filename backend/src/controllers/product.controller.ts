import { Request, Response } from "express";
import { Product, IProduct, ProductCategory } from "../models/product.model";
import slugify from "slugify";

export const getProducts = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const {
      search,
      categories,
      minPrice,
      maxPrice,
      sortBy,
      page = 1,
      limit = 12,
    } = req.query;

    const query: any = {};

    if (search && typeof search === "string") {
      query.title = { $regex: search, $options: "i" };
    }

    if (categories) {
      const categoryList =
        typeof categories === "string" ? categories.split(",") : categories;
      query.category = { $in: categoryList };
    }

    if (minPrice || maxPrice) {
      query.price = {};
      if (minPrice) query.price.$gte = parseFloat(minPrice as string);
      if (maxPrice) query.price.$lte = parseFloat(maxPrice as string);
    }

    let sortOption: any = { createdAt: -1 };
    if (sortBy === "price_asc") {
      sortOption = { price: 1 };
    } else if (sortBy === "price_desc") {
      sortOption = { price: -1 };
    }

    const pageNum = parseInt(page as string) || 1;
    const limitNum = parseInt(limit as string) || 12;
    const skip = (pageNum - 1) * limitNum;

    const [products, total] = await Promise.all([
      Product.find(query).sort(sortOption).skip(skip).limit(limitNum),
      Product.countDocuments(query),
    ]);

    res.json({
      success: true,
      data: products,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        pages: Math.ceil(total / limitNum),
      },
    });
  } catch (error) {
    console.error("Error fetching products:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching products",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};


export const getProductBySlug = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { slug } = req.params;

    const product = await Product.findOne({ slug });

    if (!product) {
      res.status(404).json({
        success: false,
        message: "Product not found",
      });
      return;
    }

    res.json({
      success: true,
      data: product,
    });
  } catch (error) {
    console.error("Error fetching product:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching product",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

export const getRelatedProducts = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { slug } = req.params;

    const currentProduct = await Product.findOne({ slug });

    if (!currentProduct) {
      res.status(404).json({
        success: false,
        message: "Product not found",
      });
      return;
    }

    const relatedProducts = await Product.find({
      category: currentProduct.category,
      _id: { $ne: currentProduct._id },
    })
      .limit(4)
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      data: relatedProducts,
    });
  } catch (error) {
    console.error("Error fetching related products:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching related products",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

export const createProduct = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { title, description, category, price, availability } = req.body;

    const baseSlug = slugify(title, { lower: true, strict: true });
    let slug = baseSlug;
    let counter = 1;

    while (await Product.findOne({ slug })) {
      slug = `${baseSlug}-${counter}`;
      counter++;
    }

    let imagePath = "";
    if (req.file) {
      imagePath = `/uploads/${req.file.filename}`;
    } else if (req.body.image) {
      imagePath = req.body.image;
    }

    if (!imagePath) {
      res.status(400).json({
        success: false,
        message: "Image is required",
      });
      return;
    }

    const product = new Product({
      title,
      description,
      image: imagePath,
      category,
      price: parseFloat(price),
      availability: availability === "true" || availability === true,
      slug,
    });

    await product.save();

    res.status(201).json({
      success: true,
      data: product,
      message: "Product created successfully",
    });
  } catch (error) {
    console.error("Error creating product:", error);
    res.status(500).json({
      success: false,
      message: "Error creating product",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

export const updateProduct = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { slug } = req.params;
    const { title, description, category, price, availability } = req.body;

    const product = await Product.findOne({ slug });

    if (!product) {
      res.status(404).json({
        success: false,
        message: "Product not found",
      });
      return;
    }

    if (title && title !== product.title) {
      product.title = title;
      const baseSlug = slugify(title, { lower: true, strict: true });
      let newSlug = baseSlug;
      let counter = 1;

      while (
        await Product.findOne({ slug: newSlug, _id: { $ne: product._id } })
      ) {
        newSlug = `${baseSlug}-${counter}`;
        counter++;
      }
      product.slug = newSlug;
    }

    if (description) product.description = description;
    if (category) product.category = category;
    if (price !== undefined) product.price = parseFloat(price);
    if (availability !== undefined) {
      product.availability = availability === "true" || availability === true;
    }

    if (req.file) {
      product.image = `/uploads/${req.file.filename}`;
    } else if (req.body.image) {
      product.image = req.body.image;
    }

    await product.save();

    res.json({
      success: true,
      data: product,
      message: "Product updated successfully",
    });
  } catch (error) {
    console.error("Error updating product:", error);
    res.status(500).json({
      success: false,
      message: "Error updating product",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

export const deleteProduct = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { slug } = req.params;

    const product = await Product.findOneAndDelete({ slug });

    if (!product) {
      res.status(404).json({
        success: false,
        message: "Product not found",
      });
      return;
    }

    res.json({
      success: true,
      message: "Product deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting product:", error);
    res.status(500).json({
      success: false,
      message: "Error deleting product",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};


export const getCategories = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const categories = Object.values(ProductCategory);

    res.json({
      success: true,
      data: categories,
    });
  } catch (error) {
    console.error("Error fetching categories:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching categories",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};
