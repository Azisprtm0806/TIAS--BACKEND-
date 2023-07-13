const asyncHandler = require("express-async-handler");
const DB = require("../../database");
const path = require("path");
const fs = require("fs-extra");
const { unixTimestamp, convertDate } = require("../../utils");

exports.addDataIp = asyncHandler(async (req, res) => {
  const userLoginId = req.user.user_id;

  const user = await DB.query("SELECT * FROM tb_users WHERE user_id = $1", [
    userLoginId,
  ]);

  if (user.rows.length) {
    const data = req.body;

    console.log(data);
    if (!data.semester || !data.tahun || !data.ip) {
      res.status(400);
      throw new Error("Pleas fill in all the required fields.");
    }

    const created_at = unixTimestamp;
    const convert = convertDate(created_at);

    const keys = ["user_id", ...Object.keys(data), "created_at"];
    const values = [userLoginId, ...Object.values(data), convert];
    const placeholders = keys.map((key, index) => `$${index + 1}`);

    // save data
    const saveData = await DB.query(
      `INSERT INTO tb_ip_mhs(${keys.join(", ")}) VALUES (${placeholders.join(
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

exports.getDataIP = asyncHandler(async (req, res) => {
  const userLoginId = req.user.user_id;

  const dataIP = await DB.query(
    "SELECT * FROM tb_ip_mhs WHERE user_id = $1 and status = $2",
    [userLoginId, 1]
  );

  const jumlahData = await DB.query(
    "SELECT COUNT(*) FROM tb_ip_mhs WHERE user_id = $1 and status = $2",
    [userLoginId, 1]
  );

  res.status(201).json({
    data: dataIP.rows,
    totalData: jumlahData.rows[0].count,
  });
});

exports.detailDataIp = asyncHandler(async (req, res) => {
  const { ipId } = req.params;

  const findData = await DB.query("SELECT * FROM tb_ip_mhs WHERE ip_id = $1", [
    ipId,
  ]);

  if (!findData.rows.length) {
    res.status(404);
    throw new Error("Data not found.");
  }

  res.status(201).json({
    data: findData.rows[0],
  });
});

exports.editDataIp = asyncHandler(async (req, res) => {
  const { ipId } = req.params;

  const findData = await DB.query("SELECT * FROM tb_ip_mhs WHERE ip_id = $1", [
    ipId,
  ]);

  if (findData.rows.length) {
    const data = req.body;

    const updated_at = unixTimestamp;
    const convert = convertDate(updated_at);

    const entries = Object.entries({ ...data, updated_at: convert });
    const setQuery = entries
      .map(([key, _], index) => `${key} = $${index + 1}`)
      .join(", ");

    const saveData = await DB.query(
      `UPDATE tb_ip_mhs SET ${setQuery} WHERE ip_id = '${findData.rows[0].ip_id}' `,
      entries.map(([_, value]) => value)
    );

    res.status(201).json({
      message: "Successfully update data.",
      data: saveData.rows[0],
    });
  } else {
    res.status(404);
    throw new Error("Data not found.");
  }
});

exports.deleteDataIp = asyncHandler(async (req, res) => {
  const { ipId } = req.params;

  const findData = await DB.query("SELECT * FROM tb_ip_mhs WHERE ip_id = $1", [
    ipId,
  ]);

  if (!findData.rows.length) {
    res.status(400);
    throw new Error("Data not found.");
  }
  await DB.query("DELETE FROM tb_ip_mhs WHERE ip_id = $1", [
    findData.rows[0].ip_id,
  ]);

  res.status(200).json({ message: "Data deleted successfully." });
});

exports.updateStatusIp = asyncHandler(async (req, res) => {
  const { ipId } = req.params;
  const data = req.body;

  if (!data.status) {
    res.status(400);
    throw new Error("Pleas fill in all the required fields.");
  }

  const findData = await DB.query("SELECT * FROM tb_ip_mhs WHERE ip_id = $1", [
    ipId,
  ]);

  if (findData.rows.length) {
    const updated_at = unixTimestamp;
    const convert = convertDate(updated_at);
    const updateStatus = await DB.query(
      `UPDATE tb_ip_mhs SET status = $1, updated_at = $2 WHERE ip_id = $3 returning *`,
      [data.status, convert, ipId]
    );

    const ip = updateStatus.rows[0].ip;
    let pointIp;
    if (ip == 0 || ip < 1.0) {
      pointIp = 175;
    } else if (ip >= 1.0 || ip <= 1.4) {
      pointIp = 240;
    } else if (ip >= 1.5 || ip <= 1.9) {
      pointIp = 300;
    } else if (ip >= 2.0 || ip <= 2.4) {
      pointIp = 355;
    } else if (ip >= 2.5 || ip <= 2.9) {
      pointIp = 7;
    }

    res.status(201).json({
      message: "Successfully update data.",
      data: updateStatus.rows[0],
    });
  } else {
    res.status(404);
    throw new Error("Data not found.");
  }
});
