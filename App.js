require("dotenv").config();
const express = require("express");
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
const cors = require("cors");
const authRoutes = require("./routes/Authentication/authRoutes");
const adminRoutes = require("./routes/Admin/adminRoutes");
const usersRoutes = require("./routes/Users/userRoutes");
const profileRoutes = require("./routes/profile/profileRoutes");
const kualifikasiRoutes = require("./routes/kualifikasi/kualifikasiRoutes");
const kompetensiRoutes = require("./routes/kompetensi/kompetensiRoutes");
const kolabExtRoutes = require("./routes/kolaborator-external/kolabExternalRoutes");
const penunjangRoutes = require("./routes/penunjang/penunjangRoutes");
const ipMhsRoutes = require("./routes/pelaks-pendidikan/ipMhsRoutes");
const bimbinganRoutes = require("./routes/pelaks-pendidikan/bimbinganRoutes");
const penelitianRoutes = require("./routes/pelaks-penelitian/penelitianRoutes");
const publikasiKaryaRoutes = require("./routes/pelaks-penelitian/publikasiKaryaRoutes");
const hkiRoutes = require("./routes/pelaks-penelitian/hkiRoutes");
const pengabdianRoutes = require("./routes/pelaks-pengabdian/pengabdianRoutes");
const pembicaraRoutes = require("./routes/pelaks-pengabdian/pembicaraRoutes");
const rekomendasiRoutes = require("./routes/rekomendasi/rekomendasiRoutes");
const errorHandler = require("./helper/errorHandler");

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(bodyParser.json());
app.use(
  cors({
    origin: ["http://localhost:3000", "https://authentication-role.vercel.app"],
    credentials: true,
  })
);

// STATUS DATA
// 0  Prosess
// 1  Disetujui
// 2  Ditolak

// STATUS MAHASISWA
// 0 Aktif
// 1 Non Aktif
// 2 Alumni

// Website API
app.use("/auth", authRoutes);
app.use("/admin", adminRoutes);
app.use("/users", usersRoutes);
app.use("/profile", profileRoutes);
app.use("/kualifikasi", kualifikasiRoutes);
app.use("/kompetensi", kompetensiRoutes);
app.use("/penunjang", penunjangRoutes);
app.use("/kolabExt", kolabExtRoutes);
app.use("/ipMhs", ipMhsRoutes);
app.use("/pendidikan/bimbingan", bimbinganRoutes);
app.use("/penelitian", penelitianRoutes);
app.use("/penelitian/publikasi-karya", publikasiKaryaRoutes);
app.use("/penelitian/hki", hkiRoutes);
app.use("/pengabdian", pengabdianRoutes);
app.use("/pengabdian/pembicara", pembicaraRoutes);
app.use("/rekomendasi", rekomendasiRoutes);

// Mobile Application API dibawah

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
