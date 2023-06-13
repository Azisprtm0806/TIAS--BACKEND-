const express = require("express");
const { protected } = require("../../middleware/authMiddleware");
const { hkiUpload } = require("../../middleware/pelaks-penelitian/hkiUpload");
const {
  addDataHki,
  getDataHki,
  detailDataHki,
  deleteHki,
  editDataHki,
  deleteDokumenHki,
  addDokumenHki,
  detailDokumenHki,
  editDokumenHki,
} = require("../../controllers/pelaks-penelitian/hkiController");

const router = express.Router();

// ============= PENELITIAN ======================
router.post("/addHki", protected, hkiUpload, addDataHki);
router.get("/getDataHki", protected, getDataHki);
router.get("/detailHki/:hkiId", protected, detailDataHki);
router.patch("/editHki/:hkiId", protected, hkiUpload, editDataHki);
router.delete("/deleteHki/:hkiId", protected, deleteHki);

// ============= END PENELITIAN =====================

// ============= DOKUMEN PENELITIAN ==============
router.post("/addDokumen", protected, hkiUpload, addDokumenHki);
router.get("/detailDokumen/:dokumenId", protected, detailDokumenHki);
router.delete("/deleteDokumen/:dokumenId", protected, deleteDokumenHki);
router.patch("/editDokumen/:dokumenId", protected, hkiUpload, editDokumenHki);
// ============= END DOKUMEN PENELITIAN ==========

module.exports = router;
