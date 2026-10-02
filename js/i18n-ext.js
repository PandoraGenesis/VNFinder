/**
 * VNFinder — Lớp dịch cho các tính năng mới (js/i18n-ext.js)
 *
 * Từ điển trong js/i18n.js khớp theo nguyên văn từng đoạn chữ, nên không dịch được các câu có
 * số liệu hoặc tên riêng chèn vào (thời tiết, tuyến đường, lý do gợi ý). Lớp này dùng mẫu câu
 * có tham số {tên} và tự vẽ lại khi người dùng đổi ngôn ngữ.
 *
 * Cách dùng:
 *   VNI18n.t('Có {n} ngày mưa', { n: 2 })           -> chuỗi theo ngôn ngữ hiện tại
 *   VNI18n.span('Có {n} ngày mưa', { n: 2 })        -> HTML <span> tự cập nhật khi đổi ngôn ngữ
 *   VNI18n.set(el, 'Có {n} ngày mưa', { n: 2 })     -> gán chữ cho phần tử và đăng ký cập nhật
 *   VNI18n.onChange(fn)                             -> chạy fn mỗi khi đổi ngôn ngữ
 *
 * Ngôn ngữ được đọc từ document.documentElement.lang ("en" là tiếng Anh, còn lại là tiếng Việt),
 * đúng như js/i18n.js đang đặt.
 */
