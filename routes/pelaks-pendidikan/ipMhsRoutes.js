const express = require("express");
const {
  protected,
  adminMhsOnly,
  adminOnly,
} = require("../../middleware/authMiddleware");
const {
  ipMhsUpload,
} = require("../../middleware/pelaks-pendidikan/ipMhsUpload");
const {
  addDataIp,
  getDataIP,
  detailDataIp,
  deleteDataIp,
  editDataIp,
  updateStatusIp,
} = require("../../controllers/pelaks-pendidikan/ipMhsController");

const router = express.Router();

// ============= PENELITIAN ======================
router.post("/add", protected, adminMhsOnly, ipMhsUpload, addDataIp);
router.get("/getDataIp", protected, adminMhsOnly, getDataIP);
router.get("/detail/:ipId", protected, adminMhsOnly, detailDataIp);
router.patch("/edit/:ipId", protected, adminMhsOnly, ipMhsUpload, editDataIp);
router.delete("/delete/:ipId", protected, adminMhsOnly, deleteDataIp);
router.patch("/updateStatus/:ipId", protected, adminOnly, updateStatusIp);
// ============= END PENELITIAN =====================

module.exports = router;
