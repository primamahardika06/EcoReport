// Data laporan yang disimpan di localStorage
let reports = JSON.parse(localStorage.getItem("ecoReports")) || [];
let uploadedImages = [];
let stream = null;

// Inisialisasi halaman
document.addEventListener("DOMContentLoaded", function () {
  loadReports();
  setupEventListeners();
  updateStatistics();
});

// Setup semua event listener
function setupEventListeners() {
  // Mobile Menu Toggle
  document
    .getElementById("mobileMenuBtn")
    .addEventListener("click", function () {
      document.getElementById("navLinks").classList.toggle("active");
    });

  // Tab Navigation
  const tabBtns = document.querySelectorAll(".tab-btn");
  const tabContents = document.querySelectorAll(".tab-content");

  tabBtns.forEach((btn) => {
    btn.addEventListener("click", () => {
      tabBtns.forEach((b) => b.classList.remove("active"));
      tabContents.forEach((c) => c.classList.remove("active"));

      btn.classList.add("active");

      const tabId = btn.getAttribute("data-tab") + "Tab";
      document.getElementById(tabId).classList.add("active");

      // Jika berpindah ke tab riwayat, refresh data
      if (tabId === "historyTab") {
        loadReports();
      }
    });
  });

  // Drag & Drop Upload
  const photoUploadArea = document.getElementById("photoUploadArea");
  const fileInput = document.getElementById("fileInput");

  // Mencegah perilaku default untuk drag & drop
  ["dragenter", "dragover", "dragleave", "drop"].forEach((eventName) => {
    photoUploadArea.addEventListener(eventName, preventDefaults, false);
  });

  function preventDefaults(e) {
    e.preventDefault();
    e.stopPropagation();
  }

  // Highlight area saat drag over
  ["dragenter", "dragover"].forEach((eventName) => {
    photoUploadArea.addEventListener(eventName, highlight, false);
  });

  ["dragleave", "drop"].forEach((eventName) => {
    photoUploadArea.addEventListener(eventName, unhighlight, false);
  });

  function highlight() {
    photoUploadArea.classList.add("drag-over");
  }

  function unhighlight() {
    photoUploadArea.classList.remove("drag-over");
  }

  // Handle drop
  photoUploadArea.addEventListener("drop", handleDrop, false);

  function handleDrop(e) {
    const dt = e.dataTransfer;
    const files = dt.files;
    handleFiles(files);
  }

  // File upload button
  document
    .getElementById("fileUploadBtn")
    .addEventListener("click", function () {
      fileInput.click();
    });

  fileInput.addEventListener("change", function () {
    handleFiles(this.files);
  });

  // Camera button
  document.getElementById("cameraBtn").addEventListener("click", openCamera);

  // Camera modal controls
  document
    .getElementById("closeCameraModal")
    .addEventListener("click", closeCamera);
  document.getElementById("captureBtn").addEventListener("click", capturePhoto);
  document.getElementById("savePhotoBtn").addEventListener("click", savePhoto);
  document.getElementById("retakeBtn").addEventListener("click", retakePhoto);

  // Submit report
  document
    .getElementById("submitReport")
    .addEventListener("click", submitReport);

  // Success message buttons
  document
    .getElementById("viewHistoryBtn")
    .addEventListener("click", function (e) {
      e.preventDefault();
      switchToTab("history");
      document.getElementById("successMessage").classList.add("hidden");
    });

  document
    .getElementById("backToReportBtn")
    .addEventListener("click", function (e) {
      e.preventDefault();
      switchToTab("report");
      document.getElementById("successMessage").classList.add("hidden");
      clearForm();
    });

  // educationTabtion menu
//  // ... (kode sebelumnya tetap sama)

const eduMenuItems = document.querySelectorAll('.education-menu a');
eduMenuItems.forEach(item => {
    item.addEventListener('click', function(e) {
        if (this.getAttribute('href') === '#' || this.getAttribute('href').startsWith('#')) {
            e.preventDefault();
            eduMenuItems.forEach(i => i.classList.remove('active-edu'));
            this.classList.add('active-edu');
            
            // Tampilkan konten yang sesuai jika ada data-content
            const contentId = this.getAttribute('data-content');
            if (contentId) {
                document.querySelectorAll('.edu-content').forEach(content => {
                    content.classList.remove('active-content');
                });
                document.getElementById(contentId + 'Content').classList.add('active-content');
            }
        }
    });
});


  // Close mobile menu when clicking on a link
  document.querySelectorAll(".nav-links a").forEach((link) => {
    link.addEventListener("click", () => {
      document.getElementById("navLinks").classList.remove("active");
    });
  });
}

