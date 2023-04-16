CREATE DATABASE db_SmartKampus

CREATE TYPE jenis_kelamin AS ENUM ('L','P');

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TABLE role(
	role_id uuid NOT NULL DEFAULT uuid_generate_v4() PRIMARY KEY,
 	nama_role varchar(50) UNIQUE NOT NULL
)

CREATE TABLE tb_users (
	user_id uuid DEFAULT uuid_generate_v4 () PRIMARY KEY NOT NULL,
	role varchar(50) NOT NULL,
	username varchar(255) NOT NULL UNIQUE,
	email varchar(100) NOT NULL UNIQUE,
	NIDN CHAR (10) UNIQUE ,
	NPM CHAR (12) UNIQUE ,
	password varchar(255) NOT NULL,
	isverified BOOLEAN NOT NULL DEFAULT false,
  user_agent varchar[] DEFAULT array[]::varchar[], 
	created_at TIMESTAMP NOT NULL DEFAULT current_date,
  updated_at TIMESTAMP,
	deleted_at TIMESTAMP 
);

create table token(
  token_id uuid NOT NULL DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id uuid NOT NULL,
  verif_token varchar(255) UNIQUE,
  reset_token varchar(255) UNIQUE,
  login_token varchar(255) UNIQUE,
  created_at TIMESTAMP NOT NULL,
  expires_at TIMESTAMP NOT NULL,
  CONSTRAINT fk_user FOREIGN KEY(user_id) REFERENCES tb_users(user_id)
);

CREATE TABLE tb_data_pribadi (
	dp_id uuid DEFAULT uuid_generate_v4 () PRIMARY KEY,
	user_id uuid UNIQUE NOT NULL, CONSTRAINT fk_tb_dataPribadi FOREIGN KEY (user_id) REFERENCES tb_users (user_id),
	nama_lengkap varchar(255) NOT NULL,
	jenkel jenis_kelamin NOT NULL,
	tanggal_lahir DATE NOT NULL ,
	tempat_lahir varchar(255) NOT NULL,
	ibu_kandung varchar(255) NOT NULL,
	image varchar(255) DEFAULT 'https://i.ibb.co/4pDNDk1/avatar.png',
	NIK CHAR(16) UNIQUE NOT NULL,
	agama varchar(25) NOT NULL,
	warga_negara varchar(100) NOT NULL,
	email varchar(255) UNIQUE NOT NULL,
	alamat varchar(100) NOT NULL,
	RT varchar(25) NOT NULL,
	RW varchar(25) NOT NULL,
	desa_kelurahan varchar(100) NOT NULL,
	kota_kabupaten varchar(100) NOT NULL,
	provinsi varchar(100) NOT NULL,
	kode_pos CHAR(5) NOT NULL,
	no_hp varchar(13) NOT NULL,
	status_kawin varchar(100) NOT NULL,
	nama_pasangan varchar(100),
	nip_pasangan CHAR(18),
	pekerjaan_pasangan varchar(255),
	tanggal_pns_pasangan DATE,
	status INT DEFAULT 0,
	created_at TIMESTAMP,
	updated_at TIMESTAMP,
	deleted_at TIMESTAMP
);
 
CREATE TABLE tb_dokumen_pribadi (
	dokPribadi_id uuid DEFAULT uuid_generate_v4 () PRIMARY KEY,
	user_id uuid NOT NULL, CONSTRAINT fk_dokumen_pribadi FOREIGN KEY (user_id) REFERENCES tb_users (user_id),
	nama_dok varchar(255) NOT NULL,
	jenis_dok varchar(255) NOT NULL,
	file_dok varchar(255) NOT NULL,
	status INT DEFAULT 0,
	created_at TIMESTAMP,
	updated_at TIMESTAMP,
	deleted_at TIMESTAMP
);

