# Panduan Pemecahan Masalah (Troubleshooting) untuk Komponen ProductCard

Komponen `ProductCard.vue` adalah elemen kunci untuk menampilkan produk di berbagai bagian aplikasi, seperti di halaman utama. Jika kartu produk tidak tampil seperti yang diharapkan (misalnya, gambar rusak, informasi harga hilang, atau badge diskon tidak muncul), panduan ini akan membantu Anda melacak sumber masalahnya.

## Alur Data

Penting untuk memahami bagaimana data produk mengalir dari database ke komponen. Alurnya adalah sebagai berikut:

1.  **Database (`nixty.sql`)**: Sumber data utama. Tabel `products` berisi semua informasi produk.
2.  **API Endpoint (`server/api/home-page/index.get.js`)**: Backend mengambil data dari database menggunakan query SQL dan menyediakannya melalui API.
3.  **Composable (`composables/useHomePage.js`)**: Frontend memanggil API, menerima data, dan memprosesnya (mapping) ke dalam format yang bisa digunakan oleh halaman.
4.  **Halaman (`pages/home.vue`)**: Halaman ini menggunakan composable untuk mendapatkan data produk, lalu mengirimkannya ke komponen `ProductCard` melalui `props`.
5.  **Komponen (`components/ProductCard.vue`)**: Komponen ini menerima data melalui `props` dan menampilkannya dalam format HTML & CSS.

## Langkah-langkah Pemecahan Masalah

Ikuti langkah-langkah ini secara berurutan untuk menemukan di mana letak masalahnya.

### Langkah 1: Periksa Komponen (`ProductCard.vue`)

Ini adalah titik akhir dari alur data. Pastikan komponen ini mengharapkan data dalam format yang benar.

-   **Path**: `components/ProductCard.vue`
-   **Yang harus diperiksa**:
    -   **Props**: Pastikan `defineProps` mengharapkan objek `product` dengan struktur yang benar.
    ```javascript
    const props = defineProps({
      product: {
        type: Object,
        required: true
      }
    });
    ```
    -   **Template Bindings**: Verifikasi bahwa template menggunakan nama field yang benar dari objek `product`. Contohnya:
        -   Gambar: `:src="product.image_url"`
        -   Nama: `{{ product.name }}`
        -   Harga: `{{ formatCurrency(product.price) }}`
        -   Badge Diskon: `v-if="product.discount_percentage"`
        -   Badge Baru: `v-if="product.is_new"`

### Langkah 2: Periksa Halaman Induk (`pages/home.vue`)

Halaman ini bertanggung jawab untuk mengirimkan data ke `ProductCard`.

-   **Path**: `pages/home.vue`
-   **Yang harus diperiksa**:
    -   **Looping & Props**: Pastikan `ProductCard` dipanggil di dalam `v-for` dan prop `:product` diisi dengan benar.
    ```html
    <ProductCard
      v-for="product in paginatedRecommendedProducts"
      :key="product.id"
      :product="product"
    />
    ```
    -   **Sumber Data**: Periksa dari mana `paginatedRecommendedProducts` atau `paginatedCategoryProducts` berasal. Data ini disediakan oleh composable `useHomePage`.

### Langkah 3: Periksa Composable (`useHomePage.js`)

Ini adalah "otak" dari logika halaman utama, tempat data dari API diolah. **Ini adalah sumber masalah yang umum.**

-   **Path**: `composables/useHomePage.js`
-   **Yang harus diperiksa**:
    -   **Fungsi `mapProduct`**: Ini adalah bagian paling krusial. Pastikan setiap field yang dikembalikan oleh API di-mapping dengan benar ke nama field yang diharapkan oleh `ProductCard.vue`.
        -   `p.image_url` harus menjadi `image_url`
        -   `p.short_description` harus menjadi `short_description`
        -   `p.discount_percentage` harus menjadi `discount_percentage`
    -   **Fungsi `fetchHomePageData`**: Pastikan fungsi ini memanggil endpoint API yang benar (`/api/home-page`).

### Langkah 4: Periksa API Endpoint (`server/api/home-page/index.get.js`)

Endpoint ini bertanggung jawab untuk mengambil data dari database.

-   **Path**: `server/api/home-page/index.get.js`
-   **Yang harus diperiksa**:
    -   **Query SQL**: Periksa `allProductsQuery`. Pastikan statement `SELECT` menyertakan **semua kolom** yang dibutuhkan oleh frontend dari tabel `products`. Kolom yang sering terlewat adalah `discount_percentage` atau `is_new`.
    ```sql
    SELECT 
      p.id, p.name, p.version, p.slug, p.short_description, 
      p.price, p.image_url, p.is_new, p.discount_percentage,
      ...
    FROM products p
    ...
    ```

### Langkah 5: Periksa Database (`nixty.sql` dan Data Aktual)

Jika semua kode sudah benar, masalah mungkin ada pada data itu sendiri.

-   **File Skema**: `nixty.sql`
-   **Yang harus diperiksa**:
    -   **Struktur Tabel `products`**: Pastikan tabel `products` di database Anda memiliki kolom-kolom seperti `is_new` (tipe `BOOLEAN`) dan `discount_percentage` (tipe `INTEGER` atau `DECIMAL`).
    -   **Data Aktual**: Jalankan query `SELECT * FROM products;` langsung di database Anda. Periksa apakah ada baris data yang memiliki nilai `is_new = true` atau `discount_percentage > 0`. Jika tidak ada data produk yang memenuhi kriteria, maka badge tidak akan pernah muncul di frontend, meskipun kodenya sudah benar. 