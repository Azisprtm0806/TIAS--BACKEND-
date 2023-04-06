const express = require("express");
const {
  createDataSerti,
  editDataSertif,
  getDataSertif,
  deleteDataSertif,
} = require("../../controllers/kompetensi/sertifikatController");
const { protected, adminOnly } = require("../../middleware/authMiddleware");
const { sertifikatUpload } = require("../../middleware/sertifikatUpload");

const router = express.Router();

router.post("/create", protected, sertifikatUpload, createDataSerti);
router.get("/get", protected, getDataSertif);
router.patch("/edit/:sertifId", protected, sertifikatUpload, editDataSertif);
router.delete("/delete/:sertifId", protected, deleteDataSertif);

module.exports = router;
