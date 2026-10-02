/**
 * VNFinder — Bộ chấm điểm gợi ý lịch trình (chạy hoàn toàn trên trình duyệt, không cần API key)
 *
 * Ý tưởng: mỗi địa danh/món ăn trong itinerary-data.js được gán "hồ sơ thẻ" (tag profile)
 * bằng cách dò từ khóa trong tên + mô tả. Khi người dùng chọn sở thích (10 thẻ trên giao diện)
 * hoặc khi chatbot trích xuất hồ sơ du lịch, từng ứng viên được chấm điểm theo:
 *   1. Mức khớp sở thích (có trọng số do chatbot đặt, nếu có)
 *   2. Thẻ cần tránh (ví dụ "yên tĩnh" thì tránh vui chơi giải trí)
 *   3. Cường độ vận động (đi cùng người lớn tuổi thì tránh trekking/leo núi)
 *   4. Thời tiết (chỉ tác động tới địa danh, không tác động tới món ăn)
 *   5. Khoảng cách tới điểm trước đó (chỉ khi dữ liệu có lat/lng)
 *   6. Đa dạng trong ngày (không dồn 3 chùa vào cùng một buổi)
 * Mỗi kết quả kèm danh sách lý do (why, dạng đối tượng {k, ...}; js/i18n-ext.js dịch ra chữ) để giải thích cho người dùng.
 *
 * Giao diện công khai: window.VNScoring = { TAGS, TAG_LABELS, inferTags, scoreItem, pickIndex, retrieve }
 */
