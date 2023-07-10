const asyncHandler = require("express-async-handler");
const DB = require("../../database");
const { unixTimestamp, convertDate } = require("../../utils");

exports.addRekomendasi = asyncHandler(async (req, res) => {
  const userLoginId = req.user.user_id;
  const data = req.body;

  if (!data.body || !data.mahasiswa_id) {
    res.status(400);
    throw new Error("Pleas fill in all the required fields.");
  }

  const user = await DB.query("SELECT * FROM tb_users WHERE user_id = $1", [
    userLoginId,
  ]);

  if (user.rows.length) {
    const findMhs = await DB.query(
      "SELECT * FROM tb_users WHERE user_id = $1 and role = $2",
      [data.mahasiswa_id, "Mahasiswa"]
    );

    if (!findMhs.rows.length) {
      res.status(404);
      throw new Error("Student not found.");
    }

    const created_at = unixTimestamp;
    const convert = convertDate(created_at);

    const keys = ["user_id", ...Object.keys(data), "created_at"];
    const values = [userLoginId, ...Object.values(data), convert];
    const placeholders = keys.map((key, index) => `$${index + 1}`);

    // save data
    const saveData = await DB.query(
      `INSERT INTO rekomendasi_mhs(${keys.join(
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
