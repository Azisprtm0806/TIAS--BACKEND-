const express = require("express");
const {
  createDataSerti,
  editDataSertif,
  getDataSertif,
  deleteDataSertif,
} = require("../../controllers/kompetensi/sertifikatController");
const { protected } = require("../../middleware/authMiddleware");
const { kompetensiUpload } = require("../../middleware/kompetensiUpload");
const {
  createDataTes,
  getDataTes,
} = require("../../controllers/kompetensi/tesController");
const { dokumenUpload } = require("../../middleware/dokumenUpload");
const router = express.Router();

// ============= SERTIFIKAT ======================
router.post("/addCertificate", protected, dokumenUpload, createDataSerti);
router.get("/getCertificate", protected, getDataSertif);
router.patch("/edit/:sertifId", protected, editDataSertif);
router.delete("/delete/:sertifId", protected, deleteDataSertif);
// ============= END SERTIFIKAT ==================

// ================== TES ======================
router.post("/addTes", protected, kompetensiUpload, createDataTes);
router.get("/getTes", protected, getDataTes);
router.patch("/edit/:sertifId", protected, editDataSertif);
router.delete("/delete/:sertifId", protected, deleteDataSertif);
// ================== END TES ==================

module.exports = router;
