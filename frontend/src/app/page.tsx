"use client";

import React, { useState, useMemo } from "react";
import { FiPlus } from "react-icons/fi";
import { useGetProductsQuery } from "@/store/services/productApi";
import ProductCard from "../components/ProductCard";
import ProductForm from "../components/ProductForm";
import LoadingSpinner from "../components/LoadingSpinner";
import EmptyState from "../components/EmptyState";
import Filters, { FilterState } from "../components/Filters";
import { useAuth } from "../context/AuthContext";

export default function HomePage() {
  const { isAuthenticated } = useAuth();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [filters, setFilters] = useState<FilterState>({
    search: "",
    categories: [],
    minPrice: "",
    maxPrice: "",
    sortBy: "",
  });
  const [page, setPage] = useState(1);

  const queryParams = useMemo(() => {
    const params: any = { page, limit: 12 };

    if (filters.search) params.search = filters.search;
    if (filters.categories.length > 0)
      params.categories = filters.categories.join(",");
    if (filters.minPrice) params.minPrice = parseFloat(filters.minPrice);
    if (filters.maxPrice) params.maxPrice = parseFloat(filters.maxPrice);
    if (filters.sortBy) params.sortBy = filters.sortBy;

    return params;
  }, [filters, page]);

  const { data, isLoading, isFetching } = useGetProductsQuery(queryParams);

  const handleFilterChange = (newFilters: FilterState) => {
    setFilters(newFilters);
    setPage(1);
  };

  const products = data?.data || [];
  const pagination = data?.pagination;

  const renderPagination = () => {
    if (!pagination || pagination.pages <= 1) return null;

    const pages = [];
    const maxVisiblePages = 5;
    let startPage = Math.max(1, page - Math.floor(maxVisiblePages / 2));
    let endPage = Math.min(pagination.pages, startPage + maxVisiblePages - 1);

    if (endPage - startPage + 1 < maxVisiblePages) {
      startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }

    for (let i = startPage; i <= endPage; i++) {
      pages.push(
        <button
          key={i}
          className={`pagination__btn ${page === i ? "active" : ""}`}
          onClick={() => setPage(i)}
        >
          {i}
        </button>
      );
    }

    return (
      <div className="pagination">
        <button
          className="pagination__btn"
          onClick={() => setPage((p) => Math.max(1, p - 1))}
          disabled={page === 1}
        >
          Prev
        </button>
        {pages}
        <button
          className="pagination__btn"
          onClick={() => setPage((p) => Math.min(pagination.pages, p + 1))}
          disabled={page === pagination.pages}
        >
          Next
        </button>
      </div>
    );
  };

  return (
    <div className="home">
      <div className="container">
        {/* Main Content */}
        <div className="home__content">
          {/* Sidebar */}
          <aside className="home__sidebar">
            <Filters onFilterChange={handleFilterChange} />
          </aside>

          {/* Products Grid */}
          <section className="home__main">
            {isAuthenticated && (
              <div className="home__toolbar">
                <button
                  className="btn btn-primary"
                  onClick={() => setIsFormOpen(true)}
                >
                  <FiPlus /> Add Product
                </button>
              </div>
            )}

            {isLoading ? (
              <LoadingSpinner />
            ) : products.length === 0 ? (
              <EmptyState
                action={
                  isAuthenticated ? (
                    <button
                      className="btn btn-primary"
                      onClick={() => setIsFormOpen(true)}
                    >
                      <FiPlus /> Add Your First Product
                    </button>
                  ) : undefined
                }
              />
            ) : (
              <>
                <div
                  className={`products-grid ${
                    isFetching ? "products-grid--loading" : ""
                  }`}
                >
                  {products.map((product, index) => (
                    <div
                      key={product._id}
                      className="fade-in"
                      style={{ animationDelay: `${index * 0.05}s` }}
                    >
                      <ProductCard product={product} />
                    </div>
                  ))}
                </div>
                {renderPagination()}
              </>
            )}
          </section>
        </div>
      </div>

      {/* Product Form Modal - Only render if authenticated */}
      {isAuthenticated && (
        <ProductForm isOpen={isFormOpen} onClose={() => setIsFormOpen(false)} />
      )}
    </div>
  );
}
