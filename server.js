require("dotenv").config();

const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const bodyParser = require("body-parser");

const authMiddleware = require("./middleware/auth");
const adminAuthMiddleware = require("./middleware/adminAuth");
const admin = require("./models/admin");
// Initialize Express
const app = express();
const PORT = process.env.PORT || 5000;
app.use(express.json({ limit: "100mb" }));
app.use(express.urlencoded({ extended: true, limit: "100mb" }));
// Middleware
app.use(cors());
app.use(bodyParser.json({ limit: "100mb" }));
app.use(bodyParser.urlencoded({ extended: true, limit: "100mb" }));

// Connect to MongoDB
mongoose
  .connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(async () => {
    console.log("MongoDB Connected");
    await insertAdmin();
  })
  .catch((err) => console.error("MongoDB Connection Error:", err));

// Simple route
app.get("/", (req, res) => {
  res.send("Server is running.");
});

app.use("/api/auth", require("./routes/auth"));
app.use("/api/sms", authMiddleware, require("./routes/smsRouter"));
app.use("/api/payment", authMiddleware, require("./routes/paymentRouter"));

app.use("/api/admin/auth", require("./routes/admin/auth"));
app.use(
  "/api/admin/user",
  adminAuthMiddleware,
  require("./routes/admin/userRouter")
);
app.use(
  "/api/admin/payment",
  adminAuthMiddleware,
  require("./routes/admin/paymentRouter")
);

app.use(
  "/api/admin/sms",
  adminAuthMiddleware,
  require("./routes/admin/smsRouter")
);

// Start server
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

async function insertAdmin() {
  try {
    const existingConfig = await admin.findOne(); // Check if any config exists
    if (!existingConfig) {
      await admin.create({
        username: "admin",
        password:
          "$2a$12$f5vB2ozfA/hB0R5T3sq5C.y9Xp1hb0oqzebwsmHFI5iPhf1aroJQe",
      }); // Insert default object
      console.log("Inserted Admin.");
    } else {
      console.log("Admin is already exists, skipping insertion.");
    }
  } catch (error) {
    console.error("Error inserting Admin:", error);
  }
}
