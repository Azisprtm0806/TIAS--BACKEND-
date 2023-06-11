const express = require("express");
const {
  protected,
  adminDosenOnly,
} = require("../../middleware/authMiddleware");
const {
  addDataTugasTambahan,
  getDataTugasTambahan,
  detailDataTugasTambahan,
  deleteDataTugasTambahan,
  addDokumenTugasTambahan,
  detailDokumen,
  deleteDokumen,
  editDokumen,
} = require("../../controllers/pelaks-pendidikan/tugasTambahanDsnController");
const {
  dokumenTgsTamabahanDsnUpload,
} = require("../../middleware/pelaks-pendidikan/tgsTamabahanDsnUpload");

const router = express.Router();

// ============= TUGAS TAMBAHAN DOSEN ======================
router.post(
  "/addData",
  protected,
  adminDosenOnly,
  dokumenTgsTamabahanDsnUpload,
  addDataTugasTambahan
);
router.get("/getData", protected, adminDosenOnly, getDataTugasTambahan);
router.get(
  "/detailData/:tgstamabahanId",
  protected,
  adminDosenOnly,
  detailDataTugasTambahan
);
// router.patch(
//   "/editPenelitian/:penelitianId",
//   protected,
//   dokumenPenelitianUpload,
//   editDataPenelitian
// );
router.delete(
  "/deleteData/:tgstamabahanId",
  protected,
  adminDosenOnly,
  deleteDataTugasTambahan
);

// ============= END TUGAS TAMBAHAN DOSEN =====================

router.post(
  "/addDokumen",
  protected,
  adminDosenOnly,
  dokumenTgsTamabahanDsnUpload,
  addDokumenTugasTambahan
);
router.get(
  "/detailDokumen/:dokumenId",
  protected,
  adminDosenOnly,
  detailDokumen
);
router.patch(
  "/editDokumen/:dokumenId",
  protected,
  adminDosenOnly,
  dokumenTgsTamabahanDsnUpload,
  editDokumen
);
router.delete(
  "/deleteDokumen/:dokumenId",
  protected,
  adminDosenOnly,
  deleteDokumen
);

module.exports = router;
