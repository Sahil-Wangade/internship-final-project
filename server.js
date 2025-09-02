require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const cors = require("cors");
const nodemailer = require("nodemailer");
const path = require("path");

const app = express();
app.use(cors());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// MongoDB connection
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("✅ MongoDB Connected"))
  .catch(err => console.error("❌ Mongo Error:", err));

// Schema & Model
const UserSchema = new mongoose.Schema({
  name: String,
  email: String,
  password: String,
});
const User = mongoose.model("User", UserSchema);

// Nodemailer setup
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: process.env.SMTP_PORT,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

// Signup route
app.post("/signup", async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // Save to MongoDB
    await User.create({ name, email, password });

    // Send email
    await transporter.sendMail({
      from: process.env.FROM_EMAIL,
      to: email,
      subject: "Welcome to MySaaS 🚀",
      text: `Hi ${name}, thanks for signing up! Please verify your email.`,
    });

    // Redirect to thankyou.html
    res.sendFile(path.join(__dirname, "thankyou.html"));
  } catch (err) {
    console.error(err);
    res.status(500).send("Error during signup");
  }
});
app.get("/health", (req, res) => res.send("OK ✅"));
app.listen(process.env.PORT, () => {
  console.log(`🚀 Server running at http://localhost:${process.env.PORT}`);
});
