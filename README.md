# ePantau PPTGWPPj

Prototaip sistem pemantauan dan pengurusan geospatial untuk Pejabat Tanah dan Galian Wilayah Persekutuan Putrajaya (PPTGWPPj).

## Demo

[ePantau Putrajaya](https://epantau-putrajaya.rienardi.chatgpt.site)

## Fungsi MVP

- Peta interaktif berpusat di Putrajaya
- Lapisan Warta Asal, Warta Kemaskini dan Aduan Awam
- Carian nombor lot, nombor warta dan presint
- Pemilihan koordinat melalui klik pada peta atau geolokasi peranti
- Borang aduan pencerobohan dan pilihan muat naik bukti
- Fungsi demonstrasi untuk memperkemas teks aduan
- Gambaran awal Portal Pentadbir
- Reka bentuk responsif untuk desktop dan peranti mudah alih

## Status Data

> **Penting:** Semua rekod lot, nombor warta, statistik dan lokasi penanda dalam versi ini ialah data demonstrasi. Ia bukan rujukan rasmi PPTGWPPj.

Versi MVP belum menyimpan aduan, dokumen, maklumat pengguna atau kelayakan log masuk. Integrasi pangkalan data, storan fail, kawalan akses, SSO/MyDigital ID dan data geospatial rasmi perlu dilaksanakan sebagai fasa seterusnya.

## Teknologi

- React 19
- Next.js 16 melalui Vinext
- TypeScript
- Tailwind CSS
- Leaflet dan OpenStreetMap
- Lucide React
- Cloudflare Workers-compatible build

## Pembangunan Tempatan

Keperluan minimum: Node.js 22.13 atau lebih baharu.

```bash
npm install
npm run dev
```

Binaan pengeluaran:

```bash
npm run build
npm run validate:artifact
```

## Struktur Utama

- `app/page.tsx` — antara muka dan interaksi utama
- `app/globals.css` — reka bentuk responsif aplikasi
- `app/layout.tsx` — metadata dan susun atur
- `db/` — asas integrasi pangkalan data
- `worker/` — titik masuk Worker
- `scripts/` — pemasangan, binaan dan pengesahan artifak

## Cadangan Fasa Seterusnya

1. Sambungkan data lot dan warta rasmi.
2. Wujudkan pangkalan data aduan dengan jejak audit.
3. Aktifkan storan bukti bergambar dan dokumen.
4. Laksanakan akses pentadbir berperanan.
5. Integrasikan SSO atau MyDigital ID.
6. Tambahkan papan pemuka, laporan dan eksport PDF.
7. Jalankan semakan keselamatan, privasi dan ISMS sebelum penggunaan rasmi.

## Lesen dan Penggunaan

Kod ini ialah prototaip pembangunan. Penggunaan rasmi hendaklah mendapat kelulusan organisasi dan melalui semakan keselamatan, data, perundangan serta tadbir urus yang berkaitan.
