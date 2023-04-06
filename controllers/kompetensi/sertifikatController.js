const asyncHandler = require("express-async-handler");
const DB = require("../../database");
const path = require("path");
const fs = require("fs-extra");

exports.createDataSerti = asyncHandler(async (req, res) => {
  const userLoginId = req.user.user_id;
  const user = await DB.query("SELECT * FROM tb_users WHERE user_id = $1", [
    userLoginId,
  ]);

  if (user.rows.length) {
    const file = req.file;
    const { jenis_sertif, nama_sertif, penyelenggara, tgl_sertif } = req.body;

    if (
      !file ||
      !jenis_sertif ||
      !nama_sertif ||
      !penyelenggara ||
      !tgl_sertif
    ) {
      res.status(400);
      throw new Error("Pleas fill in all the required fields.");
    }

    const createData = await DB.query(
      "INSERT INTO tb_sertifikat(user_id, jenis_sertif, nama_sertif, penyelenggara, tgl_sertif, file_sertif) VALUES($1, $2, $3, $4, $5, $6) returning *",
      [
        user.rows[0].user_id,
        jenis_sertif,
        nama_sertif,
        penyelenggara,
        tgl_sertif,
        file.filename,
      ]
    );

    if (createData.rows.length) {
      res.status(200).json({
        message: "Successfull created data.",
        data: createData.rows[0],
      });
    } else {
      res.status(400);
      throw new Error("Invalid sertification data.");
    }
  } else {
    res.status(404);
    throw new Error("User not found.");
  }
});

exports.getDataSertif = asyncHandler(async (req, res) => {
  const userLoginId = req.user.user_id;
  const dataSertif = await DB.query(
    "SELECT * FROM tb_sertifikat WHERE user_id = $1",
    [userLoginId]
  );

  if (dataSertif.rows.length) {
    res.status(200).json({
      message: "Success get data.",
      data: dataSertif.rows,
    });
  } else {
    res.status(404);
    throw new Error("Data not found.");
  }
});

exports.editDataSertif = asyncHandler(async (req, res) => {
  const userLoginId = req.user.user_id;
  const user = await DB.query("SELECT * FROM tb_users WHERE user_id = $1", [
    userLoginId,
  ]);

  if (user.rows.length) {
    const { sertifId } = req.params;
    const file = req.file;
    const { jenis_sertif, nama_sertif, penyelenggara, tgl_sertif } = req.body;

    if (!jenis_sertif || !nama_sertif || !penyelenggara || !tgl_sertif) {
      res.status(400);
      throw new Error("Pleas fill in all the required fields.");
    }

    const sertifData = await DB.query(
      "SELECT * FROM tb_sertifikat WHERE sertifikat_id = $1",
      [sertifId]
    );

    if (!file) {
      const updated_at = new Date();
      const updateData = await DB.query(
        "UPDATE tb_sertifikat SET jenis_sertif = $1, nama_sertif = $2, penyelenggara = $3, tgl_sertif = $4, updated_at = $5 WHERE sertifikat_id = $6 returning *",
        [
          jenis_sertif,
          nama_sertif,
          penyelenggara,
          tgl_sertif,
          updated_at,
          sertifId,
        ]
      );

      res.status(200).json({
        message: "Success Update Data",
        data: updateData.rows[0],
      });
    } else {
      await fs.remove(
        path.join(`public/sertifikat/${sertifData.rows[0].file_sertif}`)
      );
      const updated_at = new Date();
      const updateData = await DB.query(
        "UPDATE tb_sertifikat SET jenis_sertif = $1, nama_sertif = $2, penyelenggara = $3, tgl_sertif = $4, file_sertif = $5, updated_at = $6 WHERE sertifikat_id = $7 returning *",
        [
          jenis_sertif,
          nama_sertif,
          penyelenggara,
          tgl_sertif,
          file.filename,
          updated_at,
          sertifId,
        ]
      );

      res.status(200).json({
        message: "Success Update Data",
        data: updateData.rows[0],
      });
    }
  } else {
    res.status(404);
    throw new Error("User not found.");
  }
});

exports.deleteDataSertif = asyncHandler(async (req, res) => {
  const { sertifId } = req.params;

  const findData = await DB.query(
    "SELECT * FROM tb_sertifikat WHERE sertifikat_id = $1",
    [sertifId]
  );

  if (!findData.rows.length) {
    res.status(400);
    throw new Error("Data not found.");
  }

  await fs.remove(
    path.join(`public/sertifikat/${findData.rows[0].file_sertif}`)
  );
  await DB.query("DELETE FROM tb_sertifikat WHERE sertifikat_id = $1", [
    sertifId,
  ]);

  res.status(200).json({ message: "Data deleted successfully." });
});
