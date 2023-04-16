const asyncHandler = require("express-async-handler");
const DB = require("../../database");
const path = require("path");
const fs = require("fs-extra");
const { unixTimestamp, convertDate } = require("../../utils");

exports.createDataTes = asyncHandler(async (req, res) => {
  const userLoginId = req.user.user_id;

  const user = await DB.query("SELECT * FROM tb_users WHERE user_id = $1", [
    userLoginId,
  ]);

  if (user.rows.length) {
    const file = req.file;
    const data = req.body;

    if (!file) {
      res.status(400);
      throw new Error("Please fill in one file.");
    }
    if (
      !data.nama_tes ||
      !data.jenis_tes ||
      !data.penyelenggara ||
      !data.tgl_tes ||
      !data.skor_tes
    ) {
      res.status(400);
      throw new Error("Pleas fill in all the required fields.");
    }

    const existsNameTes = await DB.query(
      "SELECT * FROM tb_tes WHERE nama_tes = $1",
      [data.nama_tes]
    );

    if (existsNameTes.rows.length) {
      res.status(400);
      throw new Error("Name of TES already exists.");
    }

    const created_at = unixTimestamp;
    const convert = convertDate(created_at);

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
      `INSERT INTO tb_tes(${keys.join(", ")}) VALUES (${placeholders.join(
        ", "
      )}) returning *`,
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

exports.getDataTes = asyncHandler(async (req, res) => {
  const userLoginId = req.user.user_id;

  const dataTes = await DB.query("SELECT * FROM tb_tes WHERE user_id = $1", [
    userLoginId,
  ]);

  if (!dataTes.rows.length) {
    res.status(404);
    throw new Error("Data not found.");
  }

  res.status(201).json({
    data: dataTes.rows,
  });
});