(function () {
  'use strict';

  var TAGS = ['bien', 'nuirung', 'amthuc', 'disan', 'songnuoc', 'vanhoa', 'camtrai', 'checkin', 'sinhthai', 'giaitri'];

  var TAG_LABELS = {
    bien: 'Biển đảo & Vịnh',
    nuirung: 'Núi rừng & Cao nguyên',
    amthuc: 'Ẩm thực & Thành phố',
    disan: 'Lịch sử & Di sản',
    songnuoc: 'Sông nước Miền Tây',
    vanhoa: 'Văn hóa địa phương',
    camtrai: 'Cắm trại & Trekking',
    checkin: 'Sống ảo & Check-in',
    sinhthai: 'Sinh thái & Thiên nhiên',
    giaitri: 'Vui chơi & Giải trí'
  };

  // Từ điển dò thẻ. Từ khóa dạng chuỗi con, đã viết thường, có dấu.
  var LEXICON = {
    bien: ['biển', 'bãi tắm', 'bãi biển', 'đảo', 'vịnh', 'hải sản', 'san hô', 'lặn', 'cảng cá', 'bán đảo', 'bãi đá', 'hải đăng', 'mũi'],
    nuirung: ['núi', 'đèo', 'cao nguyên', 'đỉnh', 'rừng', 'thác', 'đồi', 'ruộng bậc thang', 'săn mây', 'hang động', 'hang '],
    amthuc: ['ẩm thực', 'đặc sản', 'chợ đêm', 'phố ẩm thực', 'quán ăn', 'nhà hàng', 'món ngon', 'đường phố', 'chợ '],
    disan: ['di tích', 'di sản', 'bảo tàng', 'chùa', 'đền', 'đình ', 'thành cổ', 'lăng', 'cố đô', 'lịch sử', 'tháp', 'nhà thờ', 'cổ kính', 'phố cổ', 'chiến thắng', 'khởi nghĩa', 'đài tưởng niệm', 'nghĩa trang'],
    songnuoc: ['sông', 'chợ nổi', 'kênh', 'rạch', 'thuyền', 'xuồng', 'miệt vườn', 'cù lao', 'vườn trái cây', 'rừng tràm', 'đầm', 'bến ninh kiều'],
    vanhoa: ['văn hóa', 'làng nghề', 'lễ hội', 'dân tộc', 'cồng chiêng', 'nhà rông', 'truyền thống', 'làng ', 'bản ', 'nghề thủ công', 'đờn ca', 'ca trù', 'quan họ', 'múa', 'dệt', 'gốm'],
    camtrai: ['cắm trại', 'trekking', 'leo núi', 'băng rừng', 'dã ngoại', 'chinh phục', 'lều', 'đi bộ đường dài', 'phượt'],
    checkin: ['check-in', 'checkin', 'sống ảo', 'săn mây', 'hoàng hôn', 'bình minh', 'cầu kính', 'view', 'toàn cảnh', 'đồi chè', 'cánh đồng', 'hoa ', 'cầu ', 'ngắm cảnh', 'chụp ảnh'],
    sinhthai: ['sinh thái', 'vườn quốc gia', 'khu bảo tồn', 'thiên nhiên', 'hồ ', 'đầm phá', 'rừng', 'thác', 'đảo hoang', 'suối', 'hệ sinh thái', 'chim', 'ngắm sao'],
    giaitri: ['công viên', 'vui chơi', 'giải trí', 'cáp treo', 'tàu lượn', 'công viên nước', 'bar', 'pub', 'phố đi bộ', 'karaoke', 'show', 'nhạc', 'rạp', 'lễ hội ánh sáng', 'chợ đêm', 'quảng trường', 'trò chơi', 'sân khấu', 'nhà hát']
  };

  // Hoạt động tốn sức: dùng cho tiêu chí "nhịp độ" (người lớn tuổi/trẻ nhỏ/nghỉ dưỡng)
  var STRENUOUS = ['trekking', 'leo núi', 'băng rừng', 'chinh phục', 'cắm trại', 'đi bộ đường dài', 'phượt', 'vượt thác', 'lặn biển', 'bậc thang'];

  // Địa danh trong nhà / ngoài trời (chỉ dùng cho nhóm tham quan)
  var INDOOR = ['bảo tàng', 'nhà hát', 'trung tâm thương mại', 'nhà hàng', 'cà phê', 'quán', 'trong nhà', 'spa', 'nhà thờ', 'rạp', 'triển lãm', 'thư viện', 'nhà rông'];
  var OUTDOOR = ['biển', 'bãi', 'núi', 'đèo', 'thác', 'đồi', 'rừng', 'hồ ', 'đảo', 'vườn', 'công viên', 'cầu ', 'ruộng', 'trekking', 'cắm trại', 'thuyền', 'xuồng', 'hoàng hôn', 'bình minh', 'phố đi bộ'];

  var FOOD_SLOTS = { breakfast: 1, lunch: 1, dinner: 1 };

  function norm(s) {
    return String(s == null ? '' : s).toLowerCase().normalize('NFC');
  }

  function countHits(text, words) {
    var n = 0;
    for (var i = 0; i < words.length; i++) {
      if (text.indexOf(words[i]) !== -1) n++;
    }
    return n;
  }

  /* ---------------- Hồ sơ thẻ của một mục ---------------- */
  var profileCache = new WeakMap();

  function profileOf(item) {
    if (!item || typeof item !== 'object') return { tags: {}, strenuous: false, indoor: false, outdoor: false };
    var cached = profileCache.get(item);
    if (cached) return cached;

    // "Hồ Chí Minh" là tên người/địa danh, không phải "hồ" (hồ nước)
    var head = norm((item.name || '') + ' ' + (item.dish || '') + ' ' + (item.keyword || '')).replace(/hồ chí minh/g, 'hcm') + ' ';
    var body = norm((item.desc || '') + ' ' + (item.tips || '')).replace(/hồ chí minh/g, 'hcm') + ' ';
    var tags = {};

    TAGS.forEach(function (tag) {
      // Từ khóa xuất hiện ở tên/keyword nặng gấp đôi so với trong phần mô tả
      var w = countHits(head, LEXICON[tag]) * 2 + countHits(body, LEXICON[tag]);
      if (w > 0) tags[tag] = Math.min(1, w / 3);
    });

    // Món ăn mặc định thuộc nhóm ẩm thực
    if (item.dish) tags.amthuc = Math.max(tags.amthuc || 0, 0.6);

    var all = head + body;
    var prof = {
      tags: tags,
      strenuous: countHits(all, STRENUOUS) > 0,
      indoor: countHits(all, INDOOR) > 0,
      outdoor: countHits(all, OUTDOOR) > 0
    };
    profileCache.set(item, prof);
    return prof;
  }

  function inferTags(item) {
    return profileOf(item).tags;
  }

  /* ---------------- Khoảng cách (chỉ khi dữ liệu có lat/lng) ---------------- */
  function haversineKm(a, b) {
    var R = 6371, rad = Math.PI / 180;
    var dLat = (b.lat - a.lat) * rad, dLng = (b.lng - a.lng) * rad;
    var h = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(a.lat * rad) * Math.cos(b.lat * rad) * Math.sin(dLng / 2) * Math.sin(dLng / 2);
    return 2 * R * Math.asin(Math.sqrt(h));
  }

  function hasCoord(it) {
    return it && typeof it.lat === 'number' && typeof it.lng === 'number';
  }

  /* ---------------- Chấm điểm một ứng viên ----------------
   * ctx: {
   *   slotKey, prefs: ['bien', ...],
   *   profile: { boost:{tag:hệ số}, avoid:[tag], intensity:'low'|'normal'|'high' },
   *   isRainy, weatherReal, dayItems: [các mục đã chọn trong buổi này],
   *   rng
   * }
   * Trả về { score, why:[{ k: 'pref'|'rain'|'easy'|'active'|'near', ... }] }
   */
  function scoreItem(item, ctx) {
    var prof = profileOf(item);
    var userProfile = ctx.profile || {};
    var boost = userProfile.boost || {};
    var avoid = userProfile.avoid || [];
    var prefs = ctx.prefs || [];
    var isFood = !!FOOD_SLOTS[ctx.slotKey];
    var score = 0;
    var why = [];

    // 0. Mục tên ghép tự động (synthetic) chỉ dùng khi hết lựa chọn thật
    if (item.synthetic) score -= 8;

    // 0b. Mục thuộc địa phương khác trong cùng tỉnh (cờ do resolveItineraryPool gắn): dùng sau mục đúng địa phương
    if (item._foreign) score -= 4;

    // 0c. Mục mượn từ địa phương cùng vùng (gần nhưng không phải chính điểm đến): xếp sau mục của điểm đến
    if (item._near) score -= 1.5;

    // 1. Khớp sở thích
    var matched = [];
    prefs.forEach(function (p) {
      var s = prof.tags[p] || 0;
      if (s > 0) {
        score += 2.5 * s * (boost[p] || 1);
        matched.push(p);
      }
    });
    // Thẻ do chatbot nâng trọng số dù người dùng chưa bấm chọn trên giao diện
    Object.keys(boost).forEach(function (p) {
      if (prefs.indexOf(p) === -1 && prof.tags[p]) {
        score += 1.5 * prof.tags[p] * boost[p];
        matched.push(p);
      }
    });
    if (matched.length) why.push({ k: 'pref', tags: matched.slice(0, 2) });

    // 2. Thẻ cần tránh
    avoid.forEach(function (p) {
      var s = prof.tags[p] || 0;
      if (s > 0) score -= 3 * s;
    });

    // 3. Cường độ vận động
    if (!isFood && prof.strenuous) {
      if (userProfile.intensity === 'low') { score -= 3; }
      else if (userProfile.intensity === 'high') { score += 1.5; why.push({ k: 'active' }); }
    }
    if (!isFood && !prof.strenuous && userProfile.intensity === 'low') {
      score += 0.5;
      why.push({ k: 'easy' });
    }

    // 4. Thời tiết (chỉ áp dụng cho địa danh)
    if (!isFood) {
      if (ctx.isRainy) {
        if (prof.indoor) { score += 2; if (ctx.weatherReal) why.push({ k: 'rain' }); }
        else if (prof.outdoor) { score -= 3; }
      } else if (prof.outdoor && !prof.indoor) {
        score += 0.8;
      }
    }

    // 5. Khoảng cách tới điểm trước đó. Tọa độ lấy qua ctx.coordOf (VNGeo.peek: file dựng sẵn
    //    hoặc bộ nhớ đệm), hoặc trực tiếp từ lat/lng của mục; không có tọa độ thì bỏ qua tiêu chí này.
    var coordOf = ctx.coordOf || function (x) { return hasCoord(x) ? x : null; };
    var here = coordOf(item);
    var dayItems = ctx.dayItems || [];
    if (here) {
      var anchor = null;
      for (var i = dayItems.length - 1; i >= 0; i--) {
        var c = coordOf(dayItems[i]);
        if (c) { anchor = c; break; }
      }
      if (anchor) {
        var km = haversineKm(anchor, here);
        score += 2.5 * Math.exp(-km / 8);
        if (km < 5) why.push({ k: 'near', km: Math.max(1, Math.round(km)) });
      }
    }

    // 6. Đa dạng trong buổi: phạt khi thẻ nổi bật đã xuất hiện ở mục khác cùng buổi
    dayItems.forEach(function (d) {
      var dt = profileOf(d).tags;
      Object.keys(prof.tags).forEach(function (t) {
        if (dt[t] && prof.tags[t] > 0.5 && dt[t] > 0.5) score -= 0.7;
      });
    });

    // 7. Nhiễu nhỏ để mỗi lần bấm "Tạo lịch trình" cho kết quả khác nhau một chút
    score += (ctx.rng ? ctx.rng() : Math.random()) * 0.6;

    return { score: score, why: why };
  }

  /* ---------------- Chọn ứng viên tốt nhất từ "túi" ---------------- */
  function pickIndex(bag, ctx) {
    var keyFn = ctx.keyFn || function (it) { return String(it.dish || it.name || ''); };
    var used = ctx.usedKeys || new Set();
    var best = -1, bestScore = -Infinity, bestWhy = [];
    for (var i = 0; i < bag.length; i++) {
      if (used.has(keyFn(bag[i]))) continue;
      var r = scoreItem(bag[i], ctx);
      if (r.score > bestScore) { bestScore = r.score; best = i; bestWhy = r.why; }
    }
    return { index: best, why: bestWhy, score: bestScore };
  }

  /* ---------------- Truy xuất cho chatbot (RAG đơn giản) ----------------
   * Tìm tối đa k mục trong pool khớp nhất với câu hỏi của người dùng.
   * pool: { breakfast:[...], morningVisit:[...], ... } (kết quả resolveItineraryPool)
   */
  function tokenize(q) {
    return norm(q).replace(/[.,!?;:()"'“”]/g, ' ').split(/\s+/).filter(function (t) { return t.length > 1; });
  }

  function retrieve(query, pool, k) {
    k = k || 10;
    var tokens = tokenize(query);
    var seen = new Set();
    var scored = [];
    Object.keys(pool || {}).forEach(function (slot) {
      (pool[slot] || []).forEach(function (it) {
        var key = norm(it.dish || it.name);
        if (!key || seen.has(key)) return;
        seen.add(key);
        var text = norm((it.dish || it.name) + ' ' + (it.desc || '') + ' ' + (it.tips || '') + ' ' + (it.keyword || ''));
        var s = 0;
        tokens.forEach(function (t) { if (text.indexOf(t) !== -1) s += 1; });
        // Khớp thẻ sở thích mà câu hỏi nhắc tới
        TAGS.forEach(function (tag) {
          if (profileOf(it).tags[tag] && LEXICON[tag].some(function (w) { return norm(query).indexOf(w.trim()) !== -1; })) s += 1.5;
        });
        scored.push({ item: it, slot: slot, score: s });
      });
    });
    scored.sort(function (a, b) { return b.score - a.score; });
    var hits = scored.filter(function (x) { return x.score > 0; });
    // Không khớp từ khóa nào: trả về vài mục đầu để chatbot vẫn có ngữ cảnh địa phương
    return (hits.length ? hits : scored).slice(0, hits.length ? k : Math.min(k, 6));
  }

  window.VNScoring = {
    TAGS: TAGS,
    TAG_LABELS: TAG_LABELS,
    inferTags: inferTags,
    scoreItem: scoreItem,
    pickIndex: pickIndex,
    retrieve: retrieve
  };
})();
