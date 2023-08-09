const express = require("express");
const {
  protected,
  adminMhsOnly,
  adminOnly,
} = require("../../middleware/authMiddleware");
const {
  addDataIp,
  getDataIP,
  detailDataIp,
  deleteDataIp,
  editDataIp,
  updateStatusIp,
  filterDataIp,
} = require("../../controllers/pelaks-pendidikan/ipMhsController");

const router = express.Router();

// ============= PENELITIAN ======================
router.post("/add", protected, adminMhsOnly, addDataIp);
router.get("/getDataIp", protected, adminMhsOnly, getDataIP);
router.get("/detail/:ipId", protected, adminMhsOnly, detailDataIp);
router.patch("/edit/:ipId", protected, adminMhsOnly, editDataIp);
router.delete("/delete/:ipId", protected, adminMhsOnly, deleteDataIp);
router.patch("/updateStatus/:ipId", protected, adminOnly, updateStatusIp);
router.get("/filterDataIp", protected, filterDataIp);
// ============= END PENELITIAN =====================

module.exports = router;
