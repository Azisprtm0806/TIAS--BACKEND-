const asyncHandler = require("express-async-handler");
const DB = require("../../database");
const path = require("path");
const fs = require("fs-extra");
const { unixTimestamp, convertDate } = require("../../utils");

exports.createDataSerti = asyncHandler(async (req, res) => {
  const userLoginId = req.user.user_id;
  const user = await DB.query("SELECT * FROM tb_users WHERE user_id = $1", [
    userLoginId,
  ]);

  if (user.rows.length) {
    const file = req.file;
    const data = req.body;

    if (
      !data.jenis_sertif ||
      !data.bidang_studi ||
      !data.nomor_sk ||
      !data.penyelenggara ||
      !data.tgl_sertif
    ) {
      res.status(400);
      throw new Error("Pleas fill in all the required fields.");
    }

    if (!file) {
      res.status(400);
      throw new Error("Type of supporting document must be filled.");
    }

    if (!data.jenis_dok || !data.nama_dok || !data.keterangan) {
      res.status(400);
      throw new Error("Pleas fill in all the data document required fields.");
    }

    const created_at = unixTimestamp;
    const convert = convertDate(created_at);

    const keysDoct = [
      "file",
      "jenis_dok",
      "nama_dok",
      "keterangan",
      "jenis_file",
      "nama_file",
      "created_at",
    ];
    const valuesDoct = [
      file.filename,
      data.jenis_dok,
      data.nama_dok,
      data.keterangan,
      file.mimetype,
      file.filename,
      convert,
    ];
    const placeholdersDoct = keysDoct.map((key, index) => `$${index + 1}`);

    // Save Dokumen
    const saveDokumen = await DB.query(
      `INSERT INTO tb_dokumen(${keysDoct.join(
        ", "
      )}) VALUES (${placeholdersDoct.join(", ")}) returning *`,
      valuesDoct
    );

    if (saveDokumen.rows.length) {
      const keys = [
        "user_id",
        "dokumen_id",
        "jenis_sertif",
        "bidang_studi",
        "nomor_sk",
        "tgl_sertif",
        "penyelenggara",
        "created_at",
      ];
      const values = [
        userLoginId,
        saveDokumen.rows[0].dokumen_id,
        data.jenis_sertif,
        data.bidang_studi,
        data.nomor_sk,
        data.tgl_sertif,
        data.penyelenggara,
        convert,
      ];
      const placeholders = keys.map((key, index) => `$${index + 1}`);
      // save data
      const saveCertificate = await DB.query(
        `INSERT INTO tb_sertifikat(${keys.join(
          ", "
        )}) VALUES (${placeholders.join(", ")}) returning *`,
        values
      );

      if (saveCertificate.rows.length) {
        const datasave = await DB.query(
          "SELECT * FROM tb_sertifikat JOIN tb_dokumen USING(dokumen_id) WHERE tb_dokumen.dokumen_id = $1",
          [saveCertificate.rows[0].dokumen_id]
        );
        res.status(200).json({
          message: "Successfull created data.",
          data: datasave.rows[0],
        });
      } else {
        res.status(500);
        throw new Error("Internal server error.");
      }
    } else {
      res.status(500);
      throw new Error("Internal server error.");
    }
  } else {
    res.status(404);
    throw new Error("User not found.");
  }
});

exports.getDataSertif = asyncHandler(async (req, res) => {
  const userLoginId = req.user.user_id;
  const findData = await DB.query(
    "SELECT * FROM tb_sertifikat WHERE user_id = $1",
    [userLoginId]
  );

  if (findData.rows.length) {
    res.status(200).json({
      message: "Success get data.",
      data: findData.rows,
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
