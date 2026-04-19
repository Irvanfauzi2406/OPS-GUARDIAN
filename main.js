const GEMINI_API_KEY = "AIzaSyCBwBkFIX1fPOLQ8aFMY0YjZrzZU7C_vV4";
const GEMINI_MODEL   = "gemini-2.0-flash";
const GEMINI_URL     = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${GEMINI_API_KEY}`;

// ──────────────────────────────────────────────
// STORAGE HELPERS
// ──────────────────────────────────────────────
function getRecords() {
  try { return JSON.parse(localStorage.getItem("opsguard_records") || "[]"); }
  catch { return []; }
}
function saveRecords(arr) {
  localStorage.setItem("opsguard_records", JSON.stringify(arr));
}
function getAudit() {
  try { return JSON.parse(localStorage.getItem("opsguard_audit") || "[]"); }
  catch { return []; }
}
function saveAudit(arr) {
  localStorage.setItem("opsguard_audit", JSON.stringify(arr));
}
function addAudit(entry) {
  const audit = getAudit();
  audit.unshift(entry);
  saveAudit(audit.slice(0, 200));
}
function tsNow() {
  return new Date().toLocaleString("id-ID", { dateStyle: "short", timeStyle: "short" });
}

// ──────────────────────────────────────────────
// SEED DEMO DATA (hanya jika storage kosong)
// ──────────────────────────────────────────────
function seedDemoData() {
  if (getRecords().length > 0) return;

  const demo = [
    { id: "REC-001", assetId: "TRK-PLT-204", location: "Warehouse Bekasi 2",       type: "Preventive Maintenance", date: "2025-07-10", technician: "Budi Santoso",   status: "Valid",             note: "Penggantian oli rutin. Aset dalam kondisi baik.", aiRisk: "low",    ts: "10/07/25 09.00" },
    { id: "REC-002", assetId: "FRK-LFT-012", location: "Gudang Cakung A",           type: "Corrective Maintenance", date: "2025-07-11", technician: "Rini Wulandari", status: "Warning",           note: "Fork lift tidak bisa naik penuh. Kemungkinan seal bocor.", aiRisk: "high",   ts: "11/07/25 10.15" },
    { id: "REC-003", assetId: "CRN-OVH-007", location: "Workshop Pulogadung",       type: "Inspection",             date: "2025-07-12", technician: "Ahmad Fauzi",    status: "Menunggu Review",   note: "Inspeksi rutin overhead crane. Wire rope perlu penggantian segera.", aiRisk: "high",   ts: "12/07/25 08.30" },
    { id: "REC-004", assetId: "GEN-SET-003", location: "Server Room Lantai 2",      type: "Preventive Maintenance", date: "2025-07-13", technician: "Dewi Cahyani",   status: "Approved",          note: "Service genset bulanan. Bahan bakar dan filter OK.", aiRisk: "low",    ts: "13/07/25 14.00" },
    { id: "REC-005", assetId: "HVY-DMP-018", location: "Terminal Pelabuhan Barat",  type: "Emergency Repair",       date: "2025-07-14", technician: "Teguh Prasetyo", status: "Warning",           note: "Hydraulic dump truck bocor. Unit dihentikan sementara.", aiRisk: "high",   ts: "14/07/25 07.45" },
    { id: "REC-006", assetId: "AIR-CMP-009", location: "Area Produksi Lantai 1",   type: "Corrective Maintenance", date: "2025-07-14", technician: "Sari Rahayu",    status: "Valid",             note: "Penggantian belt kompresor udara. Sudah running normal.", aiRisk: "medium", ts: "14/07/25 11.20" },
    { id: "REC-007", assetId: "TRK-PLT-207", location: "Warehouse Bekasi 2",       type: "Inspection",             date: "2025-07-15", technician: "Budi Santoso",   status: "Menunggu Review",   note: "Masalah serupa dengan TRK-PLT-204 seminggu lalu. Perlu cek lebih lanjut.", aiRisk: "medium", ts: "15/07/25 09.10" },
    { id: "REC-008", assetId: "ELC-PNL-002", location: "Gardu Induk Cikarang",     type: "Preventive Maintenance", date: "2025-07-15", technician: "Hendra Kurniawan", status: "Revised",          note: "Revisi catatan: tegangan drop terjadi 2x, bukan 1x seperti laporan awal.", aiRisk: "medium", ts: "15/07/25 13.55" },
  ];

  saveRecords(demo);

  const auditSeed = [
    { ts: "15/07/25 14.30", assetId: "ELC-PNL-002", action: "Revised",          user: "Hendra Kurniawan", status: "Revised",          reason: "Koreksi jumlah voltage drop dari 1x menjadi 2x" },
    { ts: "15/07/25 09.10", assetId: "TRK-PLT-207", action: "Submitted",         user: "Budi Santoso",     status: "Menunggu Review",   reason: "Pola serupa dengan TRK-PLT-204 terdeteksi" },
    { ts: "13/07/25 16.20", assetId: "GEN-SET-003", action: "Approved",          user: "Supervisor Adi",   status: "Approved",          reason: "Data lengkap dan valid. Tidak ada anomali." },
    { ts: "12/07/25 08.30", assetId: "CRN-OVH-007", action: "Flagged for Review",user: "AI Validator",     status: "Menunggu Review",   reason: "Wire rope dalam kondisi kritis. Perlu tindak lanjut segera." },
    { ts: "11/07/25 10.15", assetId: "FRK-LFT-012", action: "Warning Issued",    user: "AI Validator",     status: "Warning",           reason: "Hydraulic seal suspect. Risiko tinggi operasional." },
  ];
  saveAudit(auditSeed);
}

// ──────────────────────────────────────────────
// NAVBAR HAMBURGER
// ──────────────────────────────────────────────
function initNavbar() {
  const hamburger = document.getElementById("hamburger");
  const navLinks  = document.getElementById("navLinks");
  if (!hamburger || !navLinks) return;

  hamburger.addEventListener("click", () => {
    navLinks.classList.toggle("open");
    hamburger.classList.toggle("active");
  });

  // Scroll shadow
  window.addEventListener("scroll", () => {
    const nav = document.getElementById("navbar");
    if (nav) nav.classList.toggle("scrolled", window.scrollY > 10);
  });
}

// ──────────────────────────────────────────────
// KPI DASHBOARD
// ──────────────────────────────────────────────
function renderKPI() {
  const records = getRecords();
  const total   = records.length;
  const valid   = records.filter(r => r.status === "Valid").length;
  const warning = records.filter(r => r.status === "Warning" || r.status === "Menunggu Review").length;
  const approved= records.filter(r => r.status === "Approved").length;
  const high    = records.filter(r => r.aiRisk === "high").length;
  const pct     = total > 0 ? Math.round((valid + approved) / total * 100) : 94;

  const set = (id, val) => { const el = document.getElementById(id); if (el) el.textContent = val; };
  set("kpiTickets",   total + 1276);
  set("kpiValidation", pct + "%");
  set("kpiReview",    warning);
  set("kpiRisk",      high);
}

// ──────────────────────────────────────────────
// REVIEW QUEUE
// ──────────────────────────────────────────────
function renderReviewQueue() {
  const el = document.getElementById("reviewList");
  if (!el) return;

  const records = getRecords().filter(r =>
    r.status === "Menunggu Review" || r.status === "Warning"
  ).slice(0, 6);

  if (records.length === 0) {
    el.innerHTML = `<div class="review-empty">
      <span>✅</span><p>Tidak ada item yang perlu direview saat ini.</p>
    </div>`;
    return;
  }

  el.innerHTML = records.map(r => `
    <div class="review-item">
      <div class="review-item-left">
        <div class="review-asset">${r.assetId}</div>
        <div class="review-meta">${r.location} · ${r.type}</div>
        <div class="review-note">${r.note.substring(0, 80)}${r.note.length > 80 ? "…" : ""}</div>
      </div>
      <div class="review-item-right">
        <span class="status-pill ${statusClass(r.status)}">${r.status}</span>
        <div class="review-actions">
          <button class="btn-small btn-approve" data-id="${r.id}">Approve</button>
          <button class="btn-small btn-reject"  data-id="${r.id}">Flag</button>
        </div>
      </div>
    </div>
  `).join("");

  el.querySelectorAll(".btn-approve").forEach(btn => {
    btn.addEventListener("click", () => {
      updateRecordStatus(btn.dataset.id, "Approved", "Disetujui oleh supervisor via dashboard");
      refreshDashboard();
    });
  });
  el.querySelectorAll(".btn-reject").forEach(btn => {
    btn.addEventListener("click", () => {
      updateRecordStatus(btn.dataset.id, "Warning", "Diflag ulang oleh supervisor");
      refreshDashboard();
    });
  });
}

function updateRecordStatus(id, newStatus, reason) {
  const records = getRecords();
  const rec = records.find(r => r.id === id);
  if (!rec) return;
  rec.status = newStatus;
  saveRecords(records);
  addAudit({
    ts:      tsNow(),
    assetId: rec.assetId,
    action:  newStatus === "Approved" ? "Approved" : "Flagged",
    user:    "Supervisor (Dashboard)",
    status:  newStatus,
    reason,
  });
}

function statusClass(status) {
  const map = {
    "Valid":           "status-valid",
    "Warning":         "status-warning",
    "Menunggu Review": "status-review",
    "Approved":        "status-approved",
    "Revised":         "status-revised",
  };
  return map[status] || "status-review";
}

// ──────────────────────────────────────────────
// RECORDS TABLE
// ──────────────────────────────────────────────
function renderRecordsTable(filter = "Semua", search = "") {
  const el = document.getElementById("recordsRows");
  if (!el) return;

  let records = getRecords();
  if (filter !== "Semua") records = records.filter(r => r.status === filter);
  if (search.trim()) {
    const q = search.trim().toLowerCase();
    records = records.filter(r =>
      r.assetId.toLowerCase().includes(q) ||
      r.location.toLowerCase().includes(q) ||
      r.technician.toLowerCase().includes(q)
    );
  }

  // Summary counters
  const all = getRecords();
  const set = (id, val) => { const e = document.getElementById(id); if (e) e.textContent = val; };
  set("summaryTotalRecords",   all.length);
  set("summaryValidRecords",   all.filter(r => r.status === "Valid").length);
  set("summaryWarningRecords", all.filter(r => r.status === "Warning" || r.status === "Menunggu Review").length);
  set("summaryApprovedRecords",all.filter(r => r.status === "Approved").length);

  if (records.length === 0) {
    el.innerHTML = `<tr><td colspan="7" class="empty-state">Tidak ada data yang cocok.</td></tr>`;
    return;
  }

  el.innerHTML = records.map(r => `
    <tr>
      <td><strong>${r.assetId}</strong></td>
      <td>${r.location}</td>
      <td>${r.type}</td>
      <td>${r.date || "-"}</td>
      <td>${r.technician}</td>
      <td><span class="status-pill ${statusClass(r.status)}">${r.status}</span></td>
      <td class="note-cell" title="${r.note}">${r.note.substring(0, 60)}${r.note.length > 60 ? "…" : ""}</td>
    </tr>
  `).join("");
}

// ──────────────────────────────────────────────
// AUDIT TABLE
// ──────────────────────────────────────────────
function renderAuditTable() {
  const el = document.getElementById("auditRows");
  if (!el) return;

  const audit = getAudit();
  if (audit.length === 0) {
    el.innerHTML = `<tr><td colspan="6" class="empty-state">Belum ada aksi yang tercatat.</td></tr>`;
    return;
  }

  el.innerHTML = audit.slice(0, 50).map(a => `
    <tr>
      <td>${a.ts}</td>
      <td><strong>${a.assetId}</strong></td>
      <td>${a.action}</td>
      <td>${a.user}</td>
      <td><span class="status-pill ${statusClass(a.status)}">${a.status}</span></td>
      <td class="note-cell">${a.reason}</td>
    </tr>
  `).join("");
}

function refreshDashboard() {
  renderKPI();
  renderReviewQueue();
  renderRecordsTable(currentFilter(), currentSearch());
  renderAuditTable();
}

function currentFilter() {
  const el = document.getElementById("statusFilter");
  return el ? el.value : "Semua";
}
function currentSearch() {
  const el = document.getElementById("assetSearch");
  return el ? el.value : "";
}

// ──────────────────────────────────────────────
// DEMO SIMULATION BUTTONS
// ──────────────────────────────────────────────
function initSimulationButtons() {
  const btnClean  = document.getElementById("simulateClean");
  const btnRisk   = document.getElementById("simulateRisk");
  const btnApprove= document.getElementById("simulateApprove");

  if (btnClean) btnClean.addEventListener("click", () => {
    const rec = {
      id: "REC-SIM-" + Date.now(),
      assetId: "SIM-CLN-" + Math.floor(Math.random() * 900 + 100),
      location: "Warehouse Demo",
      type: "Preventive Maintenance",
      date: new Date().toISOString().slice(0, 10),
      technician: "Demo Teknisi",
      status: "Valid",
      note: "Simulasi data bersih: semua parameter normal, tidak ada anomali terdeteksi.",
      aiRisk: "low",
      ts: tsNow(),
    };
    const records = getRecords();
    records.unshift(rec);
    saveRecords(records);
    addAudit({ ts: tsNow(), assetId: rec.assetId, action: "Auto-Validated", user: "AI Validator", status: "Valid", reason: "Data clean simulation" });
    refreshDashboard();
    showToast("✅ Simulasi data bersih ditambahkan!", "success");
  });

  if (btnRisk) btnRisk.addEventListener("click", () => {
    const rec = {
      id: "REC-SIM-" + Date.now(),
      assetId: "SIM-RSK-" + Math.floor(Math.random() * 900 + 100),
      location: "Area Berisiko",
      type: "Emergency Repair",
      date: new Date().toISOString().slice(0, 10),
      technician: "Demo Teknisi",
      status: "Menunggu Review",
      note: "⚠ Simulasi data berisiko: kerusakan tidak terduga, potensi downtime tinggi, butuh review supervisor.",
      aiRisk: "high",
      ts: tsNow(),
    };
    const records = getRecords();
    records.unshift(rec);
    saveRecords(records);
    addAudit({ ts: tsNow(), assetId: rec.assetId, action: "Flagged for Review", user: "AI Validator", status: "Menunggu Review", reason: "High-risk simulation: emergency repair dengan anomali" });
    refreshDashboard();
    showToast("⚠️ Simulasi data berisiko masuk review queue!", "warning");
  });

  if (btnApprove) btnApprove.addEventListener("click", () => {
    const records = getRecords();
    const pending = records.filter(r => r.status === "Menunggu Review" || r.status === "Warning");
    if (pending.length === 0) {
      showToast("Tidak ada item di review queue.", "info");
      return;
    }
    const target = pending[0];
    target.status = "Approved";
    saveRecords(records);
    addAudit({ ts: tsNow(), assetId: target.assetId, action: "Approved", user: "Supervisor (Simulasi)", status: "Approved", reason: "Simulasi approval oleh supervisor" });
    refreshDashboard();
    showToast("✅ 1 item berhasil di-approve!", "success");
  });
}

// ──────────────────────────────────────────────
// FORM VALIDATION (real-time)
// ──────────────────────────────────────────────
function initFormValidation() {
  const form = document.getElementById("maintenanceForm");
  if (!form) return;

  const fields = ["assetId", "location", "maintenanceType", "maintenanceDate", "technician", "maintenanceNote"];
  fields.forEach(id => {
    const el = document.getElementById(id);
    if (el) el.addEventListener("input", runValidation);
  });

  function runValidation() {
    const assetId  = (document.getElementById("assetId")?.value || "").trim();
    const location = (document.getElementById("location")?.value || "").trim();
    const type     = document.getElementById("maintenanceType")?.value || "";
    const date     = document.getElementById("maintenanceDate")?.value || "";
    const tech     = (document.getElementById("technician")?.value || "").trim();
    const note     = (document.getElementById("maintenanceNote")?.value || "").trim();

    const checks = [];

    // Asset ID format
    if (assetId.length === 0) {
      checks.push({ ok: false, msg: "ID Aset wajib diisi." });
    } else if (!/^[A-Z]{2,5}-[A-Z]{2,5}-\d{2,5}$/i.test(assetId)) {
      checks.push({ ok: false, msg: "Format ID Aset tidak standar (contoh: TRK-PLT-204)." });
    } else {
      checks.push({ ok: true,  msg: "Format ID Aset valid ✓" });
    }

    // Location
    if (location.length < 5) checks.push({ ok: false, msg: "Lokasi terlalu pendek." });
    else checks.push({ ok: true, msg: "Lokasi terisi ✓" });

    // Type
    if (!type) checks.push({ ok: false, msg: "Jenis maintenance belum dipilih." });
    else checks.push({ ok: true, msg: `Jenis: ${type} ✓` });

    // Date
    if (!date) {
      checks.push({ ok: false, msg: "Tanggal belum diisi." });
    } else {
      const d = new Date(date);
      const today = new Date();
      const diffDays = (today - d) / 86400000;
      if (diffDays > 30) checks.push({ ok: false, msg: "⚠ Tanggal lebih dari 30 hari lalu — periksa kembali." });
      else if (diffDays < -1) checks.push({ ok: false, msg: "⚠ Tanggal di masa depan — tidak valid." });
      else checks.push({ ok: true, msg: "Tanggal valid ✓" });
    }

    // Technician
    if (tech.length < 3) checks.push({ ok: false, msg: "Nama teknisi terlalu pendek." });
    else checks.push({ ok: true, msg: "Teknisi terisi ✓" });

    // Note
    if (note.length < 15) checks.push({ ok: false, msg: "Catatan terlalu singkat (min. 15 karakter)." });
    else if (note.length > 500) checks.push({ ok: false, msg: "Catatan terlalu panjang (maks. 500 karakter)." });
    else checks.push({ ok: true, msg: "Catatan maintenance ✓" });

    // Check duplicate
    const existing = getRecords().find(r =>
      r.assetId.toLowerCase() === assetId.toLowerCase() &&
      r.date === date
    );
    if (existing) {
      checks.push({ ok: false, msg: `⚠ Duplikasi: ${assetId} sudah ada di tanggal ${date}.` });
    }

    renderValidationBox(checks);
  }

  runValidation();
}

function renderValidationBox(checks) {
  const box = document.getElementById("validationBox");
  if (!box) return;
  box.innerHTML = checks.map(c => `
    <div class="validation-item ${c.ok ? "ok" : "err"}">
      <span>${c.ok ? "✓" : "✗"}</span> ${c.msg}
    </div>
  `).join("");
}

// ──────────────────────────────────────────────
// AI ANALYSIS — GEMINI
// ──────────────────────────────────────────────
function initAiAnalysis() {
  const btn = document.getElementById("analyzeAiBtn");
  if (!btn) return;

  btn.addEventListener("click", async () => {
    const assetId  = document.getElementById("assetId")?.value?.trim() || "";
    const location = document.getElementById("location")?.value?.trim() || "";
    const type     = document.getElementById("maintenanceType")?.value || "";
    const date     = document.getElementById("maintenanceDate")?.value || "";
    const tech     = document.getElementById("technician")?.value?.trim() || "";
    const note     = document.getElementById("maintenanceNote")?.value?.trim() || "";
    const workflow = document.getElementById("workflowStatus")?.value || "";

    if (!assetId || !note || !type) {
      showToast("Isi minimal: ID Aset, Jenis Maintenance, dan Catatan terlebih dahulu.", "warning");
      return;
    }

    // Check if API key is configured
    if (GEMINI_API_KEY === "YOUR_GEMINI_API_KEY_HERE") {
      // Fallback mode — rule-based analysis
      runRuleBasedAnalysis(assetId, location, type, date, note, workflow);
      return;
    }

    // Show loading
    const panel = document.getElementById("aiAnalysisPanel");
    const btnText = document.getElementById("analyzeAiText");
    btnText.textContent = "⏳ Menganalisis...";
    btn.disabled = true;
    if (panel) panel.style.display = "block";
    document.getElementById("aiSummary").textContent = "AI sedang menganalisis data maintenance...";

    const prompt = `Kamu adalah sistem AI untuk governance dan validasi data maintenance industri.

