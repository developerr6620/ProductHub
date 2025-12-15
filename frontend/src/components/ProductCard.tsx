"use client";

import React from "react";
import Link from "next/link";
import { Product } from "@/store/services/productApi";

interface ProductCardProps {
  product: Product;
}

const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(price);
  };

  const getImageSrc = (image: string) => {
    if (image.startsWith("http")) {
      return image;
    }
    return `${process.env.NEXT_PUBLIC_API_URL?.replace("/api", "")}${image}`;
  };

  return (
    <Link href={`/products/${product.slug}`} className="product-card">
      <div className="product-card__image">
        <img
          src={getImageSrc(product.image)}
          alt={product.title}
          style={{ objectFit: "cover" }}
        />
        <span
          className={`product-card__badge product-card__badge--${
            product.availability ? "available" : "unavailable"
          }`}
        >
          {product.availability ? "In Stock" : "Out of Stock"}
        </span>
        <span className="product-card__category">{product.category}</span>
      </div>
      <div className="product-card__content">
        <h3 className="product-card__title">{product.title}</h3>
        <p className="product-card__price">{formatPrice(product.price)}</p>
      </div>
    </Link>
  );
};

export default ProductCard;