CREATE TABLE tb_jabatan_dosen (
	jabatan_id uuid DEFAULT uuid_generate_v4 () PRIMARY KEY NOT NULL,
	user_id uuid NOT NULL,CONSTRAINT fk_tb_jabatanDosen FOREIGN KEY (user_id) REFERENCES tb_users (user_id),
	jabatan_fungsi varchar(255) NOT NULL,
	nomor_sk  varchar(255) UNIQUE NOT NULL,
	tgl_mulai DATE NOT NULL,
	kel_penelitian FLOAT,
	kel_pengab_msyrkt FLOAT,
	kel_keg_penunjang FLOAT,                              
	file_jabatan varchar(100),
	status INT DEFAULT 0,
	created_at TIMESTAMP,
	updated_at TIMESTAMP,
	deleted_at TIMESTAMP
);

CREATE TABLE tb_kepangkatanDosen (
	pangkat_id uuid DEFAULT uuid_generate_v4 () PRIMARY KEY NOT NULL,
	user_id uuid NOT NULL,CONSTRAINT fk_tbkepangkatan FOREIGN KEY (user_id) REFERENCES tb_users (user_id),
	gol_pangkat varchar(255) NOT NULL,
	nomor_sk varchar(255) NOT NULL,
	tgl_sk DATE NOT NULL,
	tgl_mulai DATE NOT NULL,
	masa_kerja_tahun INT,
	masa_kerja_bulan INT,
	status INT DEFAULT 0,
	file varchar(255) NOT NULL,
	created_at TIMESTAMP,
	updated_at TIMESTAMP,
	deleted_at TIMESTAMP
);

CREATE TABLE tb_sertifikat (
	sertifikat_id uuid DEFAULT uuid_generate_v4 () PRIMARY KEY,
	user_id uuid NOT NULL, CONSTRAINT fk_tb_sertifikat FOREIGN KEY (user_id) REFERENCES tb_users (user_id),
	dokumen_id uuid, CONSTRAINT fk_tb_dokumen FOREIGN KEY (dokumen_id) REFERENCES tb_dokumen (dokumen_id),
	jenis_sertif varchar(255) NOT NULL,
	bidang_studi varchar(255) NOT NULL,
	nomor_sk varchar(255) NOT NULL,
	penyelenggara varchar(255) NOT NULL,
	tgl_sertif DATE NOT NULL,
	created_at TIMESTAMP,
	updated_at TIMESTAMP,
	deleted_at TIMESTAMP
);

CREATE TABLE tb_tes(
	tes_id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
	user_id uuid NOT NULL, CONSTRAINT fk_tb_tes FOREIGN KEY (user_id) REFERENCES tb_users (user_id),
	nama_tes varchar(255) NOT NULL,
	jenis_tes varchar(255)NOT NULL,
	penyelenggara varchar(255) NOT NULL,
	tgl_tes DATE NOT NULL,
	skor_tes varchar(255) NOT NULL,
	file varchar(255) NOT NULL,
	created_at TIMESTAMP,
	updated_at TIMESTAMP,
	deleted_at TIMESTAMP

);


CREATE TABLE tb_dokumen (
	dokumen_id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
	jenis_dok varchar(255) NOT NULL,
	nama_dok varchar(255) NOT NULL,
	jenis_file varchar(255) NOT NULL,
	nama_file varchar(255) NOT NULL,
	keterangan varchar(255) NOT NULL,
	file varchar(255) NOT NULL,
	created_at TIMESTAMP,
	updated_at TIMESTAMP,
	deleted_at TIMESTAMP
)


---- ALL DONE -----

CREATE TABLE tb_dosen (
	dosen_id uuid DEFAULT uuid_generate_v4 () PRIMARY KEY NOT NULL,
	user_id uuid NOT NULL, CONSTRAINT fk_tb_dosen FOREIGN KEY (user_id) REFERENCES tb_users (user_id),
	namaDosen varchar(100) NOT NULL,
	created_at TIMESTAMPTZ NOT NULL DEFAULT current_date,
	updated_at TIMESTAMP,
	deleted_at TIMESTAMP
)

