const asyncHandler = require("express-async-handler");
const DB = require("../../database");
const path = require("path");
const fs = require("fs-extra");
const { unixTimestamp, convertDate } = require("../../utils");

// ====================  HKI ==========================
exports.addDataHki = asyncHandler(async (req, res) => {
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
      !data.judul_hki ||
      !data.penulis ||
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
    // ==============PUBLIKASI KARYA===================
    const dataHki = {
      jenis_hki: data.jenis_hki,
      judul_hki: data.judul_hki,
      tgl_terbit_hki: data.tgl_terbit_hki,
      keterangan: data.keterangan_hki,
      status: data.status,
    };

    const created_at = unixTimestamp;
    const convert = convertDate(created_at);

    const keys = ["user_id", ...Object.keys(dataHki), "created_at"];
    const values = [userLoginId, ...Object.values(dataHki), convert];
    const placeholders = keys.map((key, index) => `$${index + 1}`);

    const saveDataHki = await DB.query(
      `INSERT INTO tb_hki(${keys.join(", ")}) VALUES (${placeholders.join(
        ", "
      )}) returning *`,
      values
    );

    // ==============END PUBLIKASI KARYA===================

    const hki_id = saveDataHki.rows[0].hki_id;

    // ==============PENULIS===================
    JSON.parse(data.penulis).forEach(async (penulis) => {
      const dataPenulis = {
        user_id: penulis.user_id,
        urutan: penulis.urutan,
        afiliasi: penulis.afiliasi,
        peran: penulis.peran,
        correspond: penulis.correspond,
      };

      const keysDataPenulis = ["hki_id", ...Object.keys(dataPenulis)];
      const valuesDataPenulis = [hki_id, ...Object.values(dataPenulis)];
      const placeholdersDataPenulis = keysDataPenulis.map(
        (key, index) => `$${index + 1}`
      );

      await DB.query(
        `INSERT INTO penulis_hki(${keysDataPenulis.join(
          ", "
        )}) VALUES (${placeholdersDataPenulis.join(", ")}) returning *`,
        valuesDataPenulis
      );
    });
    // ==============END PENULIS===================

    // ==============DOKUMEN HKI===================
    const dokumenHki = {
      nama_dok: data.nama_dok,
      keterangan: data.keterangan,
      tautan_dok: data.tautan_dok,
      file: file.filename,
    };

    const keysDokumen = ["hki_id", ...Object.keys(dokumenHki), "created_at"];
    const valuesDokumen = [hki_id, ...Object.values(dokumenHki), convert];
    const placeholdersDokumen = keysDokumen.map(
      (key, index) => `$${index + 1}`
    );

    // save data dokumen penelitian
    await DB.query(
      `INSERT INTO dokumen_hki(${keysDokumen.join(
        ", "
      )}) VALUES (${placeholdersDokumen.join(", ")}) returning *`,
      valuesDokumen
    );

    // ==============END DOKUMEN PENELITIAN===================

    if (saveDataHki.rows) {
      res.status(200).json({
        message: "Successfull created data.",
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

exports.getDataHki = asyncHandler(async (req, res) => {
  const userLoginId = req.user.user_id;

  const dataHki = await DB.query("SELECT * FROM tb_hki WHERE user_id = $1", [
    userLoginId,
  ]);

  if (!dataHki.rows.length) {
    res.status(404);
    throw new Error("Data not found.");
  }

  res.status(201).json({
    data: dataHki.rows,
  });
});

exports.detailDataHki = asyncHandler(async (req, res) => {
  const { hkiId } = req.params;

  const findDataHki = await DB.query("SELECT * FROM tb_hki WHERE hki_id = $1", [
    hkiId,
  ]);

  if (findDataHki.rows.length) {
    const penulis = await DB.query(
      "SELECT penulis_hki.*, tb_users.user_id, tb_users.role, tb_data_pribadi.nama_lengkap FROM penulis_hki JOIN tb_users ON tb_users.user_id = penulis_hki.user_id JOIN tb_data_pribadi ON tb_data_pribadi.user_id = tb_users.user_id WHERE penulis_hki.hki_id = $1",
      [hkiId]
    );

    const findDataDokumen = await DB.query(
      "SELECT * FROM dokumen_hki WHERE hki_id = $1",
      [hkiId]
    );

    res.status(201).json({
      dataHki: findDataHki.rows,
      dataPenulis: penulis.rows,
      dataDokumen: findDataDokumen.rows,
    });
  } else {
    res.status(404).json({
      message: "Data not found",
    });
  }
});

exports.deleteHki = asyncHandler(async (req, res) => {
  const { hkiId } = req.params;

  const findData = await DB.query("SELECT * FROM tb_hki WHERE hki_id = $1", [
    hkiId,
  ]);

  if (!findData.rows.length) {
    res.status(400);
    throw new Error("Data not found.");
  }

  const findDokumen = await DB.query(
    "SELECT * FROM dokumen_hki WHERE hki_id = $1",
    [hkiId]
  );

  const dataDokumen = findDokumen.rows;
  dataDokumen.forEach(async (dok) => {
    await fs.remove(path.join(`public/dokumen-hki/${dok.file}`));
  });

  await DB.query("DELETE FROM penulis_hki WHERE hki_id = $1", [hkiId]);
  await DB.query("DELETE FROM dokumen_hki WHERE hki_id = $1", [hkiId]);
  await DB.query("DELETE FROM tb_hki WHERE hki_id = $1", [hkiId]);

  res.status(200).json({ message: "Data deleted successfully." });
});

exports.editDataHki = asyncHandler(async (req, res) => {
  const { hkiId } = req.params;
  const data = req.body;
  const file = req.file;

  const findDataHki = await DB.query("SELECT * FROM tb_hki WHERE hki_id = $1", [
    hkiId,
  ]);

  if (findDataHki.rows.length) {
    // HKI
    function filterData(data) {
      const result = {};

      for (let prop in data) {
        if (data[prop] !== undefined) {
          result[prop] = data[prop];
        }
      }

      return result;
    }

    const dataHki = {
      jenis_hki: data.jenis_hki,
      judul_hki: data.judul_hki,
      tgl_terbit_hki: data.tgl_terbit_hki,
      keterangan: data.keterangan_hki,
      status: data.status,
    };

    const filteredObject = filterData(dataHki);

    const updated_at = unixTimestamp;
    const convert = convertDate(updated_at);

    const entries = Object.entries({ ...filteredObject, updated_at: convert });
    const setQuery = entries
      .map(([key, _], index) => `${key} = $${index + 1}`)
      .join(", ");

    await DB.query(
      `UPDATE tb_hki SET ${setQuery} WHERE hki_id = '${findDataHki.rows[0].hki_id}' `,
      entries.map(([_, value]) => value)
    );
    // END HKI

    // PENULIS PUBLIKASI
    if (data.penulis) {
      await DB.query("DELETE FROM penulis_hki WHERE hki_id = $1", [hkiId]);

      JSON.parse(data.penulis).forEach(async (penulis) => {
        const dataPenulis = {
          user_id: penulis.user_id,
          urutan: penulis.urutan,
          afiliasi: penulis.afiliasi,
          peran: penulis.peran,
          correspond: penulis.correspond,
        };

        const keysDataPenulis = ["hki_id", ...Object.keys(dataPenulis)];
        const valuesDataPenulis = [hkiId, ...Object.values(dataPenulis)];
        const placeholdersDataPenulis = keysDataPenulis.map(
          (key, index) => `$${index + 1}`
        );

        await DB.query(
          `INSERT INTO penulis_hki(${keysDataPenulis.join(
            ", "
          )}) VALUES (${placeholdersDataPenulis.join(", ")}) returning *`,
          valuesDataPenulis
        );
      });
    }
    // END PENULIS PUBLIKASI

    // Add Dokumen
    if (data.nama_dok || data.keterangan || data.tautan_dok || file) {
      if (!file) {
        res.status(400);
        throw new Error("Please fill in one file.");
      }
      function filterData(data) {
        const result = {};

        for (let prop in data) {
          if (data[prop] !== undefined) {
            result[prop] = data[prop];
          }
        }

        return result;
      }

      const dokumen = {
        nama_dok: data.nama_dok,
        keterangan: data.keterangan,
        tautan_dok: data.tautan_dok,
      };

      const filteredObject = filterData(dokumen);

      const created_at = unixTimestamp;
      const convert = convertDate(created_at);

      const keys = [
        "hki_id",
        ...Object.keys(filteredObject),
        "file",
        "created_at",
      ];
      const values = [
        hkiId,
        ...Object.values(filteredObject),
        file.filename,
        convert,
      ];
      const placeholders = keys.map((key, index) => `$${index + 1}`);

      // save data
      await DB.query(
        `INSERT INTO dokumen_hki(${keys.join(
          ", "
        )}) VALUES (${placeholders.join(", ")}) returning *`,
        values
      );
    }

    // END DOCUMENT

    res.status(201).json({
      message: "Successfully update data.",
    });
  } else {
    res.status(404).json({
      message: "Data not found",
    });
  }
});
// ====================  HKI ==========================

// ==================== DOCUMENT HKI ======================
exports.addDokumenHki = asyncHandler(async (req, res) => {
  const data = req.body;
  const file = req.file;

  if (!file) {
    res.status(400);
    throw new Error("Please fill in one file.");
  }

  const findDataHki = await DB.query("SELECT * FROM tb_hki WHERE hki_id = $1", [
    data.hki_id,
  ]);

  if (!findDataHki.rows.length) {
    fs.unlink(file.path, (err) => {
      if (err) {
        console.log(err);
      }
      return;
    });
    res.status(404);
    throw new Error("Data HKI not found.");
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

  const created_at = unixTimestamp;
  const convert = convertDate(created_at);

  const keys = [...Object.keys(data), "file", "created_at"];
  const values = [...Object.values(data), file.filename, convert];
  const placeholders = keys.map((key, index) => `$${index + 1}`);

  // save data
  const saveData = await DB.query(
    `INSERT INTO dokumen_hki(${keys.join(", ")}) VALUES (${placeholders.join(
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
});

exports.detailDokumenHki = asyncHandler(async (req, res) => {
  const { dokumenId } = req.params;

  const findDataDokumen = await DB.query(
    "SELECT * FROM dokumen_hki WHERE dokumen_id = $1",
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

exports.deleteDokumenHki = asyncHandler(async (req, res) => {
  const { dokumenId } = req.params;

  const findData = await DB.query(
    "SELECT * FROM dokumen_hki WHERE dokumen_id = $1",
    [dokumenId]
  );

  if (!findData.rows.length) {
    res.status(400);
    throw new Error("Data not found.");
  }

  await fs.remove(path.join(`public/dokumen-hki/${findData.rows[0].file}`));
  await DB.query("DELETE FROM dokumen_hki WHERE dokumen_id = $1", [
    findData.rows[0].dokumen_id,
  ]);

  res.status(200).json({ message: "Data deleted successfully." });
});

exports.editDokumenHki = asyncHandler(async (req, res) => {
  const { dokumenId } = req.params;
  const file = req.file;
  const data = req.body;

  const findData = await DB.query(
    "SELECT * FROM dokumen_hki WHERE dokumen_id = $1",
    [dokumenId]
  );

  if (findData.rows.length) {
    if (!file) {
      const updated_at = unixTimestamp;
      const convert = convertDate(updated_at);

      const entries = Object.entries({ ...data, updated_at: convert });
      const setQuery = entries
        .map(([key, _], index) => `${key} = $${index + 1}`)
        .join(", ");

      const saveData = await DB.query(
        `UPDATE dokumen_hki SET ${setQuery} WHERE dokumen_id = '${findData.rows[0].dokumen_id}' `,
        entries.map(([_, value]) => value)
      );

      res.status(201).json({
        message: "Successfully update data.",
        data: saveData.rows[0],
      });
    } else {
      await fs.remove(path.join(`public/dokumen-hki/${findData.rows[0].file}`));
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
        `UPDATE dokumen_hki SET ${setQuery} WHERE dokumen_id = '${findData.rows[0].dokumen_id}' `,
        entries.map(([_, value]) => value)
      );

      res.status(201).json({
        message: "Successfully update data.",
        data: saveData.rows[0],
      });
    }
  } else {
    fs.unlink(file.path, (err) => {
      if (err) {
        console.log(err);
      }
      return;
    });
    res.status(404);
    throw new Error("Data not found.");
  }
});
// ==================== END DOCUMENT HKI ==================