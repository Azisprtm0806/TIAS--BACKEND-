const express = require("express");
const { protected } = require("../../middleware/authMiddleware");
const {
  addDataPublikasi,
  getDataPublikasi,
  detailDataPublikasi,
  editDataPublikasi,
  deleteDataPublikasi,
  addDokumenPublikasi,
  detailDokumenPublikasi,
  deleteDokumenPublikasi,
  editDokumenPublikasi,
} = require("../../controllers/pelaks-penelitian/publikasiKaryaController");
const {
  publikasiKaryaUpload,
} = require("../../middleware/pelaks-penelitian/publikasiKaryaUpload");

const router = express.Router();

// ============= PENELITIAN ======================
router.post("/addPublikasi", protected, publikasiKaryaUpload, addDataPublikasi);
router.get("/getPublikasi", protected, getDataPublikasi);
router.get("/detailPublikasi/:publikasiId", protected, detailDataPublikasi);
router.patch(
  "/editPublikasi/:publikasiId",
  protected,
  publikasiKaryaUpload,
  editDataPublikasi
);
router.delete("/deletePublikasi/:publikasiId", protected, deleteDataPublikasi);
// ============= END PENELITIAN =====================

// ============= DOKUMEN PUBLIKASI ==============
router.post(
  "/addDokumen",
  protected,
  publikasiKaryaUpload,
  addDokumenPublikasi
);
router.get("/detailDokumen/:dokumenId", protected, detailDokumenPublikasi);
router.delete("/deleteDokumen/:dokumenId", protected, deleteDokumenPublikasi);
router.patch(
  "/editDokumen/:dokumenId",
  protected,
  publikasiKaryaUpload,
  editDokumenPublikasi
);
// ============= END DOKUMEN PUBLIKASI ==========

module.exports = router;
