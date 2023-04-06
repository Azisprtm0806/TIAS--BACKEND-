const asyncHandler = require("express-async-handler");
const DB = require("../../database");
const path = require("path");
const fs = require("fs-extra");
const { unixTimestamp, convertDate, date, dateToUnix } = require("../../utils");

exports.addDataJabatan = asyncHandler(async (req, res) => {
  const userLoginId = req.user.user_id;

  const user = await DB.query("SELECT * FROM tb_users WHERE user_id = $1", [
    userLoginId,
  ]);

  if (user.rows.length) {
    const file = req.file;
    const {
      jabatan_fungsi,
      nomor_sk,
      tgl_mulai,
      kel_penelitian,
      kel_pengab_msyrkt,
      kel_keg_penunjang,
    } = req.body;

    if (!jabatan_fungsi || !nomor_sk || !tgl_mulai || !file) {
      res.status(400);
      throw new Error("Pleas fill in all the required fields.");
    }

    const existsNomerSK = await DB.query(
      "SELECT * FROM tb_jabatan_dosen WHERE nomor_sk = $1",
      [nomor_sk]
    );

    if (existsNomerSK.rows.length) {
      res.status(400);
      throw new Error("SK number already exists.");
    }

    const created_at = unixTimestamp;
    const convert = await convertDate(created_at);

    // save data
    const saveData = await DB.query(
      "INSERT INTO tb_jabatan_dosen(user_id, jabatan_fungsi, nomor_sk, tgl_mulai, kel_penelitian, kel_pengab_msyrkt, kel_keg_penunjang, file_jabatan, created_at) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) returning *",
      [
        user.rows[0].user_id,
        jabatan_fungsi,
        nomor_sk,
        tgl_mulai,
        kel_penelitian,
        kel_pengab_msyrkt,
        kel_keg_penunjang,
        file.filename,
        convert,
      ]
    );

    if (saveData.rows) {
      res.status(200).json({
        message: "Successfull created data.",
        data: saveData.rows[0],
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

exports.editDataJabatan = asyncHandler(async (req, res) => {
  const { jabId } = req.params;

  const dataJabatan = await DB.query(
    "SELECT * FROM tb_jabatan_dosen WHERE jabatan_id = $1",
    [jabId]
  );

  if (dataJabatan.rows.length) {
    const file = req.file;
    const data = req.body;

    if (!data.jabatan_fungsi || !data.nomor_sk || !data.tgl_mulai) {
      res.status(400);
      throw new Error("Pleas fill in all the required fields.");
    }

    const convertToUnix = dateToUnix(data.tgl_mulai);
    const date = await convertDate(convertToUnix);

    data.tgl_mulai = date;

    const colums = Object.keys(data);
    const setClause = colums
      .map((column, index) => `${column} = $${index + 1}`)
      .join(", ");

    const values = Object.values(data);
    if (!file) {
      const saveData = await DB.query(
        `UPDATE tb_jabatan_dosen SET ${setClause} WHERE jabatan_id = '${dataJabatan.rows[0].jabatan_id}' `,
        [...values]
      );

      res.status(201).json({
        message: "Successfully update data.",
        data: saveData.rows[0],
      });
    } else {
      await fs.remove(
        path.join(`public/dokumen-jabatan/${dataJabatan.rows[0].file_jabatan}`)
      );
      const saveData = await DB.query(
        `UPDATE tb_jabatan_dosen SET ${setClause}, file_jabatan = $${
          colums.length + 1
        } WHERE jabatan_id = '${dataJabatan.rows[0].jabatan_id}' `,
        [...values, file.filename]
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
  await DB.query("DELETE FROM tb_jabatan_dosen WHERE jabatan_id = $1", [jabId]);

  res.status(200).json({ message: "Data deleted successfully." });
});