CREATE TABLE tb_mhs (
	mhs_id uuid DEFAULT uuid_generate_v4 () PRIMARY KEY NOT NULL,
	user_id uuid NOT NULL, CONSTRAINT fk_tb_mhs FOREIGN KEY (user_id) REFERENCES tb_userS (user_id),
	namaMhs varchar(100) NOT NULL,
	created_at TIMESTAMPTZ NOT NULL DEFAULT current_date,
	updated_at TIMESTAMP,
	deleted_at TIMESTAMP
)

 CREATE TABLE tb_pendidikanFormal (
	pendFormal_id uuid DEFAULT uuid_generate_v4 () PRIMARY KEY,
	user_id uuid NOT NULL, CONSTRAINT fk_tb_pendidikanFormal FOREIGN KEY (user_id) REFERENCES tb_users (user_id),
	programStudi varchar(25) NOT NULL,
	gelarAkademik varchar(25),
	tahunMasuk INT,
	tahunLulus INT,
	nomorInduk CHAR (25) UNIQUE,
	jmlhSmstrTmph INT,
	jmlhSks INT,
	ipkLulus FLOAT (4),
	noIjazah varchar(25) UNIQUE,
	judulTesis varchar(225),
	filepend varchar,
	validasi varchar,
	created_at TIMESTAMPTZ NOT NULL DEFAULT current_date,
	updated_at TIMESTAMP,
	deleted_at TIMESTAMP
)

CREATE TABLE tb_riwayatPekerjaan (
	pangkat_id uuid DEFAULT uuid_generate_v4 () PRIMARY KEY NOT NULL,
	user_id uuid NOT NULL, CONSTRAINT fk_tb_riwayatPendidikan FOREIGN KEY (user_id) REFERENCES tb_users (user_id),
	dokumen_id uuid NOT NULL, CONSTRAINT fk_tb_riwayatpekerjaan FOREIGN KEY (dokumen_id) REFERENCES tb_dokumen (dokumen_id),
	bidangUsaha varchar(25) NOT NULL,
	jenisPekerjaan varchar(25) NOT NULL,
	jabatan varchar(25),
	namaInstansi varchar(50) NOT NULL,
	divisi varchar(25),
	deskripsiKerja TEXT,
	mulaiKerja DATE,
	selesaiKerja DATE,
	areaKerja VARCHAR (25),
	pendapatan FLOAT,
	filerp VARCHAR,
	validasi varchar,
	created_at TIMESTAMPTZ NOT NULL DEFAULT current_date,
	updated_at TIMESTAMP,
	deleted_at TIMESTAMP
)

CREATE TABLE tb_dataPribadi (
	dataPribadi_id uuid DEFAULT uuid_generate_v4 () PRIMARY KEY NOT NULL,
	user_id uuid, CONSTRAINT fk_tb_dataPribadi FOREIGN KEY (user_id) REFERENCES tb_users (user_id),
	NIK CHAR (16) UNIQUE,
	agama varchar(25) NOT NULL,
	wargaNegara varchar(25) NOT NULL,
	emaildp varchar(100) NOT NULL UNIQUE,
	alamat varchar(100) NOT NULL,
	RT INT NOT NULL,
	RW INT NOT NULL,
	desaKelurahan varchar(25) NOT NULL,
	kotaKabupaten varchar(25) NOT NULL,
	provinsi varchar(25) NOT NULL,
	kodePos INT NOT NULL,
	noHP CHAR (13) UNIQUE,
	created_at TIMESTAMPTZ NOT NULL DEFAULT current_date,
	updated_at TIMESTAMP,
	deleted_at TIMESTAMP
)

CREATE TABLE tb_sertifikat (
	sertifikat_id uuid DEFAULT uuid_generate_v4 () PRIMARY KEY NOT NULL,
	user_id uuid NOT NULL, CONSTRAINT fk_tb_sertifikat FOREIGN KEY (user_id) REFERENCES tb_users (user_id),
	dokumen_id uuid NOT NULL, CONSTRAINT fk_tbsertifikat FOREIGN KEY (dokumen_id) REFERENCES tb_dokumen (dokumen_id),
	jenisSertif varchar(25),
	namaSertif varchar(100),
	bidangstudisertif varchar (100),
	nosksertifikasi varchar (50),
	tglSertif DATE,
	filesertif VARCHAR,
	validasi varchar,
	created_at TIMESTAMPTZ NOT NULL DEFAULT current_date,
	updated_at TIMESTAMP,
	deleted_at TIMESTAMP
)

