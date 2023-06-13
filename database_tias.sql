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
	RT INT NOT NULL,
	RW INT NOT NULL,
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
	file varchar(255) NOT NULL,
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
	file varchar(100),
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

CREATE TABLE tb_sertifikasi (
	sertifikat_id uuid DEFAULT uuid_generate_v4 () PRIMARY KEY,
	user_id uuid NOT NULL, CONSTRAINT fk_tb_sertifikasi FOREIGN KEY (user_id) REFERENCES tb_users (user_id),
	jenis_serti varchar(255) NOT NULL,
	nama_serti varchar(255) NOT NULL,
	bidang_studi varchar(255) NOT NULL,
	nomor_sk varchar(255) NOT NULL,
	tgl_serti DATE NOT NULL,
	nomor_peserta varchar(255),
	nomor_regist varchar(255),
	status INT DEFAULT 0,
	file varchar(255) NOT NULL,
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
	status INT DEFAULT 0,
	file varchar(255) NOT NULL,
	created_at TIMESTAMP,
	updated_at TIMESTAMP,
	deleted_at TIMESTAMP
);

CREATE TYPE area_Kerja AS ENUM ('Dalam Negri','Luar Negri');

CREATE TABLE tb_riwayat_pekerjaan (
	rwyt_pekerjaan_id uuid DEFAULT uuid_generate_v4 () PRIMARY KEY NOT NULL,
	user_id uuid NOT NULL, CONSTRAINT fk_tb_riwayatPendidikan FOREIGN KEY (user_id) REFERENCES tb_users (user_id),
	bidang_usaha varchar(25) NOT NULL,
	jenis_pekerjaan varchar(25) NOT NULL,
	jabatan varchar(25) NOT NULL,
	nama_instansi varchar(50) NOT NULL,
	divisi varchar(25),
	deskripsi TEXT,
	mulai_Kerja DATE NOT NULL,
	selesai_Kerja DATE,
	area_Kerja VARCHAR (25),
	pendapatan NUMERIC(20, 2) NOT NULL,
	file VARCHAR(255) NOT NULL,
	status INT DEFAULT 0,
	created_at TIMESTAMP,
	updated_at TIMESTAMP,
	deleted_at TIMESTAMP
);

CREATE TABLE tb_pend_formal (
	pend_id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
	user_id uuid NOT NULL, CONSTRAINT fk_tb_pendidikanFormal FOREIGN KEY(user_id) REFERENCES tb_users (user_id),
	asal varchar(255) NOT NULL,
	jenjang_studi varchar(255) NOT NULL,
	program_studi varchar(25),
	gelar_akademik varchar(25),
	tahun_masuk INT NOT NULL,
	tahun_lulus INT NOT NULL,
	tgl_lulus date,
	nomor_induk varchar(255) UNIQUE,
	jmlh_semester INT,
	jmlh_sks INT,
	ipk_lulus FLOAT(4),
	no_sk_penyetaraan varchar(255) UNIQUE,
	tgl_sk_penyetaraan varchar(255),
	no_ijazah varchar(255) UNIQUE,
	judul_tesis varchar(255),
	file VARCHAR(255) NOT NULL,
	status INT DEFAULT 0,
	created_at TIMESTAMP,
	updated_at TIMESTAMP,
	deleted_at TIMESTAMP
)


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

CREATE TABLE tb_anggota_prof (
	prof_id uuid DEFAULT uuid_generate_v4 () PRIMARY KEY NOT NULL,
	user_id uuid NOT NULL, CONSTRAINT fk_tb_prof FOREIGN KEY (user_id) REFERENCES tb_users (user_id),
	nama_organisasi varchar(255) NOT NULL,
	peran varchar(255) NOT NULL,
	mulai_keanggotaan DATE NOT NULL,
	selesai_keanggotaan DATE,
	instansi_prof varchar(255),
	file varchar(255),
	status INT DEFAULT 0,
	created_at TIMESTAMP,
	updated_at TIMESTAMP,
	deleted_at TIMESTAMP
)