Analisis data maintenance berikut dan berikan output dalam format JSON:

Data Input:
- ID Aset: ${assetId}
- Lokasi: ${location}
- Jenis Maintenance: ${type}
- Tanggal: ${date}
- Teknisi: ${tech}
- Catatan: ${note}
- Status Workflow: ${workflow}

Berikan output JSON dengan struktur berikut (hanya JSON, tanpa teks lain):
{
  "riskLevel": "low" | "medium" | "high",
  "riskScore": angka 0-100,
  "summary": "ringkasan singkat 1-2 kalimat dalam Bahasa Indonesia",
  "riskReasons": ["alasan 1", "alasan 2"],
  "recommendations": ["rekomendasi 1", "rekomendasi 2"],
  "anomalies": ["anomali 1"] // kosong jika tidak ada,
  "suggestedStatus": "Valid" | "Menunggu Review" | "Warning"
}`;

    try {
      const resp = await fetch(GEMINI_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: { temperature: 0.3, maxOutputTokens: 500 }
        })
      });

      if (!resp.ok) throw new Error(`API Error: ${resp.status}`);

      const data = await resp.json();
      const raw  = data?.candidates?.[0]?.content?.parts?.[0]?.text || "{}";
      const clean = raw.replace(/```json|```/g, "").trim();
      const result = JSON.parse(clean);
      renderAiResult(result, assetId);

    } catch (err) {
      console.warn("Gemini error, fallback to rule-based:", err);
      runRuleBasedAnalysis(assetId, location, type, date, note, workflow);
    } finally {
      btnText.textContent = "🔍 Analisis dengan AI";
      btn.disabled = false;
    }
  });
}

// Rule-based fallback (works tanpa API key)
function runRuleBasedAnalysis(assetId, location, type, date, note, workflow) {
  const noteLower = note.toLowerCase();
  let riskScore = 20;
  const riskReasons = [];
  const anomalies = [];

  if (type === "Emergency Repair")        { riskScore += 40; riskReasons.push("Jenis Emergency Repair berisiko tinggi."); }
  if (type === "Corrective Maintenance")  { riskScore += 20; riskReasons.push("Corrective Maintenance menandakan ada kerusakan."); }

  const highWords = ["bocor", "rusak", "kritis", "darurat", "gagal", "patah", "off", "tidak bisa"];
  const hitWords  = highWords.filter(w => noteLower.includes(w));
  if (hitWords.length > 0) {
    riskScore += hitWords.length * 15;
    riskReasons.push(`Kata berisiko terdeteksi: ${hitWords.join(", ")}.`);
  }

  const existing = getRecords().filter(r =>
    r.assetId.toLowerCase() === assetId.toLowerCase()
  );
  if (existing.length >= 2) {
    riskScore += 20;
    anomalies.push(`Aset ${assetId} sudah ${existing.length} kali masuk maintenance — pola berulang.`);
    riskReasons.push("Frekuensi maintenance tinggi untuk aset ini.");
  }

  riskScore = Math.min(riskScore, 100);
  const riskLevel   = riskScore >= 70 ? "high" : riskScore >= 40 ? "medium" : "low";
  const suggested   = riskScore >= 70 ? "Warning" : riskScore >= 40 ? "Menunggu Review" : "Valid";

  const recommendations = [];
  if (riskLevel === "high")   recommendations.push("Kirim ke review supervisor sebelum dilanjutkan.", "Dokumentasikan root cause secara lengkap.");
  if (riskLevel === "medium") recommendations.push("Verifikasi catatan maintenance lebih detail.", "Cek histori aset sebelumnya.");
  if (riskLevel === "low")    recommendations.push("Data terlihat valid dan konsisten.", "Bisa langsung disimpan.");

  renderAiResult({ riskLevel, riskScore, summary: `Analisis rule-based: tingkat risiko ${riskLevel} (skor ${riskScore}/100).`, riskReasons, recommendations, anomalies, suggestedStatus: suggested }, assetId);

  // Show note about fallback
  const panel = document.getElementById("aiAnalysisPanel");
  if (panel) {
    const note2 = document.createElement("p");
    note2.style.cssText = "font-size:11px;color:#888;margin-top:8px;padding:8px;background:#f8f9fa;border-radius:6px;";
    note2.innerHTML = `💡 <em>Mode rule-based aktif. Untuk analisis AI penuh, tambahkan Gemini API Key di main.js baris 8. <a href="https://ai.google.dev" target="_blank">Dapatkan gratis di ai.google.dev</a></em>`;
    panel.appendChild(note2);
  }
}

function renderAiResult(result, assetId) {
  const panel  = document.getElementById("aiAnalysisPanel");
  if (!panel) return;
  panel.style.display = "block";

  const badge  = document.getElementById("aiRiskBadge");
  const summary= document.getElementById("aiSummary");
  const reasons= document.getElementById("aiRiskReasons");
  const recs   = document.getElementById("aiRecommendations");
  const anomSec= document.getElementById("aiAnomaliesSection");
  const anomList=document.getElementById("aiAnomalies");
  const analyzedAt = document.getElementById("aiAnalyzedAt");

  const riskMap = { low: "🟢 Risiko Rendah", medium: "🟡 Risiko Sedang", high: "🔴 Risiko Tinggi" };
  const classMap= { low: "badge-low", medium: "badge-medium", high: "badge-high" };

  badge.textContent = riskMap[result.riskLevel] || "Tidak Diketahui";
  badge.className   = "ai-badge " + (classMap[result.riskLevel] || "");
  summary.textContent = result.summary || "";
  reasons.innerHTML = (result.riskReasons || []).map(r => `<li>${r}</li>`).join("");
  recs.innerHTML    = (result.recommendations || []).map(r => `<li>${r}</li>`).join("");

  if (result.anomalies && result.anomalies.length > 0) {
    anomSec.style.display = "block";
    anomList.innerHTML = result.anomalies.map(a => `<li>${a}</li>`).join("");
  } else {
    anomSec.style.display = "none";
  }

  analyzedAt.textContent = `Dianalisis: ${tsNow()} · Aset: ${assetId}`;

  // Update status pill
  const pill = document.getElementById("formStatusPill");
  if (pill && result.suggestedStatus) {
    pill.textContent = `AI Saran: ${result.suggestedStatus}`;
    pill.className   = `status-pill ${statusClass(result.suggestedStatus)}`;
  }
}

// ──────────────────────────────────────────────
// FORM SUBMIT — SAVE RECORD
// ──────────────────────────────────────────────
function initFormSubmit() {
  const form = document.getElementById("maintenanceForm");
  if (!form) return;

  form.addEventListener("submit", (e) => {
    e.preventDefault();

    const assetId  = document.getElementById("assetId")?.value?.trim() || "";
    const location = document.getElementById("location")?.value?.trim() || "";
    const type     = document.getElementById("maintenanceType")?.value || "";
    const date     = document.getElementById("maintenanceDate")?.value || "";
    const tech     = document.getElementById("technician")?.value?.trim() || "";
    const note     = document.getElementById("maintenanceNote")?.value?.trim() || "";
    const workflow = document.getElementById("workflowStatus")?.value || "Menunggu Approval";

    if (!assetId || !location || !type || !date || !tech || !note) {
      showToast("Semua field wajib diisi sebelum menyimpan.", "warning");
      return;
    }

    // Determine status & risk from AI panel if available
    const badge    = document.getElementById("aiRiskBadge");
    const hasAI    = badge && badge.textContent && badge.textContent !== "-";
    const riskText = hasAI ? badge.textContent : "";
    const aiRisk   = riskText.includes("Tinggi") ? "high" : riskText.includes("Sedang") ? "medium" : "low";

    let status = "Valid";
    if (workflow === "Menunggu Approval" || workflow === "Sedang Direview") status = "Menunggu Review";
    if (aiRisk === "high") status = "Warning";

    const rec = {
      id:         "REC-" + Date.now(),
      assetId, location, type, date,
      technician: tech,
      status,
      note,
      aiRisk,
      ts:         tsNow(),
    };

    const records = getRecords();
    records.unshift(rec);
    saveRecords(records);

    addAudit({
      ts:      tsNow(),
      assetId,
      action:  "Submitted",
      user:    tech,
      status,
      reason:  hasAI ? `AI risk: ${riskText}` : "Data dikirim manual",
    });

    // Feedback
    const fb = document.getElementById("formFeedback");
    if (fb) {
      fb.innerHTML = `<div class="feedback-success">✅ Data berhasil disimpan dengan status <strong>${status}</strong>. <a href="dashboard.html#records">Lihat di dashboard →</a></div>`;
      setTimeout(() => { fb.innerHTML = ""; }, 5000);
    }

    // Reset
    form.reset();
    const pill = document.getElementById("formStatusPill");
    if (pill) { pill.textContent = "Siap Diisi"; pill.className = "status-pill status-live"; }
    const panel = document.getElementById("aiAnalysisPanel");
    if (panel) panel.style.display = "none";
    renderValidationBox([{ ok: false, msg: "Isi form untuk melihat hasil validasi." }]);

    showToast(`✅ Record ${assetId} disimpan!`, "success");
  });

  // Send to reviewer
  const sendBtn = document.getElementById("sendReviewer");
  if (sendBtn) sendBtn.addEventListener("click", () => {
    const assetId  = document.getElementById("assetId")?.value?.trim() || "";
    const location = document.getElementById("location")?.value?.trim() || "";
    const type     = document.getElementById("maintenanceType")?.value || "";
    const date     = document.getElementById("maintenanceDate")?.value || "";
    const tech     = document.getElementById("technician")?.value?.trim() || "";
    const note     = document.getElementById("maintenanceNote")?.value?.trim() || "";

    if (!assetId || !type || !date) {
      showToast("Isi minimal ID Aset, Jenis Maintenance, dan Tanggal.", "warning");
      return;
    }

    const rec = {
      id:         "REC-" + Date.now(),
      assetId, location, type, date,
      technician: tech || "Unknown",
      status:     "Menunggu Review",
      note:       note || "Dikirim ke reviewer tanpa catatan.",
      aiRisk:     "medium",
      ts:         tsNow(),
    };

    const records = getRecords();
    records.unshift(rec);
    saveRecords(records);
    addAudit({ ts: tsNow(), assetId, action: "Sent to Reviewer", user: tech || "Unknown", status: "Menunggu Review", reason: "Dikirim manual ke reviewer" });
    showToast(`📤 ${assetId} masuk review queue supervisor!`, "success");
  });

  // Reset button
  const resetBtn = document.getElementById("resetForm");
  if (resetBtn) resetBtn.addEventListener("click", () => {
    const form2 = document.getElementById("maintenanceForm");
    if (form2) form2.reset();
    const panel = document.getElementById("aiAnalysisPanel");
    if (panel) panel.style.display = "none";
    renderValidationBox([{ ok: false, msg: "Isi form untuk melihat hasil validasi." }]);
    const pill = document.getElementById("formStatusPill");
    if (pill) { pill.textContent = "Siap Diisi"; pill.className = "status-pill status-live"; }
    showToast("Form direset.", "info");
  });
}

// ──────────────────────────────────────────────
// EXPORT CSV
// ──────────────────────────────────────────────
function initExport() {
  const btn = document.getElementById("exportCsv");
  if (!btn) return;

  btn.addEventListener("click", () => {
    const records = getRecords();
    if (records.length === 0) { showToast("Tidak ada data untuk diekspor.", "info"); return; }

    const header = ["ID","ID Aset","Lokasi","Jenis","Tanggal","Teknisi","Status","Catatan"];
    const rows   = records.map(r =>
      [r.id, r.assetId, r.location, r.type, r.date, r.technician, r.status, `"${r.note.replace(/"/g,'""')}"`].join(",")
    );
    const csv  = [header.join(","), ...rows].join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement("a");
    a.href     = url;
    a.download = `opsguard-records-${new Date().toISOString().slice(0,10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    showToast("✅ CSV berhasil diekspor!", "success");
  });
}

// ──────────────────────────────────────────────
// CLEAR LOCAL DATA
// ──────────────────────────────────────────────
function initClearData() {
  const btn = document.getElementById("clearLocalData");
  if (!btn) return;
  btn.addEventListener("click", () => {
    if (!confirm("Reset semua data lokal? Ini tidak bisa dibatalkan.")) return;
    localStorage.removeItem("opsguard_records");
    localStorage.removeItem("opsguard_audit");
    seedDemoData();
    refreshDashboard();
    showToast("🔄 Data direset ke demo default.", "info");
  });
}

// ──────────────────────────────────────────────
// FILTER & SEARCH
// ──────────────────────────────────────────────
function initFilters() {
  const filterEl = document.getElementById("statusFilter");
  const searchEl = document.getElementById("assetSearch");
  if (filterEl) filterEl.addEventListener("change", () => renderRecordsTable(filterEl.value, searchEl?.value || ""));
  if (searchEl) searchEl.addEventListener("input",  () => renderRecordsTable(filterEl?.value || "Semua", searchEl.value));
}

// ──────────────────────────────────────────────
// HERO LANDING MINI PANEL ANIMATION
// ──────────────────────────────────────────────
function initHeroPanel() {
  const assets    = ["TRK-PLT-204", "FRK-LFT-012", "GEN-SET-003", "CRN-OVH-007"];
  const locations = ["Warehouse Bekasi 2", "Gudang Cakung A", "Server Room", "Workshop Pulogadung"];
  const types     = ["Preventive", "Corrective", "Emergency", "Inspection"];
  const alerts    = [
    "✓ Aset terverifikasi · ✓ Format valid · ⚠ Ada issue serupa 6 hari lalu",
    "✓ Aset OK · ✓ Format valid · ✅ Tidak ada duplikasi",
    "⚠ Emergency repair — eskalasi ke supervisor disarankan",
    "✓ Inspeksi rutin · ✓ Format valid · ✅ Data siap approval",
  ];

  let i = 0;
  function rotate() {
    const j = i % assets.length;
    const set = (id, val) => { const el = document.getElementById(id); if (el) el.textContent = val; };
    set("snapshotAsset",    assets[j]);
    set("snapshotLocation", locations[j]);
    set("snapshotType",     types[j]);
    set("snapshotAlert",    alerts[j]);
    i++;
  }
  setInterval(rotate, 3000);

  // Mini KPI counter
  const records = getRecords();
  const set2 = (id, v) => { const el = document.getElementById(id); if (el) el.textContent = v; };
  set2("miniValidated",  records.filter(r => r.status === "Valid" || r.status === "Approved").length || 148);
  set2("miniNeedReview", records.filter(r => r.status === "Menunggu Review" || r.status === "Warning").length || 12);
}

// ──────────────────────────────────────────────
// TOAST NOTIFICATIONS
// ──────────────────────────────────────────────
function showToast(msg, type = "info") {
  let container = document.getElementById("toastContainer");
  if (!container) {
    container = document.createElement("div");
    container.id = "toastContainer";
    container.style.cssText = "position:fixed;bottom:24px;right:24px;z-index:9999;display:flex;flex-direction:column;gap:8px;";
    document.body.appendChild(container);
  }

  const colors = { success: "#059669", warning: "#d97706", info: "#0ea5e9", error: "#dc2626" };
  const toast  = document.createElement("div");
  toast.style.cssText = `background:${colors[type]||"#333"};color:#fff;padding:12px 18px;border-radius:10px;font-size:14px;max-width:320px;box-shadow:0 4px 16px rgba(0,0,0,.2);animation:slideIn .25s ease;`;
  toast.textContent = msg;
  container.appendChild(toast);

  if (!document.getElementById("toastStyle")) {
    const s = document.createElement("style");
    s.id = "toastStyle";
    s.textContent = `@keyframes slideIn{from{transform:translateX(110%);opacity:0}to{transform:translateX(0);opacity:1}}`;
    document.head.appendChild(s);
  }

  setTimeout(() => toast.remove(), 3500);
}

