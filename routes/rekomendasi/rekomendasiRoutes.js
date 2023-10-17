const express = require("express");
const { protected, dosenOnly } = require("../../middleware/authMiddleware");
const {
  addRekomendasi,
  editRekomendasi,
} = require("../../controllers/rekomendasi/rekomendasiController");

const router = express.Router();

// ============= REKOMENDASI ======================
router.post("/add", protected, dosenOnly, addRekomendasi);
router.patch("/edit/:id", protected, dosenOnly, editRekomendasi);
// ============= END REKOMENDASI ==================

module.exports = router;
