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
    const file = req.files;
    const data = req.body;

    if (Object.keys(file).length === 0) {
      res.status(400);
      throw new Error("Please fill in one file.");
    }

    if (
      !data.jenis_serti ||
      !data.nama_serti ||
      !data.bidang_studi ||
      !data.nomor_sk ||
      !data.tgl_serti
    ) {
      fs.unlink(file.file_serti[0].path, (err) => {
        if (err) {
          console.log(err);
        }
        return;
      });
      res.status(400);
      throw new Error("Pleas fill in all the required fields.");
    }

    const existsNomorSK = await DB.query(
      "SELECT * FROM tb_sertifikasi WHERE nomor_sk = $1",
      [data.nomor_sk]
    );

    if (existsNomorSK.rows.length) {
      fs.unlink(file.file_serti[0].path, (err) => {
        if (err) {
          console.log(err);
        }
        return;
      });
      res.status(400);
      throw new Error("Nomor SK already exists.");
    }

    const existsNamaSerti = await DB.query(
      `SELECT * FROM tb_sertifikasi WHERE CAST(user_id AS TEXT) LIKE '%${user.rows[0].user_id}%' AND nama_serti LIKE '%${data.nama_serti}%'`
    );

    if (existsNamaSerti.rows.length) {
      fs.unlink(file.file_serti[0].path, (err) => {
        if (err) {
          console.log(err);
        }
        return;
      });
      res.status(400);
      throw new Error("Name Certification already exists.");
    }

    const created_at = unixTimestamp;
    const convert = convertDate(created_at);

    const keys = ["user_id", ...Object.keys(data), "file", "created_at"];
    const values = [
      userLoginId,
      ...Object.values(data),
      file.file_serti[0].filename,
      convert,
    ];
    const placeholders = keys.map((key, index) => `$${index + 1}`);

    // save data
    const saveData = await DB.query(
      `INSERT INTO tb_sertifikasi(${keys.join(
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

exports.getDataSerti = asyncHandler(async (req, res) => {
  const userLoginId = req.user.user_id;

  const dataSerti = await DB.query(
    "SELECT * FROM tb_sertifikasi WHERE user_id = $1",
    [userLoginId]
  );

  if (!dataSerti.rows.length) {
    res.status(404);
    throw new Error("Data not found.");
  }

  res.status(201).json({
    data: dataSerti.rows,
  });
});

exports.detailDataSerti = asyncHandler(async (req, res) => {
  const { certifId } = req.params;

  const findData = await DB.query(
    "SELECT * FROM tb_sertifikasi WHERE sertifikat_id = $1",
    [certifId]
  );

  if (!findData.rows.length) {
    res.status(404);
    throw new Error("Data not found.");
  }

  res.status(201).json({
    data: findData.rows[0],
  });
});

exports.editDataSerti = asyncHandler(async (req, res) => {
  const userLoginId = req.user.user_id;
  const { certifId } = req.params;

  const findData = await DB.query(
    "SELECT * FROM tb_sertifikasi WHERE sertifikat_id = $1",
    [certifId]
  );

  if (findData.rows.length) {
    const file = req.files;
    const data = req.body;

    const existsNomorSK = await DB.query(
      "SELECT * FROM tb_sertifikasi WHERE nomor_sk = $1",
      [data.nomor_sk]
    );

    if (existsNomorSK.rows.length) {
      if (Object.keys(file).length === 0) {
        res.status(400);
        throw new Error("Nomor SK already exists.");
      } else {
        fs.unlink(file.file_serti[0].path, (err) => {
          if (err) {
            console.log(err);
          }
          return;
        });
        res.status(400);
        throw new Error("Nomor SK already exists.");
      }
    }

    const existsNamaSerti = await DB.query(
      `SELECT * FROM tb_sertifikasi WHERE CAST(user_id AS TEXT) LIKE '%${userLoginId}%' AND nama_serti LIKE '%${data.nama_serti}%'`
    );

    if (existsNamaSerti.rows.length) {
      if (Object.keys(file).length === 0) {
        res.status(400);
        throw new Error("Name Certification already exists.");
      } else {
        fs.unlink(file.file_serti[0].path, (err) => {
          if (err) {
            console.log(err);
          }
          return;
        });
        res.status(400);
        throw new Error("Name Certification already exists.");
      }
    }

    if (Object.keys(file).length === 0) {
      const updated_at = unixTimestamp;
      const convert = convertDate(updated_at);

      const entries = Object.entries({ ...data, updated_at: convert });
      const setQuery = entries
        .map(([key, _], index) => `${key} = $${index + 1}`)
        .join(", ");

      const saveData = await DB.query(
        `UPDATE tb_sertifikasi SET ${setQuery} WHERE sertifikat_id = '${findData.rows[0].sertifikat_id}' `,
        entries.map(([_, value]) => value)
      );

      res.status(201).json({
        message: "Successfully update data.",
        data: saveData.rows[0],
      });
    } else {
      await fs.remove(
        path.join(`public/file-sertifikasi/${findData.rows[0].file}`)
      );
      const updated_at = unixTimestamp;
      const convert = convertDate(updated_at);

      const entries = Object.entries({
        ...data,
        file: file.file_serti[0].filename,
        updated_at: convert,
      });
      const setQuery = entries
        .map(([key, _], index) => `${key} = $${index + 1}`)
        .join(", ");

      const saveData = await DB.query(
        `UPDATE tb_sertifikasi SET ${setQuery} WHERE sertifikat_id = '${findData.rows[0].sertifikat_id}' `,
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

exports.deleteDataSerti = asyncHandler(async (req, res) => {
  const { certifId } = req.params;

  const findData = await DB.query(
    "SELECT * FROM tb_sertifikasi WHERE sertifikat_id = $1",
    [certifId]
  );

  if (!findData.rows.length) {
    res.status(400);
    throw new Error("Data not found.");
  }

  await fs.remove(
    path.join(`public/file-sertifikasi/${findData.rows[0].file}`)
  );
  await DB.query("DELETE FROM tb_sertifikasi WHERE sertifikat_id = $1", [
    findData.rows[0].sertifikat_id,
  ]);

  res.status(200).json({ message: "Data deleted successfully." });
});
