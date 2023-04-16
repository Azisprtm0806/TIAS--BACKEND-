const asyncHandler = require("express-async-handler");
const DB = require("../../database");
const path = require("path");
const fs = require("fs-extra");
const { unixTimestamp, convertDate } = require("../../utils");

exports.addDataJabatan = asyncHandler(async (req, res) => {
  const userLoginId = req.user.user_id;

  const user = await DB.query("SELECT * FROM tb_users WHERE user_id = $1", [
    userLoginId,
  ]);

  if (user.rows.length) {
    const file = req.file;
    const data = req.body;

    if (!data.jabatan_fungsi || !data.nomor_sk || !data.tgl_mulai || !file) {
      res.status(400);
      throw new Error("Pleas fill in all the required fields.");
    }

    const existsNomerSK = await DB.query(
      "SELECT * FROM tb_jabatan_dosen WHERE nomor_sk = $1",
      [data.nomor_sk]
    );

    if (existsNomerSK.rows.length) {
      res.status(400);
      throw new Error("SK number already exists.");
    }

    const created_at = unixTimestamp;
    const convert = await convertDate(created_at);

    const keys = [
      "user_id",
      ...Object.keys(data),
      "file_jabatan",
      "created_at",
    ];
    const values = [
      userLoginId,
      ...Object.values(data),
      file.filename,
      convert,
    ];
    const placeholders = keys.map((key, index) => `$${index + 1}`);

    // save data
    const saveData = await DB.query(
      `INSERT INTO tb_jabatan_dosen(${keys.join(
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

exports.getDataJabatan = asyncHandler(async (req, res) => {
  const userLoginId = req.user.user_id;

  const dataJabatan = await DB.query(
    "SELECT * FROM tb_jabatan_dosen WHERE user_id = $1",
    [userLoginId]
  );

  if (!dataJabatan.rows.length) {
    res.status(404);
    throw new Error("Data not found.");
  }

  res.status(201).json({
    data: dataJabatan.rows,
  });
});

exports.detailDataJabatan = asyncHandler(async (req, res) => {
  const { jabId } = req.params;

  const findData = await DB.query(
    "SELECT * FROM tb_jabatan_dosen WHERE jabatan_id = $1",
    [jabId]
  );

  if (!findData.rows.length) {
    res.status(404);
    throw new Error("Data not found.");
  }

  res.status(201).json({
    data: findData.rows[0],
  });
});

exports.editDataJabatan = asyncHandler(async (req, res) => {
  const { jabId } = req.params;

  const dataJabatan = await DB.query(
    "SELECT * FROM tb_jabatan_dosen WHERE jabatan_id = $1",
    [jabId]
  );

  if (dataJabatan.rows.length) {
    const file = req.file;

    if (!file) {
      const updated_at = unixTimestamp;
      const convert = convertDate(updated_at);

      const entries = Object.entries({ ...req.body, updated_at: convert });
      const setQuery = entries
        .map(([key, _], index) => `${key} = $${index + 1}`)
        .join(", ");

      const saveData = await DB.query(
        `UPDATE tb_jabatan_dosen SET ${setQuery} WHERE jabatan_id = '${dataJabatan.rows[0].jabatan_id}' `,
        entries.map(([_, value]) => value)
      );

      res.status(201).json({
        message: "Successfully update data.",
        data: saveData.rows[0],
      });
    } else {
      await fs.remove(
        path.join(`public/dokumen-jabatan/${dataJabatan.rows[0].file_jabatan}`)
      );
      const updated_at = unixTimestamp;
      const convert = convertDate(updated_at);

      const entries = Object.entries({
        ...req.body,
        file_jabatan: file.filename,
        updated_at: convert,
      });
      const setQuery = entries
        .map(([key, _], index) => `${key} = $${index + 1}`)
        .join(", ");

      const saveData = await DB.query(
        `UPDATE tb_jabatan_dosen SET ${setQuery} WHERE jabatan_id = '${dataJabatan.rows[0].jabatan_id}' `,
        entries.map(([_, value]) => value)
      );

      res.status(201).json({
        message: "Successfully update data.",
        data: saveData.rows[0],
      });
    }
  } else {
    res.status(404);
    throw new Error("Data not found.");
  }
});

exports.deleteDataJabatan = asyncHandler(async (req, res) => {
  const { jabId } = req.params;

  const findData = await DB.query(
    "SELECT * FROM tb_jabatan_dosen WHERE jabatan_id = $1",
    [jabId]
  );

  if (!findData.rows.length) {
    res.status(400);
    throw new Error("Data not found.");
  }

  await fs.remove(
    path.join(`public/dokumen-jabatan/${findData.rows[0].file_jabatan}`)
  );
  await DB.query("DELETE FROM tb_jabatan_dosen WHERE jabatan_id = $1", [
    findData.rows[0].jabatan_id,
  ]);

  res.status(200).json({ message: "Data deleted successfully." });
});