// Handle uploaded files
function handleFiles(files) {
  [...files].forEach((file) => {
    if (!file.type.startsWith("image/")) {
      alert("Hanya file gambar yang diperbolehkan!");
      return;
    }

    const reader = new FileReader();
    reader.readAsDataURL(file);

    reader.onload = function (e) {
      addImagePreview(e.target.result, file.name);
    };
  });
}

// Tambahkan preview gambar
function addImagePreview(src, fileName) {
  const previewContainer = document.getElementById("previewContainer");

  const previewItem = document.createElement("div");
  previewItem.className = "preview-item";
  previewItem.dataset.filename = fileName;

  const img = document.createElement("img");
  img.src = src;

  const removeBtn = document.createElement("button");
  removeBtn.className = "remove-image";
  removeBtn.innerHTML = "&times;";
  removeBtn.addEventListener("click", function () {
    previewItem.remove();
    uploadedImages = uploadedImages.filter((img) => img.filename !== fileName);
  });

  previewItem.appendChild(img);
  previewItem.appendChild(removeBtn);
  previewContainer.appendChild(previewItem);

  // Simpan gambar ke array
  uploadedImages.push({
    src: src,
    filename: fileName,
  });
}

// Fungsi kamera
function openCamera() {
  const modal = document.getElementById("cameraModal");
  modal.style.display = "flex";

  // Coba akses kamera
  navigator.mediaDevices
    .getUserMedia({
      video: { facingMode: "environment" },
    })
    .then(function (mediaStream) {
      stream = mediaStream;
      const cameraStream = document.getElementById("cameraStream");
      cameraStream.srcObject = stream;
      cameraStream.style.display = "block";
      document.getElementById("cameraPlaceholder").style.display = "none";
    })
    .catch(function (err) {
      console.error("Error accessing camera:", err);
      alert(
        "Tidak dapat mengakses kamera. Pastikan Anda memberikan izin kamera."
      );
      closeCamera();
    });
}

function closeCamera() {
  const modal = document.getElementById("cameraModal");
  modal.style.display = "none";

  // Hentikan stream kamera
  if (stream) {
    stream.getTracks().forEach((track) => track.stop());
    stream = null;
  }

  // Reset tampilan kamera
  document.getElementById("cameraStream").style.display = "none";
  document.getElementById("cameraPlaceholder").style.display = "block";
  document.getElementById("photoCanvas").style.display = "none";
  document.getElementById("captureBtn").style.display = "inline-block";
  document.getElementById("savePhotoBtn").style.display = "none";
  document.getElementById("retakeBtn").style.display = "none";
}

function capturePhoto() {
  const cameraStream = document.getElementById("cameraStream");
  const photoCanvas = document.getElementById("photoCanvas");
  const ctx = photoCanvas.getContext("2d");

  // Set ukuran canvas sesuai video
  photoCanvas.width = cameraStream.videoWidth;
  photoCanvas.height = cameraStream.videoHeight;

  // Gambar frame video ke canvas
  ctx.drawImage(cameraStream, 0, 0, photoCanvas.width, photoCanvas.height);

  // Tampilkan canvas dan sembunyikan video
  cameraStream.style.display = "none";
  photoCanvas.style.display = "block";

  // Tampilkan tombol simpan dan ambil ulang
  document.getElementById("captureBtn").style.display = "none";
  document.getElementById("savePhotoBtn").style.display = "inline-block";
  document.getElementById("retakeBtn").style.display = "inline-block";
}

function retakePhoto() {
  const cameraStream = document.getElementById("cameraStream");
  const photoCanvas = document.getElementById("photoCanvas");

  // Kembali ke mode kamera
  cameraStream.style.display = "block";
  photoCanvas.style.display = "none";

  // Tampilkan tombol capture lagi
  document.getElementById("captureBtn").style.display = "inline-block";
  document.getElementById("savePhotoBtn").style.display = "none";
  document.getElementById("retakeBtn").style.display = "none";
}

function savePhoto() {
  const photoCanvas = document.getElementById("photoCanvas");
  const imageSrc = photoCanvas.toDataURL("image/jpeg");
  const fileName = "camera_" + Date.now() + ".jpg";

  addImagePreview(imageSrc, fileName);
  closeCamera();
}

