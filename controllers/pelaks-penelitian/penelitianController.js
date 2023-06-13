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
    const file = req.file;

    if (!file) {
      res.status(400);
      throw new Error("Please fill in one file.");
    }

    if (
      !data.judul_kegiatan ||
      !data.lokasi_kegiatan ||
      !data.tahun_usulan ||
      !data.tahun_kegiatan ||
      !data.tahun_pelaksanaan ||
      !data.lama_kegiatan ||
      !data.anggota_penelitian ||
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
    // ==============PENELITIAN===================
    const penelitian = {
      judul_kegiatan: data.judul_kegiatan,
      kelompok_bidang: data.kelompok_bidang,
      lokasi_kegiatan: data.lokasi_kegiatan,
      tahun_usulan: data.tahun_usulan,
      tahun_kegiatan: data.tahun_kegiatan,
      tahun_pelaksanaan: data.tahun_kegiatan,
      lama_kegiatan: data.lama_kegiatan,
      no_sk_penugasan: data.no_sk_penugasan,
      tgl_sk_penugasan: data.tgl_sk_penugasan,
    };

    const existsNoSk = await DB.query(
      "SELECT * FROM tb_penelitian WHERE no_sk_penugasan = $1",
      [penelitian.no_sk_penugasan]
    );

    if (existsNoSk.rows.length) {
      fs.unlink(file.path, (err) => {
        if (err) {
          console.log(err);
        }
        return;
      });
      res.status(400);
      throw new Error("No SK Already Exists.");
    }

    const created_at = unixTimestamp;
    const convert = convertDate(created_at);

    const keys = ["user_id", ...Object.keys(penelitian), "created_at"];
    const values = [userLoginId, ...Object.values(penelitian), convert];
    const placeholders = keys.map((key, index) => `$${index + 1}`);

    const saveDataPenelitian = await DB.query(
      `INSERT INTO tb_penelitian(${keys.join(
        ", "
      )}) VALUES (${placeholders.join(", ")}) returning *`,
      values
    );

    // ==============END PENELITIAN===================

    // ==============ANGGOTA PENELITIAN===================
    const penelitianId = saveDataPenelitian.rows[0].penelitian_id;

    JSON.parse(data.anggota_penelitian).forEach(async (anggota) => {
      const anggotaPenelitian = {
        user_id: anggota.user_id,
        peran: anggota.peran,
        status: anggota.status,
      };

      const keysDataAnggota = [
        "penelitian_id",
        ...Object.keys(anggotaPenelitian),
      ];
      const valuesDataAnggota = [
        penelitianId,
        ...Object.values(anggotaPenelitian),
      ];
      const placeholdersDataAnggota = keysDataAnggota.map(
        (key, index) => `$${index + 1}`
      );

      await DB.query(
        `INSERT INTO anggota_penelitian(${keysDataAnggota.join(
          ", "
        )}) VALUES (${placeholdersDataAnggota.join(", ")}) returning *`,
        valuesDataAnggota
      );
    });
    // ==============END ANGGOTA PENELITIAN===================

    // ==============DOKUMEN PENELITIAN===================
    const dokumenPenelitian = {
      nama_dok: data.nama_dok,
      keterangan: data.keterangan,
      tautan_dok: data.tautan_dok,
      file: file.filename,
    };

    const keysDokumen = [
      "penelitian_id",
      ...Object.keys(dokumenPenelitian),
      "created_at",
    ];
    const valuesDokumen = [
      penelitianId,
      ...Object.values(dokumenPenelitian),
      convert,
    ];
    const placeholdersDokumen = keysDokumen.map(
      (key, index) => `$${index + 1}`
    );

    // save data dokumen penelitian
    await DB.query(
      `INSERT INTO dokumen_penelitian(${keysDokumen.join(
        ", "
      )}) VALUES (${placeholdersDokumen.join(", ")}) returning *`,
      valuesDokumen
    );

    // ==============END DOKUMEN PENELITIAN===================

    if (saveDataPenelitian.rows) {
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

  const anggotaPenelitian = await DB.query(
    "SELECT anggota_penelitian.*, tb_users.user_id, tb_users.role, tb_data_pribadi.nama_lengkap FROM anggota_penelitian JOIN tb_users ON tb_users.user_id = anggota_penelitian.user_id JOIN tb_data_pribadi ON tb_data_pribadi.user_id = tb_users.user_id WHERE anggota_penelitian.penelitian_id = $1",
    [penelitianId]
  );

  const findDataDokumen = await DB.query(
    "SELECT * FROM dokumen_penelitian WHERE penelitian_id = $1",
    [penelitianId]
  );

  res.status(201).json({
    dataPenelitian: findDataPenelitian.rows,
    anggotaPenelitian: anggotaPenelitian.rows,
    dataDokumen: findDataDokumen.rows,
  });
});

