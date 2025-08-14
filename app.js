/* global UAParser, sendAdminEmail, firebase */

const $ = id => document.getElementById(id);
const setText = (id, v) => $(id).textContent = (v == null || v === '') ? 'Tidak tersedia' : v;

// ===== Data collectors =====
async function fetchIPInfo() {
  try {
    const res = await fetch('https://ipapi.co/json/');
    if (!res.ok) throw new Error('ipapi error');
    return await res.json();
  } catch {
    return {};
  }
}

function getCurrentPosition() {
  return new Promise(resolve => {
    if (!navigator.geolocation) return resolve({});
    navigator.geolocation.getCurrentPosition(
      pos => resolve({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
      () => resolve({}),
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 0 }
    );
  });
}

async function getBatteryLevel() {
  try {
    if (!navigator.getBattery) return {};
    const b = await navigator.getBattery();
    return { level: Math.round(b.level * 100), charging: !!b.charging };
  } catch {
    return {};
  }
}

function getDeviceInfo() {
  const parser = new UAParser();
  const d = parser.getDevice(), os = parser.getOS(), br = parser.getBrowser();
  return {
    vendor: d.vendor || 'Tidak diketahui',
    model: d.model || 'Tidak diketahui',
    os: `${os.name || 'Unknown'} ${os.version || ''}`.trim(),
    browser: `${br.name || 'Unknown'} ${br.version || ''}`.trim()
  };
}

function getExtraInfo() {
  const conn = navigator.connection || navigator.mozConnection || navigator.webkitConnection || {};
  return {
    platform: navigator.platform || 'Unknown',
    resolution: `${screen.width}x${screen.height}`,
    depth: `${screen.colorDepth}-bit`,
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    online: !!navigator.onLine,
    cookies: !!navigator.cookieEnabled,
    connectionType: conn.effectiveType || 'Unknown',
    downlink: typeof conn.downlink === 'number' ? `${conn.downlink} Mbps` : 'Unknown',
    ua: navigator.userAgent || ''
  };
}

// ===== Firestore helpers =====
async function saveToFirestore(doc) {
  const db = window.__db;
  const ref = await db.collection('device_logs').add(doc);
  return ref.id;
}

// ===== Main flow =====
async function collectAndProcess() {
  $('status').textContent = 'Mengambil data…';

  const [ip, gps, batt] = await Promise.all([fetchIPInfo(), getCurrentPosition(), getBatteryLevel()]);
  const dev = getDeviceInfo();
  const extra = getExtraInfo();

  // Render UI
  setText('v_vendor', dev.vendor);
  setText('v_model', dev.model);
  setText('v_os', dev.os);
  setText('v_browser', dev.browser);
  setText('v_platform', extra.platform);
  setText('v_res', extra.resolution);
  setText('v_depth', extra.depth);
  setText('v_ip', ip.ip);
  setText('v_prov', ip.region);
  setText('v_kota', ip.city);
  setText('v_gps', gps.lat ? `${gps.lat.toFixed(5)}, ${gps.lng.toFixed(5)}` : null);
  setText('v_tz', extra.timezone);
  setText('v_conn', extra.connectionType);
  setText('v_speed', extra.downlink);
  setText('v_online', extra.online ? 'Online' : 'Offline');
  setText('v_cookie', extra.cookies ? 'Aktif' : 'Nonaktif');
  setText('v_batt', (typeof batt.level === 'number') ? `${batt.level}%${batt.charging ? ' (charging)' : ''}` : 'Tidak tersedia');
  setText('v_ua', extra.ua);

  // Payload
  const payload = {
    ip: ip.ip || null,
    provinsi: ip.region || null,
    kota: ip.city || null,
    country: ip.country_name || null,
    gps: (gps.lat && gps.lng) ? { lat: gps.lat, lng: gps.lng } : null,
    gps_lat: gps.lat || null,
    gps_lng: gps.lng || null,
    baterai: (typeof batt.level === 'number') ? batt.level : null,
    charging: (typeof batt.charging === 'boolean') ? batt.charging : null,
    merek: dev.vendor,
    model: dev.model,
    os: dev.os,
    browser: dev.browser,
    platform: extra.platform,
    resolusi: extra.resolution,
    kedalaman_warna: extra.depth,
    zona_waktu: extra.timezone,
    online: extra.online,
    cookies: extra.cookies,
    koneksi: extra.connectionType,
    downlink: extra.downlink,
    ua: extra.ua,
    createdAt: firebase.firestore.FieldValue.serverTimestamp()
  };

  try {
    $('status').textContent = 'Menyimpan ke Firebase…';
    const docId = await saveToFirestore(payload);

    $('status').textContent = 'Mengirim email admin…';
    const ok = await sendAdminEmail({ ...payload, doc_id: docId, createdAt: new Date().toISOString() });

    $('status').textContent = ok ? 'Selesai ✅ (Firestore & Email)' : 'Firestore OK, Email gagal ❌ (cek EmailJS)';
  } catch (e) {
    console.error(e);
    $('status').textContent = 'Gagal simpan ❌ (cek console)';
  }
}

// ===== Consent modal =====
window.addEventListener('load', () => {
  const modal = $('consentModal');
  $('btnAgree').addEventListener('click', () => {
    if (!$('agree').checked) { alert('Centang persetujuan terlebih dahulu.'); return; }
    modal.classList.remove('show'); modal.style.display = 'none';
    collectAndProcess();
  });
  $('btnCancel').addEventListener('click', () => {
    $('status').textContent = 'Dibatalkan oleh pengguna.';
    modal.classList.remove('show'); modal.style.display = 'none';
  });
});
