"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { FiMail, FiLock, FiLogIn } from "react-icons/fi";
import { toast } from "react-toastify";
import { useLoginMutation } from "../../../store/services/authApi";
import { useAuth } from "../../../context/AuthContext";

export default function AdminLoginPage() {
  const router = useRouter();
  const { isAuthenticated, login } = useAuth();
  const [loginMutation, { isLoading }] = useLoginMutation();

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const [errors, setErrors] = useState({
    email: "",
    password: "",
  });

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      router.push("/");
    }
  }, [isAuthenticated, router]);

  const validateForm = () => {
    const newErrors = { email: "", password: "" };
    let isValid = true;

    if (!formData.email) {
      newErrors.email = "Email is required";
      isValid = false;
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Please enter a valid email";
      isValid = false;
    }

    if (!formData.password) {
      newErrors.password = "Password is required";
      isValid = false;
    } else if (formData.password.length < 6) {
      newErrors.password = "Password must be at least 6 characters";
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    try {
      const result = await loginMutation({
        email: formData.email,
        password: formData.password,
      }).unwrap();

      if (result.success) {
        login(result.data.token, result.data.admin);
        toast.success(`Welcome back, ${result.data.admin.name}!`);
        router.push("/");
      }
    } catch (error: any) {
      toast.error(error?.data?.message || "Login failed. Please try again.");
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name as keyof typeof errors]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  return (
    <div className="admin-login">
      <div className="admin-login__container">
        <div className="admin-login__card">
          <div className="admin-login__header">
            <h1 className="admin-login__title">Admin Login</h1>
            <p className="admin-login__subtitle">
              Sign in to manage your products
            </p>
          </div>

          <form onSubmit={handleSubmit} className="admin-login__form">
            <div className="admin-login__field">
              <label htmlFor="email" className="admin-login__label">
                Email
              </label>
              <div className="admin-login__input-wrapper">
                <FiMail className="admin-login__input-icon" />
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="admin@example.com"
                  className={`admin-login__input ${
                    errors.email ? "admin-login__input--error" : ""
                  }`}
                  disabled={isLoading}
                />
              </div>
              {errors.email && (
                <span className="admin-login__error">{errors.email}</span>
              )}
            </div>

            <div className="admin-login__field">
              <label htmlFor="password" className="admin-login__label">
                Password
              </label>
              <div className="admin-login__input-wrapper">
                <FiLock className="admin-login__input-icon" />
                <input
                  type="password"
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="••••••••"
                  className={`admin-login__input ${
                    errors.password ? "admin-login__input--error" : ""
                  }`}
                  disabled={isLoading}
                />
              </div>
              {errors.password && (
                <span className="admin-login__error">{errors.password}</span>
              )}
            </div>

            <button
              type="submit"
              className="admin-login__submit"
              disabled={isLoading}
            >
              {isLoading ? (
                <span className="admin-login__loading">Signing in...</span>
              ) : (
                <>
                  <FiLogIn /> Sign In
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