CREATE TABLE tb_test (
	test_id uuid DEFAULT uuid_generate_v4 () PRIMARY KEY NOT NULL,
	user_id uuid NOT NULL, CONSTRAINT fk_tbtest FOREIGN KEY (user_id) REFERENCES tb_users (user_id),
	dokumen_id uuid NOT NULL, CONSTRAINT fk_tb_test FOREIGN KEY (dokumen_id) REFERENCES tb_dokumen (dokumen_id),
	jenisTest varchar(25),
	namaTest varchar(100),
	penyelenggara varchar(100),
	tglSertif DATE,
	skorTest FLOAT,
	filetest VARCHAR,
	validasi varchar,
	created_at TIMESTAMPTZ NOT NULL DEFAULT current_date,
	updated_at TIMESTAMP,
	deleted_at TIMESTAMP
)

CREATE TABLE tb_ip(
	ip_id uuid DEFAULT uuid_generate_v4 () PRIMARY KEY NOT NULL,
	mhs_id uuid NOT NULL, CONSTRAINT fk_tbip FOREIGN KEY (mhs_id) REFERENCES tb_mhs (mhs_id),
	kelasIp varchar (10) NOT NULL ,
	ipsemester1 FLOAT,
	ipsemester2 FLOAT,
	ipsemester3 FLOAT,
	ipsemester4 FLOAT,
	ipsemester5 FLOAT,
	ipsemester6 FLOAT,
	ipsemester7 FLOAT,
	ipsemester8 FLOAT,
	created_at TIMESTAMPTZ NOT NULL DEFAULT current_date,
	updated_at TIMESTAMP,
	deleted_at TIMESTAMP
)

CREATE TABLE tb_dokumen (
	dokumen_id uuid DEFAULT uuid_generate_v4 () PRIMARY KEY NOT NULL,
	user_id uuid NOT NULL DEFAULT uuid_generate_v4 (), CONSTRAINT fk_tb_dokumen FOREIGN KEY (user_id) REFERENCES tb_users (user_id),
	namaDokumen varchar(100),
	jenisDokumen varchar(100),
	namaFile varchar(100),
	keterangan TEXT,
	jenisFile varchar(100),
	tglUpload DATE,
	lamanTautan varchar(100),
	filedok varchar,
	validasi varchar,
	created_at TIMESTAMPTZ NOT NULL DEFAULT current_date,
	updated_at TIMESTAMP,
	deleted_at TIMESTAMP
)

CREATE TABLE tb_anggota (
	anggota_id uuid DEFAULT uuid_generate_v4 () PRIMARY KEY NOT NULL,
	user_id uuid NOT NULL, CONSTRAINT fk_tb_anggota FOREIGN KEY (user_id) REFERENCES tb_users (user_id),
	urutanAnggota INT,
	afiliasi TEXT,
	peranAnggota varchar(25),
	created_at TIMESTAMPTZ NOT NULL DEFAULT current_date,
	updated_at TIMESTAMP,
	deleted_at TIMESTAMP
)

CREATE TABLE tb_pengabdian (
	pengabdian_id uuid DEFAULT uuid_generate_v4 () PRIMARY KEY NOT NULL,
	user_id uuid NOT NULL, CONSTRAINT fk_tbpengabdian FOREIGN KEY (user_id) REFERENCES tb_users (user_id),
	anggota_id uuid NOT NULL, CONSTRAINT fk_tblpengabdian FOREIGN KEY (anggota_id) REFERENCES tb_anggota (anggota_id),
	dokumen_id uuid NOT NULL, CONSTRAINT fk_tb_pengabdian FOREIGN KEY (dokumen_id) REFERENCES tb_dokumen (dokumen_id),
	Kegiatanpengabdian varchar(200),
	judulKegiatan varchar(200) NOT NULL,
	afisialisasipengabdian varchar(100) NOT NULL,
	kelBidang varchar(50),
	lokasiKegiatan varchar(200),
	lamaKegiatan varchar(200) NOT NULL,
	noSkPenugasan varchar(200) NOT NULL,
	tglSkPenugasan DATE NOT NULL,
	created_at TIMESTAMPTZ NOT NULL DEFAULT current_date,
	updated_at TIMESTAMP,
	deleted_at TIMESTAMP
)