exports.editDataPenelitian = asyncHandler(async (req, res) => {
  const { penelitianId } = req.params;
  const data = req.body;
  const file = req.file;

  const findDataPenelitian = await DB.query(
    "SELECT * FROM tb_penelitian WHERE penelitian_id = $1",
    [penelitianId]
  );

  if (findDataPenelitian.rows.length) {
    // PENELITIAN
    function filterData(data) {
      const result = {};

      for (let prop in data) {
        if (data[prop] !== undefined) {
          result[prop] = data[prop];
        }
      }

      return result;
    }

    const dataPenelitian = {
      judul_kegiatan: data.judul_kegiatan,
      kelompok_bidang: data.kelompok_bidang,
      lokasi_kegiatan: data.lokasi_kegiatan,
      tahun_usulan: data.tahun_usulan,
      tahun_kegiatan: data.tahun_kegiatan,
      tahun_pelaksanaan: data.tahun_pelaksanaan,
      lama_kegiatan: data.lama_kegiatan,
      no_sk_penugasan: data.no_sk_penugasan,
      tgl_sk_penugasan: data.tgl_sk_penugasan,
    };

    const filteredObject = filterData(dataPenelitian);

    const updated_at = unixTimestamp;
    const convert = convertDate(updated_at);

    const entries = Object.entries({ ...filteredObject, updated_at: convert });
    const setQuery = entries
      .map(([key, _], index) => `${key} = $${index + 1}`)
      .join(", ");

    await DB.query(
      `UPDATE tb_penelitian SET ${setQuery} WHERE penelitian_id = '${findDataPenelitian.rows[0].penelitian_id}' `,
      entries.map(([_, value]) => value)
    );
    // END PENELITIAN

    // ANGGOTA PENELITIAN
    if (data.anggota_penelitian) {
      await DB.query(
        "DELETE FROM anggota_penelitian WHERE penelitian_id = $1",
        [penelitianId]
      );

      JSON.parse(data.anggota_penelitian).forEach(async (anggota) => {
        const anggotaPenelitian = {
          user_id: anggota.user_id,
          peran: anggota.peran,
          status: anggota.status,
        };

        const keysDataAnggota = [
          "penelitian_id",
          ...Object.keys(anggotaPenelitian),
        ];
        const valuesDataAnggota = [
          penelitianId,
          ...Object.values(anggotaPenelitian),
        ];
        const placeholdersDataAnggota = keysDataAnggota.map(
          (key, index) => `$${index + 1}`
        );

        await DB.query(
          `INSERT INTO anggota_penelitian(${keysDataAnggota.join(
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
        "penelitian_id",
        ...Object.keys(filteredObject),
        "file",
        "created_at",
      ];
      const values = [
        penelitianId,
        ...Object.values(filteredObject),
        file.filename,
        convert,
      ];
      const placeholders = keys.map((key, index) => `$${index + 1}`);

      // save data
      await DB.query(
        `INSERT INTO dokumen_penelitian(${keys.join(
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

exports.deleteDataPenelitian = asyncHandler(async (req, res) => {
  const { penelitianId } = req.params;

  const findData = await DB.query(
    "SELECT * FROM tb_penelitian WHERE penelitian_id = $1",
    [penelitianId]
  );

  if (!findData.rows.length) {
    res.status(400);
    throw new Error("Data not found.");
  }

  const findDokumen = await DB.query(
    "SELECT * FROM dokumen_penelitian WHERE penelitian_id = $1",
    [penelitianId]
  );

  const dataDokumen = findDokumen.rows;
  dataDokumen.forEach(async (dok) => {
    await fs.remove(path.join(`public/dokumen-penelitian/${dok.file}`));
  });

  await DB.query("DELETE FROM anggota_penelitian WHERE penelitian_id = $1", [
    penelitianId,
  ]);
  await DB.query("DELETE FROM dokumen_penelitian WHERE penelitian_id = $1", [
    penelitianId,
  ]);
  await DB.query("DELETE FROM tb_penelitian WHERE penelitian_id = $1", [
    penelitianId,
  ]);

  res.status(200).json({ message: "Data deleted successfully." });
});
// ===================== END PENELITIAN ==========================

// ===================== DOKUMEN PENELITIAN =====================
exports.addDokumenPenelitian = asyncHandler(async (req, res) => {
  const data = req.body;
  const file = req.file;

  if (!file) {
    res.status(400);
    throw new Error("Please fill in one file.");
  }

  const findDataPenelitian = await DB.query(
    "SELECT * FROM tb_penelitian WHERE penelitian_id = $1",
    [data.penelitian_id]
  );
  if (!findDataPenelitian.rows.length) {
    fs.unlink(file.path, (err) => {
      if (err) {
        console.log(err);
      }
      return;
    });
    res.status(404);
    throw new Error("Data Pembicara not found.");
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
  const file = req.file;
  const data = req.body;

  const findData = await DB.query(
    "SELECT * FROM dokumen_penelitian WHERE dokumen_id = $1",
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
// ===================== END DOKUMEN PENELITIAN ===================
