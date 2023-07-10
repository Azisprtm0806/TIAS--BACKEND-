const express = require("express");
const { protected, adminOnly } = require("../../middleware/authMiddleware");
const {
  getDataSerti,
  getDataTes,
} = require("../../controllers/Admin/adminController");

const router = express.Router();

router.get("/getDataSertifikat", protected, adminOnly, getDataSerti);
router.get("/getDataTes", protected, adminOnly, getDataTes);

module.exports = router;
