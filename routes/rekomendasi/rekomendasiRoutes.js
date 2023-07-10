const express = require("express");
const { protected } = require("../../middleware/authMiddleware");
const {
  addRekomendasi,
} = require("../../controllers/rekomendasi/rekomendasiController");

const router = express.Router();

// ============= REKOMENDASI ======================
router.post("/add", protected, addRekomendasi);
// ============= END REKOMENDASI ==================

module.exports = router;
