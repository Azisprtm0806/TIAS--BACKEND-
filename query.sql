select * from tb_users;
select * from token;
select * from tb_dokumen_pribadi;
select * from tb_data_pribadi;
select * from tb_sertifikasi;

DELETE FROM token WHERE user_id = '622f19b8-f4f7-4736-a0a4-f1b134cb86ef';
DELETE FROM tb_jabatan_dosen WHERE user_id = '82220a5b-39ac-4579-bba6-47acbe92a873';



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