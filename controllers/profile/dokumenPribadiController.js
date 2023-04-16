const asyncHandler = require("express-async-handler");
const DB = require("../../database");
const path = require("path");
const fs = require("fs-extra");
const { unixTimestamp, convertDate } = require("../../utils");

exports.createDokumenPribadi = asyncHandler(async (req, res) => {
  const userLoginId = req.user.user_id;
  const user = await DB.query("SELECT * FROM tb_users WHERE user_id = $1", [
    userLoginId,
  ]);

  if (user.rows.length) {
    const file = req.file;
    const { nama_dok, jenis_dok } = req.body;

    if (!nama_dok || !jenis_dok || !file) {
      res.status(400);
      throw new Error("Pleas fill in all the required fields.");
    }

    const created_at = unixTimestamp;
    const convert = convertDate(created_at);
    const createData = await DB.query(
      "INSERT INTO tb_dokumen_pribadi(user_id, nama_dok, jenis_dok, file_dok, created_at) VALUES($1, $2, $3, $4, $5) returning *",
      [user.rows[0].user_id, nama_dok, jenis_dok, file.filename, convert]
    );

    if (createData.rows.length) {
      res.status(200).json({
        message: "Successfull created data.",
        data: createData.rows[0],
      });
    } else {
      res.status(400);
      throw new Error("Invalid data document.");
    }
  } else {
    res.status(404);
    throw new Error("User not found.");
  }
});

exports.getDokPribadi = asyncHandler(async (req, res) => {
  const userLoginId = req.user.user_id;
  const dataDokumen = await DB.query(
    "SELECT * FROM tb_dokumen_pribadi WHERE user_id = $1",
    [userLoginId]
  );

  if (dataDokumen.rows.length) {
    res.status(200).json({
      message: "Success get data.",
      data: dataDokumen.rows,
    });
  } else {
    res.status(404);
    throw new Error("Data not found.");
  }
});

exports.editDataDok = asyncHandler(async (req, res) => {
  const { dokId } = req.params;

  const dokumen = await DB.query(
    "SELECT * FROM tb_dokumen_pribadi WHERE dokpribadi_id = $1",
    [dokId]
  );

  if (dokumen.rows.length) {
    const file = req.file;

    if (!file) {
      const updated_at = unixTimestamp;
      const convert = convertDate(updated_at);

      const entries = Object.entries({ ...req.body, updated_at: convert });
      const setQuery = entries
        .map(([key, _], index) => `${key} = $${index + 1}`)
        .join(", ");

      const updateData = await DB.query(
        `UPDATE tb_dokumen_pribadi SET ${setQuery} WHERE dokpribadi_id = '${dokumen.rows[0].dokpribadi_id}' returning *`,
        entries.map(([_, value]) => value)
      );

      res.status(200).json({
        message: "Success Update Data",
        data: updateData.rows[0],
      });
    } else {
      await fs.remove(
        path.join(`public/dokumen-pribadi/${dokumen.rows[0].file_dok}`)
      );
      const updated_at = unixTimestamp;
      const convert = await convertDate(updated_at);

      const entries = Object.entries({
        ...req.body,
        file_dok: file.filename,
        updated_at: convert,
      });
      const setQuery = entries
        .map(([key, _], index) => `${key} = $${index + 1}`)
        .join(", ");

      const updateData = await DB.query(
        `UPDATE tb_dokumen_pribadi SET ${setQuery} WHERE dokpribadi_id = '${dokumen.rows[0].dokpribadi_id}' returning *`,
        entries.map(([_, value]) => value)
      );

      res.status(200).json({
        message: "Success Update Data",
        data: updateData.rows[0],
      });
    }
  } else {
    res.status(404);
    throw new Error("Dokumen not found.");
  }
});

exports.deleteDataDok = asyncHandler(async (req, res) => {
  const { dokId } = req.params;

  const findData = await DB.query(
    "SELECT * FROM tb_dokumen_pribadi WHERE dokpribadi_id = $1",
    [dokId]
  );

  if (!findData.rows.length) {
    res.status(400);
    throw new Error("Data not found.");
  }

  await fs.remove(
    path.join(`public/dokumen-pribadi/${findData.rows[0].file_dok}`)
  );
  await DB.query("DELETE FROM tb_dokumen_pribadi WHERE dokpribadi_id = $1", [
    dokId,
  ]);

  res.status(200).json({ message: "Data deleted successfully." });
});
