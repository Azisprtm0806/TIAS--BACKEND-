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
    const file = req.files;
    const data = req.body;

    if (Object.keys(file).length === 0) {
      res.status(400);
      throw new Error("Please fill in one file.");
    }

    if (!data.jabatan_fungsi || !data.nomor_sk || !data.tgl_mulai) {
      fs.unlink(file.file_jabatan[0].path, (err) => {
        if (err) {
          console.log(err);
        }
        return;
      });
      res.status(400);
      throw new Error("Pleas fill in all the required fields.");
    }

    const existsJabatan = await DB.query(
      `SELECT * FROM tb_jabatan_dosen WHERE CAST(user_id AS TEXT) LIKE '%${user.rows[0].user_id}%' AND jabatan_fungsi LIKE '%${data.jabatan_fungsi}%'`
    );

    if (existsJabatan.rows.length) {
      fs.unlink(file.file_jabatan[0].path, (err) => {
        if (err) {
          console.log(err);
        }
        return;
      });
      res.status(400);
      throw new Error("Jabatan/Fungsi already exists.");
    }

    const existsNomerSK = await DB.query(
      "SELECT * FROM tb_jabatan_dosen WHERE nomor_sk = $1",
      [data.nomor_sk]
    );

    if (existsNomerSK.rows.length) {
      fs.unlink(file.file_jabatan[0].path, (err) => {
        if (err) {
          console.log(err);
        }
        return;
      });
      res.status(400);
      throw new Error("SK number already exists.");
    }

    const created_at = unixTimestamp;
    const convert = convertDate(created_at);

    const keys = ["user_id", ...Object.keys(data), "file", "created_at"];
    const values = [
      userLoginId,
      ...Object.values(data),
      file.file_jabatan[0].filename,
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
    "SELECT * FROM tb_jabatan_dosen WHERE user_id = $1 and status = $2",
    [userLoginId, 1]
  );

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
  const userLoginId = req.user.user_id;
  const { jabId } = req.params;

  const dataJabatan = await DB.query(
    "SELECT * FROM tb_jabatan_dosen WHERE jabatan_id = $1",
    [jabId]
  );

  if (dataJabatan.rows.length) {
    const file = req.files;
    const data = req.body;

    console.log(data.jabatan_fungsi);

    const existsJabatan = await DB.query(
      `SELECT * FROM tb_jabatan_dosen WHERE CAST(user_id AS TEXT) LIKE '%${userLoginId}%' AND jabatan_fungsi LIKE '%${data.jabatan_fungsi}%'`
    );

    console.log(existsJabatan.rows[0]);

    if (existsJabatan.rows.length) {
      if (Object.keys(file).length === 0) {
        res.status(400);
        throw new Error("Jabatan/Fungsi already exists.");
      } else {
        fs.unlink(file.file_jabatan[0].path, (err) => {
          if (err) {
            console.log(err);
          }
          return;
        });
        res.status(400);
        throw new Error("Jabatan/Fungsi already exists.");
      }
    }

    const existsNomerSK = await DB.query(
      "SELECT * FROM tb_jabatan_dosen WHERE nomor_sk = $1",
      [data.nomor_sk]
    );

    if (existsNomerSK.rows.length) {
      if (Object.keys(file).length === 0) {
        res.status(400);
        throw new Error("SK Number already exists.");
      } else {
        fs.unlink(file.file_jabatan[0].path, (err) => {
          if (err) {
            console.log(err);
          }
          return;
        });
        res.status(400);
        throw new Error("SK Number already exists.");
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
        `UPDATE tb_jabatan_dosen SET ${setQuery} WHERE jabatan_id = '${dataJabatan.rows[0].jabatan_id}' `,
        entries.map(([_, value]) => value)
      );

      res.status(201).json({
        message: "Successfully update data.",
        data: saveData.rows[0],
      });
    } else {
      await fs.remove(
        path.join(`public/file-jabatan/${dataJabatan.rows[0].file}`)
      );
      const updated_at = unixTimestamp;
      const convert = convertDate(updated_at);

      const entries = Object.entries({
        ...data,
        file: file.file_jabatan[0].filename,
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

  await fs.remove(path.join(`public/file-jabatan/${findData.rows[0].file}`));
  await DB.query("DELETE FROM tb_jabatan_dosen WHERE jabatan_id = $1", [
    findData.rows[0].jabatan_id,
  ]);

  res.status(200).json({ message: "Data deleted successfully." });
});

exports.updateStatusJabatan = asyncHandler(async (req, res) => {
  const { jabId } = req.params;
  const data = req.body;

  if (!data.status) {
    res.status(400);
    throw new Error("Pleas fill in all the required fields.");
  }

  const findData = await DB.query(
    "SELECT * FROM tb_jabatan_dosen WHERE jabatan_id = $1",
    [jabId]
  );

  if (findData.rows.length) {
    const updated_at = unixTimestamp;
    const convert = convertDate(updated_at);
    const updateStatus = await DB.query(
      `UPDATE tb_jabatan_dosen SET status = $1, updated_at = $2 WHERE jabatan_id = $3 returning *`,
      [data.status, convert, jabId]
    );

    res.status(201).json({
      message: "Successfully update data.",
      data: updateStatus.rows[0],
    });
  } else {
    res.status(404);
    throw new Error("Data not found.");
  }
});
