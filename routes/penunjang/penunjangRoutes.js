const express = require("express");
const { protected } = require("../../middleware/authMiddleware");
const { penunjangUpload } = require("../../middleware/penunjangUpload");
const {
  addDataProfesi,
  getAllDataProfesi,
  detailDataProfesi,
  editDataProfesi,
  deleteDataProfesi,
} = require("../../controllers/penunjang/anggotaProfesiController");
const {
  addPenghargaan,
  getPenghargaan,
  detailPenghargaan,
  editPenghargaan,
  deletePenghargaan,
} = require("../../controllers/penunjang/penghargaanController");

const router = express.Router();

// ============= SERTIFIKAT ======================
router.post("/addProfesi", protected, penunjangUpload, addDataProfesi);
router.get("/getProfesi", protected, getAllDataProfesi);
router.get("/detailProfesi/:profId", protected, detailDataProfesi);
router.patch(
  "/editProfesi/:profId",
  protected,
  penunjangUpload,
  editDataProfesi
);
router.delete("/deleteProfesi/:profId", protected, deleteDataProfesi);

// ============= END SERTIFIKAT ==================

// ================== Penghargaan ======================
router.post("/addPenghargaan", protected, penunjangUpload, addPenghargaan);
router.get("/getPenghargaan", protected, getPenghargaan);
router.get("/detailPenghargaan/:pengId", protected, detailPenghargaan);
router.patch(
  "/editPenghargaan/:pengId",
  protected,
  penunjangUpload,
  editPenghargaan
);
router.delete("/deletePenghargaan/:pengId", protected, deletePenghargaan);
// ================== END TES ==================

module.exports = router;
