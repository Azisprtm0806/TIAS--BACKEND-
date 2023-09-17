const asyncHandler = require("express-async-handler");
const DB = require("../../database");

const fetchData = async (tb) => {
  const data = await DB.query(`SELECT * FROM ${tb} WHERE status = $1`, [0]);

  const jumlahData = await DB.query(
    `SELECT COUNT(*) FROM ${tb} WHERE status = $1`,
    [0]
  );

  return { data, jumlahData };
};

// =====================  KUALIFIKASI  ====================
exports.getDataRwytPekerjaanProses = asyncHandler(async (req, res) => {
  const { data, jumlahData } = await fetchData("tb_riwayat_pekerjaan");

  res.status(201).json({
    data: data.rows,
    totalData: jumlahData.rows[0].count,
  });
});

exports.getDataPendFormalProses = asyncHandler(async (req, res) => {
  const { data, jumlahData } = await fetchData("tb_pend_formal");

  res.status(201).json({
    data: data.rows,
    totalData: jumlahData.rows[0].count,
  });
});
// =====================  END KUALIFIKASI  ====================

// =====================  KOMPETESI  ====================
exports.getDataSertiProses = asyncHandler(async (req, res) => {
  const { data, jumlahData } = await fetchData("tb_sertifikasi");

  res.status(201).json({
    data: data.rows,
    totalData: jumlahData.rows[0].count,
  });
});

exports.getDataTesProses = asyncHandler(async (req, res) => {
  const { data, jumlahData } = await fetchData("tb_tes");

  res.status(201).json({
    data: data.rows,
    totalData: jumlahData.rows[0].count,
  });
});
// =====================  END KOMPETESI  ====================

// =====================  PENUNJANG =======================
exports.getDataAnggotaProfesiProses = asyncHandler(async (req, res) => {
  const { data, jumlahData } = await fetchData("tb_anggota_prof");

  res.status(201).json({
    data: data.rows,
    totalData: jumlahData.rows[0].count,
  });
});

exports.getDataPenghargaanProses = asyncHandler(async (req, res) => {
  const { data, jumlahData } = await fetchData("tb_penghargaan");

  res.status(201).json({
    data: data.rows,
    totalData: jumlahData.rows[0].count,
  });
});
// =====================  END PENUNJANG ===================

// =====================  PELAKS-PENGABDIAN ======================
exports.getDataPengabdianProses = asyncHandler(async (req, res) => {
  const { data, jumlahData } = await fetchData("tb_pengabdian");

  res.status(201).json({
    data: data.rows,
    totalData: jumlahData.rows[0].count,
  });
});

exports.getDataPembicaraProses = asyncHandler(async (req, res) => {
  const { data, jumlahData } = await fetchData("tb_pembicara");

  res.status(201).json({
    data: data.rows,
    totalData: jumlahData.rows[0].count,
  });
});
// =====================  END PELAKS-PENGABDIAN ==================

// ==================== PELAKS-PENELITIAN ========================
exports.getDataPenelitianProses = asyncHandler(async (req, res) => {
  const { data, jumlahData } = await fetchData("tb_penelitian");

  const dataPenelitina = data.rows;
  const combinedData = [];

  for (const penelitian of dataPenelitina) {
    const user_id = penelitian.user_id;

    const dataPribadi = await DB.query(
      "SELECT * FROM tb_users WHERE user_id = $1",
      [user_id]
    );

    combinedData.push({
      penelitian: penelitian,
      personalData: dataPribadi.rows,
    });
  }

  // const dataCombine = { ...data.rows, npm: npm };

  // console.log(combinedData);
  const dataGabungan = combinedData.map((item) => {
    const npm = item.personalData[0].npm;

    return {
      ...item.penelitian,
      npm: npm,
    };
  });

  res.status(201).json({
    data: dataGabungan,
    totalData: jumlahData.rows[0].count,
  });
});

exports.getDataPublikasiProses = asyncHandler(async (req, res) => {
  const { data, jumlahData } = await fetchData("tb_publikasi_karya");

  const dataPublikasi = data.rows;
  const combinedData = [];

  for (const publikasi of dataPublikasi) {
    const user_id = publikasi.user_id;

    const dataPribadi = await DB.query(
      "SELECT * FROM tb_users WHERE user_id = $1",
      [user_id]
    );

    combinedData.push({
      publikasi: publikasi,
      personalData: dataPribadi.rows,
    });
  }

  const dataGabungan = combinedData.map((item) => {
    const npm = item.personalData[0].npm;

    return {
      ...item.publikasi,
      npm: npm,
    };
  });

  res.status(201).json({
    data: dataGabungan,
    totalData: jumlahData.rows[0].count,
  });
});

exports.getDataHkiProses = asyncHandler(async (req, res) => {
  const { data, jumlahData } = await fetchData("tb_hki");

  const dataHki = data.rows;
  const combinedData = [];

  for (const hki of dataHki) {
    const user_id = hki.user_id;

    const dataPribadi = await DB.query(
      "SELECT * FROM tb_users WHERE user_id = $1",
      [user_id]
    );

    combinedData.push({
      hki: hki,
      personalData: dataPribadi.rows,
    });
  }

  const dataGabungan = combinedData.map((item) => {
    const npm = item.personalData[0].npm;

    return {
      ...item.hki,
      npm: npm,
    };
  });

  res.status(201).json({
    data: dataGabungan,
    totalData: jumlahData.rows[0].count,
  });
});
// ==================== PELAKS-PENELITIAN ========================

// =================== PELAKS-PENDIDIKAN ========================
exports.getDataIpProses = asyncHandler(async (req, res) => {
  const { data, jumlahData } = await fetchData("tb_ip_mhs");

  const dataIp = data.rows;
  const combinedData = [];

  for (const ip of dataIp) {
    const user_id = ip.user_id;

    const dataPribadi = await DB.query(
      "SELECT * FROM tb_users WHERE user_id = $1",
      [user_id]
    );

    combinedData.push({
      ip: ip,
      personalData: dataPribadi.rows,
    });
  }

  // const dataCombine = { ...data.rows, npm: npm };

  // console.log(combinedData);
  const dataGabungan = combinedData.map((item) => {
    const npm = item.personalData[0].npm;

    return {
      ...item.ip,
      npm: npm,
    };
  });

  res.status(201).json({
    data: dataGabungan,
    totalData: jumlahData.rows[0].count,
  });
});
