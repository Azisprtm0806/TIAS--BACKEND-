require("dotenv").config();
const express = require("express");
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
const cors = require("cors");
const authRoutes = require("./routes/Authentication/authRoutes");
const profileRoutes = require("./routes/profile/profileRoutes");
const kompetensiRoutes = require("./routes/kompetensi/kompetensiRoutes");
const errorHandler = require("./helper/errorHandler");

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(bodyParser.json());
app.use(
  cors({
    origin: "http://localhost:3000/",
    credentials: true,
  })
);

app.use("/auth", authRoutes);
app.use("/profile", profileRoutes);
app.use("/kompetensi", kompetensiRoutes);
app.get("/", (req, res) => {
  res.send("Server Oke");
});

// error handler
app.use(errorHandler);

const startServer = () => {
  const PORT = process.env.PORT || 5000;
  try {
    app.listen(PORT, () => {
      console.log(`Server Running On Port: ${PORT}`);
    });
  } catch (error) {
    console.log(error);
  }
};

startServer();
