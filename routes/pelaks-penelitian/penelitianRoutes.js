const express = require("express");
const { protected } = require("../../middleware/authMiddleware");
const {
  addDataPenelitian,
  addDataAnggotaPenelitian,
  addDokumenPenelitian,
  getDataPenelitian,
  detailDataPenelitian,
  detailDokumenPenelitian,
  deleteDokumenPenelitian,
  editDokumenPenelitian,
  addAnggotaDosen,
  addAnggotaMhs,
} = require("../../controllers/pelaks-penelitian/penelitianController");
const {
  dokumenPenelitianUpload,
} = require("../../middleware/pelaks-penelitian/dokumenPenelitianUpload");

const router = express.Router();

// ============= PENELITIAN ======================
router.post("/addPenelitian", protected, addDataPenelitian);
router.get("/getDatapenelitian", protected, getDataPenelitian);
router.get("/detailPenelitian/:penelitianId", protected, detailDataPenelitian);
// router.patch(
//   "/editProfesi/:profId",
//   protected,
//   penunjangUpload,
//   editDataProfesi
// );
// router.delete("/deleteProfesi/:profId", protected, deleteDataProfesi);

// ============= END PENELITIAN =====================

// ============= ANGGOTA PENELITIAN ==================
router.post("/anggotaDosen", protected, addAnggotaDosen);
router.post("/anggotaMhs", protected, addAnggotaMhs);
// ============= END ANGGOTA PENELITIAN ==============

// ============= DOKUMEN PENELITIAN ==============
router.post(
  "/addDokumenPenelitian",
  protected,
  dokumenPenelitianUpload,
  addDokumenPenelitian
);
router.get("/detailDokumen/:dokumenId", protected, detailDokumenPenelitian);
router.delete("/deleteDokumen/:dokumenId", protected, deleteDokumenPenelitian);
router.patch(
  "/editDokumen/:dokumenId",
  protected,
  dokumenPenelitianUpload,
  editDokumenPenelitian
);
// ============= END DOKUMEN PENELITIAN ==========

module.exports = router;
