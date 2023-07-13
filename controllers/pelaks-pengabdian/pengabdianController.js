const asyncHandler = require("express-async-handler");
const DB = require("../../database");
const path = require("path");
const fs = require("fs-extra");
const { unixTimestamp, convertDate } = require("../../utils");

// ====================  PENGABDIAN ==========================
exports.addDataPengabdian = asyncHandler(async (req, res) => {
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
      !data.judul_kegiatan ||
      !data.lokasi_kegiatan ||
      !data.lama_kegiatan ||
      !data.anggota_pengabdian ||
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
    // ==============PENGABDIAN===================
    const dataPengabdian = {
      judul_kegiatan: data.judul_kegiatan,
      kelompok_bidang: data.kelompok_bidang,
      lokasi_kegiatan: data.lokasi_kegiatan,
      lama_kegiatan: data.lama_kegiatan,
      no_sk_penugasan: data.no_sk_penugasan,
      tgl_sk_penugasan: data.tgl_sk_penugasan,
    };

    const created_at = unixTimestamp;
    const convert = convertDate(created_at);

    const keys = ["user_id", ...Object.keys(dataPengabdian), "created_at"];
    const values = [userLoginId, ...Object.values(dataPengabdian), convert];
    const placeholders = keys.map((key, index) => `$${index + 1}`);

    const saveDataPengabdian = await DB.query(
      `INSERT INTO tb_pengabdian(${keys.join(
        ", "
      )}) VALUES (${placeholders.join(", ")}) returning *`,
      values
    );

    // ==============END PENGABDIAN===================

    const pengabdian_id = saveDataPengabdian.rows[0].pengabdian_id;

    // ==============ANGGOTA PENGABDIAN===================
    JSON.parse(data.anggota_pengabdian).forEach(async (anggota) => {
      const anggotaPengabdian = {
        user_id: anggota.user_id,
        peran: anggota.peran,
        status: anggota.status,
      };

      const keysDataAnggota = [
        "pengabdian_id",
        ...Object.keys(anggotaPengabdian),
      ];
      const valuesDataAnggota = [
        pengabdian_id,
        ...Object.values(anggotaPengabdian),
      ];
      const placeholdersDataAnggota = keysDataAnggota.map(
        (key, index) => `$${index + 1}`
      );

      await DB.query(
        `INSERT INTO anggota_pengabdian(${keysDataAnggota.join(
          ", "
        )}) VALUES (${placeholdersDataAnggota.join(", ")}) returning *`,
        valuesDataAnggota
      );
    });
    // ==============END ANGGOTA PENGABDIAN===================

    // ==============DOKUMEN ===================
    const dataDokumen = {
      nama_dok: data.nama_dok,
      keterangan: data.keterangan,
      tautan_dok: data.tautan_dok,
      file: file.filename,
    };

    const keysDokumen = [
      "pengabdian_id",
      ...Object.keys(dataDokumen),
      "created_at",
    ];
    const valuesDokumen = [
      pengabdian_id,
      ...Object.values(dataDokumen),
      convert,
    ];
    const placeholdersDokumen = keysDokumen.map(
      (key, index) => `$${index + 1}`
    );

    // save data dokumen pengabdian
    await DB.query(
      `INSERT INTO dokumen_pengabdian(${keysDokumen.join(
        ", "
      )}) VALUES (${placeholdersDokumen.join(", ")}) returning *`,
      valuesDokumen
    );

    // ==============END DOKUMEN pengabdian===================

    if (saveDataPengabdian.rows) {
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

exports.getDataPengabdian = asyncHandler(async (req, res) => {
  const userLoginId = req.user.user_id;

  const dataPengabdian = await DB.query(
    "SELECT * FROM tb_pengabdian WHERE user_id = $1 and status = $2",
    [userLoginId, 1]
  );

  const jumlahData = await DB.query(
    "SELECT COUNT(*) FROM tb_pengabdian WHERE user_id = $1 and status = $2",
    [userLoginId, 1]
  );

  res.status(201).json({
    data: dataPengabdian.rows,
    totalData: jumlahData.rows[0].count,
  });
});

exports.detailDataPengabdian = asyncHandler(async (req, res) => {
  const { pengabdianId } = req.params;

  const findDataPengabdian = await DB.query(
    "SELECT * FROM tb_pengabdian WHERE pengabdian_id = $1",
    [pengabdianId]
  );

  const anggotaPenelitian = await DB.query(
    "SELECT anggota_pengabdian.*, tb_users.user_id, tb_users.role, tb_data_pribadi.nama_lengkap FROM anggota_pengabdian JOIN tb_users ON tb_users.user_id = anggota_pengabdian.user_id JOIN tb_data_pribadi ON tb_data_pribadi.user_id = tb_users.user_id WHERE anggota_pengabdian.pengabdian_id = $1",
    [pengabdianId]
  );

  const findDataDokumen = await DB.query(
    "SELECT * FROM dokumen_pengabdian WHERE pengabdian_id = $1",
    [pengabdianId]
  );

  res.status(201).json({
    dataPengabdian: findDataPengabdian.rows,
    anggotaPengabdian: anggotaPenelitian.rows,
    dataDokumen: findDataDokumen.rows,
  });
});

exports.editDataPengabdian = asyncHandler(async (req, res) => {
  const { pengabdianId } = req.params;
  const data = req.body;
  const file = req.file;

  const findDataPengabdian = await DB.query(
    "SELECT * FROM tb_pengabdian WHERE pengabdian_id = $1",
    [pengabdianId]
  );

  if (findDataPengabdian.rows.length) {
    // PENGABDIAN
    function filterData(data) {
      const result = {};

      for (let prop in data) {
        if (data[prop] !== undefined) {
          result[prop] = data[prop];
        }
      }

      return result;
    }

    const dataPengabdian = {
      judul_kegiatan: data.judul_kegiatan,
      kelompok_bidang: data.kelompok_bidang,
      lokasi_kegiatan: data.lokasi_kegiatan,
      lama_kegiatan: data.lama_kegiatan,
      no_sk_penugasan: data.no_sk_penugasan,
      tgl_sk_penugasan: data.tgl_sk_penugasan,
    };

    const filteredObject = filterData(dataPengabdian);

    const updated_at = unixTimestamp;
    const convert = convertDate(updated_at);

    const entries = Object.entries({ ...filteredObject, updated_at: convert });
    const setQuery = entries
      .map(([key, _], index) => `${key} = $${index + 1}`)
      .join(", ");

    await DB.query(
      `UPDATE tb_pengabdian SET ${setQuery} WHERE pengabdian_id = '${findDataPengabdian.rows[0].pengabdian_id}' `,
      entries.map(([_, value]) => value)
    );
    // END PENGABDIAN

    // ANGGOTA PENGABDIAN
    if (data.anggota_pengabdian) {
      await DB.query(
        "DELETE FROM anggota_pengabdian WHERE pengabdian_id = $1",
        [pengabdianId]
      );

      JSON.parse(data.anggota_pengabdian).forEach(async (anggota) => {
        const dataAnggota = {
          user_id: anggota.user_id,
          peran: anggota.peran,
          status: anggota.status,
        };

        const keysDataAnggota = ["pengabdian_id", ...Object.keys(dataAnggota)];
        const valuesDataAnggota = [pengabdianId, ...Object.values(dataAnggota)];
        const placeholdersDataAnggota = keysDataAnggota.map(
          (key, index) => `$${index + 1}`
        );

        await DB.query(
          `INSERT INTO anggota_pengabdian(${keysDataAnggota.join(
            ", "
          )}) VALUES (${placeholdersDataAnggota.join(", ")}) returning *`,
          valuesDataAnggota
        );
      });
    }
    // END ANGGOTA PENELITIAN

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
        "pengabdian_id",
        ...Object.keys(filteredObject),
        "file",
        "created_at",
      ];
      const values = [
        pengabdianId,
        ...Object.values(filteredObject),
        file.filename,
        convert,
      ];
      const placeholders = keys.map((key, index) => `$${index + 1}`);

      // save data
      await DB.query(
        `INSERT INTO dokumen_pengabdian(${keys.join(
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

exports.deleteDataPengabdian = asyncHandler(async (req, res) => {
  const { pengabdianId } = req.params;

  const findData = await DB.query(
    "SELECT * FROM tb_pengabdian WHERE pengabdian_id = $1",
    [pengabdianId]
  );

  if (!findData.rows.length) {
    res.status(400);
    throw new Error("Data not found.");
  }

  const findDokumen = await DB.query(
    "SELECT * FROM dokumen_pengabdian WHERE pengabdian_id = $1",
    [pengabdianId]
  );

  const dataDokumen = findDokumen.rows;
  dataDokumen.forEach(async (dok) => {
    await fs.remove(path.join(`public/dokumen-pengabdian/${dok.file}`));
  });

  await DB.query("DELETE FROM anggota_pengabdian WHERE pengabdian_id = $1", [
    pengabdianId,
  ]);
  await DB.query("DELETE FROM dokumen_pengabdian WHERE pengabdian_id = $1", [
    pengabdianId,
  ]);
  await DB.query("DELETE FROM tb_pengabdian WHERE pengabdian_id = $1", [
    pengabdianId,
  ]);

  res.status(200).json({ message: "Data deleted successfully." });
});

exports.updateStatusPengabdian = asyncHandler(async (req, res) => {
  const { pengabdianId } = req.params;
  const data = req.body;

  if (!data.status) {
    res.status(400);
    throw new Error("Pleas fill in all the required fields.");
  }

  const findData = await DB.query(
    "SELECT * FROM tb_pengabdian WHERE pengabdian_id = $1",
    [pengabdianId]
  );

  if (findData.rows.length) {
    const updated_at = unixTimestamp;
    const convert = convertDate(updated_at);
    const updateStatus = await DB.query(
      `UPDATE tb_pengabdian SET status = $1, updated_at = $2 WHERE pengabdian_id = $3`,
      [data.status, convert, pengabdianId]
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
// ====================  END PENGABDIAN ==========================

// ===================== DOKUMEN PENGABDIAN =====================
exports.addDokumenPengabdian = asyncHandler(async (req, res) => {
  const data = req.body;
  const file = req.file;

  if (!file) {
    res.status(400);
    throw new Error("Please fill in one file.");
  }

  const findDataPengabdian = await DB.query(
    "SELECT * FROM tb_pengabdian WHERE pengabdian_id = $1",
    [data.pengabdian_id]
  );
  if (!findDataPengabdian.rows.length) {
    fs.unlink(file.path, (err) => {
      if (err) {
        console.log(err);
      }
      return;
    });
    res.status(404);
    throw new Error("Data Pengabdian not found.");
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
    `INSERT INTO dokumen_pengabdian(${keys.join(
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

exports.detailDokumenPengabdian = asyncHandler(async (req, res) => {
  const { dokumenId } = req.params;

  const findDataDokumen = await DB.query(
    "SELECT * FROM dokumen_pengabdian WHERE dokumen_id = $1",
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

exports.deleteDokumenPengabdian = asyncHandler(async (req, res) => {
  const { dokumenId } = req.params;

  const findData = await DB.query(
    "SELECT * FROM dokumen_pengabdian WHERE dokumen_id = $1",
    [dokumenId]
  );

  if (!findData.rows.length) {
    res.status(400);
    throw new Error("Data not found.");
  }

  await fs.remove(
    path.join(`public/dokumen-pengabdian/${findData.rows[0].file}`)
  );
  await DB.query("DELETE FROM dokumen_pengabdian WHERE dokumen_id = $1", [
    findData.rows[0].dokumen_id,
  ]);

  res.status(200).json({ message: "Data deleted successfully." });
});

exports.editDokumenPengabdian = asyncHandler(async (req, res) => {
  const { dokumenId } = req.params;
  const file = req.file;
  const data = req.body;

  const findData = await DB.query(
    "SELECT * FROM dokumen_pengabdian WHERE dokumen_id = $1",
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
        `UPDATE dokumen_pengabdian SET ${setQuery} WHERE dokumen_id = '${findData.rows[0].dokumen_id}' `,
        entries.map(([_, value]) => value)
      );

      res.status(201).json({
        message: "Successfully update data.",
        data: saveData.rows[0],
      });
    } else {
      await fs.remove(
        path.join(`public/dokumen-pengabdian/${findData.rows[0].file}`)
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
        `UPDATE dokumen_pengabdian SET ${setQuery} WHERE pengabdian_id = '${findData.rows[0].pengabdian_id}' `,
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
// ===================== END DOKUMEN PENGABDIAN ===================
