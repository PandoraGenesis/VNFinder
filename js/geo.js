/**
 * VNFinder — Tọa độ địa danh (js/geo.js)
 *
 * Thứ tự tra cứu tọa độ cho một địa danh:
 *   1. data/place-coords.json  (tạo sẵn bằng tools/geocode-places.mjs, nhanh và không giới hạn tốc độ)
 *   2. Bộ nhớ đệm localStorage (kết quả Nominatim các lần trước)
 *   3. Nominatim (hàng đợi, tối thiểu 1,1 giây giữa hai lần gọi theo chính sách sử dụng của OSM)
 *
 * Giao diện công khai: window.VNGeo = { placeKey, peek, geocode, locate, provinceCenter, ready }
 */
(function () {
  'use strict';

  var CACHE_KEY = 'vnfinder_geocache_v1';
  var MIN_GAP_MS = 1100;
  var VN_BOX = { south: 4.0, north: 24.5, west: 99.0, east: 118.5 };

  var prebuilt = {};     // từ data/place-coords.json
  var cache = {};        // từ localStorage
  var provinces = null;  // { tên chuẩn hóa: [lat, lng] }
  var queue = Promise.resolve();
  var lastCall = 0;

  function norm(s) { return String(s == null ? '' : s).toLowerCase().normalize('NFC').trim(); }

  // Khóa dùng chung với tools/geocode-places.mjs
  function placeKey(name, province) {
    return String(name || '').trim() + ', ' + String(province || '').trim();
  }

  try { cache = JSON.parse(localStorage.getItem(CACHE_KEY) || '{}') || {}; } catch (e) { cache = {}; }
  function saveCache() { try { localStorage.setItem(CACHE_KEY, JSON.stringify(cache)); } catch (e) { /* đầy bộ nhớ */ } }

  function inVietnam(lat, lng) {
    return lat >= VN_BOX.south && lat <= VN_BOX.north && lng >= VN_BOX.west && lng <= VN_BOX.east;
  }

  /* ---------- Tải dữ liệu tĩnh ---------- */
  var readyPromise = Promise.all([
    fetch('data/place-coords.json').then(function (r) { return r.ok ? r.json() : {}; }).catch(function () { return {}; }),
    fetch('data/maps/provinces.geojson').then(function (r) { return r.ok ? r.json() : null; }).catch(function () { return null; })
  ]).then(function (res) {
    prebuilt = res[0] || {};
    if (res[1] && res[1].features) {
      provinces = {};
      res[1].features.forEach(function (f) {
        var c = bboxCenter(f.geometry);
        if (c && f.properties) {
          provinces[norm(f.properties.name)] = c;
          if (f.properties.nameEn) provinces[norm(f.properties.nameEn)] = c;
        }
      });
    }
  });

  function bboxCenter(geom) {
    if (!geom || !geom.coordinates) return null;
    var minLat = 90, maxLat = -90, minLng = 180, maxLng = -180;
    (function walk(a) {
      if (typeof a[0] === 'number') {
        if (a[1] < minLat) minLat = a[1]; if (a[1] > maxLat) maxLat = a[1];
        if (a[0] < minLng) minLng = a[0]; if (a[0] > maxLng) maxLng = a[0];
      } else { a.forEach(walk); }
    })(geom.coordinates);
    return maxLat < minLat ? null : [(minLat + maxLat) / 2, (minLng + maxLng) / 2];
  }

  /* ---------- Tra cứu không gọi mạng ---------- */
  function peek(name, province) {
    var k = placeKey(name, province);
    var v = prebuilt[k] || cache[k];
    return v && v.length === 2 ? { lat: v[0], lng: v[1] } : null;
  }

  function provinceCenter(province) {
    if (!provinces) return null;
    var p = norm(province).replace(/^(tỉnh|thành phố|tp\.?)\s+/, '');
    var c = provinces[p];
    return c ? { lat: c[0], lng: c[1] } : null;
  }

  /* ---------- Nominatim qua hàng đợi ---------- */
  function throttled(task) {
    var run = queue.then(function () {
      var wait = Math.max(0, lastCall + MIN_GAP_MS - Date.now());
      return new Promise(function (r) { setTimeout(r, wait); }).then(function () {
        lastCall = Date.now();
        return task();
      });
    });
    queue = run.catch(function () { /* giữ hàng đợi sống */ });
    return run;
  }

  function queryText(name) {
    // Bỏ phần trong ngoặc: "Biển Hồ (Hồ T'Nưng)" → "Biển Hồ"
    return String(name || '').replace(/\([^)]*\)/g, '').replace(/\s+/g, ' ').trim();
  }

  function geocode(name, province) {
    return readyPromise.then(function () {
      var hit = peek(name, province);
      if (hit) return hit;
      var k = placeKey(name, province);
      var url = 'https://nominatim.openstreetmap.org/search?format=jsonv2&limit=1&countrycodes=vn&accept-language=vi&q=' +
        encodeURIComponent(queryText(name) + ', ' + province + ', Việt Nam');
      return throttled(function () {
        return fetch(url).then(function (r) { return r.json(); });
      }).then(function (list) {
        var r0 = list && list[0];
        if (!r0) return null;
        var lat = parseFloat(r0.lat), lng = parseFloat(r0.lon);
        if (!isFinite(lat) || !isFinite(lng) || !inVietnam(lat, lng)) return null;
        cache[k] = [lat, lng];
        saveCache();
        return { lat: lat, lng: lng };
      }).catch(function () { return null; });
    });
  }

  // Tọa độ của điểm đến (dùng cho dự báo thời tiết): thử địa danh trước, rồi tới trung tâm tỉnh
  function locate(destination, province) {
    return readyPromise.then(function () {
      var first = String(destination || '').split(',')[0].trim();
      var hit = peek(first, province);
      if (hit) return hit;
      return geocode(first, province || destination).then(function (g) {
        return g || provinceCenter(province) || provinceCenter(destination);
      });
    });
  }

  window.VNGeo = {
    placeKey: placeKey,
    peek: peek,
    geocode: geocode,
    locate: locate,
    provinceCenter: provinceCenter,
    ready: readyPromise
  };
})();
