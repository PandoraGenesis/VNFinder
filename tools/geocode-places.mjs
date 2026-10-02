#!/usr/bin/env node
/**
 * VNFinder — Tạo tọa độ cho toàn bộ địa danh trong js/itinerary-data.js
 *
 * Chạy MỘT LẦN trên máy của bạn (cần Node 18+ và internet), kết quả lưu vào data/place-coords.json.
 * Sau đó web đọc file này nên bộ chấm điểm tính được khoảng cách và vẽ tuyến ngay, không cần gọi
 * Nominatim lúc chạy.
 *
 *   node tools/geocode-places.mjs --dry-run      # chỉ đếm, không gọi mạng
 *   node tools/geocode-places.mjs                # chạy thật (vài chục phút, có thể dừng và chạy lại)
 *   node tools/geocode-places.mjs --limit 50     # thử với 50 địa danh đầu
 *
 * Tôn trọng chính sách sử dụng Nominatim: 1 yêu cầu mỗi giây, có User-Agent định danh.
 * Kết quả được ghi dần sau mỗi 20 địa danh nên dừng giữa chừng không mất dữ liệu.
 */
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const DATA_FILE = path.join(root, 'js', 'itinerary-data.js');
const OUT_FILE = path.join(root, 'data', 'place-coords.json');
const GAP_MS = 1100;
const VN = { south: 4.0, north: 24.5, west: 99.0, east: 118.5 };
const SLOTS = ['morningVisit', 'afternoonVisit', 'nightlife'];

const args = process.argv.slice(2);
const dryRun = args.includes('--dry-run');
const limitIdx = args.indexOf('--limit');
const limit = limitIdx !== -1 ? Number(args[limitIdx + 1]) : Infinity;

// Phải trùng với VNGeo.placeKey trong js/geo.js
const placeKey = (name, province) => `${String(name).trim()}, ${String(province).trim()}`;
const queryName = (name) => String(name).replace(/\([^)]*\)/g, '').replace(/\s+/g, ' ').trim();

function loadData() {
  const ctx = vm.createContext({ console });
  const code = fs.readFileSync(DATA_FILE, 'utf8') +
    '\n;this.__out = { ITINERARY_DATA, PROVINCE_FALLBACK, EXTENDED_PROVINCE_DATA };';
  vm.runInContext(code, ctx);
  return ctx.__out;
}

/** Gom (tên địa danh, tỉnh) duy nhất từ cả ba tầng dữ liệu. */
export function collectPlaces(data) {
  const found = new Map();
  const add = (name, province) => {
    if (!name || !province) return;
    found.set(placeKey(name, province), { name, province });
  };
  const scan = (block, province) => {
    if (!block) return;
    // Bỏ qua mục tên ghép tự động (synthetic): không phải địa điểm thật nên không có tọa độ để tra
    for (const slot of SLOTS) (block[slot] || []).filter((it) => !it.synthetic).forEach((it) => add(it.name, province));
  };
  for (const [key, block] of Object.entries(data.ITINERARY_DATA || {})) {
    scan(block, key.includes(',') ? key.split(',').pop().trim() : key);
  }
  for (const [prov, block] of Object.entries(data.PROVINCE_FALLBACK || {})) scan(block, prov);
  for (const [prov, block] of Object.entries(data.EXTENDED_PROVINCE_DATA || {})) scan(block, prov);
  return [...found.entries()].map(([key, v]) => ({ key, ...v }));
}

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function geocode(place) {
  const url = 'https://nominatim.openstreetmap.org/search?format=jsonv2&limit=1&countrycodes=vn&accept-language=vi&q=' +
    encodeURIComponent(`${queryName(place.name)}, ${place.province}, Việt Nam`);
  const res = await fetch(url, { headers: { 'User-Agent': 'VNFinder-geocoder/1.0 (student project, Quy Nhon High School)' } });
  if (!res.ok) throw new Error('HTTP ' + res.status);
  const list = await res.json();
  const r0 = list[0];
  if (!r0) return null;
  const lat = parseFloat(r0.lat), lng = parseFloat(r0.lon);
  if (!Number.isFinite(lat) || !Number.isFinite(lng)) return null;
  if (lat < VN.south || lat > VN.north || lng < VN.west || lng > VN.east) return null;
  return [Math.round(lat * 1e5) / 1e5, Math.round(lng * 1e5) / 1e5];
}

async function main() {
  const places = collectPlaces(loadData());
  const existing = fs.existsSync(OUT_FILE) ? JSON.parse(fs.readFileSync(OUT_FILE, 'utf8')) : {};
  const todo = places.filter((p) => !(p.key in existing)).slice(0, limit);

  console.log(`Tổng địa danh duy nhất: ${places.length}`);
  console.log(`Đã có tọa độ: ${places.length - places.filter((p) => !(p.key in existing)).length}`);
  console.log(`Cần tra: ${todo.length} (khoảng ${Math.ceil((todo.length * GAP_MS) / 60000)} phút)`);
  if (dryRun) return;

  fs.mkdirSync(path.dirname(OUT_FILE), { recursive: true });
  const save = () => fs.writeFileSync(OUT_FILE, JSON.stringify(existing));
  let ok = 0, miss = 0;

  for (let i = 0; i < todo.length; i++) {
    const p = todo[i];
    try {
      const c = await geocode(p);
      if (c) { existing[p.key] = c; ok++; } else { miss++; }
    } catch (e) {
      console.warn(`  Lỗi "${p.key}": ${e.message} (bỏ qua, chạy lại sau để thử tiếp)`);
      await sleep(5000);
    }
    if ((i + 1) % 20 === 0) { save(); console.log(`  ${i + 1}/${todo.length} (tìm thấy ${ok}, không thấy ${miss})`); }
    await sleep(GAP_MS);
  }
  save();
  console.log(`Xong. Tìm thấy ${ok}, không thấy ${miss}. Đã ghi ${OUT_FILE}`);
}

if (process.argv[1] === fileURLToPath(import.meta.url)) main();
