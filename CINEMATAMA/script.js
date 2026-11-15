/* ==========================================================================
   CINEMATAMA — Application Script
   Satu file, terbagi dalam bagian bernomor agar mudah ditelusuri:
     1. Konfigurasi & data
     2. Utilitas
     3. Router SPA
     4. Navbar & menu
     5. Daftar Saya & riwayat tontonan
     6. Render halaman
     7. Pemutar YouTube
     8. Modal & toast
     9. Event delegation & init
   ========================================================================== */
/* --------------------------------------------------------------------------
   Tema Tailwind (Play CDN).
   Sengaja ditempatkan di sini agar aplikasi cukup terdiri dari 3 berkas:
   index.html, css/style.css, dan js/script.js.
   Ubah palet warna/font di sini bila ingin menyesuaikan tema.
   -------------------------------------------------------------------------- */
if (window.tailwind) {
    window.tailwind.config = {
        darkMode: "class",
        theme: {
            extend: {
                colors: {
                    brand: {
                        bg: "#08090D",
                        card: "#12141B",
                        secondary: "#1B1E28",
                        maroon: "#B91C3B",
                        maroonHover: "#9F1832",
                        textPrimary: "#F8FAFC",
                        textSecondary: "#9CA3AF",
                    },
                },
                fontFamily: {
                    sans: ["Plus Jakarta Sans", "Inter", "sans-serif"],
                },
            },
        },
    };
}