CREATE TABLE tb_pembicara (
	pembicara_id uuid DEFAULT uuid_generate_v4 () PRIMARY KEY NOT NULL,
	user_id uuid NOT NULL, CONSTRAINT fk_tbpembicara FOREIGN KEY (user_id) REFERENCES tb_users (user_id),
	dokumen_id uuid NOT NULL, CONSTRAINT fk_tb_pembicara FOREIGN KEY (dokumen_id) REFERENCES tb_dokumen (dokumen_id),
	kegiatanPembicara varchar(100),
	kategoriPembicara varchar(100),
	judulMakalah varchar(100) NOT NULL,
	namaPertemuanIlmiah varchar(100) NOT NULL,
	tingkatPertemuan varchar(25),
	penyelenggara varchar(100),
	tglPelaksanaan DATE NOT NULL,
	created_at TIMESTAMPTZ NOT NULL DEFAULT current_date,
	updated_at TIMESTAMP,
	deleted_at TIMESTAMP
)

CREATE TABLE tb_penulis (
	penulis_id uuid DEFAULT uuid_generate_v4 () PRIMARY KEY NOT NULL,
	user_id uuid NOT NULL, CONSTRAINT fk_tbpenulis FOREIGN KEY (user_id) REFERENCES tb_users (user_id),
	urutanPenulis INT,
	afiliasiPenulis TEXT,
	peranPenulis varchar(25),
	created_at TIMESTAMPTZ NOT NULL DEFAULT current_date,
	updated_at TIMESTAMP,
	deleted_at TIMESTAMP
)

CREATE TABLE tb_HKI (
	hki_id uuid DEFAULT uuid_generate_v4 () PRIMARY KEY NOT NULL,
	user_id uuid NOT NULL, CONSTRAINT fk_tbHKI FOREIGN KEY (user_id) REFERENCES tb_users (user_id),
	penulis_id uuid NOT NULL, CONSTRAINT fk_tb_HKI FOREIGN KEY (penulis_id) REFERENCES tb_penulis (penulis_id),
	dokumen_id uuid NOT NULL, CONSTRAINT fk_tbLhki FOREIGN KEY (dokumen_id) REFERENCES tb_dokumen (dokumen_id),
	kategorikegiatanHKI varchar(200) ,
	jenisHki varchar (200),
	kategoriCapaianHki varchar (200),
	judulHki varchar (255) NOT NULL,
	tanggalterbitHki DATE,
	keterangan TEXT,
	created_at TIMESTAMPTZ NOT NULL DEFAULT current_date,
	updated_at TIMESTAMP,
	deleted_at TIMESTAMP
)

CREATE TABLE tb_anggotaProfesi (
	anggotaProf_id uuid DEFAULT uuid_generate_v4 () PRIMARY KEY NOT NULL,
	user_id uuid NOT NULL, CONSTRAINT fk_tbanggotaprof FOREIGN KEY (user_id) REFERENCES tb_users (user_id),
	dokumen_id uuid NOT NULL, CONSTRAINT fk_tb_anggotaprofesi FOREIGN KEY (dokumen_id) REFERENCES tb_dokumen (dokumen_id),
	kegiatanProf varchar(200),
	namaOrganisasi varchar(50),
	peranOrganisasi varchar(25),
	mulaiKeanggotaan DATE,
	selesaiKeanggotaan DATE,
	instansiProf varchar(100),
	fileProf varchar,
	validasi varchar,
	created_at TIMESTAMPTZ NOT NULL DEFAULT current_date,
	updated_at TIMESTAMP,
	deleted_at TIMESTAMP
)

CREATE TABLE tb_penghargaan (
	penghargaan_id uuid DEFAULT uuid_generate_v4 () PRIMARY KEY NOT NULL,
	user_id uuid NOT NULL, CONSTRAINT fk_tbpenghargaan FOREIGN KEY (user_id) REFERENCES tb_users (user_id),
	kegiatanPenghargaan varchar(100),
	tingkatPenghargaan varchar(100) NOT NULL,
	jenisPenghargaan varchar(100) NOT NULL,
	namaPenghargaan varchar(100) NOT NULL,
	tahunpenghargaan INT NOT NULL,
	instansiPemberi varchar(100),
	filePenghargaan varchar,
	validasi varchar,
	created_at TIMESTAMPTZ NOT NULL DEFAULT current_date,
	updated_at TIMESTAMP,
	deleted_at TIMESTAMP
)

