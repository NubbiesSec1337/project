# Customer Management System

## Deskripsi Proyek
Customer Management System adalah aplikasi sederhana untuk mengelola pelanggan, mencatat transaksi, dan melihat detail pelanggan termasuk produk yang telah dipesan. Aplikasi ini dikembangkan dengan menggunakan Node.js untuk backend dan React untuk frontend.

## Fitur
- Menambahkan, mengedit, dan menghapus pelanggan.
- Mencatat transaksi pelanggan.
- Mengelola dan menampilkan produk yang paling sering dipesan.
- Menghitung dan menampilkan total transaksi serta level pelanggan (Warga, Sultan, Juragan, Konglomerat).

## Persyaratan Sistem
- Node.js (versi terbaru)
- MySQL (versi terbaru)
- NPM (Node Package Manager)

## Instalasi dan Pengaturan
Ikuti langkah-langkah di bawah ini untuk menjalankan proyek ini di mesin lokal Anda.

### Backend
1. **Clone repository**:
    ```bash
    git clone https://github.com/NubbiesSec1337/project.git
    ```
2. **Masuk ke direktori backend**:
    ```bash
    cd backend
    ```
3. **Install dependencies**:
    ```bash
    npm install
    ```
4. **Buat database MySQL**:
    - Buat database baru di MySQL, misalnya `pos_system`.
    - Jalankan file migration untuk membuat tabel yang dibutuhkan:
      ```bash
      mysql -u username -p pos_system < create_products_table.sql
      ```
    - Jalankan file seeder untuk mengisi tabel produk:
      ```bash
      mysql -u username -p pos_system < seed_products.sql
      ```

5. **Konfigurasi database**:
    - Edit file `config/database.js` dan sesuaikan dengan pengaturan database Anda:
      ```javascript
      const db = mysql.createConnection({
          host: 'localhost',
          user: 'root',
          password: '',
          database: 'pos_system'
      });
      ```
      
6. **Jalankan server**:
    ```bash
    npm start
    ```
    Server akan berjalan di `http://localhost:3001`.

### Frontend
1. **Masuk ke direktori frontend**:
    ```bash
    cd ../frontend
    ```
2. **Install dependencies**:
    ```bash
    npm install
    ```
3. **Jalankan aplikasi frontend**:
    ```bash
    npm start
    ```
    Aplikasi frontend akan berjalan di `http://localhost:3000`.

### Cara Menggunakan Aplikasi
1. Buka aplikasi di `http://localhost:3000`.
2. Anda dapat menambah pelanggan, mencatat transaksi, dan melihat detail pelanggan.
3. Cobalah fitur pencarian untuk menemukan pelanggan berdasarkan nama.

## Struktur Direktori
