const asyncHandler = require("express-async-handler");
const DB = require("../../database");
const path = require("path");
const fs = require("fs-extra");
const { unixTimestamp, convertDate } = require("../../utils");

exports.addPenghargaan = asyncHandler(async (req, res) => {
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
      !data.tingkat_peng ||
      !data.jenis_peng ||
      !data.nama_peng ||
      !data.tahun_peng ||
      !data.instansi_pemberi
    ) {
      fs.unlink(file.file_penghargaan[0].path, (err) => {
        if (err) {
          console.log(err);
        }
        return;
      });
      res.status(400);
      throw new Error("Pleas fill in all the required fields.");
    }

    const created_at = unixTimestamp;
    const convert = convertDate(created_at);

    const keys = ["user_id", ...Object.keys(data), "file", "created_at"];
    const values = [
      userLoginId,
      ...Object.values(data),
      file.file_penghargaan[0].filename,
      convert,
    ];
    const placeholders = keys.map((key, index) => `$${index + 1}`);

    // save data
    const saveData = await DB.query(
      `INSERT INTO tb_penghargaan(${keys.join(
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

exports.getPenghargaan = asyncHandler(async (req, res) => {
  const userLoginId = req.user.user_id;

  const dataPenghargaan = await DB.query(
    "SELECT * FROM tb_penghargaan WHERE user_id = $1",
    [userLoginId]
  );

  if (!dataPenghargaan.rows.length) {
    res.status(404);
    throw new Error("Data not found.");
  }

  res.status(201).json({
    data: dataPenghargaan.rows,
  });
});

exports.detailPenghargaan = asyncHandler(async (req, res) => {
  const { pengId } = req.params;

  const findData = await DB.query(
    "SELECT * FROM tb_penghargaan WHERE penghargaan_id = $1",
    [pengId]
  );

  if (!findData.rows.length) {
    res.status(404);
    throw new Error("Data not found.");
  }

  res.status(201).json({
    data: findData.rows[0],
  });
});

exports.editPenghargaan = asyncHandler(async (req, res) => {
  // const userLoginId = req.user.user_id;
  const { pengId } = req.params;

  const findData = await DB.query(
    "SELECT * FROM tb_penghargaan WHERE penghargaan_id = $1",
    [pengId]
  );

  if (findData.rows.length) {
    const file = req.files;
    const data = req.body;

    if (Object.keys(file).length === 0) {
      const updated_at = unixTimestamp;
      const convert = convertDate(updated_at);

      const entries = Object.entries({ ...data, updated_at: convert });
      const setQuery = entries
        .map(([key, _], index) => `${key} = $${index + 1}`)
        .join(", ");

      const saveData = await DB.query(
        `UPDATE tb_penghargaan SET ${setQuery} WHERE penghargaan_id = '${findData.rows[0].penghargaan_id}' `,
        entries.map(([_, value]) => value)
      );

      res.status(201).json({
        message: "Successfully update data.",
        data: saveData.rows[0],
      });
    } else {
      await fs.remove(
        path.join(`public/file-penghargaan/${findData.rows[0].file}`)
      );
      const updated_at = unixTimestamp;
      const convert = convertDate(updated_at);

      const entries = Object.entries({
        ...data,
        file: file.file_penghargaan[0].filename,
        updated_at: convert,
      });
      const setQuery = entries
        .map(([key, _], index) => `${key} = $${index + 1}`)
        .join(", ");

      const saveData = await DB.query(
        `UPDATE tb_penghargaan SET ${setQuery} WHERE penghargaan_id = '${findData.rows[0].penghargaan_id}' `,
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

exports.deletePenghargaan = asyncHandler(async (req, res) => {
  const { pengId } = req.params;

  const findData = await DB.query(
    "SELECT * FROM tb_penghargaan WHERE penghargaan_id = $1",
    [pengId]
  );

  if (!findData.rows.length) {
    res.status(400);
    throw new Error("Data not found.");
  }

  await fs.remove(
    path.join(`public/file-penghargaan/${findData.rows[0].file}`)
  );
  await DB.query("DELETE FROM tb_penghargaan WHERE penghargaan_id = $1", [
    findData.rows[0].penghargaan_id,
  ]);

  res.status(200).json({ message: "Data deleted successfully." });
});

exports.updateStatusPenghargaan = asyncHandler(async (req, res) => {
  const { pengId } = req.params;
  const data = req.body;

  if (!data.status) {
    res.status(400);
    throw new Error("Pleas fill in all the required fields.");
  }

  const findData = await DB.query(
    "SELECT * FROM tb_penghargaan WHERE penghargaan_id = $1",
    [pengId]
  );

  if (findData.rows.length) {
    const updateStatus = await DB.query(
      `UPDATE tb_penghargaan SET status = $1 WHERE penghargaan_id = $2`,
      [data.status, pengId]
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
