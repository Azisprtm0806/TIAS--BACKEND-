const asyncHandler = require("express-async-handler");
const DB = require("../../database");
const path = require("path");
const fs = require("fs-extra");
const { unixTimestamp, convertDate } = require("../../utils");

// ====================  PENELITIAN ==========================
exports.addDataPenelitian = asyncHandler(async (req, res) => {
  const userLoginId = req.user.user_id;

  const user = await DB.query("SELECT * FROM tb_users WHERE user_id = $1", [
    userLoginId,
  ]);

  if (user.rows.length) {
    const data = req.body;

    if (
      !data.judul_kegiatan ||
      !data.lokasi_kegiatan ||
      !data.tahun_usulan ||
      !data.tahun_kegiatan ||
      !data.tahun_pelaksanaan ||
      !data.lama_kegiatan
    ) {
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
      `INSERT INTO tb_penelitian(${keys.join(
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

exports.getDataPenelitian = asyncHandler(async (req, res) => {
  const userLoginId = req.user.user_id;

  const dataPenelitian = await DB.query(
    "SELECT * FROM tb_penelitian WHERE user_id = $1",
    [userLoginId]
  );
  if (!dataPenelitian.rows.length) {
    res.status(404);
    throw new Error("Data not found.");
  }

  res.status(201).json({
    data: dataPenelitian.rows,
  });
});

exports.detailDataPenelitian = asyncHandler(async (req, res) => {
  const { penelitianId } = req.params;

  const findDataPenelitian = await DB.query(
    "SELECT * FROM tb_penelitian WHERE penelitian_id = $1",
    [penelitianId]
  );

  const anggotaDosen = await DB.query(
    "SELECT * FROM anggota_penelitian_dosen WHERE penelitian_id = $1",
    [penelitianId]
  );

  const anggotaMhs = await DB.query(
    "SELECT * FROM anggota_penelitian_mhs WHERE penelitian_id = $1",
    [penelitianId]
  );

  const findDataDokumen = await DB.query(
    "SELECT * FROM dokumen_penelitian WHERE penelitian_id = $1",
    [penelitianId]
  );

  res.status(201).json({
    dataPenelitian: findDataPenelitian.rows,
    anggotaDosen: anggotaDosen.rows,
    anggotaMhs: anggotaMhs.rows,
    dataDokumen: findDataDokumen.rows,
  });
});

exports.editDataPenelitian = asyncHandler(async (req, res) => {});

exports.deleteDataPenelitian = asyncHandler(async (req, res) => {});
// ===================== END PENELITIAN ==========================

// ===================== ANGGOTA PENELITIAN ======================
exports.addAnggotaDosen = asyncHandler(async (req, res) => {
  const data = req.body;

  if (!data.nama || !data.peran || !data.status) {
    res.status(400);
    throw new Error("Pleas fill in all the required fields.");
  }

  const keys = [...Object.keys(data)];
  const values = [...Object.values(data)];
  const placeholders = keys.map((key, index) => `$${index + 1}`);

  // save data
  const saveData = await DB.query(
    `INSERT INTO anggota_penelitian_dosen(${keys.join(
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

exports.addAnggotaMhs = asyncHandler(async (req, res) => {
  const data = req.body;

  if (!data.nama || !data.peran || !data.status) {
    res.status(400);
    throw new Error("Pleas fill in all the required fields.");
  }

  const keys = [...Object.keys(data)];
  const values = [...Object.values(data)];
  const placeholders = keys.map((key, index) => `$${index + 1}`);

  // save data
  const saveData = await DB.query(
    `INSERT INTO anggota_penelitian_mhs(${keys.join(
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
// ===================== END ANGGOTA PENELITIAN ===================

// ===================== DOKUMEN PENELITIAN =====================
exports.addDokumenPenelitian = asyncHandler(async (req, res) => {
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
    "SELECT * FROM dokumen_penelitian WHERE nama_dok = $1",
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
    `INSERT INTO dokumen_penelitian(${keys.join(
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

exports.detailDokumenPenelitian = asyncHandler(async (req, res) => {
  const { dokumenId } = req.params;

  const findDataDokumen = await DB.query(
    "SELECT * FROM dokumen_penelitian WHERE dokumen_id = $1",
    [dokumenId]
  );

  if (!findDataDokumen.rows.length) {
    res.status(404);
    throw new Error("Data not found.");
  }

  res.status(201).json({
    data: findDataDokumen.rows[0],
  });
});

exports.deleteDokumenPenelitian = asyncHandler(async (req, res) => {
  const { dokumenId } = req.params;

  const findData = await DB.query(
    "SELECT * FROM dokumen_penelitian WHERE dokumen_id = $1",
    [dokumenId]
  );

  if (!findData.rows.length) {
    res.status(400);
    throw new Error("Data not found.");
  }

  await fs.remove(
    path.join(`public/dokumen-penelitian/${findData.rows[0].file}`)
  );
  await DB.query("DELETE FROM dokumen_penelitian WHERE dokumen_id = $1", [
    findData.rows[0].dokumen_id,
  ]);

  res.status(200).json({ message: "Data deleted successfully." });
});

exports.editDokumenPenelitian = asyncHandler(async (req, res) => {
  const { dokumenId } = req.params;

  const findData = await DB.query(
    "SELECT * FROM dokumen_penelitian WHERE dokumen_id = $1",
    [dokumenId]
  );

  if (findData.rows.length) {
    const file = req.file;
    const data = req.body;

    const existsName = await DB.query(
      "SELECT * FROM dokumen_penelitian WHERE nama_dok = $1",
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
        `UPDATE dokumen_penelitian SET ${setQuery} WHERE dokumen_id = '${findData.rows[0].dokumen_id}' `,
        entries.map(([_, value]) => value)
      );

      res.status(201).json({
        message: "Successfully update data.",
        data: saveData.rows[0],
      });
    } else {
      await fs.remove(
        path.join(`public/dokumen-penelitian/${findData.rows[0].file}`)
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
        `UPDATE dokumen_penelitian SET ${setQuery} WHERE penelitian_id = '${findData.rows[0].penelitian_id}' `,
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
// ===================== END DOKUMEN PENELITIAN ===================
