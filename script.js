    const defaultConfig = {
      judul_utama: "Sistem Pelanggaran Siswa",
      nama_sekolah: "SMA Negeri 1",
      kata_motivasi: "Kesalahan adalah guru terbaik. Belajarlah dari kesalahan dan jadilah pribadi yang lebih baik. Masa depanmu cerah, jangan sia-siakan dengan pelanggaran!",
      background_color: "#dbeafe",
      card_color: "#ffffff",
      text_color: "#1f2937",
      primary_color: "#3b82f6",
      button_color: "#3b82f6"
    };

    // Data siswa per kelas
    const studentsByClass = {
      "X-A": ["Ahmad Rizki", "Siti Nurhaliza", "Budi Santoso", "Dewi Lestari", "Eko Prasetyo"],
      "X-B": ["Fitri Handayani", "Gilang Ramadhan", "Hana Pertiwi", "Indra Gunawan", "Joko Widodo"],
      "XI-IPA-1": ["Kartika Sari", "Lukman Hakim", "Maya Angelina", "Nanda Pratama", "Olivia Tan"],
      "XI-IPA-2": ["Putra Mahendra", "Qori Amalia", "Rudi Hartono", "Sinta Dewi", "Taufik Hidayat"],
      "XI-IPS-1": ["Umar Bakri", "Vina Melinda", "Wawan Setiawan", "Xena Putri", "Yusuf Ibrahim"],
      "XII-IPA-1": ["Zahra Amira", "Andi Wijaya", "Bella Safira", "Citra Kirana", "Doni Saputra"],
      "XII-IPA-2": ["Elsa Permata", "Fajar Nugroho", "Gita Savitri", "Hendra Kusuma", "Intan Cahaya"],
      "XII-IPS-1": ["Jihan Aulia", "Kevin Anggara", "Linda Marlina", "Miko Pratama", "Nina Zahara"]
    };

    let allRecords = [];
    let capturedImage = null;
    let stream = null;

    const dataHandler = {
      onDataChanged(data) {
        allRecords = data;
        renderViolationsList(data);
        updateRecordCount(data.length);
      }
    };

    function getFolderName(date) {
      const d = new Date(date);
      const year = d.getFullYear();
      const month = String(d.getMonth() + 1).padStart(2, '0');
      const day = String(d.getDate()).padStart(2, '0');
      return ${year}-${month}-${day};
    }

    function renderViolationsList(records) {
      const listContainer = document.getElementById('violations-list');
      
      if (records.length === 0) {
        listContainer.innerHTML = `
          <div class="text-center text-gray-400 py-12">
            <div class="inline-block p-6 bg-gray-50 rounded-3xl mb-4">
              <svg class="w-20 h-20 mx-auto opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"></path>
              </svg>
            </div>
            <p class="text-lg font-medium">Belum ada data pelanggaran</p>
            <p class="text-sm mt-2">Data akan muncul setelah Anda menambahkan pelanggaran</p>
          </div>
        `;
        return;
      }

      const existingItems = new Map(
        [...listContainer.querySelectorAll('.record-item')].map(el => [el.dataset.recordId, el])
      );

      const sortedRecords = [...records].sort((a, b) => new Date(b.tanggal) - new Date(a.tanggal));

      sortedRecords.forEach(record => {
        if (existingItems.has(record.id)) {
          updateRecordElement(existingItems.get(record.id), record);
          existingItems.delete(record.id);
        } else {
          listContainer.insertBefore(createRecordElement(record), listContainer.firstChild);
        }
      });

      existingItems.forEach(el => el.remove());
    }

    function createRecordElement(record) {
      const div = document.createElement('div');
      div.className = 'record-item bg-white p-5 rounded-2xl shadow-md';
      div.dataset.recordId = record.id;
      
      const date = new Date(record.tanggal);
      const formattedDate = date.toLocaleDateString('id-ID', { 
        day: 'numeric', 
        month: 'short', 
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
      
      div.innerHTML = `
        <div class="flex gap-4">
          <div class="flex-shrink-0">
            ${record.face_image ? 
              <img src="${record.face_image}" alt="Foto ${record.nama}" class="record-face-img"> :
              `<div class="record-face-img bg-gray-200 flex items-center justify-center">
                <svg class="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path>
                </svg>
              </div>`
            }
          </div>
          <div class="flex-1">
            <div class="flex justify-between items-start mb-2">
              <div>
                <h4 class="font-bold text-gray-800 text-lg">${record.nama}</h4>
                <p class="text-sm text-gray-600 font-medium">${record.kelas}</p>
              </div>
              <button class="delete-btn text-red-500 hover:text-red-700 transition-colors p-2 hover:bg-red-50 rounded-lg" data-id="${record.id}">
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
                </svg>
              </button>
            </div>
            <div class="bg-red-50 border-l-4 border-red-400 p-3 rounded-lg mb-3">
              <p class="text-sm text-red-700 font-semibold">${record.jenis_pelanggaran}</p>
            </div>
            <div class="flex justify-between items-center">
              <span class="folder-badge">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z"></path>
                </svg>
                ${record.folder}
              </span>
              <span class="text-xs text-gray-500">${formattedDate}</span>
            </div>
          </div>
        </div>
      `;
      
      div.querySelector('.delete-btn').addEventListener('click', () => deleteRecord(record));
      
      return div;
    }

    function updateRecordElement(element, record) {
      const date = new Date(record.tanggal);
      const formattedDate = date.toLocaleDateString('id-ID', { 
        day: 'numeric', 
        month: 'short', 
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
      
      const imgContainer = element.querySelector('.flex-shrink-0');
      if (record.face_image) {
        imgContainer.innerHTML = <img src="${record.face_image}" alt="Foto ${record.nama}" class="record-face-img">;
      }
      
      element.querySelector('h4').textContent = record.nama;
      element.querySelector('.text-sm.text-gray-600').textContent = record.kelas;
      element.querySelector('.text-red-700').textContent = record.jenis_pelanggaran;
      element.querySelector('.folder-badge').innerHTML = `
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z"></path>
        </svg>
        ${record.folder}
      `;
      element.querySelector('.text-xs.text-gray-500').textContent = formattedDate;
    }

    function updateRecordCount(count) {
      document.getElementById('record-count').textContent = count;
    }

    async function deleteRecord(record) {
      const deleteBtn = document.querySelector([data-id="${record.id}"]);
      const originalHTML = deleteBtn.innerHTML;
      
      deleteBtn.innerHTML = '<div class="loading-spinner"></div>';
      deleteBtn.disabled = true;

      const result = await window.dataSdk.delete(record);
      
      if (result.isOk) {
        showToast('Data berhasil dihapus', 'success');
      } else {
        showToast('Gagal menghapus data', 'error');
        deleteBtn.innerHTML = originalHTML;
        deleteBtn.disabled = false;
      }
    }

    function showToast(message, type) {
      const toast = document.createElement('div');
      toast.className = toast ${type};
      toast.textContent = message;
      document.body.appendChild(toast);
      
      setTimeout(() => {
        toast.remove();
      }, 3000);
    }

    // Update nama siswa berdasarkan kelas
    document.getElementById('kelas').addEventListener('change', function() {
      const selectedClass = this.value;
      const namaSelect = document.getElementById('nama');
      
      namaSelect.innerHTML = '<option value="">Pilih Nama</option>';
      
      if (selectedClass && studentsByClass[selectedClass]) {
        namaSelect.disabled = false;
        namaSelect.classList.remove('bg-gray-100');
        namaSelect.classList.add('bg-white');
        
        studentsByClass[selectedClass].forEach(student => {
          const option = document.createElement('option');
          option.value = student;
          option.textContent = student;
          namaSelect.appendChild(option);
        });
      } else {
        namaSelect.disabled = true;
        namaSelect.classList.add('bg-gray-100');
        namaSelect.classList.remove('bg-white');
        namaSelect.innerHTML = '<option value="">Pilih kelas terlebih dahulu</option>';
      }
    });

    // Camera Functions
    document.getElementById('start-camera').addEventListener('click', async () => {
      try {
        stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'user' }, audio: false });
        const video = document.getElementById('camera-preview');
        video.srcObject = stream;
        video.classList.remove('hidden');
        document.getElementById('preview-container').classList.add('hidden');
        document.getElementById('start-camera').classList.add('hidden');
        document.getElementById('capture-photo').classList.remove('hidden');
      } catch (error) {
        showToast('Tidak dapat mengakses kamera', 'error');
      }
    });

    document.getElementById('capture-photo').addEventListener('click', () => {
      const video = document.getElementById('camera-preview');
      const canvas = document.getElementById('canvas');
      const context = canvas.getContext('2d');
      
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      context.drawImage(video, 0, 0, canvas.width, canvas.height);
      
      capturedImage = canvas.toDataURL('image/jpeg', 0.8);
      
      // Stop camera
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
      
      // Show preview
      video.classList.add('hidden');
      document.getElementById('preview-container').innerHTML = `
        <img src="${capturedImage}" class="face-preview mx-auto">
        <p class="text-blue-600 font-semibold mt-3">✓ Foto berhasil diambil</p>
      `;
      document.getElementById('preview-container').classList.remove('hidden');
      document.getElementById('capture-photo').classList.add('hidden');
      document.getElementById('start-camera').classList.remove('hidden');
      document.getElementById('start-camera').textContent = 'Ambil Ulang';
      
      showToast('Foto wajah berhasil diambil', 'success');
    });

    document.getElementById('violation-form').addEventListener('submit', async (e) => {
      e.preventDefault();
      
      if (!capturedImage) {
        showToast('Silakan ambil foto wajah terlebih dahulu', 'error');
        return;
      }
      
      if (allRecords.length >= 999) {
        showToast('Batas maksimal 999 data tercapai. Hapus beberapa data terlebih dahulu.', 'error');
        return;
      }

      const submitBtn = document.getElementById('submit-btn');
      const submitText = document.getElementById('submit-text');
      const submitLoading = document.getElementById('submit-loading');
      
      submitBtn.disabled = true;
      submitText.textContent = 'Menyimpan...';
      submitLoading.classList.remove('hidden');

      const now = new Date();
      const formData = {
        id: Date.now().toString(),
        kelas: document.getElementById('kelas').value,
        nama: document.getElementById('nama').value,
        jenis_pelanggaran: document.getElementById('jenis-pelanggaran').value,
        face_image: capturedImage,
        tanggal: now.toISOString(),
        folder: getFolderName(now)
      };

      const result = await window.dataSdk.create(formData);
      
      if (result.isOk) {
        showToast('Data pelanggaran berhasil disimpan', 'success');
        e.target.reset();
        capturedImage = null;
        document.getElementById('preview-container').innerHTML = `
          <div class="inline-block p-8 bg-gray-50 rounded-2xl border-2 border-dashed border-gray-300">
            <svg class="w-20 h-20 text-gray-400 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"></path>
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"></path>
            </svg>
            <p class="text-gray-500 text-sm">Klik tombol untuk mengambil foto</p>
          </div>
        `;
        document.getElementById('start-camera').textContent = 'Buka Kamera';
      } else {
        showToast('Gagal menyimpan data', 'error');
      }

      submitBtn.disabled = false;
      submitText.textContent = '💾 Simpan Pelanggaran';
      submitLoading.classList.add('hidden');
    });

    async function onConfigChange(config) {
      document.getElementById('judul-utama').textContent = config.judul_utama || defaultConfig.judul_utama;
      document.getElementById('nama-sekolah').textContent = config.nama_sekolah || defaultConfig.nama_sekolah;
      document.getElementById('kata-motivasi').textContent = "${config.kata_motivasi || defaultConfig.kata_motivasi}";
      
      const backgroundColor = config.background_color || defaultConfig.background_color;
      const primaryColor = config.primary_color || defaultConfig.primary_color;
      
      document.querySelector('.gradient-bg').style.background = linear-gradient(135deg, ${backgroundColor} 0%, #93c5fd 50%, ${primaryColor} 100%);
    }

    if (window.elementSdk) {
      window.elementSdk.init({
        defaultConfig,
        onConfigChange,
        mapToCapabilities: (config) => ({
          recolorables: [
            {
              get: () => config.background_color || defaultConfig.background_color,
              set: (value) => {
                config.background_color = value;
                window.elementSdk.setConfig({ background_color: value });
              }
            },
            {
              get: () => config.card_color || defaultConfig.card_color,
              set: (value) => {
                config.card_color = value;
                window.elementSdk.setConfig({ card_color: value });
              }
            },
            {
              get: () => config.text_color || defaultConfig.text_color,
              set: (value) => {
                config.text_color = value;
                window.elementSdk.setConfig({ text_color: value });
              }
            },
            {
              get: () => config.primary_color || defaultConfig.primary_color,
              set: (value) => {
                config.primary_color = value;
                window.elementSdk.setConfig({ primary_color: value });
              }
            },
            {
              get: () => config.button_color || defaultConfig.button_color,
              set: (value) => {
                config.button_color = value;
                window.elementSdk.setConfig({ button_color: value });
              }
            }
          ],
          borderables: [],
          fontEditable: undefined,
          fontSizeable: undefined
        }),
        mapToEditPanelValues: (config) => new Map([
          ["judul_utama", config.judul_utama || defaultConfig.judul_utama],
          ["nama_sekolah", config.nama_sekolah || defaultConfig.nama_sekolah],
          ["kata_motivasi", config.kata_motivasi || defaultConfig.kata_motivasi]
        ])
      });
    }

    if (window.dataSdk) {
      window.dataSdk.init(dataHandler);
    }
