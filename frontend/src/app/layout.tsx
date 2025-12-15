import type { Metadata } from "next";
import { Providers } from "@/components/Providers";
import Header from "@/components/Header";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "@/styles/globals.scss";
import "@/styles/main.scss";

export const metadata: Metadata = {
  title: "ProductHub - Premium Product Catalog",
  description:
    "Discover our curated collection of premium products across multiple categories. Shop electronics, clothing, shoes, and more.",
  keywords: "products, catalog, electronics, clothing, shoes, shopping",
  openGraph: {
    title: "ProductHub - Premium Product Catalog",
    description: "Discover our curated collection of premium products.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>
        <Providers>
          <Header />
          <main>{children}</main>
          <ToastContainer
            position="bottom-right"
            autoClose={4000}
            hideProgressBar={false}
            newestOnTop
            closeOnClick
            rtl={false}
            pauseOnFocusLoss
            draggable
            pauseOnHover
            theme="dark"
          />
        </Providers>
      </body>
    </html>
  );
}
