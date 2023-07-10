const asyncHandler = require("express-async-handler");
const DB = require("../../database");

// =====================  KUALIFIKASI  ====================

// =====================  END KUALIFIKASI  ====================

// =====================  KOMPETESI  ====================
exports.getDataSerti = asyncHandler(async (req, res) => {
  const dataSerti = await DB.query("SELECT * FROM tb_sertifikasi");

  const jumlahData = await DB.query("SELECT COUNT(*) FROM tb_sertifikasi");

  res.status(201).json({
    data: dataSerti.rows,
    totalData: jumlahData.rows[0].count,
  });
});

exports.getDataTes = asyncHandler(async (req, res) => {
  const dataTes = await DB.query("SELECT * FROM tb_tes");

  const jumlahData = await DB.query("SELECT COUNT(*) FROM tb_tes");

  res.status(201).json({
    data: dataTes.rows,
    totalData: jumlahData.rows[0].count,
  });
});
// =====================  END KOMPETESI  ====================
