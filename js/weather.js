/**
 * VNFinder — Dự báo thời tiết thật (js/weather.js)
 *
 * Nguồn: Open-Meteo (miễn phí, không cần khóa API, hỗ trợ CORS).
 *  - Ngày trong 16 ngày tới  → dự báo thật (forecast API)
 *  - Ngày xa hơn             → ước tính theo thời tiết cùng ngày năm trước (archive API),
 *                              được gắn nhãn "ước tính theo cùng kỳ" để không đánh lừa người dùng.
 *
 * Giao diện công khai: window.VNWeather = { fetchDays, describe }
 */
(function () {
  'use strict';

  var FORECAST = 'https://api.open-meteo.com/v1/forecast';
  var ARCHIVE = 'https://archive-api.open-meteo.com/v1/archive';
  var DAILY = 'weather_code,temperature_2m_max,temperature_2m_min,precipitation_probability_max,precipitation_sum';
  var HORIZON_DAYS = 15; // forecast API hỗ trợ tối đa ~16 ngày kể từ hôm nay

  function pad(n) { return (n < 10 ? '0' : '') + n; }
  function iso(d) { return d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate()); }
  function startOfDay(d) { return new Date(d.getFullYear(), d.getMonth(), d.getDate()); }
  function addDays(d, n) { var x = new Date(d.getTime()); x.setDate(x.getDate() + n); return x; }

  // Mã WMO → biểu tượng lucide + nhãn tiếng Việt + cờ mưa
  function describe(code) {
    if (code === 0) return { icon: 'sun', label: 'Trời nắng', color: '#f59e0b', rain: false };
    if (code === 1 || code === 2) return { icon: 'cloud-sun', label: 'Ít mây', color: '#f59e0b', rain: false };
    if (code === 3) return { icon: 'cloud', label: 'Nhiều mây', color: '#94a3b8', rain: false };
    if (code === 45 || code === 48) return { icon: 'cloud-fog', label: 'Có sương mù', color: '#94a3b8', rain: false };
    if ((code >= 51 && code <= 57) || (code >= 61 && code <= 67) || (code >= 80 && code <= 82)) {
      return { icon: 'cloud-rain', label: code >= 63 || code >= 81 ? 'Mưa vừa đến to' : 'Mưa nhỏ', color: '#3b82f6', rain: true };
    }
    if (code >= 95) return { icon: 'cloud-lightning', label: 'Dông, mưa lớn', color: '#6366f1', rain: true };
    if (code >= 71 && code <= 77) return { icon: 'snowflake', label: 'Có tuyết', color: '#0ea5e9', rain: false };
    return { icon: 'cloud', label: 'Nhiều mây', color: '#94a3b8', rain: false };
  }

  function getJson(url) {
    var ctrl = ('AbortController' in window) ? new AbortController() : null;
    var timer = setTimeout(function () { if (ctrl) ctrl.abort(); }, 12000);
    return fetch(url, ctrl ? { signal: ctrl.signal } : undefined).then(function (r) {
      clearTimeout(timer);
      if (!r.ok) throw new Error('HTTP ' + r.status);
      return r.json();
    }).catch(function (e) { clearTimeout(timer); throw e; });
  }

  function rows(daily, mapDate) {
    var out = {};
    (daily.time || []).forEach(function (t, i) {
      var key = mapDate ? mapDate(t) : t;
      out[key] = {
        code: daily.weather_code[i],
        tmax: daily.temperature_2m_max[i],
        tmin: daily.temperature_2m_min[i],
        pop: daily.precipitation_probability_max ? daily.precipitation_probability_max[i] : null,
        mm: daily.precipitation_sum ? daily.precipitation_sum[i] : null
      };
    });
    return out;
  }

  /**
   * lat, lng: tọa độ điểm đến; startDate: Date; days: số ngày.
   * Trả về Promise<[{ date, label, icon, color, rain, tmax, tmin, pop, estimated }]>
   */
  function fetchDays(lat, lng, startDate, days) {
    var today = startOfDay(new Date());
    var start = startOfDay(startDate);
    var end = addDays(start, days - 1);
    var list = [];
    for (var i = 0; i < days; i++) list.push(addDays(start, i));

    var horizon = addDays(today, HORIZON_DAYS);
    var realDays = list.filter(function (d) { return d >= today && d <= horizon; });
    var estDays = list.filter(function (d) { return !(d >= today && d <= horizon); });
    var base = 'latitude=' + lat.toFixed(4) + '&longitude=' + lng.toFixed(4) + '&daily=' + DAILY + '&timezone=auto';
    var jobs = [];
    var real = {}, est = {};

    if (realDays.length) {
      jobs.push(getJson(FORECAST + '?' + base + '&start_date=' + iso(realDays[0]) + '&end_date=' + iso(realDays[realDays.length - 1]))
        .then(function (j) { real = rows(j.daily || {}); }));
    }
    if (estDays.length) {
      // Cùng ngày-tháng của năm trước, quy về năm hiện tại của chuyến đi để tra cứu theo khóa
      var a = estDays[0], b = estDays[estDays.length - 1];
      var shift = function (d) { return new Date(d.getFullYear() - 1, d.getMonth(), d.getDate()); };
      var archiveEnd = addDays(today, -7); // dữ liệu ERA5 trễ vài ngày
      var sa = shift(a), sb = shift(b);
      if (sb > archiveEnd) { sa = new Date(sa.getFullYear() - 1, sa.getMonth(), sa.getDate()); sb = new Date(sb.getFullYear() - 1, sb.getMonth(), sb.getDate()); }
      var offset = a.getFullYear() - sa.getFullYear();
      jobs.push(getJson(ARCHIVE + '?' + base + '&start_date=' + iso(sa) + '&end_date=' + iso(sb))
        .then(function (j) {
          est = rows(j.daily || {}, function (t) {
            var p = t.split('-');
            return (Number(p[0]) + offset) + '-' + p[1] + '-' + p[2];
          });
        }));
    }

    return Promise.all(jobs).then(function () {
      return list.map(function (d) {
        var key = iso(d);
        var r = real[key] || est[key];
        var estimated = !real[key];
        if (!r || r.code == null) return null;
        var info = describe(r.code);
        // Ngày ước tính theo cùng kỳ: coi là "có mưa" khi lượng mưa ngày đó đáng kể
        var rain = estimated ? (r.mm != null && r.mm >= 5) || info.rain : (info.rain || (r.pop != null && r.pop >= 60));
        return {
          date: d, label: info.label, icon: rain && !info.rain ? 'cloud-rain' : info.icon, color: info.color,
          rain: rain, tmax: Math.round(r.tmax), tmin: Math.round(r.tmin), pop: r.pop, estimated: estimated
        };
      });
    });
  }

  window.VNWeather = { fetchDays: fetchDays, describe: describe };
})();
