"use client";

import React, { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { FiTrash2, FiEdit2 } from "react-icons/fi";
import {
  useGetProductBySlugQuery,
  useGetRelatedProductsQuery,
  useDeleteProductMutation,
} from "@/store/services/productApi";
import ProductCard from "@/components/ProductCard";
import ProductForm from "@/components/ProductForm";
import LoadingSpinner from "@/components/LoadingSpinner";
import { toast } from "react-toastify";
import { useAuth } from "@/context/AuthContext";

export default function ProductDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { isAuthenticated } = useAuth();
  const slug = params.slug as string;

  const [isEditFormOpen, setIsEditFormOpen] = useState(false);

  const {
    data: productData,
    isLoading,
    error,
  } = useGetProductBySlugQuery(slug);
  const { data: relatedData } = useGetRelatedProductsQuery(slug);
  const [deleteProduct, { isLoading: isDeleting }] = useDeleteProductMutation();

  const product = productData?.data;
  const relatedProducts = relatedData?.data || [];

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

  const handleDelete = async () => {
    if (!product) return;

    const confirmed = window.confirm(
      `Are you sure you want to delete "${product.title}"? This action cannot be undone.`
    );

    if (confirmed) {
      try {
        await deleteProduct(slug).unwrap();
        toast.success("Product deleted successfully");
        router.push("/");
      } catch (error: any) {
        toast.error(error?.data?.message || "Failed to delete product");
      }
    }
  };

  if (isLoading) {
    return (
      <div className="product-detail">
        <div className="container">
          <LoadingSpinner />
        </div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="product-detail">
        <div className="container">
          <div className="product-detail__breadcrumb">
            <Link href="/">Home</Link>
            <span>/</span>
            <span>Not Found</span>
          </div>
          <div className="empty-state">
            <h3 className="empty-state__title">Product Not Found</h3>
            <p className="empty-state__message">
              The product you&apos;re looking for doesn&apos;t exist or has been
              removed.
            </p>
            <Link href="/" className="btn btn-primary">
              Browse All Products
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="product-detail">
      <div className="container">
        {/* Breadcrumb */}
        <div className="product-detail__breadcrumb">
          <Link href="/">Home</Link>
          <span>/</span>
          <Link href={`/?category=${product.category}`}>
            {product.category}
          </Link>
        </div>

        <div className="product-detail__container">
          {/* Product Image */}
          <div className="product-detail__image">
            <Image
              src={getImageSrc(product.image)}
              alt={product.title}
              fill
              sizes="(max-width: 1024px) 100vw, 400px"
              style={{ objectFit: "contain" }}
              priority
            />
          </div>

          {/* Product Info */}
          <div className="product-detail__info">
            <h1 className="product-detail__title">{product.title}</h1>

            <div className="product-detail__price-row">
              <p className="product-detail__price">
                {formatPrice(product.price)}
              </p>
              <span
                className={`product-detail__stock product-detail__stock--${
                  product.availability ? "available" : "unavailable"
                }`}
              >
                {product.availability ? "In Stock" : "Out of Stock"}
              </span>
            </div>

            <h3 className="product-detail__description-title">Description</h3>
            <p className="product-detail__description">{product.description}</p>

            {isAuthenticated && (
              <div className="product-detail__actions">
                <button
                  className="btn btn-secondary"
                  onClick={() => setIsEditFormOpen(true)}
                >
                  <FiEdit2 />
                  Edit Product
                </button>
                <button
                  className="btn btn-danger"
                  onClick={handleDelete}
                  disabled={isDeleting}
                >
                  <FiTrash2 />
                  {isDeleting ? "Deleting..." : "Delete Product"}
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Related Products */}
        {relatedProducts.length > 0 && (
          <section className="related-products">
            <h2 className="related-products__title">Related Products</h2>
            <div className="related-products__grid">
              {relatedProducts.map((product) => (
                <ProductCard key={product._id} product={product} />
              ))}
            </div>
          </section>
        )}
      </div>

      {/* Edit Product Modal */}
      {isAuthenticated && (
        <ProductForm
          isOpen={isEditFormOpen}
          onClose={() => setIsEditFormOpen(false)}
          product={product}
          mode="edit"
          onSuccess={(newSlug) => {
            if (newSlug !== slug) {
              router.push(`/products/${newSlug}`);
            }
          }}
        />
      )}
    </div>
  );
}