(function () {
    "use strict";

    /* ======================================================================
       1. KONFIGURASI & DATA
       ====================================================================== */
    /* Nilai tetap aplikasi: kredensial demo, kunci penyimpanan browser,
       dan pengaturan waktu (carousel, debounce pencarian, simpan progres). */
    const CONFIG = {
        myListKey: "cinematama_mylist",
        historyKey: "cinematama_watch_history",
        heroCount: 6,
        heroInterval: 7000,
        searchDebounce: 180,
    };

    /* Basis data film pendek YouTube (tanpa server/API).
       Field tiap objek: id, title, type ("movie"/"series"), year, rating,
       duration, genres[], overview, cast, director, popularity (untuk urutan),
       youtubeId (ID video YouTube), featured (opsional: dipakai slide hero).
       Thumbnail dan pemutar diambil langsung dari YouTube. */
    const MOVIES_DATA = [
        {
            id: "1",
            title: "Big Buck Bunny",
            type: "movie",
            year: 2008,
            rating: 8.4,
            duration: "10m",
            genres: ["Animation", "Comedy", "Adventure"],
            overview: "Big Buck Bunny, kelinci raksasa yang lembut, harus menghadapi tiga hewan pengerat nakal yang mengganggu ketenangan hutan.",
            cast: "Animasi 3D Blender Foundation",
            director: "Sacha Goedegebure",
            popularity: 92,
            featured: true,
            youtubeId: "aqz-KE-bpKQ",
        },
        {
            id: "2",
            title: "Sintel",
            type: "movie",
            year: 2010,
            rating: 8.3,
            duration: "15m",
            genres: ["Animation", "Fantasy", "Adventure"],
            overview: "Sintel, gadis muda pemberani, mengembara melewati negeri bersalju untuk menemukan kembali anak naga yang pernah ia rawat.",
            cast: "Animasi 3D Blender Foundation",
            director: "Colin Levy",
            popularity: 95,
            youtubeId: "eRsGyueVLvQ",
        },
        {
            id: "3",
            title: "Tears of Steel",
            type: "movie",
            year: 2012,
            rating: 7.6,
            duration: "12m",
            genres: ["Sci-Fi", "Action", "Drama"],
            overview: "Di Amsterdam masa depan, sekelompok prajurit kembali ke masa lalu untuk memperbaiki kesalahan yang memicu invasi robot.",
            cast: "Derek de Lint, Sergio Hasselbaink, Rogier Schippers",
            director: "Ian Hubert",
            popularity: 90,
            featured: true,
            youtubeId: "R6MlUcmOul8",
        },
        {
            id: "4",
            title: "Elephants Dream",
            type: "movie",
            year: 2006,
            rating: 7.1,
            duration: "11m",
            genres: ["Animation", "Sci-Fi", "Fantasy"],
            overview: "Dua pria menjelajahi mesin raksasa tanpa ujung, tempat realitas dan ingatan terus berubah di setiap sudut.",
            cast: "Tygo Gernandt, Cas Jansen",
            director: "Bassam Kurdali",
            popularity: 78,
            featured: true,
            youtubeId: "TLkA0RELQ1g",
        },
        {
            id: "5",
            title: "Kung Fury",
            type: "movie",
            year: 2015,
            rating: 8.0,
            duration: "31m",
            genres: ["Action", "Comedy", "Sci-Fi"],
            overview: "Detektif kung fu dari Miami terlempar ke masa lalu Nazi Jerman untuk menghentikan Hitler yang menguasai teknologi waktu.",
            cast: "David Sandberg, Jorma Taccone, Leopold Nilsson",
            director: "David Sandberg",
            popularity: 97,
            youtubeId: "bS5P_LAqiVg",
        },
        {
            id: "6",
            title: "The Present",
            type: "movie",
            year: 2014,
            rating: 8.6,
            duration: "4m",
            genres: ["Animation", "Drama"],
            overview: "Seorang bocah yang asyik bermain gim menerima hadiah dari ibunya: anak anjing berkaki tiga yang mengubah cara pandangnya.",
            cast: "Animasi 2D tanpa dialog",
            director: "Jacob Frey",
            popularity: 96,
            youtubeId: "WjqiU5FgsYc",
        },
        {
            id: "7",
            title: "Caminandes",
            type: "series",
            year: 2016,
            rating: 8.1,
            duration: "3 Episode",
            genres: ["Animation", "Comedy", "Adventure"],
            overview: "Tiga film pendek tentang Koro, llama pemalu dari Patagonia, yang berjuang menyeberang jalan, mencari makan, dan bertahan di cuaca ekstrem.",
            cast: "Animasi 3D Blender Studio",
            director: "Pablo Vazquez",
            popularity: 85,
            youtubeId: "SkVqJ1SGeL0",
        },
        {
            id: "8",
            title: "Spring",
            type: "movie",
            year: 2019,
            rating: 8.2,
            duration: "8m",
            genres: ["Animation", "Fantasy", "Drama"],
            overview: "Seorang gembala muda dan anjingnya berhadapan dengan roh musim semi agar siklus alam kembali berjalan.",
            cast: "Animasi 3D Blender Studio",
            director: "Andy Goralczyk",
            popularity: 88,
            youtubeId: "WhWc3b3KhnY",
        },
        {
            id: "9",
            title: "Sprite Fright",
            type: "movie",
            year: 2021,
            rating: 7.9,
            duration: "11m",
            genres: ["Animation", "Horror", "Comedy"],
            overview: "Sekelompok remaja yang berkemah di hutan menemukan rahasia kelam di balik jamur-jamur cantik yang tumbuh di sana.",
            cast: "Animasi 3D Blender Studio",
            director: "Matthew Luhn",
            popularity: 93,
            youtubeId: "_cMxraX_5RE",
        },
        {
            id: "10",
            title: "CHARGE",
            type: "movie",
            year: 2022,
            rating: 7.8,
            duration: "4m",
            genres: ["Animation", "Action", "Sci-Fi"],
            overview: "Di bunker energi yang mulai runtuh, seorang pejuang muda bertarung melawan mesin yang menguasai kota.",
            cast: "Animasi 3D Blender Studio",
            director: "Blender Studio",
            popularity: 91,
            youtubeId: "UXqq0ZvbOnk",
        },
        {
            id: "11",
            title: "In a Heartbeat",
            type: "movie",
            year: 2017,
            rating: 8.4,
            duration: "4m",
            genres: ["Animation", "Drama"],
            overview: "Jantung seorang bocah pemalu keluar dari tubuhnya dan mengejar gebetannya, memaksanya menghadapi perasaan di depan sekolah.",
            cast: "Animasi 2D tanpa dialog",
            director: "Esteban Bravo, Beth David",
            popularity: 89,
            youtubeId: "2REkk9SCRn0",
        },
        {
            id: "12",
            title: "Cosmos Laundromat: First Cycle",
            type: "series",
            year: 2015,
            rating: 7.9,
            duration: "1 Cycle",
            genres: ["Animation", "Drama", "Sci-Fi"],
            overview: "Franck, domba yang kehilangan harapan di pulau terpencil, bertemu penjual misterius yang menawarkan kehidupan baru di semesta lain.",
            cast: "Animasi 3D Blender Studio",
            director: "Mathieu Auvray",
            popularity: 80,
            youtubeId: "Y-rmzh0PI3c",
        },
        {
            id: "13",
            title: "Agent 327: Operation Barbershop",
            type: "movie",
            year: 2017,
            rating: 7.7,
            duration: "4m",
            genres: ["Animation", "Action", "Comedy"],
            overview: "Agen rahasia Belanda 327 menyamar di sebuah barbershop untuk membongkar jaringan kriminal internasional.",
            cast: "Animasi 3D Blender Studio",
            director: "Colin Levy",
            popularity: 84,
            youtubeId: "mN0zPOpADL4",
        },
        {
            id: "14",
            title: "HERO",
            type: "movie",
            year: 2018,
            rating: 8.0,
            duration: "4m",
            genres: ["Animation", "Action"],
            overview: "Seorang pahlawan kecil beraksi di tengah hiruk-pikuk gambar tangan, memperlihatkan kekuatan animasi grease pencil.",
            cast: "Animasi 2D Blender",
            director: "Daniel Martínez Lara",
            popularity: 82,
            youtubeId: "pKmSdY56VtY",
        },
        {
            id: "15",
            title: "Lights Out",
            type: "movie",
            year: 2013,
            rating: 8.5,
            duration: "3m",
            genres: ["Horror", "Thriller"],
            overview: "Seorang perempuan yang hendak tidur terus diganggu sosok bayangan yang hanya muncul ketika lampu dimatikan.",
            cast: "Lotta Losten",
            director: "David F. Sandberg",
            popularity: 99,
            featured: true,
            youtubeId: "FUQhNGEu2KA",
        },
        {
            id: "16",
            title: "Tilik",
            type: "movie",
            year: 2018,
            rating: 8.9,
            duration: "32m",
            genres: ["Comedy", "Drama", "Indonesian"],
            country: "Indonesia",
            overview: "Rombongan ibu-ibu desa menaiki truk bak terbuka untuk menjenguk (tilik) Bu Lurah yang dirawat di rumah sakit kota. Di sepanjang jalan, Bu Tejo memicu perbincangan penuh intrik dan gunjingan panas mengenai status Dian, seorang gadis desa mandiri yang dicurigai warga.",
            cast: "Siti Fauziah (Bu Tejo), Brilliana Desy Arfira (Yu Sam), Angeline Rizky (Yu Tri), Dyah Mulani (Bu Trucuk), Stephanus Wahyu Gumilar (Gotrek)",
            director: "Wahyu Agung Prasetyo",
            popularity: 99,
            featured: true,
            youtubeId: "GAyvgz8_zV8",
        },
        {
            id: "17",
            title: "Lemantun",
            type: "movie",
            year: 2014,
            rating: 9.1,
            duration: "21m",
            genres: ["Drama", "Indonesian"],
            country: "Indonesia",
            overview: "Seorang ibu sepuh membagikan warisan kepada kelima anaknya bukan berupa tanah atau perhiasan, melainkan lima lemari kayu peninggalan leluhur. Kelima anak diwajibkan membawa pulang lemari masing-masing hari itu juga tanpa boleh menjualnya, menyingkap kepedihan Tri, anak ketiga yang belum memiliki tempat tinggal tetap.",
            cast: "Tatik Wardiono (Ibu), Freddy Rotterdam (Eko), Agoes Kencrot (Dwi), Budi Ros (Tri), Henricus Pria (Catur), Titik Renggo (Rini)",
            director: "Wregas Bhanuteja",
            popularity: 98,
            featured: true,
            youtubeId: "AfchZ4kfFMc",
        },
        {
            id: "18",
            title: "Anak Lanang",
            type: "movie",
            year: 2017,
            rating: 8.8,
            duration: "15m",
            genres: ["Comedy", "Drama", "Indonesian"],
            country: "Indonesia",
            overview: "Direkam dalam satu bidikan kamera kontinu (one-shot take) tanpa henti selama 15 menit di atas becak kayuh saat jam pulang sekolah di Yogyakarta. Empat anak laki-laki SD berdebat seru tentang tugas sekolah, permainan dingdong, dan perayaan Hari Ibu, yang berujung pada kejutan mengharukan di garis akhir perjalanan mereka.",
            cast: "Khoirul Fajar (Sigit), Denis Wisnu (Samsul), Garry Alexander (Yudho), Mahadi Wijaya (Danang), Ibnu Widodo (Pak Becak)",
            director: "Wahyu Agung Prasetyo",
            popularity: 96,
            youtubeId: "nIoknYnDtG8",
        },
        {
            id: "21",
            title: "Singsot",
            type: "movie",
            year: 2016,
            rating: 8.6,
            duration: "14m",
            genres: ["Horror", "Mystery", "Indonesian"],
            country: "Indonesia",
            overview: "Pulung, anak laki-laki yang sedang menginap di rumah kakek dan neneknya di desa, memiliki kebiasaan bersiul sembarangan. Sang nenek berulang kali mengingatkan pamali Jawa kuno bahwa bersiul di kala petang dan malam hari bisa memanggil roh halus. Ketika malam tiba dan ia sendirian, siulan tersebut membalas dengan teror yang nyata.",
            cast: "Naufal Rafa Adyaksa (Pulung), Anton Suprapto (Kakek), Indarwati (Nenek), Budi Arifianto",
            director: "Wahyu Agung Prasetyo",
            popularity: 93,
            youtubeId: "gZp2x5k_9YI",
        },
        {
            id: "22",
            title: "Unbaedah",
            type: "movie",
            year: 2019,
            rating: 8.4,
            duration: "15m",
            genres: ["Comedy", "Horror", "Indonesian"],
            country: "Indonesia",
            overview: "Baedah memiliki tabiat buruk yang meresahkan para tetangga, yakni suka mengambil berkat kenduri melebihi haknya. Suatu malam usai acara tahlilan, ia kembali nekat menyembunyikan berkat milik orang lain. Di tengah jalan pulang yang sunyi dan gelap, sosok gaib misterius muncul memberinya pelajaran yang tak terlupakan.",
            cast: "Siti Fauziah (Baedah), Pritt Timothy (Pak RT), Brilliana Desy Arfira (Tetangga)",
            director: "Iqbal Ariefurrahman",
            popularity: 91,
            youtubeId: "AyJZzw12ggY",
        },
        {
            id: "23",
            title: "Natalan",
            type: "movie",
            year: 2015,
            rating: 8.6,
            duration: "28m",
            genres: ["Drama", "Mystery", "Indonesian"],
            country: "Indonesia",
            overview: "Resnu bersama sang istri melakukan perjalanan darat malam hari dari Jakarta menuju Yogyakarta untuk merayakan malam Natal bersama sang ibu tercinta. Di tengah sepinya jalur jalan raya dan pekatnya malam, rasa rindu, penyesalan, dan rahasia kelam masa lalu perlahan terkuak sepanjang perjalanan.",
            cast: "Ramon Y. Tungka (Resnu), Enggar Hasti Pudjiastuti (Istri Resnu), Landung Simatupang (Ayah)",
            director: "Sidharta Tata",
            popularity: 90,
            youtubeId: "ANlKtc3O_gI",
        },
        {
            id: "25",
            title: "Mlethek",
            type: "movie",
            year: 2023,
            rating: 8.5,
            duration: "17m",
            genres: ["Comedy", "Fantasy", "Indonesian"],
            country: "Indonesia",
            overview: "Tiga anak laki-laki memilih membolos dari kelas mengaji sore hari untuk memetik buah rambutan di pekarangan warga. Kepanikan konyol terjadi saat salah seorang tersedak dan tak sengaja menelan biji rambutan utuh, memicu mitos masa kecil bahwa pohon rambutan akan bertunas dan tumbuh keluar dari kepalanya.",
            cast: "Fajar Kurniawan (Gogo), Gabriel Bagus (Triton), Aditya Nugraha (Nunu)",
            director: "Wahyu Agung Prasetyo",
            popularity: 92,
            youtubeId: "UY5WwuPM1ZI",
        },
        {
            id: "26",
            title: "Coffee Run",
            type: "movie",
            year: 2020,
            rating: 8.0,
            duration: "3m",
            genres: ["Animation", "Drama"],
            overview: "Berbekal kopi, seorang perempuan muda berlari menembus jalanan kota sambil mengenang manis dan pahitnya hubungan yang telah berakhir.",
            cast: "Animasi 3D Blender Studio",
            director: "Hjalti Hjalmarsson",
            popularity: 87,
            youtubeId: "PVGeM40dABA",
        },
        {
            id: "27",
            title: "Wing It!",
            type: "movie",
            year: 2023,
            rating: 8.2,
            duration: "4m",
            genres: ["Animation", "Comedy", "Sci-Fi"],
            overview: "Seorang teknisi kapal angkasa yang serba rapi kedatangan tamu tak diundang: calon pilot amatir yang bersemangat, dan keduanya terlempar ke udara dalam pesawat yang lepas kendali.",
            cast: "Animasi 3D Blender Studio",
            director: "Rik Schutte",
            popularity: 90,
            youtubeId: "u9lj-c29dxI",
        },
        {
            id: "28",
            title: "The Daily Dweebs",
            type: "movie",
            year: 2017,
            rating: 7.4,
            duration: "1m",
            genres: ["Animation", "Comedy"],
            overview: "Pilot serial animasi pendek tentang Dixey, anjing peliharaan yang tinggal di kawasan pinggiran Amerika era 1950-an dan selalu punya tingkah menggemaskan.",
            cast: "Animasi 3D Blender Studio",
            director: "Hjalti Hjalmarsson",
            popularity: 76,
            youtubeId: "RJnKaAtBPhA",
        },
        {
            id: "29",
            title: "SINGULARITY",
            type: "movie",
            year: 2026,
            rating: 8.3,
            duration: "6m",
            genres: ["Animation", "Sci-Fi", "Adventure"],
            overview: "Petualangan ruang angkasa bergaya lukisan cat: seorang penjelajah kecil menembus keheningan kosmos menuju titik di mana segala sesuatu bertemu.",
            cast: "Animasi 3D Blender Studio",
            director: "Blender Studio",
            popularity: 88,
            youtubeId: "l5OZu-IrXpw",
        },
    ];

    /* Gambar pengganti bila poster/backdrop asli gagal dimuat. */
    const FALLBACK_POSTER =
        "https://images.unsplash.com/photo-1536440136628-849c177e76a1?auto=format&fit=crop&w=500&q=80";
    const FALLBACK_BACKDROP =
        "https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?auto=format&fit=crop&w=1280&q=80";

    /* ======================================================================
       2. UTILITAS
       ====================================================================== */
    /* Alias singkat document.getElementById agar kode render lebih ringkas. */
    const $ = (id) => document.getElementById(id);
    /* Cari satu judul berdasarkan id. */
    const findMovie = (id) => MOVIES_DATA.find((movie) => movie.id === id);
    /* Thumbnail diambil langsung dari YouTube agar tampilannya sama dengan video aslinya. */
    const youtubeThumb = (id, quality) => `https://i.ytimg.com/vi/${id}/${quality}.jpg`;
    /* Poster kartu memakai thumbnail standar YouTube. */
    const getPosterUrl = (movie) =>
        movie.youtubeId ? youtubeThumb(movie.youtubeId, "hqdefault") : FALLBACK_POSTER;
    /* Hero & halaman detail memakai thumbnail resolusi maksimal (16:9). */
    const getBackdropUrl = (movie) =>
        movie.youtubeId ? youtubeThumb(movie.youtubeId, "maxresdefault") : FALLBACK_BACKDROP;
    /* Cadangan bila thumbnail resolusi maksimal belum tersedia untuk video tersebut. */
    const getBackdropFallback = (movie) =>
        movie.youtubeId ? youtubeThumb(movie.youtubeId, "hqdefault") : FALLBACK_BACKDROP;
    /* Alamat video asli di YouTube (tombol "Buka di YouTube"). */
    const getYoutubeWatchUrl = (movie) =>
        movie.youtubeId ? `https://www.youtube.com/watch?v=${movie.youtubeId}` : "https://www.youtube.com";
    /* Alamat sematan pemutar. youtube-nocookie dipakai agar sematan lebih andal
       dan tidak memasang cookie pelacakan sebelum video diputar. */
    const getEmbedUrl = (movie) =>
        movie.youtubeId
            ? `https://www.youtube-nocookie.com/embed/${movie.youtubeId}?autoplay=1&rel=0&modestbranding=1&playsinline=1`
            : "";
    /* Deteksi preferensi sistem "kurangi animasi" (aksesibilitas). */
    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    /** Menunda eksekusi agar input pencarian tidak merender di setiap ketikan. */
    function debounce(fn, wait) {
        let timer = null;
        return function (...args) {
            clearTimeout(timer);
            timer = setTimeout(() => fn.apply(null, args), wait);
        };
    }

    /** Ambil data JSON dari localStorage; fallback bila kosong atau rusak. */
    function readJSON(key, fallback) {
        try {
            const raw = localStorage.getItem(key);
            return raw ? JSON.parse(raw) : fallback;
        } catch (error) {
            return fallback;
        }
    }

    /** Simpan data sebagai JSON; gagal menyimpan tidak menghentikan aplikasi. */
    function writeJSON(key, value) {
        try {
            localStorage.setItem(key, JSON.stringify(value));
        } catch (error) {
            /* Penyimpanan penuh atau diblokir: aplikasi tetap berjalan. */
        }
    }

    /** Render ulang ikon Lucide (tetap aman bila CDN gagal dimuat). */
    function refreshIcons() {
        if (window.lucide && typeof window.lucide.createIcons === "function") {
            window.lucide.createIcons();
        }
    }

    /* ======================================================================
       3. ROUTER SPA
       ====================================================================== */
    /* Peta hash URL -> id section halaman + fungsi yang mengisi isinya. */
    const ROUTES = {
        home: { page: "page-home", render: renderHomePage },
        movies: { page: "page-movies", render: renderMoviesPage },
        series: { page: "page-series", render: renderSeriesPage },
        detail: { page: "page-detail", render: renderDetailPage },
        "my-list": { page: "page-my-list", render: renderMyListPage },
        search: { page: "page-search", render: renderSearchPage },
        watch: { page: "page-watch", render: renderWatchPage },
    };

    /* Penanda agar listener hashchange hanya dipasang satu kali. */
    let routerReady = false;

    /** Pasang router sekali, lalu render rute yang sedang aktif. */
    function startRouter() {
        if (!routerReady) {
            routerReady = true;
            window.addEventListener("hashchange", handleRoute);
        }
        handleRoute();
    }

    /** Ambil nama rute dari hash: #movies/12 -> "movies". */
    function getCurrentRouteName() {
        const name = location.hash.replace(/^#\/?/, "").split("/")[0];
        return ROUTES[name] ? name : "home";
    }

    /** Inti router: sembunyikan semua halaman, tampilkan yang aktif, render isinya. */
    function handleRoute() {
        const [routeName, paramId] = location.hash.replace(/^#\/?/, "").split("/");
        const route = ROUTES[routeName] || ROUTES.home;
        const activeName = ROUTES[routeName] ? routeName : "home";

        // Hindari pemutaran yang tetap berjalan di halaman yang tidak terlihat.
        if (activeName !== "watch") stopWatchVideo();
        if (activeName !== "home") stopHeroAutoplay();

        document.querySelectorAll(".virtual-page").forEach((page) => page.classList.add("hidden"));
        $(route.page).classList.remove("hidden");

        document.querySelectorAll(".nav-link").forEach((link) => {
            link.classList.toggle("is-active", link.dataset.route === activeName);
        });

        closeMobileMenu();

        route.render(paramId);

        window.scrollTo(0, 0);
        refreshIcons();
    }

    /** Tombol kembali: selalu arahkan ke halaman utama web. */
    function goHome() {
        // Sudah di beranda (mis. dibuka langsung tanpa hash): cukup gulir ke atas.
        if (location.hash === "" || location.hash === "#" || location.hash === "#home") {
            window.scrollTo({ top: 0, behavior: "smooth" });
            return;
        }
        location.hash = "home";
    }

    /* ======================================================================
       4. NAVBAR & MENU MOBILE
       ====================================================================== */
    /** Beri gaya solid pada navbar begitu halaman digulir. */
    function initNavbarScroll() {
        const navbar = $("main-navbar");
        if (!navbar) return;

        let ticking = false;

        const update = () => {
            navbar.classList.toggle("is-scrolled", window.scrollY > 30);
            ticking = false;
        };

        window.addEventListener(
            "scroll",
            () => {
                if (ticking) return;
                ticking = true;
                requestAnimationFrame(update);
            },
            { passive: true }
        );

        update();
    }

    /** Tutup menu navigasi versi mobile. */
    function closeMobileMenu() {
        const menu = $("mobile-menu");
        if (!menu) return;
        menu.classList.add("hidden");
        $("mobile-menu-btn")?.setAttribute("aria-expanded", "false");
    }

    /** Buka/tutup menu navigasi versi mobile. */
    function toggleMobileMenu() {
        const menu = $("mobile-menu");
        if (!menu) return;
        const willOpen = menu.classList.contains("hidden");
        menu.classList.toggle("hidden", !willOpen);
        $("mobile-menu-btn")?.setAttribute("aria-expanded", String(willOpen));
    }

    /* ======================================================================
       5. DAFTAR SAYA & RIWAYAT TONTONAN
       ====================================================================== */
    /* Daftar Saya = array id judul yang disimpan di localStorage. */
    const getMyList = () => readJSON(CONFIG.myListKey, []);
    const isInMyList = (id) => getMyList().includes(id);
    const getWatchHistory = () => readJSON(CONFIG.historyKey, {});

    /** Perbarui angka jumlah item tersimpan di badge Daftar Saya. */
    function updateBadges() {
        const badge = $("mylist-count-badge");
        // Hanya hitung judul yang masih ada di katalog, agar sisa id lama di
        // localStorage tidak membuat angka badge berbeda dari isi daftar.
        if (badge) badge.textContent = `${getMyList().filter((id) => findMovie(id)).length} Item`;
    }

    /** Simpan atau hapus satu judul dari Daftar Saya. */
    function toggleMyList(id, trigger) {
        const list = getMyList();
        const movie = findMovie(id);
        const title = movie ? movie.title : "Film";
        const index = list.indexOf(id);
        const willSave = index === -1;

        if (willSave) {
            list.push(id);
            showToast(`"${title}" disimpan ke Daftar Saya.`);
        } else {
            list.splice(index, 1);
            showToast(`"${title}" dihapus dari Daftar Saya.`);
        }

        writeJSON(CONFIG.myListKey, list);
        updateBadges();

        // Perbarui ikon pada kartu yang diklik tanpa merender ulang seluruh daftar.
        if (trigger && trigger.classList.contains("bookmark-btn")) {
            trigger.classList.toggle("is-saved", willSave);
        }

        const route = getCurrentRouteName();
        if (route === "my-list") renderMyListPage();
        else if (route === "detail") renderDetailPage(id);
    }

    /** Catat persentase tontonan agar muncul di "Lanjutkan Menonton". */
    function saveWatchProgress(id, progressPct) {
        const history = getWatchHistory();
        history[id] = { timestamp: Date.now(), progressPct };
        writeJSON(CONFIG.historyKey, history);
    }

    /** Hapus satu judul dari riwayat tontonan. */
    function removeWatchProgress(id) {
        const history = getWatchHistory();
        delete history[id];
        writeJSON(CONFIG.historyKey, history);
        renderContinueWatchingSection();
        showToast("Item dihapus dari riwayat tontonan.");
    }

    /* ======================================================================
       6. RENDER HALAMAN
       ====================================================================== */

    /* ------------------------------- Kartu ------------------------------- */
    /** Template HTML satu kartu film, dipakai semua daftar dan grid. */
    function createMovieCardHtml(movie) {
        const saved = isInMyList(movie.id);

        return `
            <article class="card-hover-effect w-full h-full bg-[#12141B] border border-[#1B1E28] rounded-2xl overflow-hidden flex flex-col justify-between group">
                <div class="relative aspect-video w-full overflow-hidden bg-[#08090D]">
                    <!-- Thumbnail adalah tautan langsung ke pemutar film -->
                    <a href="#watch/${movie.id}" class="absolute inset-0 block" aria-label="Putar ${movie.title}">
                        <img src="${getPosterUrl(movie)}" alt="${movie.title}"
                            class="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                            loading="lazy" decoding="async" data-fallback="${FALLBACK_POSTER}">
                        <span class="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 transition">
                            <span class="w-10 h-10 rounded-full bg-[#B91C3B] text-white flex items-center justify-center shadow-lg">
                                <i data-lucide="play" class="w-5 h-5 fill-white"></i>
                            </span>
                        </span>
                    </a>

                    <div class="absolute top-2 right-2 z-10 flex items-center gap-1 bg-black/70 backdrop-blur-md px-2 py-0.5 rounded-full text-[10px] font-bold text-amber-400 border border-white/10">
                        <i data-lucide="star" class="w-3 h-3 fill-amber-400"></i> ${movie.rating}
                    </div>

                    <button type="button" data-action="toggle-mylist" data-id="${movie.id}"
                        aria-label="Simpan ${movie.title} ke Daftar Saya"
                        class="bookmark-btn ${saved ? "is-saved" : ""} absolute top-2 left-2 z-10 p-1.5 rounded-full backdrop-blur-md transition">
                        <i data-lucide="bookmark" class="w-3.5 h-3.5"></i>
                    </button>
                </div>

                <div class="p-3 flex-grow flex flex-col justify-between space-y-1.5">
                    <div>
                        <div class="flex items-center justify-between text-[10px] text-[#9CA3AF] mb-1">
                            <span>${movie.year}</span>
                            <span class="uppercase font-semibold">${movie.type}</span>
                        </div>
                        <h3 class="text-xs font-bold text-white truncate group-hover:text-[#B91C3B] transition" title="${movie.title}">${movie.title}</h3>
                        <p class="text-[10px] text-[#9CA3AF] truncate">${movie.genres.join(", ")}</p>
                        ${movie.cast ? `<p class="text-[10px] text-[#9CA3AF]/90 truncate mt-0.5" title="${movie.cast}"><span class="text-[#B91C3B] font-semibold">Pemeran:</span> ${movie.cast}</p>` : ""}
                    </div>

                    <div class="pt-2 mt-auto">
                        <a href="#detail/${movie.id}"
                            class="w-full py-1.5 bg-[#1B1E28] hover:bg-[#B91C3B] text-white text-[11px] font-semibold rounded-lg text-center transition flex items-center justify-center gap-1">
                            <i data-lucide="info" class="w-3 h-3"></i> Detail
                        </a>
                    </div>
                </div>
            </article>
        `;
    }

    /** Tampilan alternatif saat daftar kosong (mis. Daftar Saya belum berisi). */
    function createEmptyStateHtml(title, description) {
        return `
            <div class="col-span-full py-16 text-center space-y-3 bg-[#12141B] border border-[#1B1E28] rounded-3xl p-8">
                <i data-lucide="bookmark-x" class="w-12 h-12 text-[#9CA3AF] mx-auto opacity-40"></i>
                <h2 class="text-base font-bold text-white">${title}</h2>
                <p class="text-xs text-[#9CA3AF] max-w-sm mx-auto">${description}</p>
                <a href="#movies" class="inline-block mt-2 px-5 py-2.5 bg-[#B91C3B] text-white font-bold text-xs rounded-xl hover:bg-[#9F1832] transition">Eksplor Katalog Film</a>
            </div>
        `;
    }

    /** Carousel horizontal: setiap kartu dibungkus lebar tetap. */
    function renderMovieCards(movies, containerId) {
        const container = $(containerId);
        if (!container) return;

        container.innerHTML = movies
            .map((movie) => `<div class="card-fixed-width">${createMovieCardHtml(movie)}</div>`)
            .join("");

        refreshIcons();
    }

    /** Grid responsif. */
    function renderMovieGrid(movies, containerId) {
        const container = $(containerId);
        if (!container) return;

        container.innerHTML = movies.length
            ? movies.map(createMovieCardHtml).join("")
            : `
                <div class="col-span-full py-12 text-center text-[#9CA3AF]">
                    <i data-lucide="film" class="w-10 h-10 mx-auto mb-2 opacity-40"></i>
                    <p class="text-sm">Tidak ada film yang cocok dengan kriteria filter Anda.</p>
                </div>
            `;

        refreshIcons();
    }

    /** Geser carousel horizontal sejauh 300px ke kiri atau kanan. */
    function scrollSection(elementId, direction) {
        const element = $(elementId);
        if (!element) return;
        const distance = direction === "left" ? -300 : 300;
        element.scrollBy({ left: distance, behavior: prefersReducedMotion ? "auto" : "smooth" });
    }

    /* ------------------------------- Beranda ----------------------------- */
    /** Isi beranda: hero, lanjutkan menonton, dan semua deretan kartu. */
    function renderHomePage() {
        setupHeroCarousel();
        renderContinueWatchingSection();

        const trendingMovies = [...MOVIES_DATA].sort((a, b) => b.popularity - a.popularity).slice(0, 10);
        renderMovieCards(trendingMovies, "trending-list");
        renderMovieCards(
            MOVIES_DATA.filter((movie) => movie.country === "Indonesia" || movie.genres.includes("Indonesian")),
            "indonesia-list"
        );
        renderMovieCards(
            MOVIES_DATA.filter((movie) => movie.rating >= 8.7),
            "top-rated-list"
        );
        renderMovieCards(
            MOVIES_DATA.filter((movie) => movie.type === "movie"),
            "popular-list"
        );
        renderMovieGrid(MOVIES_DATA.slice(10, 15), "originals-list");

        updateBadges();
    }

    /** Tampilkan kartu riwayat tontonan beserta bar progresnya. */
    function renderContinueWatchingSection() {
        const container = $("continue-watching-container");
        if (!container) return;

        const history = getWatchHistory();
        const activeIds = Object.keys(history);

        if (activeIds.length === 0) {
            container.innerHTML = `
                <div class="bg-[#12141B] border border-[#1B1E28] rounded-2xl p-6 text-center space-y-2">
                    <i data-lucide="tv" class="w-8 h-8 text-[#9CA3AF] mx-auto opacity-50"></i>
                    <p class="text-sm font-semibold text-white">Belum Ada Tontonan untuk Dilanjutkan</p>
                    <p class="text-xs text-[#9CA3AF] max-w-md mx-auto">Mulai jelajahi katalog dan tonton film favorit Anda. Progres tontonan akan otomatis tersimpan di sini.</p>
                </div>
            `;
            refreshIcons();
            return;
        }

        const itemsHtml = activeIds
            .map((id) => {
                const movie = findMovie(id);
                if (!movie) return "";
                const progress = history[id].progressPct || 0;

                return `
                    <div class="shrink-0 w-56 sm:w-64 bg-[#12141B] border border-[#1B1E28] rounded-2xl overflow-hidden relative group">
                        <div class="relative aspect-video">
                            <img src="${getBackdropUrl(movie)}" alt="${movie.title}"
                                class="w-full h-full object-cover" loading="lazy" decoding="async"
                                data-fallback="${getBackdropFallback(movie)}">
                            <div class="absolute inset-0 bg-black/40 group-hover:bg-black/20 transition"></div>
                            <a href="#watch/${movie.id}" class="absolute inset-0 flex items-center justify-center" aria-label="Lanjutkan ${movie.title}">
                                <span class="w-10 h-10 rounded-full bg-[#B91C3B] text-white flex items-center justify-center shadow-lg group-hover:scale-110 transition">
                                    <i data-lucide="play" class="w-5 h-5 fill-white"></i>
                                </span>
                            </a>
                            <button type="button" data-action="remove-history" data-id="${movie.id}"
                                title="Hapus dari riwayat" aria-label="Hapus ${movie.title} dari riwayat"
                                class="absolute top-2 right-2 p-1 rounded-full bg-black/60 text-[#9CA3AF] hover:text-white hover:bg-red-600 transition">
                                <i data-lucide="x" class="w-3.5 h-3.5"></i>
                            </button>
                            <div class="absolute bottom-0 left-0 right-0 h-1 bg-white/30">
                                <div class="h-full bg-[#B91C3B]" style="width: ${progress}%"></div>
                            </div>
                        </div>
                        <div class="p-3">
                            <p class="text-xs font-bold text-white truncate">${movie.title}</p>
                            <p class="text-[10px] text-[#9CA3AF]">${movie.duration} - Sisa tontonan</p>
                        </div>
                    </div>
                `;
            })
            .join("");

        container.innerHTML = `
            <div class="flex gap-2 sm:gap-3 overflow-x-auto no-scrollbar scroll-smooth pb-2">
                ${itemsHtml}
            </div>
        `;

        refreshIcons();
    }

    /* ----------------------------- Hero carousel ------------------------- */
    /* Slide hero memakai judul bertanda featured (thumbnail YouTube resolusi tinggi). */
    const HERO_MOVIES = MOVIES_DATA.filter((movie) => movie.featured).slice(0, CONFIG.heroCount);
    let heroTimer = null;
    let heroIndex = 0;

    /** Bangun slide + titik indikator, lalu mulai autoplay. */
    function setupHeroCarousel() {
        const container = $("hero-slides-container");
        const indicators = $("hero-indicators");
        if (!container || !indicators) return;

        const slidesHtml = HERO_MOVIES.map(
            (movie, index) => `
                <div class="hero-slide absolute inset-0 w-full h-full ${index === 0 ? "opacity-100 z-10" : "opacity-0 z-0"}" data-slide-index="${index}">
                    <img src="${getBackdropUrl(movie)}" alt="${movie.title}"
                        class="w-full h-full object-cover" ${index === 0 ? 'fetchpriority="high"' : 'loading="lazy"'}
                        data-fallback="${getBackdropFallback(movie)}">
                    <div class="absolute inset-0 bg-gradient-to-t from-[#08090D] via-[#08090D]/60 to-transparent"></div>
                    <div class="absolute inset-0 bg-gradient-to-r from-[#08090D] via-[#08090D]/40 to-transparent"></div>

                    <div class="absolute bottom-8 sm:bottom-12 left-0 right-0 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-3 sm:space-y-4">
                        <div class="flex items-center gap-2">
                            <span class="bg-[#B91C3B] text-white text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider">CINEMATAMA FEATURED</span>
                            <span class="text-xs text-[#9CA3AF] font-bold">${movie.year}</span>
                            <span class="text-xs text-amber-400 font-bold flex items-center gap-1">
                                <i data-lucide="star" class="w-3.5 h-3.5 fill-amber-400"></i> ${movie.rating}
                            </span>
                        </div>

                        <h1 class="text-2xl sm:text-4xl md:text-5xl lg:text-6xl font-black text-white max-w-2xl tracking-tight leading-none">${movie.title}</h1>
                        <p class="text-xs sm:text-sm text-[#9CA3AF] max-w-xl line-clamp-2 leading-relaxed">${movie.overview}</p>

                        <div class="pt-2 flex flex-wrap items-center gap-2 sm:gap-3">
                            <a href="#watch/${movie.id}" class="px-4 sm:px-6 py-2.5 sm:py-3 bg-[#B91C3B] hover:bg-[#9F1832] text-white font-bold rounded-xl transition shadow-lg shadow-[#B91C3B]/30 flex items-center gap-2 text-xs sm:text-sm">
                                <i data-lucide="play" class="w-4 h-4 fill-white"></i> Tonton Sekarang
                            </a>
                            <a href="#detail/${movie.id}" class="px-5 py-3 bg-[#12141B]/80 hover:bg-[#1B1E28] text-white font-semibold rounded-xl border border-[#1B1E28] backdrop-blur-md transition flex items-center gap-2 text-xs sm:text-sm">
                                <i data-lucide="info" class="w-4 h-4 text-[#B91C3B]"></i> Informasi
                            </a>
                        </div>
                    </div>
                </div>
            `
        ).join("");

        const indicatorsHtml = HERO_MOVIES.map(
            (movie, index) => `
                <button type="button" data-action="hero-goto" data-index="${index}"
                    aria-label="Tampilkan ${movie.title}"
                    class="hero-dot h-1.5 rounded-full transition-all ${index === 0 ? "bg-[#B91C3B] w-12" : "bg-white/30 hover:bg-white/60 w-8"}"></button>
            `
        ).join("");

        container.innerHTML = slidesHtml;
        indicators.innerHTML = indicatorsHtml;

        setHeroSlide(0);
        startHeroAutoplay();

        const carousel = $("hero-carousel");
        if (carousel) {
            carousel.onmouseenter = stopHeroAutoplay;
            carousel.onmouseleave = startHeroAutoplay;
        }
    }

    /** Tampilkan slide ke-index; indeks di luar batas akan diputar (looping). */
    function setHeroSlide(index) {
        const slides = document.querySelectorAll(".hero-slide");
        const dots = document.querySelectorAll(".hero-dot");
        if (!slides.length) return;

        const target = ((index % slides.length) + slides.length) % slides.length;

        slides.forEach((slide, position) => {
            const isActive = position === target;
            slide.classList.toggle("opacity-100", isActive);
            slide.classList.toggle("z-10", isActive);
            slide.classList.toggle("opacity-0", !isActive);
            slide.classList.toggle("z-0", !isActive);
            slide.setAttribute("aria-hidden", String(!isActive));
        });

        dots.forEach((dot, position) => {
            const isActive = position === target;
            dot.classList.toggle("bg-[#B91C3B]", isActive);
            dot.classList.toggle("w-12", isActive);
            dot.classList.toggle("bg-white/30", !isActive);
            dot.classList.toggle("hover:bg-white/60", !isActive);
            dot.classList.toggle("w-8", !isActive);
            dot.setAttribute("aria-current", String(isActive));
        });

        heroIndex = target;
    }

    /** Lompat ke slide tertentu (dari klik titik indikator). */
    function goToHeroSlide(index) {
        setHeroSlide(index);
        startHeroAutoplay();
    }

    /** Slide berikutnya. */
    function nextHeroSlide() {
        setHeroSlide(heroIndex + 1);
    }

    /** Slide sebelumnya. */
    function prevHeroSlide() {
        setHeroSlide(heroIndex - 1);
    }

    /** Mulai autoplay; batal bila tab tak terlihat atau animasi dikurangi. */
    function startHeroAutoplay() {
        stopHeroAutoplay();
        if (prefersReducedMotion || document.hidden) return;
        heroTimer = setInterval(nextHeroSlide, CONFIG.heroInterval);
    }

    /** Hentikan autoplay hero. */
    function stopHeroAutoplay() {
        if (heroTimer) clearInterval(heroTimer);
        heroTimer = null;
    }

    /* --------------------------- Katalog film ---------------------------- */
    /** Halaman katalog film: cukup jalankan filter katalog. */
    function renderMoviesPage() {
        applyCatalogFilters();
    }

    /** Cocokkan tahun rilis film dengan pilihan pada filter tahun. */
    function matchYear(movie, yearFilter) {
        switch (yearFilter) {
            case "2020-2026":
                return movie.year >= 2020 && movie.year <= 2026;
            case "2015-2019":
                return movie.year >= 2015 && movie.year <= 2019;
            case "2010-2014":
                return movie.year >= 2010 && movie.year <= 2014;
            case "CLASSIC":
                return movie.year < 2010;
            default:
                return true;
        }
    }

    /** Gabungkan pencarian + genre + tahun + urutan, lalu render grid-nya. */
    function applyCatalogFilters() {
        const search = ($("catalog-search")?.value || "").trim().toLowerCase();
        const genre = $("catalog-genre")?.value || "ALL";
        const year = $("catalog-year")?.value || "ALL";
        const sort = $("catalog-sort")?.value || "popular";

        const filtered = MOVIES_DATA.filter((movie) => {
            if (movie.type !== "movie") return false;
            if (genre !== "ALL" && !movie.genres.includes(genre) && !(genre === "Indonesian" && movie.country === "Indonesia")) return false;
            if (!matchYear(movie, year)) return false;
            if (!search) return true;
            return (
                movie.title.toLowerCase().includes(search) ||
                (movie.director && movie.director.toLowerCase().includes(search)) ||
                (movie.cast && movie.cast.toLowerCase().includes(search)) ||
                (movie.overview && movie.overview.toLowerCase().includes(search)) ||
                movie.genres.some((item) => item.toLowerCase().includes(search))
            );
        });

        const sorters = {
            popular: (a, b) => b.popularity - a.popularity,
            rating: (a, b) => b.rating - a.rating,
            newest: (a, b) => b.year - a.year,
            title: (a, b) => a.title.localeCompare(b.title),
        };
        filtered.sort(sorters[sort] || sorters.popular);

        const badge = $("movies-count-badge");
        if (badge) badge.textContent = String(filtered.length);

        renderMovieGrid(filtered, "movies-catalog-grid");
    }

    /** Halaman serial TV: tampilkan semua data bertipe "series". */
    function renderSeriesPage() {
        renderMovieGrid(
            MOVIES_DATA.filter((movie) => movie.type === "series"),
            "series-catalog-grid"
        );
    }

    /* ---------------------------- Halaman detail ------------------------- */
    /** Isi halaman detail satu judul beserta rekomendasi serupa. */
    function renderDetailPage(id) {
        const movie = findMovie(id) || MOVIES_DATA[0];

        // Thumbnail besar diambil dari YouTube; siapkan cadangan bila resolusi maksimal tidak ada.
        const backdropImg = $("detail-backdrop");
        backdropImg.dataset.fallback = getBackdropFallback(movie);
        delete backdropImg.dataset.handled;
        backdropImg.src = getBackdropUrl(movie);
        $("detail-poster").src = getPosterUrl(movie);
        // Poster pada halaman detail juga langsung memutar film.
        const posterLink = $("detail-poster-link");
        if (posterLink) {
            posterLink.setAttribute("href", `#watch/${movie.id}`);
            posterLink.setAttribute("aria-label", `Putar ${movie.title}`);
        }
        $("detail-title").textContent = movie.title;
        $("detail-type-badge").textContent = movie.type.toUpperCase();
        $("detail-year").textContent = movie.year;
        $("detail-rating").textContent = movie.rating;
        $("detail-duration").textContent = movie.duration;
        $("detail-overview").textContent = movie.overview;
        $("detail-director").textContent = movie.director;
        $("detail-cast").textContent = movie.cast;

        $("detail-genres").innerHTML = movie.genres
            .map(
                (genre) =>
                    `<span class="bg-[#1B1E28] text-white text-[11px] px-3 py-1 rounded-full font-semibold border border-[#1B1E28]">${genre}</span>`
            )
            .join("");

        const saved = isInMyList(movie.id);

        const playBtn = $("detail-play-btn");
        playBtn.dataset.id = movie.id;

        const youtubeBtn = $("detail-youtube-btn");
        if (youtubeBtn) youtubeBtn.setAttribute("href", getYoutubeWatchUrl(movie));

        const myListBtn = $("detail-mylist-btn");
        myListBtn.dataset.id = movie.id;
        myListBtn.innerHTML = `<i data-lucide="bookmark" class="w-4 h-4 ${saved ? "fill-white" : ""}"></i> ${
            saved ? "Tersimpan di Daftar" : "Tambah ke Daftar"
        }`;

        const similar = MOVIES_DATA.filter(
            (item) => item.id !== movie.id && item.genres.some((genre) => movie.genres.includes(genre))
        ).slice(0, 5);
        renderMovieGrid(similar, "detail-similar-grid");

        refreshIcons();
    }

    /* ---------------------------- Daftar Saya ---------------------------- */
    /** Halaman Daftar Saya: tampilkan judul yang tersimpan. */
    function renderMyListPage() {
        const listIds = getMyList();
        const container = $("mylist-grid");
        updateBadges();

        if (listIds.length === 0) {
            container.innerHTML = createEmptyStateHtml(
                "Daftar Tontonan Anda Kosong",
                "Klik ikon penanda pada kartu film untuk menyimpannya di sini."
            );
            refreshIcons();
            return;
        }

        renderMovieGrid(
            MOVIES_DATA.filter((movie) => listIds.includes(movie.id)),
            "mylist-grid"
        );
    }

    /* ------------------------------ Pencarian ---------------------------- */
    /** Halaman pencarian: langsung jalankan pencarian terakhir. */
    function renderSearchPage() {
        handleSearchQuery();
    }

    /** Isi kolom pencarian lalu cari (dipakai tombol "Pencarian Populer"). */
    function setSearchQuery(query) {
        const input = $("global-search-input");
        if (!input) return;
        input.value = query;
        handleSearchQuery();
    }

    /** Cari berdasarkan judul, sutradara, atau genre lalu render hasil. */
    function handleSearchQuery() {
        const input = $("global-search-input");
        const container = $("search-results-container");
        if (!input || !container) return;

        const query = input.value.trim().toLowerCase();

        if (!query) {
            container.innerHTML = `
                <div class="py-12 text-center text-[#9CA3AF]">
                    <p class="text-xs">Ketik kata kunci di atas untuk mencari koleksi film dan serial.</p>
                </div>
            `;
            return;
        }

        const results = MOVIES_DATA.filter(
            (movie) =>
                movie.title.toLowerCase().includes(query) ||
                (movie.director && movie.director.toLowerCase().includes(query)) ||
                (movie.cast && movie.cast.toLowerCase().includes(query)) ||
                (movie.overview && movie.overview.toLowerCase().includes(query)) ||
                (movie.country && movie.country.toLowerCase().includes(query)) ||
                movie.genres.some((genre) => genre.toLowerCase().includes(query))
        );

        container.innerHTML = `
            <div class="space-y-4">
                <p class="text-xs text-[#9CA3AF]">Ditemukan <span class="text-white font-bold">${results.length}</span> hasil untuk "<span class="text-white">${query}</span>"</p>
                <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2 sm:gap-3">
                    ${results.map(createMovieCardHtml).join("")}
                </div>
            </div>
        `;

        refreshIcons();
    }

    /* ======================================================================
       7. PEMUTAR YOUTUBE
       ====================================================================== */
    /** Siapkan halaman nonton: judul, deskripsi, dan sematkan video YouTube. */
    function renderWatchPage(id) {
        const movie = findMovie(id) || MOVIES_DATA[0];

        $("watch-movie-title").textContent = movie.title;
        $("watch-movie-overview").textContent = movie.overview;
        if ($("watch-movie-director")) $("watch-movie-director").textContent = movie.director || "-";
        if ($("watch-movie-cast")) $("watch-movie-cast").textContent = movie.cast || "-";

        const backLink = $("watch-back-link");
        if (backLink) backLink.setAttribute("href", `#detail/${movie.id}`);

        const youtubeLink = $("watch-youtube-link");
        if (youtubeLink) youtubeLink.setAttribute("href", getYoutubeWatchUrl(movie));

        // Video asli YouTube disematkan langsung dan diputar otomatis.
        const frame = $("youtube-player");
        if (frame) {
            frame.title = movie.title;
            frame.src = getEmbedUrl(movie);
        }

        // Catat tontonan baru saja dimulai (sekali, agar progres tidak tertimpa).
        if (!getWatchHistory()[movie.id]) saveWatchProgress(movie.id, 10);
    }

    /** Kosongkan iframe agar video berhenti saat halaman ditinggalkan. */
    function stopWatchVideo() {
        const frame = $("youtube-player");
        if (frame && frame.getAttribute("src") !== "about:blank") frame.src = "about:blank";
    }

    /* ======================================================================
       8. MODAL & TOAST
       ====================================================================== */
    /** Buka modal pengaturan pemutaran. */
    function openSettingsModal() {
        $("settings-modal")?.classList.remove("hidden");
    }

    /** Tutup modal pengaturan pemutaran. */
    function closeSettingsModal() {
        $("settings-modal")?.classList.add("hidden");
    }

    /** Tampilkan notifikasi kecil di kanan bawah selama 3 detik. */
    function showToast(message) {
        const container = $("toast-container");
        if (!container) return;

        const toast = document.createElement("div");
        toast.className = "toast";
        toast.innerHTML = `<i data-lucide="check-circle" class="w-4 h-4 text-[#B91C3B]"></i><span></span>`;
        toast.querySelector("span").textContent = message;

        container.appendChild(toast);
        refreshIcons();

        requestAnimationFrame(() => toast.classList.add("is-visible"));

        setTimeout(() => {
            toast.classList.add("is-hiding");
            setTimeout(() => toast.remove(), 300);
        }, 3000);
    }

    /* ======================================================================
       9. EVENT DELEGATION & INIT
       ====================================================================== */

    /** Satu listener untuk seluruh aksi klik (statis maupun hasil render). */
    function onDocumentClick(event) {
        if (!(event.target instanceof Element)) return;

        const actionEl = event.target.closest("[data-action]");

        if (!actionEl) {
            // Hanya klik tepat pada area gelap modal yang menutup modal.
            const backdrop = event.target;
            if (backdrop.hasAttribute?.("data-modal-backdrop")) closeSettingsModal();
            return;
        }

        const { action, id, index, target, direction, query } = actionEl.dataset;

        // Setiap nilai data-action di HTML dipetakan ke fungsi di bawah ini.
        switch (action) {
            case "toggle-mobile-menu":
                toggleMobileMenu();
                break;

            case "close-mobile-menu":
                closeMobileMenu();
                break;

            case "open-settings":
                openSettingsModal();
                break;

            case "close-settings":
                closeSettingsModal();
                break;

            case "save-settings":
                closeSettingsModal();
                showToast("Pengaturan berhasil disimpan!");
                break;

            case "go-home":
                goHome();
                break;

            case "hero-prev":
                prevHeroSlide();
                startHeroAutoplay();
                break;

            case "hero-next":
                nextHeroSlide();
                startHeroAutoplay();
                break;

            case "hero-goto":
                goToHeroSlide(Number(index));
                break;

            case "scroll-section":
                scrollSection(target, direction);
                break;

            case "toggle-mylist":
                if (id) toggleMyList(id, actionEl);
                break;

            case "remove-history":
                if (id) removeWatchProgress(id);
                break;

            case "watch":
                if (id) location.hash = `watch/${id}`;
                break;

            case "search":
                setSearchQuery(query || "");
                if (actionEl.tagName === "BUTTON") location.hash = "search";
                break;

            default:
                break;
        }
    }

    /** Tombol Escape menutup semua modal dan menu. */
    function onDocumentKeydown(event) {
        if (event.key !== "Escape") return;

        closeSettingsModal();
        closeMobileMenu();
    }

    /** Menangani gambar yang gagal dimuat tanpa inline `onerror`. */
    function onImageError(event) {
        const image = event.target;
        if (!(image instanceof HTMLImageElement)) return;

        if (image.dataset.imgError === "logo") {
            image.style.display = "none";
            const label = image.nextElementSibling;
            if (label) label.style.display = "block";
            return;
        }

        if (image.dataset.handled === "true") {
            image.style.visibility = "hidden";
            return;
        }

        if (image.dataset.fallback) {
            image.dataset.handled = "true";
            image.src = image.dataset.fallback;
            return;
        }

        image.style.display = "none";
    }

    /** Saat tab disembunyikan: hentikan animasi hero dan video. */
    function onVisibilityChange() {
        if (document.hidden) {
            stopHeroAutoplay();
            stopWatchVideo();
        } else if (getCurrentRouteName() === "home") {
            startHeroAutoplay();
        }
    }

    /** Pasang listener filter katalog (dengan debounce agar ringan). */
    function initCatalogFilters() {
        const refresh = debounce(applyCatalogFilters, CONFIG.searchDebounce);

        ["catalog-search", "catalog-genre", "catalog-year", "catalog-sort"].forEach((id) => {
            const element = $(id);
            if (!element) return;
            element.addEventListener("input", refresh);
            element.addEventListener("change", refresh);
        });
    }

    /** Pasang listener kolom pencarian global (dengan debounce). */
    function initGlobalSearch() {
        const input = $("global-search-input");
        if (!input) return;
        input.addEventListener("input", debounce(handleSearchQuery, CONFIG.searchDebounce));
    }

    /** Titik masuk aplikasi: pasang event, ikon, lalu mulai router. */
    function init() {
        initNavbarScroll();
        initCatalogFilters();
        initGlobalSearch();

        document.addEventListener("click", onDocumentClick);
        document.addEventListener("keydown", onDocumentKeydown);
        document.addEventListener("error", onImageError, true);
        document.addEventListener("visibilitychange", onVisibilityChange);

        refreshIcons();
        startRouter();
    }

    init();
})();
