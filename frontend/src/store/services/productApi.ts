import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export interface Product {
  _id: string;
  title: string;
  description: string;
  image: string;
  category: string;
  price: number;
  availability: boolean;
  slug: string;
  createdAt: string;
  updatedAt: string;
}

export interface ProductsResponse {
  success: boolean;
  data: Product[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

export interface ProductResponse {
  success: boolean;
  data: Product;
}

export interface CategoriesResponse {
  success: boolean;
  data: string[];
}

export interface ProductQueryParams {
  search?: string;
  categories?: string;
  minPrice?: number;
  maxPrice?: number;
  sortBy?: "price_asc" | "price_desc";
  page?: number;
  limit?: number;
}

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

export const productApi = createApi({
  reducerPath: "productApi",
  baseQuery: fetchBaseQuery({ baseUrl: API_URL }),
  tagTypes: ["Product", "Products"],
  endpoints: (builder) => ({
    // Get all products with filtering
    getProducts: builder.query<ProductsResponse, ProductQueryParams>({
      query: (params) => {
        const searchParams = new URLSearchParams();

        if (params.search) searchParams.append("search", params.search);
        if (params.categories)
          searchParams.append("categories", params.categories);
        if (params.minPrice !== undefined)
          searchParams.append("minPrice", params.minPrice.toString());
        if (params.maxPrice !== undefined)
          searchParams.append("maxPrice", params.maxPrice.toString());
        if (params.sortBy) searchParams.append("sortBy", params.sortBy);
        if (params.page) searchParams.append("page", params.page.toString());
        if (params.limit) searchParams.append("limit", params.limit.toString());

        return `/products?${searchParams.toString()}`;
      },
      providesTags: ["Products"],
    }),

    getProductBySlug: builder.query<ProductResponse, string>({
      query: (slug) => `/products/${slug}`,
      providesTags: (result, error, slug) => [{ type: "Product", id: slug }],
    }),

    getRelatedProducts: builder.query<
      { success: boolean; data: Product[] },
      string
    >({
      query: (slug) => `/products/${slug}/related`,
    }),

    getCategories: builder.query<CategoriesResponse, void>({
      query: () => "/products/categories",
    }),

    createProduct: builder.mutation<ProductResponse, FormData>({
      query: (formData) => ({
        url: "/products",
        method: "POST",
        body: formData,
      }),
      invalidatesTags: ["Products"],
    }),

    updateProduct: builder.mutation<
      ProductResponse,
      { slug: string; formData: FormData }
    >({
      query: ({ slug, formData }) => ({
        url: `/products/${slug}`,
        method: "PUT",
        body: formData,
      }),
      invalidatesTags: (result, error, { slug }) => [
        "Products",
        { type: "Product", id: slug },
      ],
    }),

    deleteProduct: builder.mutation<
      { success: boolean; message: string },
      string
    >({
      query: (slug) => ({
        url: `/products/${slug}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Products"],
    }),
  }),
});

export const {
  useGetProductsQuery,
  useGetProductBySlugQuery,
  useGetRelatedProductsQuery,
  useGetCategoriesQuery,
  useCreateProductMutation,
  useUpdateProductMutation,
  useDeleteProductMutation,
} = productApi;
