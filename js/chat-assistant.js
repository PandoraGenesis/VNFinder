/**
 * VNFinder — Trợ lý du lịch (chatbot)
 *
 * Luồng xử lý:
 *   1. Người dùng gõ yêu cầu tự nhiên ("3 ngày, đi với bố mẹ, thích yên tĩnh").
 *   2. Truy xuất (RAG): lấy tối đa 10 địa danh/món ăn của điểm đến hiện tại khớp câu hỏi
 *      từ dữ liệu của nhóm (VNScoring.retrieve) và gửi kèm làm ngữ cảnh.
 *   3. Máy chủ trung gian (worker/worker.js) gọi LLM, yêu cầu trả về JSON gồm lời đáp +
 *      hồ sơ du lịch có cấu trúc. LLM chỉ được nhắc tên địa điểm có trong ngữ cảnh.
 *   4. Hồ sơ được kiểm tra (chỉ nhận thẻ hợp lệ) rồi áp vào state.profile và các nút sở thích,
 *      để bộ chấm điểm (js/scoring.js) xếp lịch trình theo đúng nhu cầu.
 *
 * Nếu chưa cấu hình VNFINDER_CHAT_URL hoặc máy chủ lỗi, chatbot tự dùng bộ phân tích từ khóa
 * chạy trên trình duyệt, nên bản demo luôn hoạt động.
 */
