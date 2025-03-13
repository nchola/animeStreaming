
# 🎬 AnimeStream - Platform Streaming Anime Modern

**AnimeStream** adalah platform streaming anime yang dibangun dengan teknologi modern untuk memberikan pengalaman menonton anime yang nyaman dan menarik. Proyek ini menggunakan **Vue.js** untuk frontend dan **Laravel** untuk backend, dengan integrasi API dari **Jikan** dan **Consumet**.

![image](https://github.com/user-attachments/assets/93fdf02c-060b-4ffa-aeb3-2e9351e59dd1)

---

## 🚀 Fitur Utama

- **Daftar Anime Terpopuler**: Menampilkan anime terpopuler dengan poster, judul, rating, dan deskripsi.
- **Pencarian Anime**: Cari anime berdasarkan judul dengan hasil real-time.
- **Pemutaran Video In-Page**: Tonton anime langsung di situs tanpa redirect.
- **Modern UI/UX**: Desain antarmuka yang menarik dengan tema gelap dan animasi halus.
- **Responsif**: Dukungan penuh untuk perangkat desktop, tablet, dan mobile.

---

## 🛠 Teknologi yang Digunakan

### Frontend
- ![Vue.js](https://img.shields.io/badge/Vue.js-4FC08D?style=for-the-badge&logo=vuedotjs&logoColor=white)
- ![Vue Router](https://img.shields.io/badge/Vue_Router-4FC08D?style=for-the-badge&logo=vuedotjs&logoColor=white)
- ![Axios](https://img.shields.io/badge/Axios-5A29E4?style=for-the-badge&logo=axios&logoColor=white)
- ![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)

### Backend
- ![Laravel](https://img.shields.io/badge/Laravel-FF2D20?style=for-the-badge&logo=laravel&logoColor=white)
- ![PHP](https://img.shields.io/badge/PHP-777BB4?style=for-the-badge&logo=php&logoColor=white)
- ![MySQL](https://img.shields.io/badge/MySQL-4479A1?style=for-the-badge&logo=mysql&logoColor=white)

### API
- ![Jikan API](https://img.shields.io/badge/Jikan_API-000000?style=for-the-badge&logo=myanimelist&logoColor=white)
- ![Consumet API](https://img.shields.io/badge/Consumet_API-00B4D8?style=for-the-badge)

---

## 🖥️ Struktur Proyek

```plaintext
animestream/
├── resources/
│   ├── js/
│   │   ├── components/
│   │   │   ├── AnimeList.vue
│   │   │   ├── AnimeModal.vue
│   │   ├── App.vue
│   │   ├── router.js
│   ├── views/
│   │   ├── welcome.blade.php
├── routes/
│   ├── api.php
│   ├── web.php
├── app/
│   ├── Http/
│   │   ├── Controllers/
│   │   │   ├── AnimeController.php
├── database/
│   ├── migrations/
│   │   ├── create_animes_table.php
├── public/
│   ├── css/
│   ├── js/
├── .env
├── package.json
├── vite.config.js
```

---

## 🛠️ Cara Menjalankan Proyek

### Persyaratan
- PHP >= 8.1
- Composer
- Node.js >= 16
- MySQL atau database lainnya

### Langkah-langkah
1. Clone repository:
   ```bash
   git clone https://github.com/username/animestream.git
   cd animestream
   ```

2. Instal dependensi backend:
   ```bash
   composer install
   ```

3. Instal dependensi frontend:
   ```bash
   npm install
   ```

4. Setup environment:
   ```bash
   cp .env.example .env
   php artisan key:generate
   ```

5. Konfigurasi database di `.env`:
   ```env
   DB_CONNECTION=mysql
   DB_HOST=127.0.0.1
   DB_PORT=3306
   DB_DATABASE=animestream
   DB_USERNAME=root
   DB_PASSWORD=
   ```

6. Jalankan migrasi:
   ```bash
   php artisan migrate
   ```

7. Jalankan server backend:
   ```bash
   php artisan serve
   ```

8. Jalankan server frontend:
   ```bash
   npm run dev
   ```

9. Buka browser dan akses:
   ```
   http://localhost:8000
   ```

---

## 🤝 Kontribusi

Kontribusi sangat diterima! Jika Anda ingin berkontribusi, ikuti langkah-langkah berikut:
1. Fork repository ini.
2. Buat branch baru (`git checkout -b fitur-baru`).
3. Commit perubahan Anda (`git commit -m 'Tambahkan fitur baru'`).
4. Push ke branch (`git push origin fitur-baru`).
5. Buat Pull Request.

---

## 📄 Lisensi

Proyek ini dilisensikan di bawah **MIT License**. Lihat file [LICENSE](LICENSE) untuk detail lebih lanjut.

---

## 📌 Tautan Berguna
- [Jikan API Documentation](https://jikan.moe/)
- [Consumet API Documentation](https://consumet.org/)
- [Vue.js Documentation](https://vuejs.org/)
- [Laravel Documentation](https://laravel.com/)
```