CREATE TABLE tb_dokumenPribadi (
	dokumenPribadi_id uuid DEFAULT uuid_generate_v4 () PRIMARY KEY NOT NULL,
	user_id uuid NOT NULL, CONSTRAINT fk_dokumenPribadi FOREIGN KEY (user_id) REFERENCES tb_users (user_id),
	nmDokumen varchar(100) NOT NULL,
	jnsDokumen varchar(100),
	fileDokpribadi varchar,
	validasi varchar,
	created_at TIMESTAMPTZ NOT NULL DEFAULT current_date,
	updated_at TIMESTAMP,
	deleted_at TIMESTAMP
)

CREATE TABLE tb_tgsTambahanDosen (
	tugastambahan_id uuid DEFAULT uuid_generate_v4 () PRIMARY KEY NOT NULL,
	user_id uuid NOT NULL, CONSTRAINT fk_tgstambahan FOREIGN KEY (user_id) REFERENCES tb_users (user_id),
	dokumen_id uuid NOT NULL, CONSTRAINT fk_tb_tgstambahan FOREIGN KEY (dokumen_id) REFERENCES tb_dokumen (dokumen_id),
	kegiatandosen varchar(100) NOT NULL,
	jenisTugas varchar(100) NOT NULL,
	perguruanTinggi varchar(100) NOT NULL,
	unitKerja varchar(100) NOT NULL,
	noSKpenugasan varchar(100) NOT NULL,
	tglmulaitugas DATE NOT NULL,
	tglakhirtugas DATE NOT NULL,
	filetgs varchar,
	validasi varchar,
	created_at TIMESTAMPTZ NOT NULL DEFAULT current_date,
	updated_at TIMESTAMP,
	deleted_at TIMESTAMP
)

CREATE TABLE tb_bhnAjarDosen (
	bahanAjar_id uuid DEFAULT uuid_generate_v4 () PRIMARY KEY NOT NULL,
	user_id uuid NOT NULL, CONSTRAINT fk_tbbhnAjarDosen FOREIGN KEY (user_id) REFERENCES tb_users (user_id),
	dokumen_id uuid NOT NULL, CONSTRAINT fk_tb_bhnajar_dosen FOREIGN KEY (dokumen_id) REFERENCES tb_dokumen (dokumen_id),
	penulis_id uuid, CONSTRAINT fk_tb_bhnAjarDosen FOREIGN KEY (penulis_id) REFERENCES tb_penulis (penulis_id),
	jenisBhnAjar varchar(100) NOT NULL,
	judulBhnAjar varchar(100) NOT NULL,
	tglTerbit DATE,
	penerbit varchar(100),
	filepenerbit varchar,
	validasi varchar,
	created_at TIMESTAMPTZ NOT NULL DEFAULT current_date,
	updated_at TIMESTAMP,
	deleted_at TIMESTAMP
)

CREATE TABLE tb_tugasakhirmhsdsn (
	pengujian_id uuid DEFAULT uuid_generate_v4 () PRIMARY KEY NOT NULL,
	user_id uuid NOT NULL, CONSTRAINT fk_pengujianMHSDSN FOREIGN KEY (user_id) REFERENCES tb_users (user_id),
	dosen_id uuid NOT NULL, CONSTRAINT fk_tbpengujianMHSDSN FOREIGN KEY (dosen_id) REFERENCES tb_dosen (dosen_id),
	mhs_id uuid NOT NULL, CONSTRAINT fk_tb_pengujianMHSDSN FOREIGN KEY (mhs_id) REFERENCES tb_mhs (mhs_id),
	semester INT,
	judulPengujian varchar(225) NOT NULL,
	jenisBimbingan varchar(225),
	keteranganAktivitas varchar (100),
	programStudi varchar(100) NOT NULL,
	noSKPenugasan varchar(100),
	tgalPenugasan DATE,
	lokasiKegiatan varchar(100),
	created_at TIMESTAMPTZ NOT NULL DEFAULT current_date,
	updated_at TIMESTAMP,
	deleted_at TIMESTAMP
)

