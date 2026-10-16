# diaz3d. — Konfigurator Dekorasi 3D

Pelanggan merancang dekorasi acara (ulang tahun anak, sweet 17, formal) dalam 3D, melihat estimasi harga secara langsung, lalu mengajukan desainnya. Admin memeriksa pengajuan, menyetujui atau merevisi harga, dan mengirim hasilnya ke WhatsApp pelanggan.

## Menjalankan secara lokal

```bash
npm install
npx prisma generate
cp .env.example .env   # lalu isi ADMIN_PASSWORD dan ADMIN_SESSION_SECRET
npm run db:push
npm run db:seed
npm run dev
```

- Editor: `http://localhost:3000/`
- Panel admin: `http://localhost:3000/admin` (password dari `ADMIN_PASSWORD`)
- Halaman desain pelanggan: `/d/<kode>?t=<token>` (link dikirim lewat WhatsApp)

## Perintah

| Perintah | Fungsi |
|---|---|
| `npm test` | Test domain (harga, validasi, editor, sesi, pengajuan) dengan `node --test` |
| `node scripts/check-decoration.cjs` | Cek geometri backdrop dan garland |
| `npm run build` | Build produksi |

Jangan jalankan `npm run build` saat `npm run dev` masih berjalan, karena keduanya memakai folder `.next` yang sama.

## Harga

- Paket dasar Rp2.500.000 sudah termasuk pemasangan, transport, 1 panel, garland 4,5 m, dan semua item bawaan tema.
- Item di luar bawaan tema dihitung sebagai add-on. Menghapus item bawaan tidak menurunkan harga.
- Harga bisa diubah di `/admin/katalog`. Perubahan hanya berlaku untuk pengajuan baru.
- Isi tiap tema (item bawaan dan posisinya) didefinisikan di `src/domain/presets.ts`.

## Batasan yang diketahui

- SQLite (`prisma/dev.db`) dan folder screenshot lokal `uploads/` **tidak bertahan di hosting serverless** seperti Vercel. Untuk deploy di Vercel, ganti `provider` Prisma ke `postgresql` (misalnya Neon atau Supabase), lalu pindahkan screenshot ke object storage.
- Pilihan font tulisan backdrop (serif/script/modern) belum punya file font sendiri, jadi semuanya memakai font bawaan.
- Tombol "Kirim ke WA" membuka WhatsApp admin dengan pesan yang sudah terisi. Pengiriman otomatis lewat API berbayar belum ada.