CREATE TABLE tb_penghargaan (
	penghargaan_id uuid DEFAULT uuid_generate_v4 () PRIMARY KEY NOT NULL,
	user_id uuid NOT NULL, CONSTRAINT fk_tb_penghargaan FOREIGN KEY (user_id) REFERENCES tb_users (user_id),
	tingkat_peng varchar(255) NOT NULL,
	jenis_peng varchar(255) NOT NULL,
	nama_peng varchar(255) NOT NULL,
	tahun_peng INT NOT NULL,
	instansi_pemberi varchar(255) NOT NULL,
	file varchar(255) NOT NULL,
	status INT DEFAULT 0,
	created_at TIMESTAMP,
	updated_at TIMESTAMP,
	deleted_at TIMESTAMP
);

CREATE TABLE tb_penelitian (
	penelitian_id uuid DEFAULT uuid_generate_v4 () PRIMARY KEY NOT NULL,
	user_id uuid NOT NULL, CONSTRAINT fk_tb_penelitian FOREIGN KEY (user_id) REFERENCES tb_users (user_id),
	judul_kegiatan varchar(255) NOT NULL,
	kelompok_bidang varchar(255),
	lokasi_kegiatan varchar(255) NOT NULL,
	tahun_usulan INT NOT NULL,
	tahun_kegiatan INT NOT NULL,
	tahun_pelaksanaan INT NOT NULL,
	lama_kegiatan varchar(255) NOT NULL,
	no_sk_penugasan varchar(255),
	tgl_sk_penugasan DATE,
	status INT DEFAULT 0,
	created_at TIMESTAMP,
	updated_at TIMESTAMP,
	deleted_at TIMESTAMP
);

CREATE TABLE angota_penelitian(
	anggota_id uuid DEFAULT uuid_generate_v4 () PRIMARY KEY NOT NULL,
	penelitian_id uuid NOT NULL, CONSTRAINT fk_tb_anggota_penelitian FOREIGN KEY (penelitian_id) REFERENCES tb_penelitian (penelitian_id),
	user_id uuid NOT NULL, CONSTRAINT fk_tb_anggota_user FOREIGN KEY (user_id) REFERENCES tb_users(user_id),
	peran varchar(180) NOT NULL,
	status BOOLEAN DEFAULT false
);

CREATE TABLE dokumen_penelitian(
	dokumen_id uuid DEFAULT uuid_generate_v4 () PRIMARY KEY NOT NULL,
	penelitian_id uuid NOT NULL, CONSTRAINT fk_tb_penelitian FOREIGN KEY (penelitian_id) REFERENCES tb_penelitian (penelitian_id),
	nama_dok varchar(180) NOT NULL,
	keterangan TEXT,
	tautan_dok varchar(255),
	file varchar(255) NOT NULL,
	created_at TIMESTAMP,
	updated_at TIMESTAMP,
	deleted_at TIMESTAMP
);

CREATE TABLE kolab_external(
	ext_id uuid DEFAULT uuid_generate_v4() PRIMARY KEY NOT NULL,
	nama varchar(180) NOT NULL,
	negara varchar(180) NOT NULL,
	jenkel jenis_kelamin NOT NULL,
	nik CHAR(16) UNIQUE,
	tanggal_lahir DATE ,
	tempat_lahir varchar(255),
	jalan TEXT,
	RT INT,
	RW INT,
	desa_kelurahan varchar(100),
	kota_kabupaten varchar(100),
	provinsi varchar(100),
	kode_pos CHAR(5),
	no_hp varchar(13),
	email varchar(180) UNIQUE,
	status INT DEFAULT 0
);

