import express, { Router } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User, { IUser } from "../models/user";

const router: Router = express.Router();

// สร้าง admin user
router.post("/admin", async (req, res) => {
  try {
    const { username, password } = req.body;

    console.log("🔐 Request to create admin with:");
    console.log("Username:", username);
    console.log("Raw Password:", password);

    const existingAdmin = await User.findOne({ role: "admin" });
    if (existingAdmin) {
      console.log("⚠️ Admin already exists");
      return res.status(400).json({ message: "Admin already exists" });
    }

    const existingUser = await User.findOne({ username });
    if (existingUser) {
      console.log("⚠️ Username already exists");
      return res.status(400).json({ message: "Username already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    console.log("🔑 Hashed Password:", hashedPassword);

    const user = new User({
      username,
      password, // ส่ง raw password เลย
      role: "admin",
      isPermanent: true,
    });

    await user.save(); // pre save จะจัดการ hash ให้เอง

    const token = jwt.sign(
      { _id: user._id, role: user.role },
      process.env.JWT_SECRET || "secret"
    );

    console.log("🪙 JWT Token:", token);

    res.status(201).json({ message: "Permanent Admin created", token });
  } catch (error) {
    console.error("❌ Server Error:", error);
    res.status(500).json({ message: "Server error", error });
  }
});

export default router;
