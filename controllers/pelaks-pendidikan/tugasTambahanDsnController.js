const asyncHandler = require("express-async-handler");
const DB = require("../../database");
const path = require("path");
const fs = require("fs-extra");
const { unixTimestamp, convertDate } = require("../../utils");

// ====================  Tugas Tamabahan Dosen ==========================
exports.addDataTugasTambahan = asyncHandler(async (req, res) => {
  const userLoginId = req.user.user_id;

  const user = await DB.query("SELECT * FROM tb_users WHERE user_id = $1", [
    userLoginId,
  ]);

  if (user.rows.length) {
    const data = req.body;
    const file = req.file;

    if (!file) {
      res.status(400);
      throw new Error("Please fill in one file.");
    }

    if (
      !data.jenis_tugas ||
      !data.perguruan_tinggi ||
      !data.unit_kerja ||
      !data.no_sk_penugasan ||
      !data.tgl_mulai_tugas ||
      !data.tgl_akhir_tugas ||
      !data.nama_dok ||
      !data.keterangan
    ) {
      fs.unlink(file.path, (err) => {
        if (err) {
          console.log(err);
        }
        return;
      });
      res.status(400);
      throw new Error("Pleas fill in all the required fields.");
    }

    const tugasTambahanDsn = {
      jenis_tugas: data.jenis_tugas,
      perguruan_tinggi: data.perguruan_tinggi,
      unit_kerja: data.unit_kerja,
      no_sk_penugasan: data.no_sk_penugasan,
      tgl_mulai_tugas: data.tgl_mulai_tugas,
      tgl_akhir_tugas: data.tgl_akhir_tugas,
    };

    const existsNomorSK = await DB.query(
      "SELECT * FROM tb_tgs_tambahan_dosen WHERE no_sk_penugasan = $1",
      [tugasTambahanDsn.no_sk_penugasan]
    );

    if (existsNomorSK.rows.length) {
      fs.unlink(file.path, (err) => {
        if (err) {
          console.log(err);
        }
        return;
      });
      res.status(400);
      throw new Error("Nomor SK already exists.");
    }

    const created_at = unixTimestamp;
    const convert = convertDate(created_at);

    const keys = ["user_id", ...Object.keys(tugasTambahanDsn), "created_at"];
    const values = [userLoginId, ...Object.values(tugasTambahanDsn), convert];
    const placeholders = keys.map((key, index) => `$${index + 1}`);

    // save data
    const saveDataTgsTambahan = await DB.query(
      `INSERT INTO tb_tgs_tambahan_dosen(${keys.join(
        ", "
      )}) VALUES (${placeholders.join(", ")}) returning *`,
      values
    );

    const tugastambahan_id = saveDataTgsTambahan.rows[0].tugastambahan_id;

    const dokumen = {
      nama_dok: data.nama_dok,
      keterangan: data.keterangan,
      tautan_dok: data.tautan_dok,
      file: file.filename,
    };

    const keysDokumen = [
      "tugastambahan_id",
      ...Object.keys(dokumen),
      "created_at",
    ];
    const valuesDokumen = [
      tugastambahan_id,
      ...Object.values(dokumen),
      convert,
    ];
    const placeholdersDokumen = keysDokumen.map(
      (key, index) => `$${index + 1}`
    );

    const saveDataDokumen = await DB.query(
      `INSERT INTO dokumen_tgs_tambahan(${keysDokumen.join(
        ", "
      )}) VALUES (${placeholdersDokumen.join(", ")}) returning *`,
      valuesDokumen
    );

    if (saveDataTgsTambahan.rows && saveDataDokumen.rows) {
      res.status(200).json({
        message: "Successfull created data.",
        dataTugasTambahan: saveDataTgsTambahan.rows[0],
        dataDokumen: saveDataDokumen.rows[0],
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

exports.getDataTugasTambahan = asyncHandler(async (req, res) => {
  const userLoginId = req.user.user_id;

  const findData = await DB.query(
    "SELECT * FROM tb_tgs_tambahan_dosen WHERE user_id = $1",
    [userLoginId]
  );

  if (!findData.rows.length) {
    res.status(404);
    throw new Error("Data not found.");
  }

  res.status(201).json({
    data: findData.rows,
  });
});

exports.detailDataTugasTambahan = asyncHandler(async (req, res) => {
  const { tgstamabahanId } = req.params;

  const findDataTgsTambahanDsn = await DB.query(
    "SELECT * FROM tb_tgs_tambahan_dosen WHERE tugastambahan_id = $1",
    [tgstamabahanId]
  );

  const findDataDokumen = await DB.query(
    "SELECT * FROM dokumen_tgs_tambahan WHERE tugastambahan_id = $1",
    [tgstamabahanId]
  );

  if (!findDataTgsTambahanDsn.rows.length) {
    res.status(404);
    throw new Error("Data not found.");
  }

  res.status(201).json({
    dataTugasTambahan: findDataTgsTambahanDsn.rows,
    dataDokumen: findDataDokumen.rows,
  });
});

exports.editDataTugasTambahan = asyncHandler(async (req, res) => {
  res.send("oke");
});

exports.deleteDataTugasTambahan = asyncHandler(async (req, res) => {
  const { tgstamabahanId } = req.params;

  const findData = await DB.query(
    "SELECT * FROM tb_tgs_tambahan_dosen WHERE tugastambahan_id = $1",
    [tgstamabahanId]
  );

  if (!findData.rows.length) {
    res.status(400);
    throw new Error("Data not found.");
  }

  const findDokumen = await DB.query(
    "SELECT * FROM dokumen_tgs_tambahan WHERE tugastambahan_id = $1",
    [tgstamabahanId]
  );

  const dataDokumen = findDokumen.rows;
  dataDokumen.forEach(async (dok) => {
    await fs.remove(path.join(`public/dokumen-tgs-tambahan-dsn/${dok.file}`));
  });

  await DB.query(
    "DELETE FROM dokumen_tgs_tambahan WHERE tugastambahan_id = $1",
    [tgstamabahanId]
  );
  await DB.query(
    "DELETE FROM tb_tgs_tambahan_dosen WHERE tugastambahan_id = $1",
    [tgstamabahanId]
  );

  res.status(200).json({ message: "Data deleted successfully." });
});

// Dokumen tugas tambahan Dosen
exports.addDokumenTugasTambahan = asyncHandler(async (req, res) => {
  const data = req.body;
  const file = req.file;

  if (!file) {
    res.status(400);
    throw new Error("Please fill in one file.");
  }

  if (!data.nama_dok || !data.keterangan) {
    fs.unlink(file.path, (err) => {
      if (err) {
        console.log(err);
      }
      return;
    });
    res.status(400);
    throw new Error("Pleas fill in all the required fields.");
  }

  const existsName = await DB.query(
    "SELECT * FROM dokumen_tgs_tambahan WHERE nama_dok = $1",
    [data.nama_dok]
  );
  if (existsName.rows.length) {
    fs.unlink(file.path, (err) => {
      if (err) {
        console.log(err);
      }
      return;
    });
    res.status(400);
    throw new Error("Name of document already exists.");
  }

  const created_at = unixTimestamp;
  const convert = convertDate(created_at);

  const keys = [...Object.keys(data), "file", "created_at"];
  const values = [...Object.values(data), file.filename, convert];
  const placeholders = keys.map((key, index) => `$${index + 1}`);

  // save data
  const saveData = await DB.query(
    `INSERT INTO dokumen_tgs_tambahan(${keys.join(
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
});

exports.detailDokumen = asyncHandler(async (req, res) => {
  const { dokumenId } = req.params;

  const findData = await DB.query(
    "SELECT * FROM dokumen_tgs_tambahan WHERE dokumen_id = $1",
    [dokumenId]
  );

  if (!findData.rows.length) {
    res.status(404);
    throw new Error("Data not found.");
  }

  res.status(201).json({
    data: findData.rows,
  });
});

exports.deleteDokumen = asyncHandler(async (req, res) => {
  const { dokumenId } = req.params;

  const findData = await DB.query(
    "SELECT * FROM dokumen_tgs_tambahan WHERE dokumen_id = $1",
    [dokumenId]
  );

  if (!findData.rows.length) {
    res.status(400);
    throw new Error("Data not found.");
  }

  await fs.remove(
    path.join(`public/dokumen-tgs-tambahan-dsn/${findData.rows[0].file}`)
  );
  await DB.query("DELETE FROM dokumen_tgs_tambahan WHERE dokumen_id = $1", [
    findData.rows[0].dokumen_id,
  ]);

  res.status(200).json({ message: "Data deleted successfully." });
});

exports.editDokumen = asyncHandler(async (req, res) => {
  const { dokumenId } = req.params;

  const findData = await DB.query(
    "SELECT * FROM dokumen_tgs_tambahan WHERE dokumen_id = $1",
    [dokumenId]
  );

  if (findData.rows.length) {
    const file = req.file;
    const data = req.body;

    const existsName = await DB.query(
      "SELECT * FROM dokumen_tgs_tambahan WHERE nama_dok = $1",
      [data.nama_dok]
    );
    if (existsName.rows.length) {
      fs.unlink(file.path, (err) => {
        if (err) {
          console.log(err);
        }
        return;
      });
      res.status(400);
      throw new Error("Name of document already exists.");
    }

    if (!file) {
      const updated_at = unixTimestamp;
      const convert = convertDate(updated_at);

      const entries = Object.entries({ ...data, updated_at: convert });
      const setQuery = entries
        .map(([key, _], index) => `${key} = $${index + 1}`)
        .join(", ");

      const saveData = await DB.query(
        `UPDATE dokumen_tgs_tambahan SET ${setQuery} WHERE dokumen_id = '${findData.rows[0].dokumen_id}' `,
        entries.map(([_, value]) => value)
      );

      res.status(201).json({
        message: "Successfully update data.",
        data: saveData.rows[0],
      });
    } else {
      await fs.remove(
        path.join(`public/dokumen-tgs-tambahan-dsn/${findData.rows[0].file}`)
      );
      const updated_at = unixTimestamp;
      const convert = convertDate(updated_at);

      const entries = Object.entries({
        ...data,
        file: file.filename,
        updated_at: convert,
      });
      const setQuery = entries
        .map(([key, _], index) => `${key} = $${index + 1}`)
        .join(", ");

      const saveData = await DB.query(
        `UPDATE dokumen_tgs_tambahan SET ${setQuery} WHERE dokumen_id = '${findData.rows[0].dokumen_id}' `,
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
