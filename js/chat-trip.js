/**
 * VNFinder — js/chat-trip.js
 * Hỗ trợ chatbot xử lý sự cố (thời tiết, sức khỏe, thời gian):
 *   - collect():           gom lịch trình + thời tiết + giờ hiện tại gửi kèm cho máy chủ
 *   - isDisruption/expandQuery: nhận diện câu hỏi sự cố để lấy thêm địa điểm thay thế
 *   - sanitize/renderAlternatives: kiểm tra và hiển thị thẻ phương án
 *
 * Nạp SAU js/weather.js và TRƯỚC js/chat-assistant.js.
 */
(function () {
  'use strict';

  var SLOTS = ['breakfast', 'morningVisit', 'lunch', 'afternoonVisit', 'dinner', 'nightlife'];
  var SLOT_LABEL = {
    breakfast: 'Bữa sáng', morningVisit: 'Sáng', lunch: 'Bữa trưa',
    afternoonVisit: 'Chiều', dinner: 'Bữa tối', nightlife: 'Tối'
  };

  /* ---------- Cache thời tiết: bọc VNWeather.fetchDays, không cần sửa script.js ---------- */
  var weatherCache = null;
  function hookWeather() {
    var W = window.VNWeather;
    if (!W || W.__chatHooked || typeof W.fetchDays !== 'function') return;
    var orig = W.fetchDays;
    W.fetchDays = function () {
      return orig.apply(this, arguments).then(function (r) { weatherCache = r; return r; });
    };
    W.__chatHooked = true;
  }
  hookWeather();
  document.addEventListener('DOMContentLoaded', hookWeather);

  function pad(n) { return (n < 10 ? '0' : '') + n; }
  function iso(d) { return d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate()); }
  function itemName(x) { return x ? String(x.dish || x.name || x).slice(0, 80) : ''; }

  /* ---------- Lịch trình hiện tại ----------
     GIẢ ĐỊNH: mỗi ngày là object có các khóa breakfast/morningVisit/lunch/afternoonVisit/dinner/nightlife
     (khớp cấu trúc itinerary-data.js). Nếu state.itinerary của bạn khác, chỉ cần sửa hàm này. */
  function normalizeDays(it) {
    var days = Array.isArray(it) ? it : (it && (it.days || it.plan));
    if (!Array.isArray(days)) return null;
    return days.slice(0, 10).map(function (d, i) {
      var o = { day: i + 1 };
      SLOTS.forEach(function (s) {
        var v = d && d[s];
        if (Array.isArray(v)) v = v[0];
        if (v) o[s] = itemName(v);
      });
      return o;
    });
  }

  function collect() {
    var s = (typeof state !== 'undefined') ? state : null;
    var now = new Date();
    var out = { now: now.toISOString(), today: iso(now), timezone: 'Asia/Ho_Chi_Minh' };
    var it = s && (s.itinerary || s.plan || s.currentItinerary) || window.currentItinerary;
    var days = normalizeDays(it);
    if (days) out.days = days;
    if (weatherCache && weatherCache.length) {
      out.weather = weatherCache.filter(Boolean).slice(0, 10).map(function (w) {
        return {
          date: w.date instanceof Date ? iso(w.date) : String(w.date),
          label: w.label, rain: !!w.rain, tmax: w.tmax, tmin: w.tmin,
          pop: w.pop, estimated: !!w.estimated
        };
      });
    }
    return out;
  }

  /* ---------- Nhận diện câu hỏi sự cố ---------- */
  var RE = {
    weather: /(mưa|bão|lũ|sạt lở|nắng gắt|nóng|lạnh|gió lớn|thời tiết|rain|storm|typhoon|flood|hot|weather)/i,
    health: /(mệt|ốm|sốt|đau|say xe|chóng mặt|bệnh|sức khỏe|tired|sick|ill|fever|pain|dizzy|health)/i,
    time: /(trễ|muộn|hoãn|còn ít thời gian|không kịp|về sớm|rút ngắn|delay|late|short on time|no time)/i
  };
  function isDisruption(t) {
    t = String(t || '');
    return RE.weather.test(t) || RE.health.test(t) || RE.time.test(t);
  }
  // Thêm từ khóa gợi ý để bộ truy xuất lấy được nhiều địa điểm trong nhà / nhẹ nhàng làm phương án thay thế
  function expandQuery(t) {
    t = String(t || '');
    var extra = [];
    if (RE.weather.test(t)) extra.push('bảo tàng chùa quán cà phê trong nhà');
    if (RE.health.test(t)) extra.push('nghỉ ngơi nhẹ nhàng cà phê công viên');
    if (RE.time.test(t)) extra.push('gần trung tâm tham quan nhanh');
    return extra.length ? t + ' ' + extra.join(' ') : t;
  }

  /* ---------- Kiểm tra và hiển thị phương án ---------- */
  function sanitize(list) {
    return (Array.isArray(list) ? list : []).slice(0, 3).map(function (a) {
      a = a || {};
      return {
        title: String(a.title || '').slice(0, 80),
        day: Number(a.day) > 0 ? Number(a.day) : null,
        slot: SLOTS.indexOf(a.slot) !== -1 ? a.slot : '',
        replaces: String(a.replaces || '').slice(0, 100),
        new_plan: String(a.new_plan || '').slice(0, 280),
        reason: String(a.reason || '').slice(0, 220),
        extra_time_min: isFinite(Number(a.extra_time_min)) ? Math.round(Number(a.extra_time_min)) : 0,
        indoor: a.indoor === true,
        generic: a.generic === true
      };
    }).filter(function (a) { return a.title && a.new_plan; });
  }

  function el(tag, cls, text) {
    var e = document.createElement(tag);
    if (cls) e.className = cls;
    if (text != null) e.textContent = text;
    return e;
  }

  function renderAlternatives(alts, onPick) {
    var wrap = el('div', 'vnchat-alts');
    alts.forEach(function (a, i) {
      var card = el('div', 'vnchat-alt');
      card.appendChild(el('div', 'vnchat-alt-title', 'Phương án ' + (i + 1) + ': ' + a.title));

      var where = [];
      if (a.day) where.push('Ngày ' + a.day);
      if (a.slot) where.push(SLOT_LABEL[a.slot]);
      if (where.length) card.appendChild(el('div', 'vnchat-alt-where', where.join(' · ')));

      if (a.replaces) card.appendChild(el('div', 'vnchat-alt-row', 'Thay cho: ' + a.replaces));
      card.appendChild(el('div', 'vnchat-alt-row', 'Thay bằng: ' + a.new_plan));
      if (a.reason) card.appendChild(el('div', 'vnchat-alt-row vnchat-alt-reason', a.reason));

      var meta = [];
      meta.push(a.indoor ? 'Trong nhà' : 'Ngoài trời');
      if (a.extra_time_min) meta.push((a.extra_time_min > 0 ? '+' : '') + a.extra_time_min + ' phút');
      if (a.generic) meta.push('Gợi ý chung, chưa xác minh');
      card.appendChild(el('div', 'vnchat-alt-meta', meta.join(' · ')));

      var btn = el('button', 'vnchat-alt-pick', 'Chọn phương án này');
      btn.type = 'button';
      btn.addEventListener('click', function () {
        // Sự kiện để script.js lắng nghe khi muốn áp dụng thật vào lịch trình
        document.dispatchEvent(new CustomEvent('vnfinder:apply-alternative', { detail: a }));
        if (onPick) onPick(a, i);
      });
      card.appendChild(btn);
      wrap.appendChild(card);
    });
    return wrap;
  }

  window.VNChatTrip = {
    collect: collect, isDisruption: isDisruption, expandQuery: expandQuery,
    sanitize: sanitize, renderAlternatives: renderAlternatives
  };
})();
