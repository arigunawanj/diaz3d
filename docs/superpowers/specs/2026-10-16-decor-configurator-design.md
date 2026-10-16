# Diaz3D — Konfigurator Dekorasi 3D + Pengajuan Harga ke Admin

Tanggal: 2026-10-16
Status: draf, menunggu persetujuan

## 1. Maksud dan alasan

Client pemilik usaha dekorasi (selanjutnya "pemilik") ingin calon pelanggannya bisa **merancang dekorasi acara sendiri** di web, melihatnya langsung dalam 3D, dan melihat **estimasi biaya yang berubah seketika** setiap kali desain diubah. Desain itu lalu dikirim sebagai **pengajuan** ke panel admin. Admin memeriksa hitungannya: kalau cocok disetujui, kalau salah harga final direvisi. Hasilnya dikirim ke WhatsApp pelanggan.

Tujuannya: pelanggan bisa bereksplorasi tanpa harus bolak-balik chat, dan pemilik menerima pengajuan yang sudah lengkap (gambar, daftar item, harga) sehingga tinggal mengonfirmasi.

Referensi visual dan interaksi: https://desent.arigunawanj.com/ ("Forma"), yaitu konfigurator sewa workspace dengan katalog di kiri, 3D di kanan, dan bar total di bawah.

## 2. Sasaran, bukan sasaran, anti-sasaran

**Sasaran**
- Tiga jenis template: **Ulang Tahun Anak**, **Sweet 17**, **Formal**. Masing-masing punya beberapa preset tema.
- Editor sefleksibel mungkin: tambah/hapus item, atur jumlah, seret item ke posisi di panggung 3D, atur balon secara detail.
- 3D yang jelas memperlihatkan apa yang berubah: item baru masuk dengan animasi, item terpilih disorot, kamera bergerak ke item yang diatur.
- Harga live sesuai aturan paket + add-on (bagian 6).
- Alur pengajuan → panel admin → setujui/revisi → kirim ke WA pelanggan.
- Interaksi kaya memakai Three.js (React Three Fiber) + GSAP, terasa lebih hidup daripada referensi.

**Bukan sasaran (sekarang)**
- Pembayaran online / DP.
- Akun pelanggan / login pelanggan.
- Pengiriman WA otomatis via API berbayar (cukup tombol satu klik, lihat 8.3).
- Multi-admin, peran, atau audit log.
- Kalender ketersediaan tanggal.

**Anti-sasaran (gagal walau secara teknis jalan)**
- Harga di layar tidak sama dengan rincian di pengajuan/admin.
- Item di 3D tidak terlihat berubah ketika setelan diubah (pelanggan bingung apa yang diganti).
- Editor terasa seperti formulir panjang, bukan alat desain.
- Lambat atau patah-patah di laptop biasa dan HP kelas menengah.
- Tampilan jauh dari gaya desent (gelap/ramai seperti versi lama `decor-preview.jpg`).

## 3. Batasan

- Membangun di atas proyek yang ada: `diaz3d` (Next.js 14 App Router, React 18, `@react-three/fiber`, `@react-three/drei`, `three` 0.160, `gsap` 3.12, Tailwind 4, `lucide-react`). Komponen 3D lama di `src/components/3d/` (Backdrop, BalloonGarland, CharacterCutouts, MarqueeNumber, PedestalAndCake, Foliage, StudioStage) dipakai ulang/diubah bila cocok.
- Bahasa antarmuka: Bahasa Indonesia. Mata uang: Rupiah, format `Rp2.900.000`.
- Hosting belum ditentukan. Harus bisa jalan lokal tanpa layanan luar.
- Harga hasil hitungan adalah **estimasi**. Harga mengikat adalah harga final dari admin.

## 4. Tampilan dan tata letak (diputuskan pemilik)

