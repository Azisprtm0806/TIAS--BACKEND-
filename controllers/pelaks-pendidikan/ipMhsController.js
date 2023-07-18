const asyncHandler = require("express-async-handler");
const DB = require("../../database");
const { unixTimestamp, convertDate } = require("../../utils");

exports.addDataIp = asyncHandler(async (req, res) => {
  const userLoginId = req.user.user_id;

  const user = await DB.query("SELECT * FROM tb_users WHERE user_id = $1", [
    userLoginId,
  ]);

  if (user.rows.length) {
    const data = req.body;

    if (!data.semester || !data.tahun || !data.ip) {
      res.status(400);
      throw new Error("Pleas fill in all the required fields.");
    }

    const ip = data.ip;
    let pointIp;
    if (ip == 0 || ip < 1.0) {
      pointIp = 175;
    } else if (ip >= 1.00 && ip <= 1.49) {
      pointIp = 240;
    } else if (ip >= 1.50 && ip <= 1.99) {
      pointIp = 300;
    } else if (ip >= 2.00 && ip <= 2.49) {
      pointIp = 355;
    } else if (ip >= 2.50 && ip <= 2.99) {
      pointIp = 405;
    } else if (ip >= 3.00 && ip <= 3.49) {
      pointIp = 450;
    } else if (ip >= 3.50 && ip <= 3.60) {
      pointIp = 490;
    } else if (ip > 3.60 && ip <= 3.70) {
      pointIp = 525;
    } else if (ip > 3.70 && ip <= 3.80) {
      pointIp = 555;
    } else if (ip > 3.80 && ip <= 3.90) {
      pointIp = 580;
    } else if (ip > 3.90 && ip <= 4.00) {
      pointIp = 600;
    }

    const created_at = unixTimestamp;
    const convert = convertDate(created_at);

    const keys = ["user_id", ...Object.keys(data), "created_at", "point"];
    const values = [userLoginId, ...Object.values(data), convert, pointIp];
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
    "SELECT * FROM tb_ip_mhs WHERE user_id = $1 and status = $2 and is_deleted = $3",
    [userLoginId, 1, false]
  );

  const jumlahData = await DB.query(
    "SELECT COUNT(*) FROM tb_ip_mhs WHERE user_id = $1 and status = $2 and is_deleted = $3",
    [userLoginId, 1, false]
  );

  const sumPoint = await DB.query(
    "SELECT SUM(point) AS total_points FROM tb_ip_mhs WHERE user_id = $1 and status = $2 and is_deleted = $3",
    [userLoginId, 1, false]
  );

  const totalPoints = sumPoint.rows[0].total_points;

  const ipArr = dataIP.rows.map((row) => row.ip);
  const totalIp = ipArr.reduce((total, ip) => total + ip, 0);
  const jumlahSemester = ipArr.length;
  const ipk = totalIp / jumlahSemester;

  res.status(201).json({
    data: dataIP.rows,
    totalData: jumlahData.rows[0].count,
    totalPoints: totalPoints == null ? "0" : totalPoints,
    ipk: ipk.toFixed(2),
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

  
  const created_at = unixTimestamp;
  const convert = convertDate(created_at);

  const deleteData = await DB.query(
    "UPDATE tb_ip_mhs SET is_deleted = $1, deleted_at = $2 WHERE ip_id = $1 returning *",
    [true, convert,findData.rows[0].ip_id]
  );

  if (deleteData.rows.length) {
    const data = await DB.query(
      "SELECT * FROM tb_ip_mhs WHERE user_id = $1 and status = $2",
      [deleteData.rows[0].user_id, 1]
    );

    const userId = data.rows[0].user_id;

    const sumPoint = await DB.query(
      "SELECT SUM(point) AS total_points FROM tb_ip_mhs WHERE user_id = $1 and status = $2",
      [userId, 1]
    );
    const totalPoints = sumPoint.rows[0].total_points;

    await DB.query(
      "UPDATE tb_data_pribadi SET point_pendidikan = $1 WHERE user_id = $2",
      [totalPoints, userId]
    );
  }

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

    if (updateStatus.rows[0].status === 1) {
      const data = await DB.query(
        "SELECT * FROM tb_ip_mhs WHERE user_id = $1 and status = $2",
        [updateStatus.rows[0].user_id, 1]
      );

      const userId = data.rows[0].user_id;

      const sumPoint = await DB.query(
        "SELECT SUM(point) AS total_points FROM tb_ip_mhs WHERE user_id = $1 and status = $2",
        [userId, 1]
      );
      const totalPoints = sumPoint.rows[0].total_points;

      await DB.query(
        "UPDATE tb_data_pribadi SET point_pendidikan = $1 WHERE user_id = $2",
        [totalPoints, userId]
      );
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
