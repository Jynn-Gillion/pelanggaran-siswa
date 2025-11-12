 // Ganti URL di bawah ini dengan URL Web App kamu dari Google Apps Script
const SCRIPT_URL = "https://script.google.com/macros/s/AKfycbx_YANG_KAMU_COPY/exec";

const form = document.getElementById("formPelanggaran");
const kelas = document.getElementById("kelas");
const nama = document.getElementById("nama");
const pelanggaran = document.getElementById("pelanggaran");
const camera = document.getElementById("camera");
const canvas = document.getElementById("canvas");
const startCamera = document.getElementById("startCamera");
const capture = document.getElementById("capture");
const statusMsg = document.getElementById("status");

let stream;
let photoData = "";

startCamera.addEventListener("click", async () => {
  try {
    stream = await navigator.mediaDevices.getUserMedia({ video: true });
    camera.srcObject = stream;
    camera.classList.remove("hidden");
    capture.classList.remove("hidden");
    startCamera.classList.add("hidden");
  } catch (err) {
    alert("Kamera tidak bisa diakses: " + err.message);
  }
});

capture.addEventListener("click", () => {
  const ctx = canvas.getContext("2d");
  canvas.width = camera.videoWidth;
  canvas.height = camera.videoHeight;
  ctx.drawImage(camera, 0, 0, canvas.width, canvas.height);
  photoData = canvas.toDataURL("image/png");
  camera.classList.add("hidden");
  capture.classList.add("hidden");
  startCamera.classList.remove("hidden");
  stream.getTracks().forEach(t => t.stop());
  alert("Foto berhasil diambil!");
});

form.addEventListener("submit", async (e) => {
  e.preventDefault();

  if (!kelas.value || !nama.value || !pelanggaran.value) {
    alert("Isi semua data dulu ya!");
    return;
  }

  statusMsg.textContent = "Menyimpan data...";
  const data = {
    kelas: kelas.value,
    nama: nama.value,
    pelanggaran: pelanggaran.value,
    foto: photoData || "tidak ada foto"
  };

  try {
    const res = await fetch(SCRIPT_URL, {
      method: "POST",
      body: JSON.stringify(data)
    });
    const result = await res.json();
    if (result.result === "success") {
      statusMsg.textContent = "✅ Data berhasil disimpan!";
      form.reset();
      photoData = "";
    } else {
      statusMsg.textContent = "❌ Gagal menyimpan data.";
    }
  } catch (err) {
    statusMsg.textContent = "⚠️ Terjadi kesalahan koneksi.";
  }
});
