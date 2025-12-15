import mongoose from "mongoose";
import { Admin } from "../models/admin.model";

const MONGODB_URI =
  process.env.MONGODB_URI || "mongodb://localhost:27017/product_catalog";

const defaultAdmin = {
  email: "admin@producthub.com",
  password: "admin123",
  name: "Admin User",
};

async function seedAdmin() {
  try {
    console.log("🔌 Connecting to MongoDB...");
    await mongoose.connect(MONGODB_URI);
    console.log("✅ Connected to MongoDB\n");

    const existingAdmin = await Admin.findOne({ email: defaultAdmin.email });

    if (existingAdmin) {
      console.log(`⚠️  Admin already exists: ${defaultAdmin.email}`);
      console.log("   Use existing credentials to log in.");
    } else {
      const admin = new Admin(defaultAdmin);
      await admin.save();
      console.log("✅ Default admin created successfully!\n");
      console.log("   📧 Email:", defaultAdmin.email);
      console.log("   🔑 Password:", defaultAdmin.password);
      console.log("\n   ⚠️  Please change the password after first login!");
    }

    await mongoose.disconnect();
    console.log("\n✅ Done!");
    process.exit(0);
  } catch (error) {
    console.error("❌ Seed failed:", error);
    process.exit(1);
  }
}

seedAdmin();
