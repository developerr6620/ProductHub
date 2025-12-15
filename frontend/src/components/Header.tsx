"use client";

import React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { FiBox, FiLogIn, FiLogOut, FiUser } from "react-icons/fi";
import { useAuth } from "@/context/AuthContext";

const Header: React.FC = () => {
  const router = useRouter();
  const { isAuthenticated, admin, logout } = useAuth();

  const handleLogout = () => {
    logout();
    router.push("/");
  };

  return (
    <header className="header">
      <div className="header__container">
        <Link href="/" className="header__logo">
          <span className="header__logo-icon">
            <FiBox />
          </span>
          ProductHub
        </Link>
        <nav className="header__nav">
          <Link href="/" className="header__link">
            Products
          </Link>

          {isAuthenticated ? (
            <div className="header__auth">
              <span className="header__user">
                <FiUser /> {admin?.name}
              </span>
              <button onClick={handleLogout} className="header__logout">
                <FiLogOut /> Logout
              </button>
            </div>
          ) : (
            <Link href="/admin/login" className="header__login">
              <FiLogIn /> Admin Login
            </Link>
          )}
        </nav>
      </div>
    </header>
  );
};

export default Header;