// Submit laporan
function submitReport() {
  const location = document.getElementById("location").value.trim();
  const description = document.getElementById("description").value.trim();

  if (!location || !description) {
    alert("Harap isi lokasi dan deskripsi kejadian!");
    return;
  }

  // Tampilkan loading
  const submitBtn = document.getElementById("submitReport");
  const submitText = document.getElementById("submitText");
  const submitLoading = document.getElementById("submitLoading");

  submitText.classList.add("hidden");
  submitLoading.classList.remove("hidden");

  // Simulasikan pengiriman data
  setTimeout(() => {
    // Buat laporan baru
    const newReport = {
      id: Date.now(),
      location: location,
      description: description,
      images: [...uploadedImages],
      status: "posted",
      createdAt: new Date().toISOString(),
      statusHistory: [{ status: "posted", time: new Date().toISOString() }],
    };

    // Tambahkan ke array reports
    reports.unshift(newReport);

    // Simpan ke localStorage
    localStorage.setItem("ecoReports", JSON.stringify(reports));

    // Reset form dan gambar
    clearForm();

    // Sembunyikan loading
    submitText.classList.remove("hidden");
    submitLoading.classList.add("hidden");

    // Tampilkan pesan sukses
    document.getElementById("reportTab").classList.add("hidden");
    document.getElementById("successMessage").classList.remove("hidden");

    // Update statistik
    updateStatistics();

    // Mulai timer untuk update status otomatis
    startStatusUpdateTimer(newReport.id);
  }, 1500);
}

// Timer untuk update status otomatis setiap 10 menit
function startStatusUpdateTimer(reportId) {
  const statusUpdates = [
    { status: "processed", delay: 10 * 60 * 1000 }, // 10 menit
    { status: "reviewed", delay: 20 * 60 * 1000 }, // 20 menit (10 menit setelah processed)
    { status: "completed", delay: 30 * 60 * 1000 }, // 30 menit (10 menit setelah reviewed)
  ];

  statusUpdates.forEach((update, index) => {
    setTimeout(() => {
      // Update status laporan
      const reportIndex = reports.findIndex((r) => r.id === reportId);
      if (reportIndex !== -1) {
        reports[reportIndex].status = update.status;
        reports[reportIndex].statusHistory.push({
          status: update.status,
          time: new Date().toISOString(),
        });

        // Simpan ke localStorage
        localStorage.setItem("ecoReports", JSON.stringify(reports));

        // Update tampilan jika di halaman riwayat
        if (
          document.getElementById("historyTab").classList.contains("active")
        ) {
          loadReports();
          updateStatistics();
        }
      }
    }, update.delay);
  });
}

// Load riwayat laporan
function loadReports() {
  const historyList = document.getElementById("historyList");

  if (reports.length === 0) {
    historyList.innerHTML =
      '<p style="text-align: center; color: var(--gray-color); padding: 20px;">Belum ada laporan.</p>';
    return;
  }

  let html = "";

  reports.forEach((report) => {
    const date = new Date(report.createdAt);
    const formattedDate = date.toLocaleDateString("id-ID", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });

    const time = date.toLocaleTimeString("id-ID", {
      hour: "2-digit",
      minute: "2-digit",
    });

    // Tentukan kelas status
    let statusClass = "status-posted";
    let statusText = "Diposting";

    if (report.status === "processed") {
      statusClass = "status-processed";
      statusText = "Diproses";
    } else if (report.status === "reviewed") {
      statusClass = "status-reviewed";
      statusText = "Ditinjau";
    } else if (report.status === "completed") {
      statusClass = "status-completed";
      statusText = "Selesai";
    }

    // Hitung waktu sejak dibuat
    const createdTime = new Date(report.createdAt);
    const now = new Date();
    const diffMs = now - createdTime;
    const diffMins = Math.floor(diffMs / (1000 * 60));

    let timeIndicator = "";
    if (diffMins < 60) {
      timeIndicator = `Dibuat ${diffMins} menit yang lalu`;
    } else if (diffMins < 1440) {
      const hours = Math.floor(diffMins / 60);
      timeIndicator = `Dibuat ${hours} jam yang lalu`;
    }

    html += `
                    <div class="history-item">
                        <div class="history-info">
                            <h4>${report.location.substring(0, 30)}${
      report.location.length > 30 ? "..." : ""
    }</h4>
                            <p>${formattedDate}, ${time}</p>
                            <p class="time-indicator">${timeIndicator}</p>
                        </div>
                        <div class="history-status ${statusClass}">${statusText}</div>
                    </div>
                `;
  });

  historyList.innerHTML = html;
}

// Update statistik
function updateStatistics() {
  document.getElementById("totalReports").textContent = reports.length;
  document.getElementById("processedCount").textContent = reports.filter(
    (r) => r.status === "processed"
  ).length;
  document.getElementById("reviewedCount").textContent = reports.filter(
    (r) => r.status === "reviewed"
  ).length;
  document.getElementById("completedCount").textContent = reports.filter(
    (r) => r.status === "completed"
  ).length;
}

// Beralih ke tab tertentu
function switchToTab(tabName) {
  document
    .querySelectorAll(".tab-btn")
    .forEach((b) => b.classList.remove("active"));
  document
    .querySelectorAll(".tab-content")
    .forEach((c) => c.classList.remove("active"));

  document.querySelector(`[data-tab="${tabName}"]`).classList.add("active");
  document.getElementById(`${tabName}Tab`).classList.add("active");

  // Jika berpindah ke tab riwayat, refresh data
  if (tabName === "history") {
    loadReports();
  }
}