// ──────────────────────────────────────────────
// INJECT MISSING CSS CLASSES (jika style.css belum punya)
// ──────────────────────────────────────────────
function injectExtraStyles() {
  const s = document.createElement("style");
  s.textContent = `
    /* Status Pills */
    .status-pill { display:inline-block; padding:3px 10px; border-radius:20px; font-size:12px; font-weight:600; }
    .status-valid    { background:#d1fae5; color:#065f46; }
    .status-warning  { background:#fef3c7; color:#92400e; }
    .status-review   { background:#dbeafe; color:#1e40af; }
    .status-approved { background:#ede9fe; color:#4c1d95; }
    .status-revised  { background:#f3f4f6; color:#374151; }
    .status-live     { background:#d1fae5; color:#065f46; }

    /* Validation Box */
    .validation-box { padding:12px; background:#f8f9fa; border-radius:8px; margin:12px 0; font-size:13px; }
    .validation-item { padding:3px 0; color:#6b7280; }
    .validation-item.ok { color:#059669; }
    .validation-item.err { color:#dc2626; }

    /* AI Analysis Panel */
    .ai-analysis-panel { margin-top:16px; border:1.5px solid #e5e7eb; border-radius:12px; padding:16px; background:#fafafa; }
    .ai-panel-header { display:flex; justify-content:space-between; align-items:center; margin-bottom:10px; }
    .ai-panel-title { font-weight:700; font-size:14px; }
    .ai-badge { padding:4px 12px; border-radius:20px; font-size:12px; font-weight:700; }
    .badge-low    { background:#d1fae5; color:#065f46; }
    .badge-medium { background:#fef3c7; color:#92400e; }
    .badge-high   { background:#fee2e2; color:#991b1b; }
    .ai-summary { font-size:13px; color:#374151; margin-bottom:8px; }
    .ai-section { margin-top:8px; font-size:13px; }
    .ai-section ul { margin:4px 0 0 16px; }
    .ai-section li { margin-bottom:2px; color:#4b5563; }

    /* Review Queue */
    .review-item { display:flex; justify-content:space-between; align-items:flex-start; padding:12px 0; border-bottom:1px solid #f3f4f6; gap:12px; }
    .review-item:last-child { border-bottom:none; }
    .review-asset { font-weight:700; font-size:14px; }
    .review-meta  { font-size:12px; color:#6b7280; margin:2px 0; }
    .review-note  { font-size:13px; color:#374151; }
    .review-item-right { display:flex; flex-direction:column; align-items:flex-end; gap:6px; flex-shrink:0; }
    .review-actions { display:flex; gap:6px; }
    .review-empty { text-align:center; padding:24px; color:#6b7280; }
    .review-empty span { font-size:28px; display:block; margin-bottom:8px; }

    /* Buttons */
    .btn-small { padding:4px 10px; border-radius:6px; font-size:12px; font-weight:600; border:none; cursor:pointer; }
    .btn-approve { background:#d1fae5; color:#065f46; }
    .btn-reject  { background:#fee2e2; color:#991b1b; }

    /* Table */
    .empty-state { text-align:center; padding:24px; color:#9ca3af; font-style:italic; }
    .note-cell   { max-width:200px; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; }

    /* Form Feedback */
    .feedback-success { background:#d1fae5; color:#065f46; padding:12px 16px; border-radius:8px; margin-top:8px; font-size:14px; }

    /* Form shortcuts */
    .form-shortcuts { display:flex; gap:10px; margin-top:16px; flex-wrap:wrap; }
    .form-page-note { font-size:12px; color:#9ca3af; margin-top:12px; text-align:center; }
  `;
  document.head.appendChild(s);
}

// ──────────────────────────────────────────────
// INIT
// ──────────────────────────────────────────────
document.addEventListener("DOMContentLoaded", () => {
  injectExtraStyles();
  seedDemoData();
  initNavbar();

  // Dashboard page
  if (document.getElementById("reviewList")) {
    refreshDashboard();
    initSimulationButtons();
    initFilters();
    initExport();
    initClearData();

    // Auto-refresh setiap 30 detik
    setInterval(refreshDashboard, 30000);
  }

  // Form page
  if (document.getElementById("maintenanceForm")) {
    initFormValidation();
    initAiAnalysis();
    initFormSubmit();

    // Set today's date as default
    const dateEl = document.getElementById("maintenanceDate");
    if (dateEl && !dateEl.value) {
      dateEl.value = new Date().toISOString().slice(0, 10);
    }
  }

  // Landing page
  if (document.getElementById("snapshotAsset")) {
    initHeroPanel();
  }
});
