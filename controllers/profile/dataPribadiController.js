const asyncHandler = require("express-async-handler");
const DB = require("../../database");
const { unixTimestamp, convertDate } = require("../../utils");

exports.createDataPribadi = asyncHandler(async (req, res) => {
  const userLoginId = req.user.user_id;

  const findData = await DB.query(
    "SELECT * FROM tb_data_pribadi WHERE user_id = $1",
    [userLoginId]
  );

  if (findData.rows.length) {
    res.status(400);
    throw new Error("Your account already has personal data.");
  }

  const data = req.body;

  if (
    !data.nama_lengkap ||
    !data.jenkel ||
    !data.tanggal_lahir ||
    !data.tempat_lahir ||
    !data.ibu_kandung ||
    !data.nik ||
    !data.agama ||
    !data.warga_negara ||
    !data.email ||
    !data.alamat ||
    !data.rt ||
    !data.rw ||
    !data.desa_kelurahan ||
    !data.kota_kabupaten ||
    !data.provinsi ||
    !data.kode_pos ||
    !data.no_hp ||
    !data.status_kawin
  ) {
    res.status(400);
    throw new Error("Pleas fill in all the required fields.");
  }

  if (data.nik.length !== 16) {
    res.status(400);
    throw new Error("NIK must be with 16 digits.");
  }

  if (data.no_hp.length > 13 || data.no_hp.length < 10) {
    res.status(400);
    throw new Error("Invalid phone number.");
  }

  const created_at = unixTimestamp;
  const convert = convertDate(created_at);

  const keys = ["user_id", ...Object.keys(data), "created_at"];
  const values = [userLoginId, ...Object.values(data), convert];
  const placeholders = keys.map((key, index) => `$${index + 1}`);

  const saveData = await DB.query(
    `INSERT INTO tb_data_pribadi (${keys.join(
      ", "
    )}) VALUES (${placeholders.join(", ")}) RETURNING *`,
    values
  );

  if (saveData.rows.length) {
    res.status(200).json({
      message: "Successfull created data.",
      data: saveData.rows[0],
    });
  } else {
    res.status(400);
    throw new Error("Invalid data.");
  }
});

exports.getDataPribadi = asyncHandler(async (req, res) => {
  const userLoginId = req.user.user_id;

  const dataPribadi = await DB.query(
    "SELECT * FROM tb_data_pribadi WHERE user_id = $1",
    [userLoginId]
  );

  if (!dataPribadi.rows.length) {
    res.status(404);
    throw new Error("Data not found.");
  }

  res.status(201).json({
    data: dataPribadi.rows[0],
  });
});

exports.editDataPribadi = asyncHandler(async (req, res) => {
  const userLogin = req.user;

  const dataPribadi = await DB.query(
    "SELECT * FROM tb_data_pribadi WHERE user_id = $1",
    [userLogin.user_id]
  );

  if (dataPribadi.rows.length) {
    const updated_at = unixTimestamp;
    const convert = convertDate(updated_at);
    const entries = Object.entries({ ...req.body, updated_at: convert });
    const setQuery = entries
      .map(([key, _], index) => `${key} = $${index + 1}`)
      .join(", ");

    const updatedData = await DB.query(
      `UPDATE tb_data_pribadi SET ${setQuery} WHERE dp_id = '${dataPribadi.rows[0].dp_id}' returning *`,
      entries.map(([_, value]) => value)
    );

    res.status(200).json({
      message: "Success Update Data.",
      data: updatedData.rows[0],
    });
  } else {
    res.status(404);
    throw new Error("data not found.");
  }
});

exports.deleteDataPribadi = asyncHandler(async (req, res) => {
  const userLogin = req.user.user_id;

  const findData = await DB.query(
    "SELECT * FROM tb_data_pribadi WHERE dp_id = $1",
    [userLogin]
  );

  if (!findData.rows.length) {
    res.status(400);
    throw new Error("Data not found.");
  }

  await DB.query("DELETE FROM tb_data_pribadi WHERE dp_id = $1", [userLogin]);

  res.status(200).json({ message: "Data deleted successfully." });
});
