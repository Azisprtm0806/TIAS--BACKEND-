const express = require("express");
const {
  createDataPribadi,
  editDataPribadi,
  getDataPribadi,
  deleteDataPribadi,
  updateStatusMhs,
} = require("../../controllers/profile/dataPribadiController");
const {
  createDokumenPribadi,
  getDokPribadi,
  editDataDok,
  deleteDataDok,
  detailDokPribadi,
} = require("../../controllers/profile/dokumenPribadiController");
const {
  protected,
  dosenOnly,
  adminOnly,
} = require("../../middleware/authMiddleware");
const {
  addDataJabatan,
  getDataJabatan,
  editDataJabatan,
  deleteDataJabatan,
  detailDataJabatan,
} = require("../../controllers/profile/jabatanController");
const {
  addDataKepangkatan,
  getDataKepangkatan,
  editDataKepangkatan,
  deleteDataKepangkatan,
  detailDataKepangkatan,
} = require("../../controllers/profile/kepangkatanController");
const { profileUpload } = require("../../middleware/profileUpload");

const router = express.Router();

// ============= DATA PRIBADI ================
router.post("/createData", protected, createDataPribadi);
router.patch("/editData", protected, editDataPribadi);
router.get("/getDataPribadi", protected, getDataPribadi);
router.delete("/deleteData/:dataID", protected, adminOnly, deleteDataPribadi);
router.patch("/updateStatusMhs/:id", protected, adminOnly, updateStatusMhs);
// ============= END DATA PRIBADI =============

// ============= DOKUMEN PRIBADI ==============
router.post("/createDokumen", protected, profileUpload, createDokumenPribadi);
router.get("/getDokumen", protected, getDokPribadi);
router.get("/detailDokumen/:dokId", protected, detailDokPribadi);
router.patch("/editDokumen/:dokId", protected, profileUpload, editDataDok);
router.delete("/deleteDokumen/:dokId", protected, deleteDataDok);
// ============ END DOKUMEN PRIBADI =============

// ============ JABATAN DOSEN =============
router.post("/addJabatan", protected, dosenOnly, profileUpload, addDataJabatan);
router.get("/getDataJabatan", protected, dosenOnly, getDataJabatan);
router.get(
  "/detailDataJabatan/:jabId",
  protected,
  dosenOnly,
  detailDataJabatan
);
router.patch(
  "/editDataJabatan/:jabId",
  protected,
  dosenOnly,
  profileUpload,
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
  profileUpload,
  addDataKepangkatan
);
router.get("/getDataKepangkatan", protected, dosenOnly, getDataKepangkatan);
router.get(
  "/detailDataPangkat/:pangkatId",
  protected,
  dosenOnly,
  detailDataKepangkatan
);
router.patch(
  "/editPangkat/:pangkatId",
  protected,
  dosenOnly,
  profileUpload,
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