(function () {
  'use strict';

  // Điền URL của Cloudflare Worker sau khi triển khai (xem worker/README.md)
  var CHAT_URL = window.VNFINDER_CHAT_URL || '';
  var TIMEOUT_MS = 20000;
  var MAX_HISTORY = 8;

  var history = [];
  var busy = false;
  var els = {};

  function esc(s) {
    return String(s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }

  // Dịch qua js/i18n-ext.js (nếu chưa nạp thì giữ nguyên tiếng Việt)
  function T(vi, params) {
    return window.VNI18n ? window.VNI18n.t(vi, params) : String(vi).replace(/\{(\w+)\}/g, function (m, k) {
      return params && params[k] != null ? (Array.isArray(params[k]) ? params[k].map(labelOf).join(', ') : params[k]) : m;
    });
  }

  function labelOf(tag) {
    if (window.VNI18n) return window.VNI18n.tagLabel(tag);
    return (window.VNScoring && window.VNScoring.TAG_LABELS[tag]) || tag;
  }

  /* ---------------- Bộ phân tích từ khóa dự phòng (không cần mạng) ---------------- */
  function localParse(text) {
    var t = text.toLowerCase();
    var normT = t.normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/đ/g, 'd');
    var lang = document.documentElement.lang === 'en' ? 'en' : 'vi';

    // Xử lý linh hoạt các câu hỏi FAQ thường gặp
    if (normT.indexOf('mua nao') !== -1 || normT.indexOf('thoi tiet') !== -1 || normT.indexOf('season') !== -1 || normT.indexOf('weather') !== -1) {
      var rep = lang === 'en' ? 'Central Vietnam (Da Nang, Quy Nhon, Nha Trang...) is best visited during the dry season (January - August) with clear skies and calm seas. From September to December is usually the rainy/typhoon season, so please check the forecast before going!' : 'Thời tiết miền Trung (Đà Nẵng, Quy Nhơn, Nha Trang...) đẹp nhất vào mùa khô (tháng 1 - tháng 8). Từ tháng 9 - tháng 12 thường có mưa bão, bạn nên xem trước dự báo thời tiết nhé!';
      return { reply: rep, profile: { prefs: [], boost: {}, avoid: [], intensity: 'normal', notes: '' } };
    }
    if (normT.indexOf('check-in la gi') !== -1 || normT.indexOf('check-in dung') !== -1 || normT.indexOf('tinh nang check-in') !== -1 || normT.indexOf('what is check-in') !== -1) {
      var rep2 = lang === 'en' ? 'The Check-in feature on VNFinder helps you mark the places you have visited on the map, like a miniature travel diary. You can open the "Check-in" tab to explore!' : 'Tính năng Check-in trên VNFinder giúp bạn đánh dấu lại các địa danh đã ghé thăm trên bản đồ, như một cuốn nhật ký du lịch thu nhỏ. Bạn có thể mở tab "Check-in" để khám phá!';
      return { reply: rep2, profile: { prefs: [], boost: {}, avoid: [], intensity: 'normal', notes: '' } };
    }
    if (normT.indexOf('lich trinh 3 ngay') !== -1 || normT.indexOf('goi y lich trinh') !== -1 || normT.indexOf('3-day') !== -1 || normT.indexOf('itinerary') !== -1) {
      var rep3 = lang === 'en' ? 'To create an itinerary, just open the "Itinerary" tab, type a destination (e.g., Da Lat, Quy Nhon), choose the number of nights (e.g., 2 nights), and select your preferences. I will automatically arrange the most optimal sightseeing spots for you!' : 'Để tạo lịch trình, bạn chỉ cần mở tab "Lịch trình", gõ tên điểm đến (VD: Đà Lạt, Quy Nhơn), chọn số đêm (VD: 2 đêm) và chọn các sở thích của bạn. Mình sẽ tự động sắp xếp điểm tham quan tối ưu nhất!';
      return { reply: rep3, profile: { prefs: [], boost: {}, avoid: [], intensity: 'normal', notes: '' } };
    }
    if ((normT.indexOf('an gi') !== -1 || normT.indexOf('food') !== -1 || normT.indexOf('eat') !== -1) && normT.indexOf('hue') !== -1) {
      var rep4 = lang === 'en' ? 'In Hue, you must try: Hue beef noodle soup (Bun bo Hue), steamed flat rice dumplings (banh nam), water fern cake (banh beo), tapioca dumplings (banh bot loc), mussel rice, and alley sweet soup. Wishing you a delicious food tour!' : 'Đến Huế bạn nhất định phải thử: Bún bò Huế, bánh nậm, bánh bèo, bánh bột lọc, cơm hến và chè hẻm nhé. Chúc bạn có một chuyến food-tour thật ngon miệng!';
      return { reply: rep4, profile: { prefs: [], boost: {}, avoid: [], intensity: 'normal', notes: '' } };
    }

    var has = function (arr) { return arr.some(function (w) { return t.indexOf(w) !== -1; }); };
    var prefs = [], avoid = [], boost = {}, intensity = 'normal';

    if (has(['bố mẹ', 'ba mẹ', 'ông bà', 'người lớn tuổi', 'người già', 'trẻ nhỏ', 'em bé', 'con nhỏ',
             'parents', 'grandparents', 'elderly', 'senior', 'kids', 'children', 'toddler', 'baby'])) intensity = 'low';
    if (has(['yên tĩnh', 'thư giãn', 'nghỉ dưỡng', 'nhẹ nhàng', 'chill', 'quiet', 'relax', 'peaceful', 'slow'])) {
      intensity = 'low'; avoid.push('giaitri'); prefs.push('sinhthai');
    }
    if (has(['năng động', 'khám phá', 'mạo hiểm', 'thử thách', 'active', 'adventur', 'challeng'])) intensity = 'high';
    if (has(['biển', 'đảo', 'vịnh', 'beach', 'sea', 'island', 'bay', 'seafood'])) prefs.push('bien');
    if (has(['núi', 'cao nguyên', 'đèo', 'mountain', 'highland'])) prefs.push('nuirung');
    if (has(['ăn', 'ẩm thực', 'đặc sản', 'món', 'food', 'cuisine', 'specialt', 'street food', 'eat'])) prefs.push('amthuc');
    if (has(['lịch sử', 'di tích', 'di sản', 'bảo tàng', 'chùa', 'đền', 'history', 'heritage', 'museum', 'temple', 'pagoda'])) prefs.push('disan');
    if (has(['sông nước', 'chợ nổi', 'miền tây', 'xuồng', 'river', 'floating market', 'mekong', 'boat'])) prefs.push('songnuoc');
    if (has(['văn hóa', 'dân tộc', 'làng nghề', 'lễ hội', 'culture', 'ethnic', 'craft', 'festival'])) prefs.push('vanhoa');
    if (has(['trekking', 'cắm trại', 'leo núi', 'trek', 'camp', 'hiking', 'hike'])) { prefs.push('camtrai'); intensity = 'high'; }
    if (has(['sống ảo', 'check-in', 'chụp ảnh', 'view đẹp', 'photo', 'instagram', 'selfie', 'scenic'])) prefs.push('checkin');
    if (has(['thiên nhiên', 'sinh thái', 'rừng', 'thác', 'nature', 'eco', 'forest', 'waterfall'])) prefs.push('sinhthai');
    if (has(['vui chơi', 'giải trí', 'công viên', 'trẻ em', 'amusement', 'theme park', 'entertainment', 'nightlife'])) prefs.push('giaitri');

    var seen = {};
    prefs = prefs.filter(function (p) { if (seen[p]) return false; seen[p] = 1; return true; });
    // Một thẻ không thể vừa ưu tiên vừa tránh
    avoid = avoid.filter(function (p) { return prefs.indexOf(p) === -1; });
    prefs.forEach(function (p) { boost[p] = 1.5; });

    var parts = [];
    if (prefs.length) parts.push(lang === 'en' ? T('prefer {tags}', { tags: prefs }) : T('ưu tiên {tags}', { tags: prefs }));
    if (avoid.length) parts.push(lang === 'en' ? T('avoid {tags}', { tags: avoid }) : T('hạn chế {tags}', { tags: avoid }));
    if (intensity === 'low') parts.push(lang === 'en' ? 'relaxed pace' : 'nhịp độ nhẹ nhàng');
    if (intensity === 'high') parts.push(lang === 'en' ? 'active pace' : 'nhịp độ năng động');

    var normT = t.normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/đ/g, 'd');
    var K = (lang === 'en' && window.VN_CHAT_KNOWLEDGE_EN) ? window.VN_CHAT_KNOWLEDGE_EN : (window.VN_CHAT_KNOWLEDGE || {});
    var suggestions = Object.keys(K).filter(function(k) { return normT.indexOf(k) !== -1; }).slice(0, 2);
    var knowledgeReply = suggestions.length ? suggestions.map(function(k) { return K[k]; }).join('\n\n') : '';

    var reply = '';
    if (knowledgeReply) {
      reply = knowledgeReply + (parts.length ? '\n\n' : '');
    }

    if (parts.length) {
      var recStr = lang === 'en' ? 'I have noted: {parts}. Please select a destination and dates, then create the itinerary.' : 'Mình đã ghi nhận: {parts}. Bạn chọn điểm và ngày đi rồi tạo lịch trình nhé.';
      reply += T(recStr, { parts: parts.join('; ') });
    } else if (!knowledgeReply) {
      reply = lang === 'en' ? 'I didn\'t catch any specific preferences. Could you elaborate? E.g., "love the beach, seafood, traveling with parents".' : 'Mình chưa bắt được sở thích cụ thể. Bạn thử nói rõ hơn, ví dụ "thích biển, ăn hải sản, đi với bố mẹ".';
    }

    return { reply: reply, profile: { prefs: prefs, boost: boost, avoid: avoid, intensity: intensity, notes: '' } };
  }

  /* ---------------- Ngữ cảnh gửi kèm (RAG) ---------------- */
  function buildContext(query) {
    var ctx = { destination: '', duration: 0, prefs: [], candidates: [] };
    try {
      if (typeof state !== 'undefined') {
        ctx.destination = state.destination || '';
        ctx.duration = state.duration || 0;
        ctx.prefs = state.selectedPrefs || [];
        if (ctx.destination && typeof resolveItineraryPool === 'function' && window.VNScoring) {
          var province = state.destProvince || ctx.destination.split(',').pop().trim();
          var pool = resolveItineraryPool(ctx.destination, province);
          ctx.candidates = window.VNScoring.retrieve(query, pool, 10).map(function (c) {
            return { name: c.item.dish || c.item.name, kind: c.item.dish ? 'món ăn' : 'địa danh', desc: String(c.item.desc || '').slice(0, 140) };
          });
        }
      }
    } catch (e) { /* không có ngữ cảnh vẫn chạy được */ }
    return ctx;
  }

  /* ---------------- Gọi máy chủ trung gian ---------------- */
  function callServer(userText) {
    var ctrl = new AbortController();
    var timer = setTimeout(function () { ctrl.abort(); }, TIMEOUT_MS);
    var body = { messages: history.slice(-MAX_HISTORY), context: buildContext(userText) };
    if (window.VNChat && window.VNChat.buildSystem) {
      body.system = window.VNChat.buildSystem(userText);
    }
    return fetch(CHAT_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
      signal: ctrl.signal
    }).then(function (res) {
      clearTimeout(timer);
      if (!res.ok) throw new Error('HTTP ' + res.status);
      return res.json();
    }).catch(function (err) { clearTimeout(timer); throw err; });
  }

  /* ---------------- Kiểm tra + áp hồ sơ vào ứng dụng ---------------- */
  function sanitizeProfile(p) {
    var valid = window.VNScoring ? window.VNScoring.TAGS : [];
    p = p || {};
    var out = { prefs: [], boost: {}, avoid: [], intensity: 'normal', notes: '' };
    (Array.isArray(p.prefs) ? p.prefs : []).forEach(function (t) { if (valid.indexOf(t) !== -1 && out.prefs.indexOf(t) === -1) out.prefs.push(t); });
    (Array.isArray(p.avoid) ? p.avoid : []).forEach(function (t) { if (valid.indexOf(t) !== -1 && out.avoid.indexOf(t) === -1) out.avoid.push(t); });
    if (p.boost && typeof p.boost === 'object') {
      Object.keys(p.boost).forEach(function (t) {
        var v = Number(p.boost[t]);
        if (valid.indexOf(t) !== -1 && isFinite(v)) out.boost[t] = Math.max(0.5, Math.min(2, v));
      });
    }
    out.prefs.forEach(function (t) { if (!out.boost[t]) out.boost[t] = 1.3; });
    if (['low', 'normal', 'high'].indexOf(p.intensity) !== -1) out.intensity = p.intensity;
    out.notes = typeof p.notes === 'string' ? p.notes.slice(0, 200) : '';
    // Một thẻ không thể vừa ưu tiên vừa tránh
    out.avoid = out.avoid.filter(function (t) { return out.prefs.indexOf(t) === -1; });
    return out;
  }

  function applyProfile(profile) {
    if (typeof state === 'undefined') return;
    state.profile = { boost: profile.boost, avoid: profile.avoid, intensity: profile.intensity, notes: profile.notes };
    // Đồng bộ các nút sở thích trên giao diện bằng chính trình xử lý click có sẵn
    if (profile.prefs.length) {
      document.querySelectorAll('.tag[data-tag]').forEach(function (btn) {
        var tag = btn.getAttribute('data-tag');
        var want = profile.prefs.indexOf(tag) !== -1;
        var isOn = (state.selectedPrefs || []).indexOf(tag) !== -1;
        if (want !== isOn) btn.click();
      });
    }
  }

  /* ---------------- Giao diện ---------------- */
  function addMsg(role, html, cls) {
    var div = document.createElement('div');
    div.className = 'vnchat-msg ' + role + (cls ? ' ' + cls : '');
    div.innerHTML = html;
    els.log.appendChild(div);
    els.log.scrollTop = els.log.scrollHeight;
    return div;
  }

  function renderBotReply(reply, profile, onDone) {
    var chips = '';
    profile.prefs.forEach(function (t) { chips += '<span class="vnchat-chip">' + esc(labelOf(t)) + '</span>'; });
    profile.avoid.forEach(function (t) { chips += '<span class="vnchat-chip avoid">' + esc(T('Tránh: {tags}', { tags: [t] })) + '</span>'; });
    if (chips) chips = '<div class="vnchat-applied">' + chips + '</div>';
    
    var gen = document.getElementById('generate-btn');
    var btn = null;
    if (gen && (profile.prefs.length || profile.avoid.length || profile.intensity !== 'normal')) {
      btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'vnchat-cta';
      if (window.VNI18n) window.VNI18n.set(btn, 'Tạo lịch trình theo nhu cầu này'); else btn.textContent = 'Tạo lịch trình theo nhu cầu này';
      btn.addEventListener('click', function () { gen.click(); toggle(false); });
    }

    var node = addMsg('bot', '');
    var textNode = document.createElement('span');
    node.appendChild(textNode);
    
    var chars = reply.split('');
    var i = 0;
    
    function typeNext() {
      if (i < chars.length) {
        var c = chars[i];
        if (c === '\n') {
          textNode.appendChild(document.createElement('br'));
        } else {
          textNode.appendChild(document.createTextNode(c));
        }
        i++;
        els.log.scrollTop = els.log.scrollHeight;
        setTimeout(typeNext, 20);
      } else {
        if (chips) {
          var cdiv = document.createElement('div');
          cdiv.innerHTML = chips;
          node.appendChild(cdiv.firstChild);
        }
        if (btn) {
          node.appendChild(btn);
        }
        els.log.scrollTop = els.log.scrollHeight;
        if (onDone) onDone();
      }
    }
    typeNext();
  }

  function send(text) {
    text = String(text || '').trim().slice(0, 500);
    if (!text || busy) return;
    
    var lang = document.documentElement.lang === 'en' ? 'en' : 'vi';
    var txt = (window.VNChat && window.VNChat.TEXT && window.VNChat.TEXT[lang]) || {};

    busy = true;
    els.send.disabled = true;
    els.input.value = '';
    addMsg('user', esc(text));
    history.push({ role: 'user', content: text });

    if (window.VNChat && window.VNChat.isOutOfScope && window.VNChat.isOutOfScope(text)) {
      var replyScope = txt.outOfScope || T('Ngoài phạm vi');
      history.push({ role: 'assistant', content: replyScope });
      renderBotReply(replyScope, { prefs: [], avoid: [], intensity: 'normal', notes: '' }, function() {
        busy = false;
        els.send.disabled = false;
        els.input.focus();
      });
      return;
    }

    var typingMsg = txt.typing || T('Đang suy nghĩ...');
    var typing = addMsg('bot', esc(typingMsg), 'typing');

    var run = CHAT_URL
      ? callServer(text).catch(function (err) {
          console.warn('[VNFinder Chat] Máy chủ lỗi, dùng bộ phân tích dự phòng:', err);
          return localParse(text);
        })
      : Promise.resolve(localParse(text));

    run.then(function (data) {
      var profile = sanitizeProfile(data && data.profile);
      var reply = (data && typeof data.reply === 'string' && data.reply.trim()) || T('Mình đã cập nhật nhu cầu của bạn.');
      typing.remove();
      applyProfile(profile);
      history.push({ role: 'assistant', content: reply });
      return new Promise(function(resolve) {
        renderBotReply(reply, profile, resolve);
      });
    }).then(function () {
      busy = false;
      els.send.disabled = false;
      els.input.focus();
    }).catch(function (err) {
      console.error(err);
      busy = false;
      els.send.disabled = false;
    });
  }

  function toggle(open) {
    var isOpen = open === undefined ? !els.panel.classList.contains('is-open') : open;
    els.panel.classList.toggle('is-open', isOpen);
    
    if (isOpen) {
      els.fab.innerHTML = '<i data-lucide="x"></i>';
      els.input.focus();
    } else {
      els.fab.innerHTML = '<i data-lucide="message-circle"></i>';
    }
    if (window.lucide && window.lucide.createIcons) window.lucide.createIcons({ root: els.fab });
  }

  function build() {
    var lang = document.documentElement.lang === 'en' ? 'en' : 'vi';
    var txt = (window.VNChat && window.VNChat.TEXT && window.VNChat.TEXT[lang]) || {};
    var title = txt.title || T('Trợ lý VNFinder');
    var placeholder = txt.placeholder || T('VD: đi với bố mẹ, thích yên tĩnh, ăn đặc sản');

    var wrap = document.createElement('div');
    wrap.innerHTML =
      '<button type="button" class="vnchat-fab" id="vnchat-fab" data-vni-aria="Mở trợ lý du lịch" aria-label="' + esc(T('Mở trợ lý du lịch')) + '" title="' + esc(T('Mở trợ lý du lịch')) + '">' +
      '<i data-lucide="message-circle"></i></button>' +
      '<section class="vnchat-panel" id="vnchat-panel" role="dialog" aria-label="' + esc(title) + '" data-vni-aria="Trợ lý VNFinder">' +
      '<header class="vnchat-head"><div><h3 data-vni-k="Trợ lý VNFinder">' + esc(title) + '</h3>' +
      '<small data-vni-k="Mô tả chuyến đi, mình sẽ chỉnh lịch trình">' + esc(T('Mô tả chuyến đi, mình sẽ chỉnh lịch trình')) + '</small></div>' +
      '<div class="vnchat-controls">' +
      '<button type="button" class="vnchat-minimize" id="vnchat-minimize" data-vni-aria="Thu nhỏ" aria-label="' + esc(T('Thu nhỏ')) + '">&minus;</button>' +
      '<button type="button" class="vnchat-close" id="vnchat-close" data-vni-aria="Đóng" aria-label="' + esc(T('Đóng')) + '">&times;</button>' +
      '</div></header>' +
      '<div class="vnchat-log" id="vnchat-log" aria-live="polite"></div>' +
      '<div class="vnchat-suggest" id="vnchat-suggest"></div>' +
      '<form class="vnchat-form" id="vnchat-form" autocomplete="off">' +
      '<input id="vnchat-input" type="text" maxlength="500" data-vni-ph="VD: đi với bố mẹ, thích yên tĩnh, ăn đặc sản" placeholder="' + esc(placeholder) + '" data-vni-aria="Tin nhắn" aria-label="' + esc(T('Tin nhắn')) + '">' +
      '<button type="submit" id="vnchat-send" data-vni-k="Gửi">' + esc(T('Gửi')) + '</button></form></section>';
    while (wrap.firstChild) document.body.appendChild(wrap.firstChild);

    els.fab = document.getElementById('vnchat-fab');
    els.panel = document.getElementById('vnchat-panel');
    els.log = document.getElementById('vnchat-log');
    els.input = document.getElementById('vnchat-input');
    els.send = document.getElementById('vnchat-send');

    els.fab.addEventListener('click', function () { toggle(); });
    document.getElementById('vnchat-close').addEventListener('click', function () { toggle(false); });
    document.getElementById('vnchat-minimize').addEventListener('click', function () { toggle(false); });
    document.getElementById('vnchat-form').addEventListener('submit', function (e) { e.preventDefault(); send(els.input.value); });

    var suggest = document.getElementById('vnchat-suggest');
    var lang = document.documentElement.lang === 'en' ? 'en' : 'vi';
    var txt = (window.VNChat && window.VNChat.TEXT && window.VNChat.TEXT[lang]) || {};
    
    if (txt.chips && txt.chips.length) {
      txt.chips.forEach(function (chip) {
        var b = document.createElement('button');
        b.type = 'button';
        b.textContent = chip.label;
        b.addEventListener('click', function () { send(chip.q); });
        suggest.appendChild(b);
      });
    } else {
      ['Đi với bố mẹ, thích yên tĩnh', 'Thích biển và hải sản', 'Thích trekking, cắm trại'].forEach(function (vi) {
        var b = document.createElement('button');
        b.type = 'button';
        b.setAttribute('data-vni-k', vi);
        b.textContent = T(vi);
        b.addEventListener('click', function () { send(T(vi)); });
        suggest.appendChild(b);
      });
    }

    var greetingMsg = txt.greeting || T('Chào bạn! Hãy kể mình nghe về chuyến đi: đi với ai, thích gì, muốn nhẹ nhàng hay năng động. Mình sẽ điều chỉnh gợi ý lịch trình cho phù hợp.');
    var greet = addMsg('bot', esc(greetingMsg));
    // Dùng data-vni-k tạm bằng nội dung gốc nếu không có txt.greeting
    if (!txt.greeting) greet.setAttribute('data-vni-k', greetingMsg);
    if (window.lucide && window.lucide.createIcons) window.lucide.createIcons();
  }

  function updateChatLang(lang) {
    if (!window.VNChat || !window.VNChat.TEXT) return;
    var txt = window.VNChat.TEXT[lang] || window.VNChat.TEXT.vi || {};
    
    var headTitle = document.querySelector('.vnchat-head h3');
    if (headTitle && txt.title) headTitle.textContent = txt.title;
    
    if (els.input && txt.placeholder) els.input.placeholder = txt.placeholder;
    
    var suggest = document.getElementById('vnchat-suggest');
    if (suggest && txt.chips && txt.chips.length) {
      suggest.innerHTML = '';
      txt.chips.forEach(function (chip) {
        var b = document.createElement('button');
        b.type = 'button';
        b.textContent = chip.label;
        b.addEventListener('click', function () { send(chip.q); });
        suggest.appendChild(b);
      });
    }

    if (history.length === 0 && els.log && els.log.firstChild && txt.greeting) {
       els.log.firstChild.innerHTML = esc(txt.greeting);
    }
  }

  var observer = new MutationObserver(function(mutations) {
    mutations.forEach(function(mutation) {
      if (mutation.attributeName === 'lang') {
        var newLang = document.documentElement.lang === 'en' ? 'en' : 'vi';
        updateChatLang(newLang);
      }
    });
  });
  observer.observe(document.documentElement, { attributes: true, attributeFilter: ['lang'] });

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', build);
  else build();
})();
