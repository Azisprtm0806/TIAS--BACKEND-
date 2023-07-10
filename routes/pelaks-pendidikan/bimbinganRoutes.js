const express = require("express");
const {
  protected,
  adminDosenOnly,
  adminOnly,
} = require("../../middleware/authMiddleware");
const {
  addDataBimbingan,
  detailDataBimbingan,
  getDataBimbingan,
  editDataBimbingan,
  deleteDataBimbingan,
  updateStatusBimbingan,
} = require("../../controllers/pelaks-pendidikan/bimbinganController");

const router = express.Router();

// ============= PENELITIAN ======================

router.post("/add", protected, adminDosenOnly, addDataBimbingan);
router.get("/get", protected, adminDosenOnly, getDataBimbingan);
router.get(
  "/detail/:bimbinganId",
  protected,
  adminDosenOnly,
  detailDataBimbingan
);
router.patch(
  "/edit/:bimbinganId",
  protected,
  adminDosenOnly,
  editDataBimbingan
);
router.delete(
  "/delete/:bimbinganId",
  protected,
  adminDosenOnly,
  deleteDataBimbingan
);
router.patch(
  "/updateStatus/:bimbinganId",
  protected,
  adminOnly,
  updateStatusBimbingan
);

// ============= END PENELITIAN =====================

module.exports = router;