(function () {
  'use strict';

  var TAG_EN = {
    bien: 'Beaches, Islands & Bays',
    nuirung: 'Mountains & Highlands',
    amthuc: 'Food & City',
    disan: 'History & Heritage',
    songnuoc: 'Mekong Delta Waterways',
    vanhoa: 'Local Culture',
    camtrai: 'Camping & Trekking',
    checkin: 'Photo Spots',
    sinhthai: 'Ecology & Nature',
    giaitri: 'Fun & Entertainment'
  };

  var EN = {
    /* ---- Lý do gợi ý trên thẻ lịch trình ---- */
    'Hợp sở thích: {tags}': 'Matches your interests: {tags}',
    'Ngày mưa nên ưu tiên trong nhà': 'Rainy day, so indoor places come first',
    'Nhẹ nhàng, ít di chuyển': 'Relaxed, little travel',
    'Phù hợp nhịp độ năng động': 'Fits an active pace',
    'Gần điểm trước (~{km} km)': 'Close to the previous stop (~{km} km)',
    'Gợi ý chung, chưa xác minh địa điểm cụ thể': 'General suggestion, specific place not verified',

    /* ---- Thời tiết ---- */
    'Đang tải dự báo thời tiết tại {dest}...': 'Loading the weather forecast for {dest}...',
    'Thời tiết tại {dest}:': 'Weather in {dest}:',
    'Nhiệt độ dao động {tmin} - {tmax}°C': 'Temperatures range from {tmin} to {tmax}°C',
    'Phù hợp cho các hoạt động ngoài trời.': 'Good for outdoor activities.',
    'Có {rainy}/{total} ngày nhiều khả năng mưa. Lịch trình sẽ ưu tiên địa điểm trong nhà vào những ngày này.':
      '{rainy} of {total} days are likely to be rainy. The itinerary favors indoor places on those days.',
    'Các ngày xa hơn 15 ngày được ước tính theo thời tiết cùng kỳ năm trước.':
      'Days more than 15 days ahead are estimated from the weather in the same period last year.',
    ' (ước tính)': ' (estimated)',
    'Chưa có dữ liệu thời tiết cho khoảng ngày này.': 'No weather data is available for these dates.',
    'Chưa tải được mô-đun thời tiết.': 'The weather module could not be loaded.',
    'Chưa xác định được vị trí điểm đến để lấy dự báo. Lịch trình vẫn được tạo bình thường.':
      'Could not locate the destination for a forecast. Your itinerary is still generated as usual.',
    'Không lấy được dự báo thời tiết (lỗi kết nối). Lịch trình vẫn được tạo bình thường.':
      'Could not fetch the forecast (connection error). Your itinerary is still generated as usual.',
    'Trời nắng': 'Sunny',
    'Ít mây': 'Partly cloudy',
    'Nhiều mây': 'Cloudy',
    'Có sương mù': 'Foggy',
    'Mưa nhỏ': 'Light rain',
    'Mưa vừa đến to': 'Moderate to heavy rain',
    'Dông, mưa lớn': 'Thunderstorms, heavy rain',
    'Có tuyết': 'Snow',

    /* ---- Tuyến đường trong ngày ---- */
    'Xem tuyến đường ngày {day}': 'View the route for day {day}',
    'Dùng các địa danh bạn đã đánh dấu, hoặc gợi ý đầu tiên của mỗi buổi.':
      'Uses the places you ticked, or the first suggestion of each time slot.',
    'Chưa tải được mô-đun bản đồ.': 'The map module could not be loaded.',
    'Cần ít nhất 2 địa danh để vẽ tuyến.': 'At least 2 places are needed to draw a route.',
    'Đang xác định vị trí {i}/{n}: {name}': 'Locating place {i}/{n}: {name}',
    'Chưa tìm được vị trí đủ để vẽ tuyến. Thử đánh dấu các địa danh khác.':
      'Not enough places could be located to draw a route. Try ticking other places.',
    'Đã bỏ qua {n} địa danh không tìm thấy vị trí.': 'Skipped {n} places whose location could not be found.',
    'Đã vẽ tuyến trên tab Bản đồ.': 'The route is drawn on the Maps tab.',
    'Ngày {day}': 'Day {day}',
    'tuyến trong ngày': 'route for the day',
    'Đang tìm tuyến đường trong ngày…': 'Finding the route for the day…',
    'Không tìm thấy đường đi nối các điểm trong ngày.': 'No road connecting the day\'s stops was found.',
    'Có lỗi khi tải tuyến đường, vui lòng thử lại.': 'Could not load the route, please try again.',

    /* ---- Trợ lý trò chuyện ---- */
    'Hỏi trợ lý': 'Ask the assistant',
    'Mở trợ lý du lịch': 'Open the travel assistant',
    'Trợ lý VNFinder': 'VNFinder assistant',
    'Mô tả chuyến đi, mình sẽ chỉnh lịch trình': 'Describe your trip and I will tune the itinerary',
    'Đóng': 'Close',
    'Gửi': 'Send',
    'Tin nhắn': 'Message',
    'VD: đi với bố mẹ, thích yên tĩnh, ăn đặc sản': 'e.g. traveling with my parents, quiet places, local food',
    'Đi với bố mẹ, thích yên tĩnh': 'With my parents, prefer quiet places',
    'Thích biển và hải sản': 'Love the sea and seafood',
    'Thích trekking, cắm trại': 'Into trekking and camping',
    'Chào bạn! Hãy kể mình nghe về chuyến đi: đi với ai, thích gì, muốn nhẹ nhàng hay năng động. Mình sẽ điều chỉnh gợi ý lịch trình cho phù hợp.':
      'Hi! Tell me about your trip: who you travel with, what you like, relaxed or active. I will tune the itinerary suggestions to fit.',
    'Đang suy nghĩ...': 'Thinking...',
    'Tạo lịch trình theo nhu cầu này': 'Generate an itinerary for this',
    'Tránh: {tags}': 'Avoid: {tags}',
    'Mình đã cập nhật nhu cầu của bạn.': 'I have updated your preferences.',
    'ưu tiên {tags}': 'prioritizing {tags}',
    'hạn chế {tags}': 'limiting {tags}',
    'nhịp độ nhẹ nhàng': 'a relaxed pace',
    'nhịp độ năng động': 'an active pace',
    'Mình đã ghi nhận: {parts}. Bạn chọn điểm đến và ngày đi rồi bấm tạo lịch trình, mình sẽ xếp theo nhu cầu này.':
      'Noted: {parts}. Pick a destination and dates, then generate the itinerary and I will arrange it around this.',
    'Mình chưa bắt được sở thích cụ thể. Bạn thử nói rõ hơn, ví dụ "thích biển, ăn hải sản, đi với bố mẹ".':
      'I could not pick up a specific preference. Try being more specific, for example "I like the sea, seafood, traveling with my parents".',

    /* ---- Đăng nhập ---- */
    'Bạn đã nhập sai nhiều lần. Vui lòng thử lại sau {s} giây.': 'Too many wrong attempts. Please try again in {s} seconds.'
  };

  var listeners = [];

  function isEn() { return document.documentElement.lang === 'en'; }

  function tagLabel(tag) {
    if (isEn() && TAG_EN[tag]) return TAG_EN[tag];
    return (window.VNScoring && window.VNScoring.TAG_LABELS[tag]) || tag;
  }

  function fill(template, params) {
    return String(template).replace(/\{(\w+)\}/g, function (m, k) {
      if (!params || params[k] == null) return m;
      var v = params[k];
      if (k === 'tags' && Array.isArray(v)) return v.map(tagLabel).join(', ');
      return v;
    });
  }

  // Trả về chuỗi theo ngôn ngữ hiện tại. Khóa chính là câu tiếng Việt.
  function t(vi, params) {
    var base = (isEn() && EN[vi]) ? EN[vi] : vi;
    return fill(base, params);
  }

  function escAttr(s) {
    return String(s).replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  }
  function escText(s) {
    return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  }

  // <span> tự cập nhật khi đổi ngôn ngữ
  function span(vi, params) {
    var p = params ? ' data-vni-p="' + escAttr(JSON.stringify(params)) + '"' : '';
    return '<span data-vni-k="' + escAttr(vi) + '"' + p + '>' + escText(t(vi, params)) + '</span>';
  }

  function set(el, vi, params) {
    if (!el) return;
    el.setAttribute('data-vni-k', vi);
    if (params) el.setAttribute('data-vni-p', JSON.stringify(params)); else el.removeAttribute('data-vni-p');
    el.textContent = t(vi, params);
  }

  // Lý do gợi ý do js/scoring.js sinh ra: { k: 'pref'|'rain'|'easy'|'active'|'near'|'unverified', ... }
  var REASON_KEYS = {
    pref: 'Hợp sở thích: {tags}',
    rain: 'Ngày mưa nên ưu tiên trong nhà',
    easy: 'Nhẹ nhàng, ít di chuyển',
    active: 'Phù hợp nhịp độ năng động',
    near: 'Gần điểm trước (~{km} km)',
    unverified: 'Gợi ý chung, chưa xác minh địa điểm cụ thể'
  };
  function reasonParts(w) {
    var key = REASON_KEYS[w && w.k];
    if (!key) return null;
    var params = w.tags ? { tags: w.tags } : (w.km != null ? { km: w.km } : null);
    return { key: key, params: params };
  }
  function reasonText(w) {
    var r = reasonParts(w);
    return r ? t(r.key, r.params) : '';
  }
  function reasonSpan(w) {
    var r = reasonParts(w);
    return r ? span(r.key, r.params) : '';
  }

  function parseParams(raw) {
    if (!raw) return null;
    try { return JSON.parse(raw); } catch (e) { return null; }
  }

  // Cập nhật mọi phần tử đã đăng ký theo ngôn ngữ hiện tại
  function refresh(root) {
    root = root || document;
    root.querySelectorAll('[data-vni-k]').forEach(function (el) {
      el.textContent = t(el.getAttribute('data-vni-k'), parseParams(el.getAttribute('data-vni-p')));
    });
    root.querySelectorAll('[data-vni-ph]').forEach(function (el) {
      el.setAttribute('placeholder', t(el.getAttribute('data-vni-ph')));
    });
    root.querySelectorAll('[data-vni-aria]').forEach(function (el) {
      el.setAttribute('aria-label', t(el.getAttribute('data-vni-aria')));
    });
  }

  function onChange(fn) { listeners.push(fn); }

  // js/i18n.js đổi ngôn ngữ bằng cách gán document.documentElement.lang
  if (window.MutationObserver) {
    new MutationObserver(function () {
      refresh();
      listeners.forEach(function (fn) { try { fn(); } catch (e) { console.warn('[VNI18n]', e); } });
    }).observe(document.documentElement, { attributes: true, attributeFilter: ['lang'] });
  }

  window.VNI18n = {
    t: t, span: span, set: set, refresh: refresh, onChange: onChange,
    tagLabel: tagLabel, reasonText: reasonText, reasonSpan: reasonSpan, isEn: isEn
  };
})();
