"use client";

import React, { useState, useRef, useEffect } from "react";
import { Formik, Form, Field, ErrorMessage, FormikHelpers } from "formik";
import * as Yup from "yup";
import { FiX, FiUpload, FiLink } from "react-icons/fi";
import {
  useCreateProductMutation,
  useUpdateProductMutation,
  useGetCategoriesQuery,
  Product,
} from "@/store/services/productApi";
import { toast } from "react-toastify";

interface ProductFormProps {
  isOpen: boolean;
  onClose: () => void;
  product?: Product;
  mode?: "create" | "edit";
  onSuccess?: (newSlug: string) => void;
}

interface FormValues {
  title: string;
  description: string;
  category: string;
  price: string;
  availability: boolean;
}

const slugify = (text: string): string => {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "");
};

const validationSchema = Yup.object().shape({
  title: Yup.string()
    .required("Title is required")
    .min(3, "Title must be at least 3 characters")
    .max(200, "Title cannot exceed 200 characters"),
  description: Yup.string()
    .required("Description is required")
    .min(10, "Description must be at least 10 characters"),
  category: Yup.string().required("Category is required"),
  price: Yup.number()
    .required("Price is required")
    .min(0, "Price cannot be negative")
    .typeError("Price must be a number"),
  availability: Yup.boolean(),
});