### 4.1 Halaman utama (`/`): meniru struktur desent
1. Header: logo "diaz3d." kiri, tautan "Cara kerja" kanan.
2. Hero: judul besar dua warna (bagian kedua abu-abu), contoh "Rayakan momenmu *dengan caramu.*", subjudul dua baris di kanan. *(Copy final: keputusan builder.)*
3. **Kartu konfigurator besar** (sudut membulat, bayangan halus):
   - **Kiri (±38%)**: panel adaptif (4.2).
   - **Kanan**: viewport 3D. Pojok kiri atas: label kecil "● LIVE DECOR", nama tema, dan tagline. Pojok kanan atas: tombol sudut kamera (Depan / Samping / Atas / Close-up) dan tombol reset. Pojok kiri bawah: petunjuk "Seret untuk melihat sekeliling". Pojok kanan bawah: chip toggle cepat untuk 2 add-on populer (mis. "LED backdrop ✓", "Daun aksen +"). Strip bawah: "Ukuran item mendekati skala asli. Tampilan ruangan ilustratif." dan "3D / INTERAKTIF".
   - **Bar bawah gelap** selebar kartu: ikon, "Dekorasimu, tersusun.", "N item · Estimasi biaya", lalu di kanan "Total estimasi" **RpX** dan tombol terakota **"Ajukan Desain →"**. Klik total membuka laci rincian harga.
4. Bagian "cara kerja" 3 kolom: 01 / DESAIN, 02 / LIHAT, 03 / AJUKAN.
5. Footer sederhana.

Gaya: latar krem hangat (~`#F6F3EE`), permukaan putih gading, teks hampir hitam, aksen terakota (~`#C2552B`), sans bersih (mis. Inter/Geist), banyak ruang kosong, garis tipis. Token warna dan tipografi persisnya diserahkan ke builder, mendekati desent.

### 4.2 Panel kiri adaptif (desain A yang di-upgrade)
- **Tidak ada item dipilih: Katalog.** Judul "Buat sesukamu." + subjudul. Tab: **Template · Backdrop · Balon · Properti**. Tiap tab berisi kartu item (thumbnail, nama, kategori, harga add-on atau label "Termasuk paket"). Kartu bisa **diklik** (ditaruh di posisi default) atau **diseret ke viewport 3D** (ditaruh di titik lantai yang dijatuhi). Item berjumlah (panel, karakter, balon jumbo) memakai stepper −/+.
- **Item dipilih (klik di 3D atau dari daftar): Pengaturan item.** Tombol "← Katalog", nama item, setelan khusus item itu (4.3), harga item ini, tombol hapus.
- Tab **Template** berisi pemilih jenis (Anak / Sweet 17 / Formal) dan preset tema. Memilih preset **mereset** panggung ke isi preset itu dengan animasi, dan meminta konfirmasi bila desain sudah diubah. Perubahan sebelumnya tidak dibawa. *(Keputusan saya.)*
- **Toolbar mengambang** di atas item terpilih di 3D: geser, putar, duplikat, hapus.
- **HP (< 768px)**: 3D di atas, panel menjadi lembar bawah yang bisa ditarik (setengah/penuh), bar total menempel di bawah. Di HP item ditaruh dengan tap, lalu digeser langsung di 3D.