CREATE TABLE tb_tgs_tambahan_dosen (
	tugastambahan_id uuid DEFAULT uuid_generate_v4 () PRIMARY KEY NOT NULL,
	user_id uuid NOT NULL, CONSTRAINT fk_tgstambahan FOREIGN KEY (user_id) REFERENCES tb_users (user_id),
	jenis_tugas varchar(255) NOT NULL,
	perguruan_tinggi varchar(255) NOT NULL,
	unit_kerja varchar(255) NOT NULL,
	no_sk_penugasan varchar(255) NOT NULL,
	tgl_mulai_tugas DATE NOT NULL,
	tgl_akhir_tugas DATE NOT NULL,
	status INT DEFAULT 0,
	created_at TIMESTAMP,
	updated_at TIMESTAMP,
	deleted_at TIMESTAMP
)
CREATE TABLE dokumen_tgs_tambahan(
	dokumen_id uuid DEFAULT uuid_generate_v4 () PRIMARY KEY NOT NULL,
	tugastambahan_id uuid NOT NULL, CONSTRAINT fk_tb_dokumen_tgs_tambahan FOREIGN KEY (tugastambahan_id) REFERENCES tb_tgs_tambahan_dosen(tugastambahan_id),
	nama_dok varchar(180) NOT NULL,
	keterangan TEXT,
	tautan_dok varchar(255),
	file varchar(255) NOT NULL,
	created_at TIMESTAMP,
	updated_at TIMESTAMP,
	deleted_at TIMESTAMP
);

CREATE TABLE tb_pembicara (
	pembicara_id uuid DEFAULT uuid_generate_v4 () PRIMARY KEY NOT NULL,
	user_id uuid NOT NULL, CONSTRAINT fk_tgstambahan FOREIGN KEY (user_id) REFERENCES tb_users (user_id),
	kategori_pembicara varchar(255) NOT NULL,
	judul_makalah varchar(255) NOT NULL,
	nama_pertemuan varchar(255) NOT NULL,
	tingkat_pertemuan varchar(255),
	penyelenggara varchar(255) NOT NULL,
	tgl_pelaksanaan DATE NOT NULL,
	bahasa varchar(255),
	no_sk_penugasan varchar(255),
	tgl_sk_penugasan varchar(255),
	status INT DEFAULT 0,
	created_at TIMESTAMP,
	updated_at TIMESTAMP,
	deleted_at TIMESTAMP
)

CREATE TABLE dokumen_pembicara(
	dokumen_id uuid DEFAULT uuid_generate_v4 () PRIMARY KEY NOT NULL,
	pembicara_id uuid NOT NULL, CONSTRAINT fk_dokumen_pembicara FOREIGN KEY (pembicara_id) REFERENCES tb_pembicara(pembicara_id),
	nama_dok varchar(180) NOT NULL,
	keterangan TEXT,
	tautan_dok varchar(255),
	file varchar(255) NOT NULL,
	created_at TIMESTAMP,
	updated_at TIMESTAMP,
	deleted_at TIMESTAMP
);

CREATE TABLE tb_publikasi_karya(
	publikasi_id uuid DEFAULT uuid_generate_v4 () PRIMARY KEY NOT NULL,
	user_id uuid NOT NULL,CONSTRAINT fk_tb_publikasiKarya_dosen FOREIGN KEY (user_id) REFERENCES tb_users (user_id),
	judul_artikel varchar(255) NOT NULL,
	jenis varchar(255) NOT NULL,
	kategori_capain varchar(255),
	nama_jurnal varchar(100) NOT NULL,
	tautan_jurnal varchar(100),
	tgl_terbit DATE,
	penerbit varchar(100),
	tautan_eksternal varchar(255),
	keterangan TEXT,
	status INT DEFAULT 0,
	created_at TIMESTAMP,
	updated_at TIMESTAMP,
	deleted_at TIMESTAMP
);

