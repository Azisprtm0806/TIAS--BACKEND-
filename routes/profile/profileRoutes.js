const express = require("express");
const {
  createDataPribadi,
  editDataPribadi,
  getDataPribadi,
  deleteDataPribadi,
} = require("../../controllers/profile/dataPribadiController");
const {
  createDokumenPribadi,
  getDokPribadi,
  editDataDok,
  deleteDataDok,
} = require("../../controllers/profile/dokumenPribadiController");
const {
  protected,
  dosenOnly,
  adminOnly,
} = require("../../middleware/authMiddleware");
const {
  dokumenPribadiUpload,
} = require("../../middleware/dokumenPribadiUpload");
const {
  addDataJabatan,
  getDataJabatan,
  editDataJabatan,
  deleteDataJabatan,
} = require("../../controllers/profile/jabatanController");
const { jabatanDosenUpload } = require("../../middleware/jabatanDosenUpload");
const {
  kepangkatanDosenUpload,
} = require("../../middleware/kepangkatanDosenUpload");
const {
  addDataKepangkatan,
  getDataKepangkatan,
  editDataKepangkatan,
  deleteDataKepangkatan,
} = require("../../controllers/profile/kepangkatanController");

const router = express.Router();

// ============= DATA PRIBADI ================
router.post("/createData", protected, createDataPribadi);
router.patch("/editData", protected, editDataPribadi);
router.get("/getDataPribadi", protected, getDataPribadi);
router.delete("/deleteData/:dataID", protected, adminOnly, deleteDataPribadi);
// ============= END DATA PRIBADI =============

// ============= DOKUMEN PRIBADI ==============
router.post(
  "/createDokumen",
  protected,
  dokumenPribadiUpload,
  createDokumenPribadi
);
router.get("/getDokumen", protected, getDokPribadi);
router.patch(
  "/editDokumen/:dokId",
  protected,
  dokumenPribadiUpload,
  editDataDok
);
router.delete("/deleteDokumen/:dokId", protected, deleteDataDok);
// ============ END DOKUMEN PRIBADI =============

// ============ JABATAN DOSEN =============
router.post(
  "/addJabatan",
  protected,
  dosenOnly,
  jabatanDosenUpload,
  addDataJabatan
);
router.get("/getDataJabatan", protected, dosenOnly, getDataJabatan);
router.patch(
  "/editDataJabatan/:jabId",
  protected,
  dosenOnly,
  jabatanDosenUpload,
  editDataJabatan
);
router.delete(
  "/deleteDataJabatan/:jabId",
  protected,
  dosenOnly,
  deleteDataJabatan
);
// =============== END JABATAN DOSEN ================

// =============== KEPANGKATAN DOSEN ================
router.post(
  "/addKepangkatan",
  protected,
  dosenOnly,
  kepangkatanDosenUpload,
  addDataKepangkatan
);
router.get("/getDataKepangkatan", protected, dosenOnly, getDataKepangkatan);
router.patch(
  "/editPangkat/:pangkatId",
  protected,
  dosenOnly,
  kepangkatanDosenUpload,
  editDataKepangkatan
);
router.delete(
  "/deletePangkat/:pangkatId",
  protected,
  dosenOnly,
  deleteDataKepangkatan
);
// ============== END KEPANGAKATAN DOSEN ==================

module.exports = router;