CREATE TABLE tb_bimbinganMHSDSN (
	bimbingan_id uuid DEFAULT uuid_generate_v4 () PRIMARY KEY NOT NULL,
	user_id uuid NOT NULL, CONSTRAINT fk_bimbinganMHSDSN FOREIGN KEY (user_id) REFERENCES tb_users (user_id),
	dosen_id uuid NOT NULL, CONSTRAINT fk_tbbimbinganMHSDSN FOREIGN KEY (dosen_id) REFERENCES tb_dosen (dosen_id),
	mhs_id uuid NOT NULL, CONSTRAINT fk_tb_bimbinganMHSDSN FOREIGN KEY (mhs_id) REFERENCES tb_mhs (mhs_id),
	semesterbim varchar (25),
	judulbim varchar(255) NOT NULL,
	jenisbim varchar(100) NOT NULL,
	programStudibim varchar(50) NOT NULL,
	noSKPenugasanbim varchar(25),
	tgalPenugasanbim DATE NOT NULL,
	lokasiKegiatanbim varchar(100) NOT NULL,
	created_at TIMESTAMPTZ NOT NULL DEFAULT current_date,
	updated_at TIMESTAMP,
	deleted_at TIMESTAMP
)

CREATE TABLE tb_pengajaranDosen(
	pengajaran_id uuid DEFAULT uuid_generate_v4 () PRIMARY KEY NOT NULL,
	user_id uuid NOT NULL,CONSTRAINT fk_tbpengajaranDosen FOREIGN KEY (user_id) REFERENCES tb_users (user_id),
	namaMatkul varchar(100) NOT NULL,
	jenisMatkul varchar(50) NOT NULL,
	bidangKeilmuan varchar(255) NOT NULL,
	kelas varchar(25)NOT NULL,
	jmlhMhs INT,
	SKS FLOAT NOT NULL,
	created_at TIMESTAMPTZ NOT NULL DEFAULT current_date,
	updated_at TIMESTAMP,
	deleted_at TIMESTAMP
)

CREATE TABLE tb_penelitianDosen (
	penelitianDsn_id uuid DEFAULT uuid_generate_v4 () PRIMARY KEY NOT NULL,
	user_id uuid NOT NULL, CONSTRAINT fk_tb_penelitian_dosen FOREIGN KEY (user_id) REFERENCES tb_users (user_id),
	dokumen_id uuid NOT NULL, CONSTRAINT fk_tb_penelitiandosen FOREIGN KEY (dokumen_id)REFERENCES tb_dokumen (dokumen_id),
	anggota_id uuid NOT NULL, CONSTRAINT fk_tb_penelitiann_dosen FOREIGN KEY (anggota_id)REFERENCES tb_anggota(anggota_id),
	kegiatanPenelitian varchar(100),
	judulKegiatanpnlt varchar(255) NOT NULL,
	afisialisasipnlt varchar(100) NOT NULL,
	kelBidang varchar(100),
	lokasiKegiatanpnlt varchar(255),
	lamaKegiatanpnlt varchar(20),
	nomorSKpenugasanpnlt varchar(100),
	tglSkPenugasanpnlt DATE,
	created_at TIMESTAMPTZ NOT NULL DEFAULT current_date,
	updated_at TIMESTAMP,
	deleted_at TIMESTAMP
)

CREATE TABLE tb_publikasiKarya_dosen(
	publikasi_id uuid DEFAULT uuid_generate_v4 () PRIMARY KEY NOT NULL,
	user_id uuid NOT NULL,CONSTRAINT fk_tb_publikasiKarya_dosen FOREIGN KEY (user_id) REFERENCES tb_users (user_id),
	penulis_id uuid NOT NULL ,CONSTRAINT fk_tb_publikasiKaryadosen FOREIGN KEY (penulis_id) REFERENCES tb_penulis (penulis_id),
	dokumen_id uuid NOT NULL , CONSTRAINT fk_tb_publikasi_Karyadosen FOREIGN KEY (dokumen_id) REFERENCES tb_dokumen(dokumen_id),
	kategoriKegiatanpublis varchar(255),
	judulArtikel varchar(255) NOT NULL,
	jenispublis varchar(100) NOT NULL,
	kategoriCapaianpublis CHARACTER VARYING(100),
	namaJurnal varchar(100) NOT NULL,
	tautanJurnal varchar(100),
	tglTerbitpublis DATE,
	penerbitjrnal varchar(100),
	tautanEksternal varchar(255),
	keterangan TEXT,
	created_at TIMESTAMPTZ NOT NULL DEFAULT current_date,
	updated_at TIMESTAMP,
	deleted_at TIMESTAMP
)

