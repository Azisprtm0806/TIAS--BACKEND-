const asyncHandler = require("express-async-handler");
const DB = require("../../database");

exports.getUserMhs = asyncHandler(async (req, res) => {
  const user = await DB.query(
    "SELECT tb_users.*, tb_data_pribadi.* FROM tb_users JOIN tb_data_pribadi ON tb_users.user_id=tb_data_pribadi.user_id WHERE tb_users.role = 'Mahasiswa'"
  );

  res.status(200).json({
    message: "Success get data.",
    data: user.rows,
  });
});

exports.getUserDosen = asyncHandler(async (req, res) => {
  const user = await DB.query(
    "SELECT tb_users.*, tb_data_pribadi.* FROM tb_users JOIN tb_data_pribadi ON tb_users.user_id=tb_data_pribadi.user_id WHERE tb_users.role = 'Dosen'"
  );

  res.status(200).json({
    message: "Success get data.",
    data: user.rows,
  });
});

exports.detailUser = asyncHandler(async (req, res) => {
  const { userId } = req.params;

  const findData = await DB.query(
    "SELECT tb_users.*, tb_data_pribadi.* FROM tb_users JOIN tb_data_pribadi ON tb_users.user_id=tb_data_pribadi.user_id WHERE tb_users.user_id = $1",
    [userId]
  );

  const dataRekomendasi = await DB.query(
    "SELECT * FROM rekomendasi_mhs WHERE mahasiswa_id = $1",
    [userId]
  );

  if (!findData.rows.length) {
    res.status(404);
    throw new Error("Data not found.");
  }

  res.status(201).json({
    dataMhs: findData.rows[0],
    rekomendasiMhs: dataRekomendasi.rows,
  });
});
