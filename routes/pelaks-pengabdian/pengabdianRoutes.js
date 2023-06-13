const express = require("express");
const { protected } = require("../../middleware/authMiddleware");
const {
  pengabdianUpload,
} = require("../../middleware/pelaks-pengabdian/pengabdianUpload");
const {
  addDataPengabdian,
  getDataPengabdian,
  detailDataPengabdian,
  editDataPengabdian,
  deleteDataPengabdian,
} = require("../../controllers/pelaks-pengabdian/pengabdianController");

const router = express.Router();

// ============= PENGABDIAN ======================
router.post("/addPengabdian", protected, pengabdianUpload, addDataPengabdian);
router.get("/getDataPengabdian", protected, getDataPengabdian);
router.get("/detailPengabdian/:pengabdianId", protected, detailDataPengabdian);
router.patch(
  "/editPengabdian/:pengabdianId",
  protected,
  pengabdianUpload,
  editDataPengabdian
);
router.delete(
  "/deletePengabdian/:pengabdianId",
  protected,
  deleteDataPengabdian
);

// ============= END PENGABDIAN =====================

// ============= DOKUMEN PENGABDIAN ==============
// router.post("/addDokumen", protected, hkiUpload, addDokumenHki);
// router.get("/detailDokumen/:dokumenId", protected, detailDokumenHki);
// router.delete("/deleteDokumen/:dokumenId", protected, deleteDokumenHki);
// router.patch("/editDokumen/:dokumenId", protected, hkiUpload, editDokumenHki);
// ============= END DOKUMEN PENGABDIAN ==========

module.exports = router;
