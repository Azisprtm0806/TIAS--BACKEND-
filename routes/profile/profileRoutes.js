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
const { jabatanFungsiUpload } = require("../../middleware/jabatanFungsiUpload");

const router = express.Router();

// DATA PRIBADI
router.post("/createData", protected, createDataPribadi);
router.patch("/editData", protected, editDataPribadi);
router.get("/getDataPribadi", protected, getDataPribadi);
router.delete("/deleteData/:dataID", protected, adminOnly, deleteDataPribadi);
// END DATA PRIBADI

// DOKUMEN PRIBADI
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
// END DOKUMEN PRIBADI

// JABATAN DOSEN
router.post(
  "/addJabatan",
  protected,
  dosenOnly,
  jabatanFungsiUpload,
  addDataJabatan
);
router.get("/getDataJabatan", protected, dosenOnly, getDataJabatan);
router.patch(
  "/editDataJabatan/:jabId",
  protected,
  dosenOnly,
  jabatanFungsiUpload,
  editDataJabatan
);
router.delete(
  "/deleteDataJabatan/:jabId",
  protected,
  dosenOnly,
  deleteDataJabatan
);
// END JABATAN DOSEN

module.exports = router;
