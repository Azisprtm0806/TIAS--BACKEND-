const asyncHandler = require("express-async-handler");
const DB = require("../../database");
const path = require("path");
const fs = require("fs-extra");
const { unixTimestamp, convertDate } = require("../../utils");

exports.addDataKepangkatan = asyncHandler(async (req, res) => {
  const userLoginId = req.user.user_id;

  const user = await DB.query("SELECT * FROM tb_users WHERE user_id = $1", [
    userLoginId,
  ]);

  if (user.rows.length) {
    const file = req.file;
    const data = req.body;

    if (
      !data.gol_pangkat ||
      !data.nomor_sk ||
      !data.tgl_sk ||
      !data.tgl_mulai ||
      !file
    ) {
      res.status(400);
      throw new Error("Pleas fill in all the required fields.");
    }

    const existsNomerSK = await DB.query(
      "SELECT * FROM tb_kepangkatan_dosen WHERE nomor_sk = $1",
      [data.nomor_sk]
    );

    if (existsNomerSK.rows.length) {
      res.status(400);
      throw new Error("SK number already exists.");
    }

    const created_at = unixTimestamp;
    const convert = await convertDate(created_at);

    const keys = ["user_id", ...Object.keys(data), "file", "created_at"];
    const values = [
      userLoginId,
      ...Object.values(data),
      file.filename,
      convert,
    ];
    const placeholders = keys.map((key, index) => `$${index + 1}`);

    // save data
    const saveData = await DB.query(
      `INSERT INTO tb_kepangkatan_dosen(${keys.join(
        ", "
      )}) VALUES (${placeholders.join(", ")}) returning *`,
      values
    );

    if (saveData.rows) {
      res.status(200).json({
        message: "Successfull created data.",
        data: saveData.rows[0],
      });
    } else {
      res.status(400);
      throw new Error("Invalid data.");
    }
  } else {
    res.status(404);
    throw new Error("User not found.");
  }
});

exports.getDataKepangkatan = asyncHandler(async (req, res) => {
  const userLoginId = req.user.user_id;

  const dataKepangkatan = await DB.query(
    "SELECT * FROM tb_kepangkatan_dosen WHERE user_id = $1",
    [userLoginId]
  );

  if (!dataKepangkatan.rows.length) {
    res.status(404);
    throw new Error("Data not found.");
  }

  res.status(201).json({
    data: dataKepangkatan.rows,
  });
});

exports.editDataKepangkatan = asyncHandler(async (req, res) => {
  const { pangkatId } = req.params;

  const dataPangkat = await DB.query(
    "SELECT * FROM tb_kepangkatan_dosen WHERE pangkat_id = $1",
    [pangkatId]
  );

  if (dataPangkat.rows.length) {
    const file = req.file;

    if (!file) {
      const updated_at = unixTimestamp;
      const convert = convertDate(updated_at);

      const entries = Object.entries({ ...req.body, updated_at: convert });
      const setQuery = entries
        .map(([key, _], index) => `${key} = $${index + 1}`)
        .join(", ");

      const saveData = await DB.query(
        `UPDATE tb_kepangkatan_dosen SET ${setQuery} WHERE pangkat_id = '${dataPangkat.rows[0].pangkat_id}' `,
        entries.map(([_, value]) => value)
      );

      res.status(201).json({
        message: "Successfully updated data.",
        data: saveData.rows[0],
      });
    } else {
      await fs.remove(
        path.join(`public/dokumen-kepangkatan/${dataPangkat.rows[0].file}`)
      );
      const updated_at = unixTimestamp;
      const convert = convertDate(updated_at);

      const entries = Object.entries({
        ...req.body,
        file: file.filename,
        updated_at: convert,
      });
      const setQuery = entries
        .map(([key, _], index) => `${key} = $${index + 1}`)
        .join(", ");

      const saveData = await DB.query(
        `UPDATE tb_kepangkatan_dosen SET ${setQuery} WHERE pangkat_id = '${dataPangkat.rows[0].pangkat_id}'  `,
        entries.map(([_, value]) => value)
      );

      res.status(201).json({
        message: "Successfully updated data.",
        data: saveData.rows[0],
      });
    }
  } else {
    res.status(404);
    throw new Error("Data not found.");
  }
});

exports.deleteDataKepangkatan = asyncHandler(async (req, res) => {
  const { pangkatId } = req.params;

  const findData = await DB.query(
    "SELECT * FROM tb_kepangkatan_dosen WHERE pangkat_id = $1",
    [pangkatId]
  );

  if (!findData.rows.length) {
    res.status(400);
    throw new Error("Data not found.");
  }

  await fs.remove(
    path.join(`public/dokumen-kepangkatan/${findData.rows[0].file}`)
  );
  await DB.query("DELETE FROM tb_kepangkatan_dosen WHERE pangkat_id = $1", [
    findData.rows[0].pangkat_id,
  ]);

  res.status(200).json({ message: "Data deleted successfully." });
});