// Kosongkan form
function clearForm() {
  document.getElementById("location").value = "";
  document.getElementById("description").value = "";
  document.getElementById("previewContainer").innerHTML = "";
  uploadedImages = [];
}

// Update event listener untuk nav links
document.querySelectorAll(".nav-links a").forEach((link) => {
  link.addEventListener("click", (e) => {
    e.preventDefault();

    // Close mobile menu
    document.getElementById("navLinks").classList.remove("active");

    // Update active class pada nav links
    document
      .querySelectorAll(".nav-links a")
      .forEach((l) => l.classList.remove("active"));
    link.classList.add("active");

    // Get tab from data attribute
    const tab = link.getAttribute("data-tab");

    if (tab) {
      switchToTab(tab);
    }
    // Untuk Profil (tanpa data-tab), bisa ditambahkan nanti
  });
});

const btnEdu1 = document.getElementById("edu1");
const btnEdu2 = document.getElementById("edu2");
const btnEdu3 = document.getElementById("edu3");
const artikelH3 = document.getElementById("artikelH3");
const tips = document.getElementById("artikelTips");
const artikel = document.getElementById("textArtikel");

btnEdu1.onclick = function () {
  artikelH3.textContent = "Cara Mengurangi Sampah Plastik";
  artikel.textContent =
    "Plastik telah menjadi masalah lingkungan yang serius. Berrikut cara mengurangi sampah plastik dalam kehidupan sehari-hari:";
  tips.innerHTML = `
<li>
  <strong>Gunakan tas belanja kain</strong> - Hindari tas plastik sekali pakai dengan membawa tas belanja sendiri.
</li>
<li>
  <strong>Bawa wadah makanan sendiri</strong> - Saat membeli makanan, gunakan wadah yang dapat digunakan kembali.
</li>
<li>
  <strong>Pilih produk tanpa kemasan plastik</strong> - Beli buah dan sayur tanpa kemasan plastik, atau pilih produk dengan kemasan ramah lingkungan.
</li>
<li>
  <strong>Gunakan sedotan stainless steel atau bambu</strong> - Ganti sedotan plastik dengan sedotan yang dapat digunakan kembali.
</li>
<li>
  <strong>Daur ulang dengan benar</strong> - Pisahkan sampah plastik untuk didaur ulang sesuai jenisnya.
</li>
<li>
  <strong>Dukung produk lokal tanpa kemasan berlebih</strong> - Produk lokal seringkali memiliki kemasan yang lebih minimalis.
</li>
`;
};

btnEdu2.onclick = function () {
  artikelH3.textContent = "Pentingnya Menjaga Kebersihan";
  artikel.textContent =
    "Kebersihan lingkungan berpengaruh besar terhadap kesehatan dan kenyamanan. Berikut pentingnya menjaga kebersihan dalam kehidupan sehari-hari:";
  tips.innerHTML = `
<h3>Tips Menjaga Kebersihan</h3>
<li>
  Buang sampah pada tempat yang telah disediakan.
</li>
<li>
  Pisahkan sampah organik dan anorganik.
<li>
  Jaga kebersihan area sekitar rumah dan kampus.
</li>
<li>
  Kurangi penggunaan barang sekali pakai.
</li>
    `;
};

btnEdu3.onclick = function () {
  artikelH3.textContent = "Tips Zero Waste Lainnya";
  artikel.textContent =
    "Zero waste merupakan upaya untuk mengurangi sampah sejak dari sumbernya. Berikut beberapa tips zero waste yang dapat diterapkan sehari-hari:";
  tips.innerHTML = `
<li>
  <strong>Refuse (Menolak)</strong> - Tolak penggunaan barang sekali pakai seperti kantong plastik, sedotan plastik, dan kemasan berlebihan.
</li>
<li>
  <strong>Reduce (Mengurangi)</strong> - Kurangi konsumsi barang yang tidak diperlukan dan pilih produk dengan kemasan minimal.
</li>
<li>
  <strong>Reuse (Menggunakan Kembali)</strong> - Gunakan kembali barang yang masih layak pakai seperti botol minum, tas belanja, dan wadah makanan.
</li>
<li>
  <strong>Recycle (Mendaur Ulang)</strong> - Pilah sampah sesuai jenisnya agar dapat didaur ulang dengan benar.
</li>
<li>
  <strong>Rot (Mengomposkan)</strong> - Olah sampah organik seperti sisa makanan menjadi kompos untuk mengurangi limbah rumah tangga.
</li>
`;
};
