const asyncHandler = require("express-async-handler");
const DB = require("../../database");
const path = require("path");
const fs = require("fs-extra");
const { unixTimestamp, convertDate } = require("../../utils");

exports.addPendidikan = asyncHandler(async (req, res) => {
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
      !data.asal ||
      !data.jenjang_studi ||
      !data.tahun_masuk ||
      !data.tahun_lulus ||
      !data.nomor_induk
    ) {
      fs.unlink(file.file_pend[0].path, (err) => {
        if (err) {
          console.log(err);
        }
        return;
      });
      res.status(400);
      throw new Error("Pleas fill in all the required fields.");
    }

    const existsAsalPend = await DB.query(
      `SELECT * FROM tb_pend_formal WHERE CAST(user_id AS TEXT) LIKE '%${userLoginId}%' AND asal LIKE '%${data.asal}%'`
    );

    if (existsAsalPend.rows.length) {
      fs.unlink(file.file_pend[0].path, (err) => {
        if (err) {
          console.log(err);
        }
        return;
      });
      res.status(400);
      throw new Error("Asal Sekolah/Universitas already exists.");
    }

    const existsJenjangStudi = await DB.query(
      `SELECT * FROM tb_pend_formal WHERE CAST(user_id AS TEXT) LIKE '%${userLoginId}%' AND jenjang_studi LIKE '%${data.jenjang_studi}%'`
    );

    if (existsJenjangStudi.rows.length) {
      fs.unlink(file.file_pend[0].path, (err) => {
        if (err) {
          console.log(err);
        }
        return;
      });
      res.status(400);
      throw new Error("Jenjang Studi already exists.");
    }

    const existsNomorInduk = await DB.query(
      "SELECT * FROM tb_pend_formal WHERE nomor_induk = $1",
      [data.nomor_induk]
    );

    if (existsNomorInduk.rows.length) {
      fs.unlink(file.file_pend[0].path, (err) => {
        if (err) {
          console.log(err);
        }
        return;
      });
      res.status(400);
      throw new Error("Nomor Induk already exists.");
    }

    const existsJudultesis = await DB.query(
      `SELECT * FROM tb_pend_formal WHERE CAST(user_id AS TEXT) LIKE '%${userLoginId}%' AND judul_tesis LIKE '%${data.judul_tesis}%'`
    );

    if (existsJudultesis.rows.length) {
      fs.unlink(file.file_pend[0].path, (err) => {
        if (err) {
          console.log(err);
        }
        return;
      });
      res.status(400);
      throw new Error("Judul Tesis already exists.");
    }

    const existsNomorIjazah = await DB.query(
      "SELECT * FROM tb_pend_formal WHERE no_ijazah = $1",
      [data.no_ijazah]
    );

    if (existsNomorIjazah.rows.length) {
      fs.unlink(file.file_pend[0].path, (err) => {
        if (err) {
          console.log(err);
        }
        return;
      });
      res.status(400);
      throw new Error("Nomor Ijazah already exists.");
    }

    const existsNoSKPenyetaraan = await DB.query(
      "SELECT * FROM tb_pend_formal WHERE no_sk_penyetaraan = $1",
      [data.no_sk_penyetaraan]
    );

    if (existsNoSKPenyetaraan.rows.length) {
      fs.unlink(file.file_pend[0].path, (err) => {
        if (err) {
          console.log(err);
        }
        return;
      });
      res.status(400);
      throw new Error("Nomor SK Penyetaraan already exists.");
    }

    const created_at = unixTimestamp;
    const convert = convertDate(created_at);

    const keys = ["user_id", ...Object.keys(data), "file", "created_at"];
    const values = [
      userLoginId,
      ...Object.values(data),
      file.file_pend[0].filename,
      convert,
    ];
    const placeholders = keys.map((key, index) => `$${index + 1}`);

    // save data
    const saveData = await DB.query(
      `INSERT INTO tb_pend_formal(${keys.join(
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

exports.getDataPendidikan = asyncHandler(async (req, res) => {
  const userLoginId = req.user.user_id;

  const dataPend = await DB.query(
    "SELECT * FROM tb_pend_formal WHERE user_id = $1",
    [userLoginId]
  );

  if (!dataPend.rows.length) {
    res.status(404);
    throw new Error("Data not found.");
  }

  res.status(201).json({
    data: dataPend.rows,
  });
});

exports.detailDataPendidikan = asyncHandler(async (req, res) => {
  const { pendId } = req.params;

  const findData = await DB.query(
    "SELECT * FROM tb_pend_formal WHERE pend_id = $1",
    [pendId]
  );

  if (!findData.rows.length) {
    res.status(404);
    throw new Error("Data not found.");
  }

  res.status(201).json({
    data: findData.rows[0],
  });
});

exports.editDataPendidikan = asyncHandler(async (req, res) => {
  const userLoginId = req.user.user_id;
  const { pendId } = req.params;

  const findData = await DB.query(
    "SELECT * FROM tb_pend_formal WHERE pend_id = $1",
    [pendId]
  );

  if (findData.rows.length) {
    const file = req.files;
    const data = req.body;

    const existsAsalPend = await DB.query(
      `SELECT * FROM tb_pend_formal WHERE CAST(user_id AS TEXT) LIKE '%${userLoginId}%' AND asal LIKE '%${data.asal}%'`
    );

    if (existsAsalPend.rows.length) {
      if (Object.keys(file).length === 0) {
        res.status(400);
        throw new Error("Asal Sekolah/Universitas already exists.");
      } else {
        fs.unlink(file.file_pend[0].path, (err) => {
          if (err) {
            console.log(err);
          }
          return;
        });
        res.status(400);
        throw new Error("Asal Sekolah/Universitas already exists.");
      }
    }

    const existsJenjangStudi = await DB.query(
      `SELECT * FROM tb_pend_formal WHERE CAST(user_id AS TEXT) LIKE '%${userLoginId}%' AND jenjang_studi LIKE '%${data.jenjang_studi}%'`
    );

    if (existsJenjangStudi.rows.length) {
      if (Object.keys(file).length === 0) {
        res.status(400);
        throw new Error("Jenjang Studi already exists.");
      } else {
        fs.unlink(file.file_pend[0].path, (err) => {
          if (err) {
            console.log(err);
          }
          return;
        });
        res.status(400);
        throw new Error("Jenjang Studi already exists.");
      }
    }

    const existsNomorInduk = await DB.query(
      "SELECT * FROM tb_pend_formal WHERE nomor_induk = $1",
      [data.nomor_induk]
    );

    if (existsNomorInduk.rows.length) {
      if (Object.keys(file).length === 0) {
        res.status(400);
        throw new Error("Nomor Induk already exists.");
      } else {
        fs.unlink(file.file_pend[0].path, (err) => {
          if (err) {
            console.log(err);
          }
          return;
        });
        res.status(400);
        throw new Error("Nomor Induk already exists.");
      }
    }

    const existsJudultesis = await DB.query(
      `SELECT * FROM tb_pend_formal WHERE CAST(user_id AS TEXT) LIKE '%${userLoginId}%' AND judul_tesis LIKE '%${data.judul_tesis}%'`
    );

    if (existsJudultesis.rows.length) {
      if (Object.keys(file).length === 0) {
        res.status(400);
        throw new Error("Judul Tesis already exists.");
      } else {
        fs.unlink(file.file_pend[0].path, (err) => {
          if (err) {
            console.log(err);
          }
          return;
        });
        res.status(400);
        throw new Error("Judul Tesis already exists.");
      }
    }

    const existsNomorIjazah = await DB.query(
      "SELECT * FROM tb_pend_formal WHERE no_ijazah = $1",
      [data.judul_tesis]
    );

    if (existsNomorIjazah.rows.length) {
      if (Object.keys(file).length === 0) {
        res.status(400);
        throw new Error("Nomor Ijazah already exists.");
      } else {
        fs.unlink(file.file_pend[0].path, (err) => {
          if (err) {
            console.log(err);
          }
          return;
        });
        res.status(400);
        throw new Error("Nomor Ijazah already exists.");
      }
    }

    const existsNoSKPenyetaraan = await DB.query(
      "SELECT * FROM tb_pend_formal WHERE no_sk_penyetaraan = $1",
      [data.no_sk_penyetaraan]
    );

    if (existsNoSKPenyetaraan.rows.length) {
      if (Object.keys(file).length === 0) {
        res.status(400);
        throw new Error("Nomor SK Penyetaraan already exists.");
      } else {
        fs.unlink(file.file_pend[0].path, (err) => {
          if (err) {
            console.log(err);
          }
          return;
        });
        res.status(400);
        throw new Error("Nomor SK Penyetaraan already exists.");
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
        `UPDATE tb_pend_formal SET ${setQuery} WHERE pend_id = '${findData.rows[0].pend_id}' `,
        entries.map(([_, value]) => value)
      );

      res.status(201).json({
        message: "Successfully update data.",
        data: saveData.rows[0],
      });
    } else {
      await fs.remove(
        path.join(`public/file-pendFormal/${findData.rows[0].file}`)
      );
      const updated_at = unixTimestamp;
      const convert = convertDate(updated_at);

      const entries = Object.entries({
        ...data,
        file: file.file_pend[0].filename,
        updated_at: convert,
      });
      const setQuery = entries
        .map(([key, _], index) => `${key} = $${index + 1}`)
        .join(", ");

      const saveData = await DB.query(
        `UPDATE tb_pend_formal SET ${setQuery} WHERE pend_id = '${findData.rows[0].pend_id}' `,
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

exports.deleteDataPendidikan = asyncHandler(async (req, res) => {
  const { pendId } = req.params;

  const findData = await DB.query(
    "SELECT * FROM tb_pend_formal WHERE pend_id = $1",
    [pendId]
  );

  if (!findData.rows.length) {
    res.status(400);
    throw new Error("Data not found.");
  }

  await fs.remove(path.join(`public/file-pendFormal/${findData.rows[0].file}`));
  await DB.query("DELETE FROM tb_pend_formal WHERE pend_id = $1", [
    findData.rows[0].pend_id,
  ]);

  res.status(200).json({ message: "Data deleted successfully." });
});