CREATE TABLE tb_keluargaMhs (
	keluargaMhs_id uuid DEFAULT uuid_generate_v4 () PRIMARY KEY NOT NULL,
	user_id uuid NOT NULL,CONSTRAINT fk_keluargaMhs FOREIGN KEY (user_id) REFERENCES tb_users (user_id),
	statusKawin varchar(20),
	namaIbuKandung varchar(100) NOT NULL,
	namaAyahKandung varchar(100) NOT NULL,
	created_at TIMESTAMPTZ NOT NULL DEFAULT current_date,
	updated_at TIMESTAMP,
	deleted_at TIMESTAMP
)

CREATE TABLE tb_pembelajaranMhs (
	pengajaran_id uuid DEFAULT uuid_generate_v4 () PRIMARY KEY NOT NULL,
	user_id uuid NOT NULL,CONSTRAINT fk_pengajaranMhs FOREIGN KEY (user_id) REFERENCES tb_users (user_id),
	kodeMatkul varchar(20) NOT NULL,
	nmMatkul varchar(100) NOT NULL,
	kelas varchar(10),
	nilai CHAR NOT NULL,
	totalSks INT NOT NULL,
	semester INT,
	created_at TIMESTAMPTZ NOT NULL DEFAULT current_date,
	updated_at TIMESTAMP,
	deleted_at TIMESTAMP
)

CREATE TABLE tb_penelitianMhs (
	penelitian_id uuid DEFAULT uuid_generate_v4 () PRIMARY KEY NOT NULL,
	user_id uuid NOT NULL , CONSTRAINT fk_tb_penelitianMhs FOREIGN KEY (user_id) REFERENCES tb_users (user_id),
	anggota_id uuid NOT NULL, CONSTRAINT fk_penelitianMhs FOREIGN KEY (anggota_id)REFERENCES tb_anggota(anggota_id),
	dokumen_id uuid NOT NULL, CONSTRAINT fk_tbpenelitianMhs FOREIGN KEY (dokumen_id)REFERENCES tb_dokumen (dokumen_id),
	kegiatanPenelitiMhs varchar(100),
	judulKegiatanpm varchar(255) NOT NULL,
	lokasiKegiatanpm CHARACTER VARYING(255),
	tglSkpm DATE,
	dosPem_satu varchar(50),
	dosPem_dua varchar(50),
	created_at TIMESTAMPTZ NOT NULL DEFAULT current_date,
	updated_at TIMESTAMP,
	deleted_at TIMESTAMP
)

CREATE TABLE tb_publikasiKarya_Mhs (
	publikasiMhs_id uuid DEFAULT uuid_generate_v4 () PRIMARY KEY NOT NULL,
	user_id uuid NOT NULL ,CONSTRAINT fk_tb_publikasiKarya_Mhs FOREIGN KEY (user_id) REFERENCES tb_users (user_id),
	penulis_id uuid NOT NULL,CONSTRAINT fk_tb_publikasiKaryaMhs FOREIGN KEY (penulis_id) REFERENCES tb_penulis (penulis_id),
	dokumen_id uuid NOT NULL, CONSTRAINT fk_tb_publikasi_KaryaMhs FOREIGN KEY (dokumen_id) REFERENCES tb_dokumen(dokumen_id),
	kategoriKegiatanpm varchar(255),
	judulArtikelpm varchar(255) NOT NULL,
	jenispublispm varchar(100) NOT NULL,
	kategoriCapaianpublispm VARCHAR (100),
	tglTerbitpublispm DATE,
	penerbitjrnlapm varchar(100),
	tautanEksternalpm varchar(255),
	keteranganpm TEXT,
	created_at TIMESTAMPTZ NOT NULL DEFAULT current_date,
	updated_at TIMESTAMP,
	deleted_at TIMESTAMP
)