### 4.3 Setelan per jenis item (minimum)
- **Backdrop**: jumlah panel (1–4), satu bentuk untuk seluruh backdrop *(keputusan saya)* (lengkung ganda, lengkung tunggal, bulat, gelombang, setengah lengkung, yang sudah ada di `BackdropShape`), warna utama/sekunder, teks judul + subjudul + warna + font, LED backdrop on/off + warna.
- **Balon garland**: palet warna (2–5 warna, bisa tambah/hapus), panjang (meter, langkah 0,5), campuran ukuran (5"/12"/18"), kepadatan, finishing (glossy/doff/metalik/chrome), pola (polos/dalmatian/polka), aksen daun on/off. Hanya ada **satu garland**, selalu menempel di backdrop, dan bisa disembunyikan (harga tidak turun). Garland bawaan 4,5 m berlaku untuk seluruh backdrop berapa pun jumlah panelnya. Garland mengikuti lengkung backdrop, dan kelebihan panjang memanjang ke lantai/samping. *(Keputusan saya.)*
- **Balon lepas** (tiang, jumbo, gantung): warna, jumlah, posisi.
- **Karakter cutout 100 cm**: pilih karakter (aset di `public/characters` + `characterSVGs.ts`), posisi, rotasi.
- **Angka lampu**: digit 0–9 (bisa 2 digit untuk Sweet 17), nyala/mati.
- **Meja kue**: gaya, warna, kue on/off.
- **Properti lain**: posisi, rotasi, warna jika relevan.

Setiap perubahan setelan harus **langsung terlihat** di 3D: warna berganti dengan transisi, panjang garland bertambah balon demi balon, item baru jatuh/memantul masuk (GSAP), dan item yang dihapus mengecil lalu hilang.

## 5. Model desain

Desain = data serial yang sama untuk editor, harga, pengajuan, dan halaman lihat-saja:

```
Design {
  templateType: 'anak' | 'sweet17' | 'formal'
  presetId: string
  backdrop: { panelCount, shape, colors, text, led }
  garland: { palette[], lengthM, sizes, density, finish, pattern, leafAccent }
  items: PlacedItem[]   // { uid, catalogId, position[x,z], rotationY, params }
  environment: { floor, light }
}
```

Item diletakkan di bidang lantai panggung dengan batas area. Saat diseret, posisi menempel ringan ke grid dan tidak boleh menembus backdrop. Panel backdrop disusun otomatis berdampingan sesuai `panelCount`.

## 6. Aturan harga (diputuskan pemilik)

- **Paket dasar Rp2.500.000** sudah termasuk pemasangan, transport, dan **semua dekorasi bawaan preset**: 1 panel backdrop, garland 4,5 m, dan item bawaan tema.
- **Add-on** (harga dari pemilik):

| Item | Harga | Satuan |
|---|---|---|
| Panel backdrop tambahan | 400.000 | per panel di atas 1 |
| Karakter cutout 100 cm | 100.000 | per karakter |
| Angka lampu | 250.000 | per angka |
| Meja kue | 50.000 | per meja |
| Aksen dekor di balon (daun, dll.) | 150.000 | per desain |
| Balon garland | 250.000 | per meter di atas 4,5 m |
| LED lampu backdrop | 150.000 | per desain |

- **Add-on dummy** (karangan sesuai izin pemilik, bisa diubah admin): tiang balon 200.000/pasang, balon jumbo 36" 75.000/buah, balon gantung 25.000/buah, neon sign nama 350.000, karpet/alas panggung 150.000, standing flower 300.000, tanaman besar (monstera/palem) 100.000/buah, lampu sorot 100.000/buah, meja formal + taplak 200.000. Pilihan lantai, cahaya, warna, teks, pola, dan finishing **gratis**. "Aksen dekor di balon" = satu biaya 150.000 per desain, berapa pun jenis aksennya.
- **Harga per jenis, bukan per varian** *(keputusan saya)*: karakter, gaya meja kue, dan digit angka adalah parameter dari satu item katalog. Mengganti karakter bawaan dengan karakter lain gratis, sedangkan menambah jumlahnya dikenai biaya.
- Rumus: `total = paket + Σ max(0, jumlah_dipakai − jumlah_bawaan_preset) × harga_satuan`. Untuk item on/off: dikenakan biaya bila aktif dan bukan bawaan.
- Contoh: preset bawaan + panel jadi 2 = 2.500.000 + 400.000 = **2.900.000**.
- Menghapus item bawaan **tidak** menurunkan harga *(keputusan saya, sistem paket; mudah diubah)*. UI memberi label "Termasuk paket" vs "+Rp…".
- Harga dihitung oleh **satu fungsi murni** yang dipakai di klien (live) dan di server (saat pengajuan disimpan). Server menghitung ulang dan menyimpan hasilnya, tidak mempercayai angka dari klien.
- Harga katalog disimpan di database dan dapat diubah dari panel admin (8.4). Jumlah bawaan berasal dari definisi preset di kode. Seed awal = tabel di atas.

## 7. Pengajuan oleh pelanggan

1. Klik "Ajukan Desain" untuk membuka modal ringkasan: screenshot 3D, rincian item (bawaan vs add-on, subtotal), total estimasi.
2. Form: nama, nomor WhatsApp (wajib, divalidasi format Indonesia, disimpan sebagai `62…`), tanggal acara, lokasi/kota, catatan (opsional).
3. Kirim: server menyimpan pengajuan dengan status **Menunggu** dan kode unik (mis. `DZ-7K3F`).
4. Layar sukses: kode pengajuan, pesan bahwa admin akan menghubungi via WA, dan link halaman lihat-saja.
5. Draf desain tersimpan di `localStorage` agar tidak hilang saat halaman dimuat ulang.

## 8. Panel admin (`/admin`)

### 8.1 Akses
Satu password dari env `ADMIN_PASSWORD`, sesi lewat cookie httpOnly bertanda tangan (`ADMIN_SESSION_SECRET`). Semua route `/admin` dan API admin diproteksi middleware.

### 8.2 Daftar dan detail
- Daftar pengajuan: kode, nama, tanggal acara, estimasi, harga final, status (**Menunggu / Disetujui / Direvisi**), filter status, urut terbaru.
- Detail: screenshot, viewer 3D lihat-saja dari data desain, data pelanggan, rincian item hasil hitungan server.
- Aksi:
  - **Setujui**: harga final = estimasi, status Disetujui.
  - **Revisi**: admin mengubah harga per baris dan/atau menambah baris penyesuaian (mis. "Biaya luar kota +200.000"), total final dihitung ulang, catatan admin wajib, status Direvisi.

### 8.3 Kirim ke WhatsApp
Tombol **"Kirim ke WA"** membuka `https://wa.me/<nomor>?text=<pesan>` dengan pesan terisi: salam, kode, status, rincian singkat, harga final, catatan admin, link halaman lihat-saja. Admin menekan kirim di WhatsApp-nya sendiri. Waktu klik dicatat (`waSentAt`).

### 8.4 Katalog & harga
Halaman untuk mengubah harga paket dan harga add-on, serta mengaktifkan/menonaktifkan item. **Isi preset (item bawaan, posisi, jumlah) didefinisikan di kode**, dan jumlah bawaan untuk harga diturunkan langsung dari definisi preset itu, sehingga label "Termasuk paket" selalu sama dengan yang tampil di 3D. *(Keputusan saya: admin tidak mengedit isi preset.)* Perubahan hanya berlaku untuk pengajuan baru. Pengajuan lama menyimpan snapshot rinciannya.

## 9. Halaman lihat-saja (`/d/[kode]`)
Menampilkan desain 3D (bisa diputar, tidak bisa diedit), rincian, status, dan harga final bila sudah ada. Diakses lewat kode yang sulit ditebak (kode pendek + token acak di URL).

## 10. Data dan server (keputusan saya)

- **Prisma + SQLite** (`prisma/dev.db`) untuk lokal. Pindah ke Postgres (Neon/Supabase) untuk Vercel cukup dengan ganti `provider` + `DATABASE_URL`.
- Tabel: `Submission` (kode, token, nama, wa, tanggalAcara, lokasi, catatan, designJson, lineItemsJson, estimate, finalLinesJson, finalPrice, status, adminNote, waSentAt, createdAt, updatedAt), `CatalogItem` (id, nama, kategori, harga, satuan, aktif), `Setting` (basePackagePrice).
- Screenshot: dikirim sebagai PNG dari canvas (`preserveDrawingBuffer` atau render sekali saat pengajuan), disimpan sebagai file di folder `uploads/` (di luar `public/`) dan disajikan lewat route handler, karena build produksi Next.js tidak menyajikan file yang ditulis ke `public/` setelah build. *(Untuk hosting serverless perlu storage objek; dicatat sebagai batasan.)*
- API: Next.js route handlers (`POST /api/submissions`, `GET/PATCH /api/admin/submissions/...`, `GET/PUT /api/admin/catalog`).
- Validasi input di server untuk semua field dan untuk struktur `designJson`.

## 11. Gerak dan performa

- GSAP untuk: angka total bergulir, transisi kamera ke item terpilih, animasi masuk/keluar item, transisi warna material, pergantian preset bertahap (stagger).
- Hormati `prefers-reduced-motion` (durasi 0), seperti yang sudah dilakukan `Scene.tsx`.
- Balon garland memakai `InstancedMesh`. Target ≥ 50 fps di laptop biasa. Bayangan dan DPR diturunkan di HP.
- Aksesibilitas: semua kontrol panel bisa dipakai dengan keyboard, label jelas, dan kontras cukup.

## 12. Yang diserahkan ke builder
- Copy final hero dan teks kecil, nama dan isi preset tema per jenis (minimal 2 preset per jenis).
- Bentuk 3D item dummy baru (boleh primitif yang rapi).
- Token desain persis, ikon (lucide), detail animasi.
- Gambar karakter: `public/characters` kosong, jadi pakai `src/lib/characterSVGs.ts`.
- Garland dihitung per 0,5 m (6 m = +375.000).
- Admin boleh merevisi ulang pengajuan yang sudah dikirim.
- Struktur file dan pembagian komponen. Komponen lama yang tidak terpakai boleh dihapus.

## 13. Pengecekan minimum
- Satu test/self-check untuk fungsi harga: preset bawaan = 2.500.000; +1 panel = 2.900.000; garland 6 m = +375.000; hapus item bawaan tidak menurunkan total.
- Uji manual alur penuh: desain → ajukan → admin revisi → tombol WA berisi pesan benar → halaman lihat-saja menampilkan harga final.
