/* ============================================================
   maps.js — Bản đồ chỉ đường kiểu Google Maps cho tab "Bản đồ"
   ------------------------------------------------------------
   - Nền bản đồ : Leaflet + OpenStreetMap tile layer
   - Định vị    : navigator.geolocation (GPS thiết bị người dùng)
   - Tìm kiếm   : Nominatim geocoding API (giới hạn trong Việt Nam)
   - Chỉ đường  : OSRM routing API (driving), vẽ tuyến + từng bước đi

   Lưu ý triển khai thực tế: Nominatim và OSRM demo server (dùng
   trong file này) là dịch vụ công cộng miễn phí, chỉ phù hợp cho
   dự án nhỏ/thi đấu — có giới hạn tốc độ gọi API. Nếu đưa VNFinder
   lên sản phẩm thật với lượng truy cập lớn, nên tự host lại hai
   dịch vụ này hoặc dùng nhà cung cấp trả phí (Mapbox, Google
   Directions, Goong, v.v.).

   Script này tự gắn sự kiện vào tab "Bản đồ" khi DOM đã sẵn sàng,
   nên phải nạp sau nav.js (xem chú thích trong index.html).
   ============================================================ */

(function () {
  'use strict';

  var VN_CENTER = [16.047079, 108.206230]; // Trung tâm Việt Nam (gần Đà Nẵng)
  var VN_DEFAULT_ZOOM = 6;
  var SEARCH_DEBOUNCE_MS = 350;

  // Khung giới hạn khu vực Việt Nam (kèm biên độ + toàn bộ Hoàng Sa, Trường Sa).
  // Dùng để chặn không cho phóng to/kéo ra ngoài phạm vi này — tránh hiển thị
  // tên địa danh nước ngoài bằng chữ Trung, Hàn, Ả Rập, Bengal... như khi bản
  // đồ nền OpenStreetMap bị zoom ra hết cả châu Á.
  var VN_BOUNDS = L.latLngBounds([4.0, 99.0], [24.5, 118.5]);
  var VN_MIN_ZOOM = 5;

  // Hai quần đảo thuộc chủ quyền Việt Nam — vẽ trực tiếp trên bản đồ vì dữ
  // liệu nền OpenStreetMap ở khu vực này thưa/không nhất quán về tên gọi.
  // Thông tin hành chính theo Nghị quyết 1659, 1667/NQ-UBTVQH15 (2025):
  // Hoàng Sa → đặc khu Hoàng Sa, TP. Đà Nẵng; Trường Sa → đặc khu Trường Sa,
  // tỉnh Khánh Hòa.
  var ISLANDS = [
    {
      id: 'hoang-sa',
      label: 'Quần đảo Hoàng Sa',
      center: [16.5, 112.0],
      radius: 90000,
      popup: 'Quần đảo Hoàng Sa — thuộc đặc khu Hoàng Sa, TP. Đà Nẵng, Việt Nam. ' +
        'Hiện quần đảo này đang bị Trung Quốc kiểm soát trên thực tế; Việt Nam ' +
        'tiếp tục khẳng định và duy trì chủ quyền.'
    },
    {
      id: 'truong-sa',
      label: 'Quần đảo Trường Sa',
      center: [9.5, 113.8],
      radius: 320000,
      popup: 'Quần đảo Trường Sa — thuộc đặc khu Trường Sa, tỉnh Khánh Hòa, Việt Nam. ' +
        'Việt Nam đang quản lý một số đảo, đá tại đây; một số thực thể khác trong ' +
        'quần đảo hiện do Trung Quốc, Đài Loan, Philippines và Malaysia kiểm soát.'
    }
  ];

  var els = {};
  var map = null;
  var userIcon = null;
  var destIcon = null;
  var userMarker = null;
  var userAccuracyCircle = null;
  var destMarker = null;
  var routeLine = null;
  var userLatLng = null;
  var watchId = null;
  var searchTimer = null;
  var searchAbort = null;
  var lastResults = [];
  var initialized = false;

  function cacheEls() {
    els.mapDiv = document.getElementById('vnmap-map');
    els.searchBox = document.getElementById('vnmap-search');
    els.searchInput = document.getElementById('vnmap-search-input');
    els.searchClear = document.getElementById('vnmap-search-clear');
    els.searchResults = document.getElementById('vnmap-search-results');
    els.loading = document.getElementById('vnmap-loading');
    els.loadingText = document.getElementById('vnmap-loading-text');
    els.loadingRetry = document.getElementById('vnmap-loading-retry');
    els.locateBtn = document.getElementById('vnmap-locate-btn');
    els.routePanel = document.getElementById('vnmap-route-panel');
    els.routeClose = document.getElementById('vnmap-route-close');
    els.routeSummary = document.getElementById('vnmap-route-summary');
    els.routeSteps = document.getElementById('vnmap-route-steps');
  }

  function getCssVar(name, fallback) {
    var v = getComputedStyle(document.documentElement).getPropertyValue(name);
    return (v && v.trim()) || fallback;
  }

  function escapeHtml(str) {
    return String(str).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }

  function refreshIcons() {
    if (window.lucide && typeof window.lucide.createIcons === 'function') {
      window.lucide.createIcons();
    }
  }

  function formatDistance(meters) {
    if (meters < 1000) return Math.round(meters) + ' m';
    return (Math.round(meters / 100) / 10) + ' km';
  }

  function formatDuration(seconds) {
    var minutes = Math.round(seconds / 60);
    if (minutes < 1) return '< 1 phút';
    if (minutes < 60) return minutes + ' phút';
    var hours = Math.floor(minutes / 60);
    var rem = minutes % 60;
    return hours + ' giờ' + (rem ? ' ' + rem + ' phút' : '');
  }

  var MOD_VI = {
    'uturn': 'quay đầu',
    'sharp right': 'rẽ phải gắt',
    'right': 'rẽ phải',
    'slight right': 'rẽ phải nhẹ',
    'straight': 'đi thẳng',
    'slight left': 'rẽ trái nhẹ',
    'left': 'rẽ trái',
    'sharp left': 'rẽ trái gắt'
  };

  function stepInstruction(step) {
    var m = step.maneuver || {};
    var type = m.type;
    var modifier = m.modifier;
    var road = step.name || '';
    var roadText = road ? ' vào ' + road : '';

    switch (type) {
      case 'depart':
        return 'Xuất phát' + roadText;
      case 'arrive':
        return 'Đến nơi';
      case 'roundabout':
      case 'rotary':
        return 'Vào vòng xuyến' + roadText;
      case 'merge':
        return 'Nhập làn' + roadText;
      case 'on ramp':
        return 'Vào đường nhánh' + roadText;
      case 'off ramp':
        return 'Ra khỏi đường nhánh' + roadText;
      case 'fork':
        return 'Đi theo nhánh ' + (MOD_VI[modifier] || '') + roadText;
      case 'end of road':
        return (MOD_VI[modifier] || 'Rẽ') + roadText;
      case 'turn':
      default:
        return (MOD_VI[modifier] || 'Đi tiếp') + roadText;
    }
  }

  /* -------------------- Khởi tạo bản đồ Leaflet -------------------- */

  // Vẽ đường viền biên giới toàn bộ lãnh thổ Việt Nam bằng màu đỏ để làm nổi
  // bật trên nền bản đồ OpenStreetMap. Dữ liệu ranh giới (rút gọn từ Natural
  // Earth, ~11KB) nằm ở data/vn-boundary.geojson — nếu thiếu file này thì bỏ
  // qua, không ảnh hưởng các tính năng chính của bản đồ.
  function addVietnamBoundary() {
    fetch('data/vn-boundary.geojson')
      .then(function (r) { return r.json(); })
      .then(function (geo) {
        L.geoJSON(geo, {
          style: {
            color: '#e11d2f',
            weight: 2.5,
            opacity: 0.9,
            fill: false
          }
        }).addTo(map);
      })
      .catch(function () {});
  }

  function addIslandLayers() {
    ISLANDS.forEach(function (isl) {
      L.circle(isl.center, {
        radius: isl.radius,
        color: getCssVar('--vn-primary', '#0ea5e9'),
        weight: 1.5,
        dashArray: '4 6',
        fillOpacity: 0.04
      }).addTo(map);

      L.marker(isl.center, {
        icon: L.divIcon({
          className: 'vnmap-island-marker',
          html: '<span class="vnmap-island-dot"></span>',
          iconSize: [14, 14],
          iconAnchor: [7, 7]
        })
      })
        .addTo(map)
        .bindTooltip(isl.label, {
          permanent: true,
          direction: 'top',
          offset: [0, -4],
          className: 'vnmap-island-tooltip'
        })
        .bindPopup(escapeHtml(isl.popup), { maxWidth: 260 });
    });
  }

  function initMap() {
    if (map || !window.L) return;

    map = L.map(els.mapDiv, {
      zoomControl: true,
      attributionControl: true,
      minZoom: VN_MIN_ZOOM,
      maxBounds: VN_BOUNDS,
      maxBoundsViscosity: 1.0
    }).setView(VN_CENTER, VN_DEFAULT_ZOOM);

    // Lưu ý: KHÔNG dùng dạng {s}.tile.openstreetmap.org (a/b/c...) nữa — OSM
    // đã chính thức khai tử cách chia subdomain này (tile server giờ dùng
    // HTTP/2 nên không cần nhiều subdomain để tăng số kết nối song song).
    // Domain con a/b/c hiện hoạt động chập chờn tuỳ mạng/trình duyệt của
    // từng người dùng — dùng đúng 1 domain tile.openstreetmap.org duy nhất
    // theo khuyến nghị chính thức để tải ổn định cho mọi thiết bị.
    L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener">OpenStreetMap</a>'
    }).addTo(map);

    addVietnamBoundary();
    addIslandLayers();

    userIcon = L.divIcon({
      className: 'vnmap-user-marker',
      html: '<span class="vnmap-user-pulse"></span><span class="vnmap-user-dot"></span>',
      iconSize: [22, 22],
      iconAnchor: [11, 11]
    });

    destIcon = L.divIcon({
      className: 'vnmap-dest-marker',
      html: '<span class="vnmap-pin"></span>',
      iconSize: [26, 34],
      iconAnchor: [14, 32]
    });

    // Leaflet cần biết đúng kích thước khung chứa sau khi panel hiển thị
    setTimeout(function () { map.invalidateSize(); }, 200);
  }

  /* -------------------- Định vị người dùng (GPS) -------------------- */

  function showLoading(isOn) {
    els.loading.classList.remove('is-error');
    els.loadingRetry.hidden = true;
    els.loading.hidden = !isOn;
  }

  function showMessage(text, withRetry) {
    els.loadingText.textContent = text;
    els.loading.classList.add('is-error');
    els.loadingRetry.hidden = !withRetry;
    els.loading.hidden = false;
  }

  function handleGeoError(err) {
    var msgs = {
      1: 'Bạn chưa cho phép truy cập vị trí. Hãy bật quyền định vị cho trang web này để dùng tính năng chỉ đường.',
      2: 'Không thể xác định vị trí thiết bị lúc này. Vui lòng kiểm tra kết nối hoặc GPS.',
      3: 'Quá thời gian chờ định vị, vui lòng thử lại.'
    };
    showMessage(msgs[err.code] || 'Không thể lấy vị trí của bạn.', true);
  }

  function handlePosition(pos) {
    var latlng = [pos.coords.latitude, pos.coords.longitude];
    var firstFix = !userLatLng;
    userLatLng = latlng;

    if (!userMarker) {
      userMarker = L.marker(latlng, { icon: userIcon, zIndexOffset: 1000 }).addTo(map);
    } else {
      userMarker.setLatLng(latlng);
    }

    if (userAccuracyCircle) map.removeLayer(userAccuracyCircle);
    if (pos.coords.accuracy) {
      var color = getCssVar('--vn-primary', '#0ea5e9');
      userAccuracyCircle = L.circle(latlng, {
        radius: pos.coords.accuracy,
        color: color,
        fillColor: color,
        fillOpacity: 0.08,
        weight: 1
      }).addTo(map);
    }

    if (firstFix) {
      map.setView(latlng, 15);
    }
  }

  function locateUser(onFirstFix) {
    if (!navigator.geolocation) {
      showMessage('Trình duyệt của bạn không hỗ trợ định vị GPS.', false);
      return;
    }

    showLoading(true);
    els.loadingText.textContent = 'Đang định vị thiết bị của bạn…';

    navigator.geolocation.getCurrentPosition(
      function (pos) {
        handlePosition(pos);
        showLoading(false);
        if (onFirstFix) onFirstFix();
        if (watchId === null) {
          watchId = navigator.geolocation.watchPosition(handlePosition, function () {}, {
            enableHighAccuracy: true,
            maximumAge: 5000
          });
        }
      },
      function (err) {
        showLoading(false);
        handleGeoError(err);
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
  }

  /* -------------------- Tìm kiếm điểm đến (Nominatim) -------------------- */

  function hideResults() {
    els.searchResults.hidden = true;
    els.searchResults.innerHTML = '';
  }

  // Tách địa chỉ trả về thành tối đa 4 lớp: địa chỉ/tên nơi cụ thể,
  // đường (kèm số nhà nếu có), phường/xã, tỉnh/thành — dựa vào
  // addressdetails=1 của Nominatim (nếu dữ liệu không đủ chi tiết thì
  // dự phòng bằng display_name).
  function buildAddressLines(item) {
    var addr = item.address || {};

    var houseNumber = addr.house_number || '';
    var road = addr.road || addr.pedestrian || addr.footway || addr.residential || '';
    // Số nhà + tên đường luôn đi cùng nhau — trước đây số nhà bị bỏ sót khi
    // địa điểm có tên riêng (trường học, quán ăn…) vì chỉ được gộp vào lúc
    // không có tên riêng.
    var streetLine = [houseNumber, road].filter(Boolean).join(' ');

    // Tên riêng của địa điểm (trường học, quán ăn, khu vui chơi…) — ưu tiên
    // lấy từ item.name (tên hiển thị Nominatim trả trực tiếp), vì tên khoá
    // trong addressdetails cho từng loại POI (school, restaurant…) không cố
    // định, dò theo danh sách cứng dễ bị bỏ sót.
    var venue = item.name || addr.amenity || addr.shop || addr.tourism || addr.leisure ||
      addr.office || addr.building || addr.historic || '';

    var ward = addr.suburb || addr.quarter || addr.neighbourhood || addr.city_district ||
      addr.village || addr.commune || addr.hamlet || addr.town || '';
    var province = addr.state || addr.city || addr.province || addr.region || '';

    var line1 = venue || streetLine;
    // Chỉ tách đường thành dòng riêng khi dòng 1 là tên riêng (tránh lặp lại
    // đúng nội dung đó ở cả 2 dòng).
    var line2 = (venue && streetLine) ? streetLine : '';

    var lines = [line1, line2, ward, province].filter(Boolean);
    lines = lines.filter(function (v, idx) { return lines.indexOf(v) === idx; });

    if (lines.length < 2) {
      // Dữ liệu address chi tiết không đủ (thường gặp ở khu vực OSM còn thưa) —
      // dự phòng bằng cách tách trực tiếp display_name.
      lines = (item.display_name || '').split(',').map(function (s) { return s.trim(); }).filter(Boolean).slice(0, 4);
    }

    return lines;
  }

  // Độ "cụ thể" của kết quả: địa chỉ có số nhà > tên/đường/POI > ranh giới
  // hành chính (tỉnh/phường/xã) — để ưu tiên đúng địa điểm thay vì chỉ khớp
  // tên đơn vị hành chính trùng tên.
  function rankResult(item) {
    if (item.address && item.address.house_number) return 0;
    var poiClasses = ['amenity', 'shop', 'tourism', 'leisure', 'office', 'historic', 'education'];
    if (poiClasses.indexOf(item.class) !== -1 || item.class === 'highway') return 1;
    if (item.class === 'boundary' || item.type === 'administrative') return 3;
    return 2;
  }

  function haversineKm(a, b) {
    var R = 6371;
    var dLat = (b[0] - a[0]) * Math.PI / 180;
    var dLon = (b[1] - a[1]) * Math.PI / 180;
    var lat1 = a[0] * Math.PI / 180, lat2 = b[0] * Math.PI / 180;
    var sinDLat = Math.sin(dLat / 2), sinDLon = Math.sin(dLon / 2);
    var h = sinDLat * sinDLat + Math.cos(lat1) * Math.cos(lat2) * sinDLon * sinDLon;
    return 2 * R * Math.asin(Math.sqrt(h));
  }

  // Sắp xếp: ưu tiên độ cụ thể trước, rồi đến khoảng cách gần vị trí hiện
  // tại — giống cách Google Maps ưu tiên kết quả gần bạn.
  function sortResults(list) {
    return list.slice().sort(function (a, b) {
      var ra = rankResult(a), rb = rankResult(b);
      if (ra !== rb) return ra - rb;
      if (userLatLng) {
        var da = haversineKm(userLatLng, [parseFloat(a.lat), parseFloat(a.lon)]);
        var db = haversineKm(userLatLng, [parseFloat(b.lat), parseFloat(b.lon)]);
        return da - db;
      }
      return 0;
    });
  }

  function renderResults(list, query) {
    // Khử trùng lặp: nhiều đoạn OSM khác nhau của cùng 1 con đường có thể trả
    // về y hệt cùng một dòng địa chỉ hiển thị — chỉ giữ lại bản đầu tiên
    // (đã được sortResults xếp gần/đúng nhất lên trước).
    var seen = {};
    var deduped = [];
    var dedupedLines = [];

    (Array.isArray(list) ? list : []).forEach(function (item) {
      var lines = buildAddressLines(item);
      var key = lines.join('|');
      if (seen[key]) return;
      seen[key] = true;
      deduped.push(item);
      dedupedLines.push(lines);
    });

    lastResults = deduped;

    if (lastResults.length === 0) {
      els.searchResults.innerHTML = '<div class="vnmap-search-empty">Không tìm thấy địa điểm phù hợp.</div>';
      els.searchResults.hidden = false;
      return;
    }

    // Nếu người dùng gõ số nhà (vd "9 Trần Phú") nhưng không có kết quả nào
    // khớp đúng số nhà đó — báo rõ để tránh hiểu nhầm là app tìm sai, trong
    // khi thực chất dữ liệu OpenStreetMap khu vực đó chưa có điểm địa chỉ
    // chi tiết đến mức số nhà.
    var wantsHouseNumber = /^\s*\d+/.test(query || '');
    var hasHouseNumber = deduped.some(function (item) { return item.address && item.address.house_number; });
    var notice = (wantsHouseNumber && !hasHouseNumber)
      ? '<div class="vnmap-search-notice">Chưa có dữ liệu số nhà chính xác cho địa chỉ này — dưới đây là kết quả gần đúng theo tên đường/khu vực.</div>'
      : '';

    var html = dedupedLines.map(function (lines, idx) {
      var main = lines[0] || '';
      var sub = lines.slice(1).join(' · ');
      return (
        '<button type="button" class="vnmap-search-item" data-idx="' + idx + '">' +
        '<i data-lucide="map-pin" aria-hidden="true"></i>' +
        '<span class="vnmap-search-item-text">' +
        '<span class="vnmap-search-item-main">' + escapeHtml(main) + '</span>' +
        (sub ? '<span class="vnmap-search-item-sub">' + escapeHtml(sub) + '</span>' : '') +
        '</span>' +
        '</button>'
      );
    }).join('');

    els.searchResults.innerHTML = notice + html;
    els.searchResults.hidden = false;
    refreshIcons();

    Array.prototype.forEach.call(els.searchResults.querySelectorAll('.vnmap-search-item'), function (btn) {
      btn.addEventListener('click', function () {
        var idx = parseInt(btn.getAttribute('data-idx'), 10);
        selectDestination(lastResults[idx]);
      });
    });
  }

  // Vùng ưu tiên (soft bias) quanh vị trí hiện tại — chỉ ưu tiên xếp hạng,
  // không loại bỏ kết quả ở xa (bounded=0) để vẫn tìm được nơi khác tỉnh.
  function viewboxParam() {
    if (!userLatLng) return '';
    var delta = 1.5; // ~150km mỗi hướng
    var lat = userLatLng[0], lon = userLatLng[1];
    return '&viewbox=' + (lon - delta) + ',' + (lat + delta) + ',' + (lon + delta) + ',' + (lat - delta) + '&bounded=0';
  }

  function doSearch(query) {
    if (searchAbort) searchAbort.abort();
    searchAbort = ('AbortController' in window) ? new AbortController() : null;

    var url = 'https://nominatim.openstreetmap.org/search?format=jsonv2&addressdetails=1&limit=8' +
      '&countrycodes=vn&accept-language=vi&q=' + encodeURIComponent(query) + viewboxParam();

    fetch(url, { signal: searchAbort ? searchAbort.signal : undefined })
      .then(function (r) { return r.json(); })
      .then(function (list) { renderResults(sortResults(list), query); })
      .catch(function (err) {
        if (err && err.name === 'AbortError') return;
        els.searchResults.innerHTML = '<div class="vnmap-search-empty">Có lỗi khi tìm kiếm, vui lòng thử lại.</div>';
        els.searchResults.hidden = false;
      });
  }

  function onSearchInput() {
    var q = els.searchInput.value.trim();
    els.searchClear.hidden = !q;
    clearTimeout(searchTimer);
    if (!q) { hideResults(); return; }
    searchTimer = setTimeout(function () { doSearch(q); }, SEARCH_DEBOUNCE_MS);
  }

  /* -------------------- Điểm đến + chỉ đường (OSRM) -------------------- */

  function placeDestMarker(latlng, label) {
    if (destMarker) map.removeLayer(destMarker);
    destMarker = L.marker(latlng, { icon: destIcon }).addTo(map);
    if (label) {
      destMarker.bindPopup(escapeHtml(label.split(',').slice(0, 2).join(','))).openPopup();
    }
  }

  function clearDestination() {
    if (destMarker) { map.removeLayer(destMarker); destMarker = null; }
    if (routeLine) { map.removeLayer(routeLine); routeLine = null; }
    els.routePanel.hidden = true;
  }

  function showRouteMessage(text) {
    els.routeSummary.innerHTML = '<div class="vnmap-route-message">' + escapeHtml(text) + '</div>';
    els.routeSteps.innerHTML = '';
    els.routePanel.hidden = false;
  }

  function drawRoute(route) {
    if (routeLine) { map.removeLayer(routeLine); routeLine = null; }

    var latlngs = route.geometry.coordinates.map(function (c) { return [c[1], c[0]]; });
    routeLine = L.polyline(latlngs, {
      color: getCssVar('--vn-primary', '#0ea5e9'),
      weight: 5,
      opacity: 0.85,
      lineJoin: 'round'
    }).addTo(map);

    map.fitBounds(routeLine.getBounds(), { padding: [48, 48] });

    els.routeSummary.innerHTML =
      '<div class="vnmap-route-distance">' + formatDistance(route.distance) + '</div>' +
      '<div class="vnmap-route-duration">' + formatDuration(route.duration) + ' · đi xe</div>';

    var steps = (route.legs && route.legs[0] && route.legs[0].steps) || [];
    els.routeSteps.innerHTML = steps.map(function (step) {
      return (
        '<li class="vnmap-step">' +
        '<span class="vnmap-step-text">' + escapeHtml(stepInstruction(step)) + '</span>' +
        '<span class="vnmap-step-dist">' + formatDistance(step.distance) + '</span>' +
        '</li>'
      );
    }).join('');

    els.routePanel.hidden = false;
  }

  function fetchRoute(from, to) {
    showLoading(true);
    els.loadingText.textContent = 'Đang tìm đường đi…';

    var url = 'https://router.project-osrm.org/route/v1/driving/' +
      from[1] + ',' + from[0] + ';' + to[1] + ',' + to[0] +
      '?overview=full&geometries=geojson&steps=true&alternatives=false';

    fetch(url)
      .then(function (r) { return r.json(); })
      .then(function (data) {
        showLoading(false);
        if (data.code !== 'Ok' || !data.routes || !data.routes.length) {
          showRouteMessage('Không tìm thấy đường đi phù hợp đến điểm này.');
          return;
        }
        drawRoute(data.routes[0]);
      })
      .catch(function () {
        showLoading(false);
        showRouteMessage('Có lỗi khi tải chỉ đường, vui lòng thử lại.');
      });
  }

  function selectDestination(item) {
    if (!item) return;
    hideResults();
    els.searchInput.value = (item.display_name || '').split(',')[0];
    els.searchClear.hidden = false;

    var destLatLng = [parseFloat(item.lat), parseFloat(item.lon)];
    placeDestMarker(destLatLng, item.display_name);

    if (userLatLng) {
      fetchRoute(userLatLng, destLatLng);
    } else {
      map.setView(destLatLng, 15);
      showRouteMessage('Đang chờ vị trí của bạn để hiển thị chỉ đường…');
      locateUser(function () { fetchRoute(userLatLng, destLatLng); });
    }
  }

  /* -------------------- Gắn sự kiện giao diện -------------------- */

  function bindUi() {
    els.searchInput.addEventListener('input', onSearchInput);

    els.searchInput.addEventListener('keydown', function (e) {
      if (e.key === 'Enter') {
        e.preventDefault();
        var first = els.searchResults.querySelector('.vnmap-search-item');
        if (first) first.click();
      }
    });

    els.searchClear.addEventListener('click', function () {
      els.searchInput.value = '';
      els.searchClear.hidden = true;
      hideResults();
      clearDestination();
      els.searchInput.focus();
    });

    document.addEventListener('click', function (e) {
      if (els.searchResults.hidden) return;
      if (!els.searchBox.contains(e.target)) hideResults();
    });

    els.locateBtn.addEventListener('click', function () {
      if (userLatLng) {
        map.setView(userLatLng, 16, { animate: true });
      } else {
        locateUser(function () {
          if (userLatLng) map.setView(userLatLng, 16, { animate: true });
        });
      }
    });

    els.loadingRetry.addEventListener('click', function () {
      locateUser(function () {});
    });

    els.routeClose.addEventListener('click', function () {
      clearDestination();
      els.searchInput.value = '';
      els.searchClear.hidden = true;
    });
  }

  /* -------------------- Kích hoạt khi mở tab "Bản đồ" -------------------- */

  function activate() {
    if (initialized) {
      setTimeout(function () { if (map) map.invalidateSize(); }, 150);
      return;
    }
    initialized = true;
    initMap();
    bindUi();
    locateUser(function () {});
  }

  document.addEventListener('DOMContentLoaded', function () {
    cacheEls();
    if (!els.mapDiv) return; // Không có tab Bản đồ trên trang này

    var tabBtn = document.querySelector('.sh-tab[data-panel="panel-maps"]');
    if (!tabBtn) return;

    tabBtn.addEventListener('click', function () {
      // Đợi panel hiển thị (bỏ thuộc tính hidden) rồi mới khởi tạo Leaflet,
      // vì Leaflet cần khung chứa có kích thước thật để vẽ đúng.
      setTimeout(activate, 50);
    });

    // Trường hợp tab Bản đồ đã được chọn sẵn khi tải trang (deep link)
    if (tabBtn.getAttribute('aria-selected') === 'true') {
      activate();
    }
  });
})();
