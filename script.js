/* ==========================================================================
   Pesantren Al Hikmah Darussalam - Tes Kelulusan Sorogan
   Application Logic & Real-Time Calculation (JavaScript Murni)
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {
    // Default initial participants if local storage is empty
    const defaultParticipants = [
        {
            id: generateId(),
            nama: 'Ahmad Fauzan',
            kitab: 'Awwaluma',
            tahapan: 'Batas 1',
            kedudukan: 1,
            lafadz: 0,
            makna: 2
        },
        {
            id: generateId(),
            nama: 'Muhammad Zaidan',
            kitab: 'Sulam Munajat',
            tahapan: 'Batas 2',
            kedudukan: 4,
            lafadz: 3,
            makna: 5
        },
        {
            id: generateId(),
            nama: 'Dewi Nur Laili',
            kitab: 'Mukhtashar',
            tahapan: 'Batas 1',
            kedudukan: 0,
            lafadz: 1,
            makna: 0
        },
        {
            id: generateId(),
            nama: 'Fatimah Az-Zahra',
            kitab: 'Sulam Munajat',
            tahapan: 'Batas 3',
            kedudukan: 6,
            lafadz: 5,
            makna: 8
        },
        {
            id: generateId(),
            nama: 'Rizki Ramadhan',
            kitab: 'Awwaluma',
            tahapan: 'Batas 2',
            kedudukan: 2,
            lafadz: 2,
            makna: 1
        }
    ];

    // State Management
    let participants = loadData();

    // DOM Elements
    const tableBody = document.getElementById('table-body');
    const btnAddRow = document.getElementById('btn-add-row');
    const btnReset = document.getElementById('btn-reset');
    const btnDownload = document.getElementById('btn-download');
    
    const searchInput = document.getElementById('search-input');
    const filterStatus = document.getElementById('filter-status');
    const filterKitab = document.getElementById('filter-kitab');
    const filterTahapan = document.getElementById('filter-tahapan');

    const statTotal = document.getElementById('stat-total');
    const statPass = document.getElementById('stat-pass');
    const statFail = document.getElementById('stat-fail');
    const statRate = document.getElementById('stat-rate');

    const resetModal = document.getElementById('reset-modal');
    const modalCancel = document.getElementById('modal-cancel');
    const modalConfirm = document.getElementById('modal-confirm');
    const toast = document.getElementById('toast');
    const toastMsg = document.getElementById('toast-msg');

    // Helper: Generate unique ID
    function generateId() {
        return 'part_' + Math.random().toString(36).substr(2, 9);
    }

    // Local Storage Operations
    function loadData() {
        const stored = localStorage.getItem('sorogan_participants');
        if (stored) {
            try {
                return JSON.parse(stored);
            } catch (e) {
                console.error('Error parsing local storage data', e);
            }
        }
        return defaultParticipants;
    }

    function saveData() {
        localStorage.setItem('sorogan_participants', JSON.stringify(participants));
    }

    // Toast Notification helper
    let toastTimeout;
    function showToast(message) {
        toastMsg.textContent = message;
        toast.classList.add('show');
        clearTimeout(toastTimeout);
        toastTimeout = setTimeout(() => {
            toast.classList.remove('show');
        }, 2500);
    }

    // Render Table based on filtering and search
    function renderTable() {
        const keyword = searchInput.value.toLowerCase().trim();
        const statusVal = filterStatus.value;
        const kitabVal = filterKitab.value;
        const tahapanVal = filterTahapan.value;

        tableBody.innerHTML = '';

        let displayedCount = 0;
        let passCount = 0;
        let failCount = 0;

        participants.forEach((p, index) => {
            // Calculations for display
            const calc = calculateResults(p.kedudukan, p.lafadz, p.makna);

            // Filtering check
            const matchSearch = p.nama.toLowerCase().includes(keyword);
            const matchKitab = kitabVal === 'semua' || p.kitab === kitabVal;
            const matchTahapan = tahapanVal === 'semua' || p.tahapan === tahapanVal;
            const matchStatus = statusVal === 'semua' || 
                                (statusVal === 'lulus' && calc.isLulus) || 
                                (statusVal === 'tidak-lulus' && !calc.isLulus);

            if (calc.isLulus) passCount++;
            else failCount++;

            if (!matchSearch || !matchKitab || !matchTahapan || !matchStatus) {
                return; // Skip hidden rows in view, but counts include overall or filtered? Usually dashboard reflects overall or filtered. Let's make dashboard reflect overall active records.
            }

            displayedCount++;

            const tr = document.createElement('tr');
            tr.dataset.id = p.id;

            tr.innerHTML = `
                <td style="color: var(--text-muted); font-weight: 600; text-align: center;">${index + 1}</td>
                <td>
                    <input type="text" class="table-input nama-input" value="${escapeHtml(p.nama)}" placeholder="Nama Santri" data-id="${p.id}" data-field="nama">
                </td>
                <td>
                    <select class="table-select kitab-select" data-id="${p.id}" data-field="kitab">
                        <option value="Awwaluma" ${p.kitab === 'Awwaluma' ? 'selected' : ''}>Awwaluma</option>
                        <option value="Sulam Munajat" ${p.kitab === 'Sulam Munajat' ? 'selected' : ''}>Sulam Munajat</option>
                        <option value="Mukhtashar" ${p.kitab === 'Mukhtashar' ? 'selected' : ''}>Mukhtashar</option>
                    </select>
                </td>
                <td>
                    <select class="table-select tahapan-select" data-id="${p.id}" data-field="tahapan">
                        <option value="Batas 1" ${p.tahapan === 'Batas 1' ? 'selected' : ''}>Batas 1</option>
                        <option value="Batas 2" ${p.tahapan === 'Batas 2' ? 'selected' : ''}>Batas 2</option>
                        <option value="Batas 3" ${p.tahapan === 'Batas 3' ? 'selected' : ''}>Batas 3</option>
                    </select>
                </td>
                <td>
                    <div class="errors-container">
                        <div class="error-group">
                            <label>Kedudukan</label>
                            <input type="number" min="0" class="error-input err-kedudukan" value="${p.kedudukan}" data-id="${p.id}" data-field="kedudukan">
                        </div>
                        <div class="error-group">
                            <label>Lafadz</label>
                            <input type="number" min="0" class="error-input err-lafadz" value="${p.lafadz}" data-id="${p.id}" data-field="lafadz">
                        </div>
                        <div class="error-group">
                            <label>Makna</label>
                            <input type="number" min="0" class="error-input err-makna" value="${p.makna}" data-id="${p.id}" data-field="makna">
                        </div>
                    </div>
                </td>
                <td>
                    <span class="perbaikan-cell">${formatPerbaikan(calc.perbaikan)}</span>
                </td>
                <td>
                    <span class="nilai-box" id="nilai-${p.id}">${calc.nilaiAkhir}</span>
                </td>
                <td>
                    <span class="badge ${calc.isLulus ? 'badge-lulus' : 'badge-tidaklulus'}" id="status-${p.id}">
                        ${calc.isLulus ? 'LULUS' : 'TIDAK LULUS'}
                    </span>
                </td>
                <td style="text-align: center;">
                    <button class="btn-delete" data-id="${p.id}" title="Hapus Peserta">
                        <i class="fa-solid fa-trash-can"></i>
                    </button>
                </td>
            `;

            tableBody.appendChild(tr);
        });

        // Update Dashboard Summary Stats (Total based on actual participants data)
        const totalParticipants = participants.length;
        const totalPass = participants.filter(p => calculateResults(p.kedudukan, p.lafadz, p.makna).isLulus).length;
        const totalFail = totalParticipants - totalPass;
        const passRate = totalParticipants > 0 ? Math.round((totalPass / totalParticipants) * 100) : 0;

        statTotal.textContent = totalParticipants;
        statPass.textContent = totalPass;
        statFail.textContent = totalFail;
        statRate.textContent = passRate + '%';
    }

    // Core Calculation Logic
    function calculateResults(kedudukanErr, lafadzErr, maknaErr) {
        const kErr = Math.max(0, parseInt(kedudukanErr) || 0);
        const lErr = Math.max(0, parseInt(lafadzErr) || 0);
        const mErr = Math.max(0, parseInt(maknaErr) || 0);

        const nilaiKedudukan = Math.max(0, 100 - (kErr * 3));
        const nilaiLafadz = Math.max(0, 100 - (lErr * 3));
        const nilaiMakna = Math.max(0, 100 - (mErr * 3));

        const avg = (nilaiKedudukan + nilaiLafadz + nilaiMakna) / 3;
        const nilaiAkhir = Math.round(avg);
        const isLulus = nilaiAkhir >= 86;

        // Perbaikan calculation
        let perbaikan = [];
        const maxErr = Math.max(kErr, lErr, mErr);

        if (maxErr === 0) {
            perbaikan = [];
        } else {
            if (kErr === maxErr) perbaikan.push('Kedudukan');
            if (lErr === maxErr) perbaikan.push('Lafadz');
            if (mErr === maxErr) perbaikan.push('Makna');
        }

        return {
            nilaiAkhir,
            isLulus,
            perbaikan
        };
    }

    function formatPerbaikan(arr) {
        if (!arr || arr.length === 0) {
            return '<span class="perbaikan-none">-</span>';
        }
        return `<span class="perbaikan-text">${arr.join(', ')}</span>`;
    }

    function escapeHtml(text) {
        const map = {
            '&': '&amp;',
            '<': '&lt;',
            '>': '&gt;',
            '"': '&quot;',
            "'": '&#039;'
        };
        return text.replace(/[&<>"']/g, function(m) { return map[m]; });
    }

    // Event Delegation for Table Inputs and Actions
    tableBody.addEventListener('input', (e) => {
        const target = e.target;
        const id = target.dataset.id;
        if (!id) return;

        const participant = participants.find(p => p.id === id);
        if (!participant) return;

        const field = target.dataset.field;

        if (field === 'nama') {
            participant.nama = target.value;
            saveData();
        } else if (field === 'kedudukan' || field === 'lafadz' || field === 'makna') {
            const val = parseInt(target.value);
            participant[field] = isNaN(val) ? 0 : Math.max(0, val);
            saveData();

            // Real-time update of specific row cells without full re-render to maintain focus and smoothness
            updateRowLive(id, participant);
        }
    });

    tableBody.addEventListener('change', (e) => {
        const target = e.target;
        const id = target.dataset.id;
        if (!id) return;

        const participant = participants.find(p => p.id === id);
        if (!participant) return;

        const field = target.dataset.field;
        if (field === 'kitab' || field === 'tahapan') {
            participant[field] = target.value;
            saveData();
            showToast('Perubahan disimpan');
        }
    });

    // Live update helper for instant interactive feel
    function updateRowLive(id, p) {
        const tr = tableBody.querySelector(`tr[data-id="${id}"]`);
        if (!tr) return;

        const calc = calculateResults(p.kedudukan, p.lafadz, p.makna);

        // Update Perbaikan
        const perbaikanTd = tr.querySelector('.perbaikan-cell');
        if (perbaikanTd) {
            perbaikanTd.innerHTML = formatPerbaikan(calc.perbaikan);
        }

        // Update Nilai with subtle animation
        const nilaiBox = tr.querySelector(`#nilai-${id}`);
        if (nilaiBox) {
            nilaiBox.textContent = calc.nilaiAkhir;
            nilaiBox.classList.add('nilai-highlight');
            setTimeout(() => nilaiBox.classList.remove('nilai-highlight'), 400);
        }

        // Update Status Badge
        const badge = tr.querySelector(`#status-${id}`);
        if (badge) {
            badge.className = `badge ${calc.isLulus ? 'badge-lulus' : 'badge-tidaklulus'}`;
            badge.textContent = calc.isLulus ? 'LULUS' : 'TIDAK LULUS';
        }

        // Update Dashboard Summary Stats live
        updateStatsLive();
    }

    function updateStatsLive() {
        const totalParticipants = participants.length;
        const totalPass = participants.filter(p => calculateResults(p.kedudukan, p.lafadz, p.makna).isLulus).length;
        const totalFail = totalParticipants - totalPass;
        const passRate = totalParticipants > 0 ? Math.round((totalPass / totalParticipants) * 100) : 0;

        statTotal.textContent = totalParticipants;
        statPass.textContent = totalPass;
        statFail.textContent = totalFail;
        statRate.textContent = passRate + '%';
    }

    // Delete Row
    tableBody.addEventListener('click', (e) => {
        const deleteBtn = e.target.closest('.btn-delete');
        if (!deleteBtn) return;

        const id = deleteBtn.dataset.id;
        participants = participants.filter(p => p.id !== id);
        saveData();
        renderTable();
        showToast('Peserta berhasil dihapus');
    });

    // Add Participant Row
    btnAddRow.addEventListener('click', () => {
        const newParticipant = {
            id: generateId(),
            nama: '',
            kitab: 'Awwaluma',
            tahapan: 'Batas 1',
            kedudukan: 0,
            lafadz: 0,
            makna: 0
        };
        participants.push(newParticipant);
        saveData();
        renderTable();
        
        // Focus on the newly added name input
        setTimeout(() => {
            const lastRow = tableBody.querySelector('tr:last-child');
            if (lastRow) {
                const nameInput = lastRow.querySelector('.nama-input');
                if (nameInput) nameInput.focus();
            }
        }, 50);

        showToast('Peserta baru ditambahkan');
    });

    // Search & Filter Listeners
    searchInput.addEventListener('input', renderTable);
    filterStatus.addEventListener('change', renderTable);
    filterKitab.addEventListener('change', renderTable);
    filterTahapan.addEventListener('change', renderTable);

    // Reset Modal Controls
    btnReset.addEventListener('click', () => {
        resetModal.classList.add('active');
    });

    modalCancel.addEventListener('click', () => {
        resetModal.classList.remove('active');
    });

    modalConfirm.addEventListener('click', () => {
        participants = [];
        saveData();
        renderTable();
        resetModal.classList.remove('active');
        showToast('Semua data berhasil direset');
    });

    // Close modal on outside click
    resetModal.addEventListener('click', (e) => {
        if (e.target === resetModal) {
            resetModal.classList.remove('active');
        }
    });

    // Download High-Resolution PNG using html2canvas
    btnDownload.addEventListener('click', () => {
        if (participants.length === 0) {
            showToast('Tidak ada data untuk diunduh');
            return;
        }

        showToast('Menyiapkan gambar resolusi tinggi...');

        // Populate capture container table
        const captureTbody = document.getElementById('capture-tbody');
        const captureMetaText = document.getElementById('capture-meta-text');
        captureTbody.innerHTML = '';

        const today = new Date().toLocaleDateString('id-ID', {
            day: 'numeric',
            month: 'long',
            year: 'numeric'
        });

        const totalPass = participants.filter(p => calculateResults(p.kedudukan, p.lafadz, p.makna).isLulus).length;
        captureMetaText.textContent = `Tanggal: ${today} | Total Peserta: ${participants.length} (Lulus: ${totalPass}, Tidak Lulus: ${participants.length - totalPass})`;

        participants.forEach((p, idx) => {
            const calc = calculateResults(p.kedudukan, p.lafadz, p.makna);
            const perbaikanStr = calc.perbaikan.length > 0 ? calc.perbaikan.join(', ') : '-';
            const statusStr = calc.isLulus ? 'LULUS' : 'TIDAK LULUS';

            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td style="text-align: center; font-weight: 600;">${idx + 1}</td>
                <td style="font-weight: 600;">${escapeHtml(p.nama || 'Tanpa Nama')}</td>
                <td>${p.kitab}</td>
                <td>${p.tahapan}</td>
                <td style="color: #b45309; font-weight: 600;">${perbaikanStr}</td>
                <td style="font-weight: 700; text-align: center;">${calc.nilaiAkhir}</td>
                <td style="font-weight: 700; text-align: center; color: ${calc.isLulus ? '#065f46' : '#991b1b'};">${statusStr}</td>
            `;
            captureTbody.appendChild(tr);
        });

        const captureContainer = document.getElementById('capture-container');
        captureContainer.style.display = 'block';

        html2canvas(captureContainer, {
            scale: 2, // High resolution
            useCORS: true,
            backgroundColor: '#ffffff'
        }).then(canvas => {
            captureContainer.style.display = 'none';

            const imageURI = canvas.toDataURL('image/png');
            const link = document.createElement('a');
            link.download = `Rekap-Kelulusan-Sorogan-${new Date().toISOString().slice(0, 10)}.png`;
            link.href = imageURI;
            link.click();

            showToast('Gambar rekap berhasil diunduh');
        }).catch(err => {
            captureContainer.style.display = 'none';
            console.error('Error generating image:', err);
            showToast('Gagal mengunduh gambar');
        });
    });

    // Initial Render on Load
    renderTable();
});