const ProductForm: React.FC<ProductFormProps> = ({
  isOpen,
  onClose,
  product,
  mode = "create",
  onSuccess,
}) => {
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imageUrl, setImageUrl] = useState<string>("");
  const [useImageUrl, setUseImageUrl] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { data: categoriesData } = useGetCategoriesQuery();
  const [createProduct, { isLoading: isCreating }] = useCreateProductMutation();
  const [updateProduct, { isLoading: isUpdating }] = useUpdateProductMutation();

  const isLoading = isCreating || isUpdating;
  const isEditMode = mode === "edit" && product;

  const categories = categoriesData?.data || [];

  const getImageSrc = (image: string) => {
    if (image.startsWith("http")) {
      return image;
    }
    return `${process.env.NEXT_PUBLIC_API_URL?.replace("/api", "")}${image}`;
  };

  useEffect(() => {
    if (isEditMode && product) {
      if (product.image.startsWith("http")) {
        setUseImageUrl(true);
        setImageUrl(product.image);
        setImagePreview(product.image);
      } else {
        setImagePreview(getImageSrc(product.image));
      }
    }
  }, [isEditMode, product]);

  const initialValues: FormValues = isEditMode
    ? {
        title: product.title,
        description: product.description,
        category: product.category,
        price: String(product.price),
        availability: product.availability,
      }
    : {
        title: "",
        description: "",
        category: "",
        price: "",
        availability: true,
      };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      setImageUrl("");
      setUseImageUrl(false);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleImageUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const url = e.target.value;
    setImageUrl(url);
    if (url) {
      setImagePreview(url);
      setImageFile(null);
    } else {
      setImagePreview(null);
    }
  };

  const removeImage = () => {
    setImagePreview(null);
    setImageFile(null);
    setImageUrl("");
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleClose = () => {
    if (!isEditMode) {
      removeImage();
    }
    onClose();
  };

  const handleSubmit = async (
    values: FormValues,
    { resetForm }: FormikHelpers<FormValues>
  ) => {
    try {
      const hasNewImage = imageFile || imageUrl;
      const hasExistingImage = isEditMode && product?.image;

      if (!hasNewImage && !hasExistingImage) {
        toast.error("Please upload an image or provide an image URL");
        return;
      }

      const formData = new FormData();
      formData.append("title", values.title);
      formData.append("description", values.description);
      formData.append("category", values.category);
      formData.append("price", values.price);
      formData.append("availability", String(values.availability));

      if (imageFile) {
        formData.append("image", imageFile);
      } else if (imageUrl) {
        formData.append("image", imageUrl);
      }

      if (isEditMode) {
        const result = await updateProduct({
          slug: product.slug,
          formData,
        }).unwrap();
        toast.success("Product updated successfully!");
        onClose();
        if (onSuccess && result.data?.slug) {
          onSuccess(result.data.slug);
        }
      } else {
        await createProduct(formData).unwrap();
        toast.success("Product created successfully!");
        resetForm();
        removeImage();
        onClose();
      }
    } catch (error: any) {
      toast.error(
        error?.data?.message ||
          `Failed to ${isEditMode ? "update" : "create"} product`
      );
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal">
      <div className="modal__backdrop" onClick={handleClose} />
      <div className="modal__content">
        <div className="modal__header">
          <h2>{isEditMode ? "Edit Product" : "Add New Product"}</h2>
          <button className="modal__close" onClick={handleClose}>
            <FiX />
          </button>
        </div>
        <div className="modal__body">
          <Formik
            initialValues={initialValues}
            validationSchema={validationSchema}
            onSubmit={handleSubmit}
            enableReinitialize
          >
            {({ values, setFieldValue }) => (
              <Form className="product-form">
                {/* Title */}
                <div className="product-form__group">
                  <label className="product-form__label">Title *</label>
                  <Field
                    name="title"
                    type="text"
                    className="product-form__input"
                    placeholder="Enter product title"
                  />
                  <ErrorMessage
                    name="title"
                    component="span"
                    className="product-form__error"
                  />
                </div>

                {/* Slug Preview */}
                <div className="product-form__group">
                  <label className="product-form__label">
                    Slug (auto-generated)
                  </label>
                  <div className="product-form__slug">
                    <FiLink />
                    <code>
                      /products/{slugify(values.title) || "your-product-slug"}
                    </code>
                  </div>
                </div>

                {/* img Upload */}
                <div className="product-form__group">
                  <label className="product-form__label">
                    img {isEditMode ? "(leave empty to keep current)" : "*"}
                  </label>

                  {/* Toggle between file upload and URL */}
                  <div style={{ marginBottom: "0.75rem" }}>
                    <label className="product-form__checkbox">
                      <input
                        type="checkbox"
                        checked={useImageUrl}
                        onChange={(e) => {
                          setUseImageUrl(e.target.checked);
                          removeImage();
                        }}
                      />
                      <span>Use image URL instead</span>
                    </label>
                  </div>

                  {useImageUrl ? (
                    <input
                      type="text"
                      className="product-form__input"
                      placeholder="Enter image URL (e.g., https://example.com/image.jpg)"
                      value={imageUrl}
                      onChange={handleImageUrlChange}
                    />
                  ) : (
                    <div
                      className={`product-form__image-upload ${
                        imagePreview ? "has-image" : ""
                      }`}
                      onClick={() =>
                        !imagePreview && fileInputRef.current?.click()
                      }
                    >
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        onChange={handleImageChange}
                      />
                      {imagePreview ? (
                        <div className="product-form__image-upload-preview">
                          <img src={imagePreview} alt="Preview" />
                          <button type="button" onClick={removeImage}>
                            <FiX />
                          </button>
                        </div>
                      ) : (
                        <div className="product-form__image-upload-placeholder">
                          <FiUpload />
                          <p>Click to upload image</p>
                          <span>PNG, JPG, GIF up to 5MB</span>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Category and Price */}
                <div className="product-form__row">
                  <div className="product-form__group">
                    <label className="product-form__label">Category *</label>
                    <Field
                      as="select"
                      name="category"
                      className="product-form__select"
                    >
                      <option value="">Select category</option>
                      {categories.map((cat) => (
                        <option key={cat} value={cat}>
                          {cat}
                        </option>
                      ))}
                    </Field>
                    <ErrorMessage
                      name="category"
                      component="span"
                      className="product-form__error"
                    />
                  </div>

                  <div className="product-form__group">
                    <label className="product-form__label">Price ($) *</label>
                    <Field
                      name="price"
                      type="number"
                      step="0.01"
                      min="0"
                      className="product-form__input"
                      placeholder="0.00"
                    />
                    <ErrorMessage
                      name="price"
                      component="span"
                      className="product-form__error"
                    />
                  </div>
                </div>

                {/* Availability */}
                <div className="product-form__group">
                  <label className="product-form__checkbox">
                    <input
                      type="checkbox"
                      checked={values.availability}
                      onChange={(e) =>
                        setFieldValue("availability", e.target.checked)
                      }
                    />
                    <span>Available in stock</span>
                  </label>
                </div>

                {/* Description */}
                <div className="product-form__group">
                  <label className="product-form__label">Description *</label>
                  <Field
                    as="textarea"
                    name="description"
                    className="product-form__textarea"
                    placeholder="Enter product description..."
                  />
                  <ErrorMessage
                    name="description"
                    component="span"
                    className="product-form__error"
                  />
                </div>

                {/* Actions */}
                <div className="product-form__actions">
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={handleClose}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="btn btn-primary"
                    disabled={isLoading}
                  >
                    {isLoading
                      ? isEditMode
                        ? "Updating..."
                        : "Creating..."
                      : isEditMode
                      ? "Update Product"
                      : "Create Product"}
                  </button>
                </div>
              </Form>
            )}
          </Formik>
        </div>
      </div>
    </div>
  );
};

export default ProductForm;
