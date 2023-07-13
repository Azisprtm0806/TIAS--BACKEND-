const asyncHandler = require("express-async-handler");
const DB = require("../../database");
const path = require("path");
const fs = require("fs-extra");
const { unixTimestamp, convertDate } = require("../../utils");

exports.addDataProfesi = asyncHandler(async (req, res) => {
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

    if (!data.nama_organisasi || !data.peran || !data.mulai_keanggotaan) {
      fs.unlink(file.file_profesi[0].path, (err) => {
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
      file.file_profesi[0].filename,
      convert,
    ];
    const placeholders = keys.map((key, index) => `$${index + 1}`);

    // save data
    const saveData = await DB.query(
      `INSERT INTO tb_anggota_prof(${keys.join(
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
exports.getAllDataProfesi = asyncHandler(async (req, res) => {
  const userLoginId = req.user.user_id;

  const dataProf = await DB.query(
    "SELECT * FROM tb_anggota_prof WHERE user_id = $1 and status = $2",
    [userLoginId, 1]
  );

  const jumlahData = await DB.query(
    "SELECT COUNT(*) FROM tb_anggota_prof WHERE user_id = $1 and status = $2",
    [userLoginId, 1]
  );

  res.status(201).json({
    data: dataProf.rows,
    totalData: jumlahData.rows[0].count,
  });
});
exports.detailDataProfesi = asyncHandler(async (req, res) => {
  const { profId } = req.params;

  const findData = await DB.query(
    "SELECT * FROM tb_anggota_prof WHERE prof_id = $1",
    [profId]
  );

  if (!findData.rows.length) {
    res.status(404);
    throw new Error("Data not found.");
  }

  res.status(201).json({
    data: findData.rows[0],
  });
});
exports.editDataProfesi = asyncHandler(async (req, res) => {
  const { profId } = req.params;

  const findData = await DB.query(
    "SELECT * FROM tb_anggota_prof WHERE prof_id = $1",
    [profId]
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
        `UPDATE tb_anggota_prof SET ${setQuery} WHERE prof_id = '${findData.rows[0].prof_id}' `,
        entries.map(([_, value]) => value)
      );

      res.status(201).json({
        message: "Successfully update data.",
        data: saveData.rows[0],
      });
    } else {
      await fs.remove(
        path.join(`public/file-profesi/${findData.rows[0].file}`)
      );
      const updated_at = unixTimestamp;
      const convert = convertDate(updated_at);

      const entries = Object.entries({
        ...data,
        file: file.file_profesi[0].filename,
        updated_at: convert,
      });
      const setQuery = entries
        .map(([key, _], index) => `${key} = $${index + 1}`)
        .join(", ");

      const saveData = await DB.query(
        `UPDATE tb_anggota_prof SET ${setQuery} WHERE prof_id = '${findData.rows[0].prof_id}' `,
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
exports.deleteDataProfesi = asyncHandler(async (req, res) => {
  const { profId } = req.params;

  const findData = await DB.query(
    "SELECT * FROM tb_anggota_prof WHERE prof_id = $1",
    [profId]
  );

  if (!findData.rows.length) {
    res.status(400);
    throw new Error("Data not found.");
  }

  await fs.remove(path.join(`public/file-profesi/${findData.rows[0].file}`));
  await DB.query("DELETE FROM tb_anggota_prof WHERE prof_id = $1", [
    findData.rows[0].prof_id,
  ]);

  res.status(200).json({ message: "Data deleted successfully." });
});
exports.updateStatusProfesi = asyncHandler(async (req, res) => {
  const { profId } = req.params;
  const data = req.body;

  if (!data.status) {
    res.status(400);
    throw new Error("Pleas fill in all the required fields.");
  }

  const findData = await DB.query(
    "SELECT * FROM tb_anggota_prof WHERE prof_id = $1",
    [profId]
  );

  if (findData.rows.length) {
    const updated_at = unixTimestamp;
    const convert = convertDate(updated_at);
    const updateStatus = await DB.query(
      `UPDATE tb_anggota_prof SET status = $1, updated_at = $2 WHERE prof_id = $2`,
      [data.status, convert, profId]
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
