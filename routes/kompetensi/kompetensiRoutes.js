const express = require("express");
const { protected, adminOnly } = require("../../middleware/authMiddleware");
const { kompetensiUpload } = require("../../middleware/kompetensiUpload");
const {
  createDataSerti,
  getDataSerti,
  detailDataSerti,
  editDataSerti,
  deleteDataSerti,
  editStatusSerti,
  filterDataSertifikasi,
} = require("../../controllers/kompetensi/sertifikasiController");
const {
  createDataTes,
  getDataTes,
  detailDataTes,
  editDataTes,
  deleteTes,
  editStatusTes,
  filterDataTes,
} = require("../../controllers/kompetensi/tesController");
const router = express.Router();

// ============= SERTIFIKAT ======================
router.post("/addCertificate", protected, kompetensiUpload, createDataSerti);
router.get("/getCertificate", protected, getDataSerti);
router.get("/detailCertif/:certifId", protected, detailDataSerti);
router.patch(
  "/editCertif/:certifId",
  protected,
  kompetensiUpload,
  editDataSerti
);
router.delete("/deleteCertif/:certifId", protected, deleteDataSerti);
router.patch(
  "/updateStatusCertif/:certifId",
  protected,
  adminOnly,
  editStatusSerti
);
router.get("/filterCertif", protected, filterDataSertifikasi);
// ============= END SERTIFIKAT ==================

// ================== TES ======================
router.post("/addTes", protected, kompetensiUpload, createDataTes);
router.get("/getTes", protected, getDataTes);
router.get("/detailTes/:tesId", protected, detailDataTes);
router.patch("/editTes/:tesId", protected, kompetensiUpload, editDataTes);
router.delete("/deleteTes/:tesId", protected, deleteTes);
router.patch("/updateStatusTes/:tesId", protected, adminOnly, editStatusTes);
router.get("/filterTes", protected, filterDataTes);
// ================== END TES ==================

module.exports = router;
