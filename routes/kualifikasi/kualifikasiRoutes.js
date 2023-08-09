const express = require("express");
const { protected, adminOnly } = require("../../middleware/authMiddleware");
const { kualifikasiUpload } = require("../../middleware/kualifikasiUpload");
const {
  addRiwayatPekerjaan,
  getDataRiwayatPekerjaan,
  detailDataRiwayatPekerjaan,
  editDataRiwayatPekerjaan,
  deleteDataRiwayatPekerjaan,
  editStatusRiwayatPekerjaan,
  filterDataRiwayatPekerjaan,
} = require("../../controllers/kualifikasi/riwayatPekerjaanController");
const {
  detailDataPendidikan,
  deleteDataPendidikan,
  editDataPendidikan,
  addPendidikan,
  getDataPendidikan,
  editStatusPendidikan,
  filterDataPendidikan,
} = require("../../controllers/kualifikasi/pendidikanController");
const router = express.Router();

// ============= RIWAYAT PEKERJAAN ======================
router.post(
  "/addRiwayatPekerjaan",
  protected,
  kualifikasiUpload,
  addRiwayatPekerjaan
);
router.get("/getDataRiwayatPekerjaan", protected, getDataRiwayatPekerjaan);
router.get(
  "/detailRiwayatPekerjaan/:rwytId",
  protected,
  detailDataRiwayatPekerjaan
);
router.patch(
  "/editRiwayatPekerjaan/:rwytId",
  protected,
  kualifikasiUpload,
  editDataRiwayatPekerjaan
);
router.delete(
  "/deleteRiwayatPekerjaan/:rwytId",
  protected,
  deleteDataRiwayatPekerjaan
);
router.patch(
  "/updateStatusRwyt/:rwytId",
  protected,
  adminOnly,
  editStatusRiwayatPekerjaan
);
router.get("/filterRiwayatPekerjaan", protected, filterDataRiwayatPekerjaan);
// ============= END RIWAYAT PEKERJAAN ==================

// ================== PENDIDIKAN FORMAL ======================
router.post("/addPend", protected, kualifikasiUpload, addPendidikan);
router.get("/getDataPend", protected, getDataPendidikan);
router.get("/detailPend/:pendId", protected, detailDataPendidikan);
router.patch(
  "/editDataPend/:pendId",
  protected,
  kualifikasiUpload,
  editDataPendidikan
);
router.delete("/deletePend/:pendId", protected, deleteDataPendidikan);
router.patch(
  "/updateStatusPend/:pendId",
  protected,
  adminOnly,
  editStatusPendidikan
);
router.get("/filterPend", protected, filterDataPendidikan);
// ================== END PENDIDIKAN FORMAL ==================

module.exports = router;
