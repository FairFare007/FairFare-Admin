import mongoose from "mongoose";
import dotenv from "dotenv";
import Admin from "../models/Admin.model.js";
import { hashPassword } from "../utils/hash.js";

dotenv.config();

const createAdmin = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);

    const existingAdmin = await Admin.findOne({
      email: "admin@ff.com",
    });

    if (existingAdmin) {
      console.log("Admin already exists");
      process.exit(0);
    }

    const hashedPassword = await hashPassword("admin@123");

    await Admin.create({
      name: "Super Admin",
      email: "admin@ff.com",
      password: hashedPassword,
      role: "superadmin",
    });

    console.log("Admin created successfully");
    process.exit(0);
  } catch (error) {
    console.error("Admin creation failed:", error.message);
    process.exit(1);
  }
};

createAdmin();