CREATE TABLE dokumen_publikasi(
	dokumen_id uuid DEFAULT uuid_generate_v4 () PRIMARY KEY NOT NULL,
	publikasi_id uuid NOT NULL, CONSTRAINT fk_dokumen_publikasi FOREIGN KEY (publikasi_id) REFERENCES tb_publikasi_karya(publikasi_id),
	nama_dok varchar(180) NOT NULL,
	keterangan TEXT,
	tautan_dok varchar(255),
	file varchar(255) NOT NULL,
	created_at TIMESTAMP,
	updated_at TIMESTAMP,
	deleted_at TIMESTAMP
);

CREATE TABLE penulis_publikasi (
	penulis_id uuid DEFAULT uuid_generate_v4 () PRIMARY KEY NOT NULL,
	publikasi_id uuid NOT NULL, CONSTRAINT fk_penulis_publikasi FOREIGN KEY (publikasi_id) REFERENCES tb_publikasi_karya(publikasi_id),
	user_id uuid NOT NULL, CONSTRAINT fk_user_penulis_publikasi FOREIGN KEY (user_id) REFERENCES tb_users(user_id),
	urutan INT,
	afiliasi TEXT,
	peran varchar(25),
	correspond BOOLEAN
);

-- YANG DIATAS ALL DONE

tb_publikasiKarya(
	judulArtikel
	jenisPublikasi
	kategoriCapaian
	namaJurnal
	tautanJurnal
	tglTerbitJurnal
	penerbitJurnal
	tautanEksternal
	keterangan
)



CREATE TABLE tb_HKI (
	jenisHki varchar (200),
	judulHki varchar (255) NOT NULL,
	tanggalterbitHki DATE,
	keterangan TEXT,
	created_at TIMESTAMPTZ NOT NULL DEFAULT current_date,
	updated_at TIMESTAMP,
	deleted_at TIMESTAMP
)

CREATE TABLE tb_pengabdian (
	judulKegiatan varchar(200) NOT NULL,
	afisialisasipengabdian varchar(100) NOT NULL,
	kelompokBidang varchar(50),
	lokasiKegiatan varchar(200),
	lamaKegiatan varchar(200) NOT NULL,
	noSkPenugasan varchar(200) NOT NULL,
	tglSkPenugasan DATE NOT NULL,
	created_at TIMESTAMPTZ NOT NULL DEFAULT current_date,
	updated_at TIMESTAMP,
	deleted_at TIMESTAMP
)

CREATE TABLE tb_pengajaranDosen(
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

CREATE TABLE tb_bhnAjarDosen (
	bahanAjar_id uuid DEFAULT uuid_generate_v4 () PRIMARY KEY NOT NULL,
	user_id uuid NOT NULL, CONSTRAINT fk_tbbhnAjarDosen FOREIGN KEY (user_id) REFERENCES tb_users (user_id),
	dokumen_id uuid NOT NULL, CONSTRAINT fk_tb_bhnajar_dosen FOREIGN KEY (dokumen_id) REFERENCES tb_dokumen (dokumen_id),
	penulis_id uuid, CONSTRAINT fk_tb_bhnAjarDosen FOREIGN KEY (penulis_id) REFERENCES tb_penulis (penulis_id),
	jenisBhnAjar varchar(100) NOT NULL,
	judulBhnAjar varchar(100) NOT NULL,
	tglTerbit DATE,
	penerbit varchar(100),
	noSkPenugasan
	tglSkpenugasan
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







CREATE TABLE tb_bimbinganMHSDSN (
	bimbingan_id,
	user_id,
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

tb_anggota_bimbingan{
	bimbingan_id
	user_id
}




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







CREATE TABLE tb_publikasiKarya_Mhs (
	publikasiMhs_id uuid DEFAULT uuid_generate_v4 () PRIMARY KEY NOT NULL,
	user_id uuid NOT NULL ,CONSTRAINT fk_tb_publikasiKarya_Mhs FOREIGN KEY (user_id) REFERENCES tb_users (user_id),
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
