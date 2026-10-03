/**
 * VNFinder — Trợ lý du lịch AI (Chatbot)
 *
 * Hỗ trợ 3 phương thức linh hoạt:
 *   1. Cloudflare Worker Proxy: bảo mật API key trên máy chủ (worker/worker.js).
 *   2. Gọi trực tiếp Google Gemini API (gemini-2.5-flash) từ trình duyệt bằng API Key cá nhân.
 *   3. Bộ phân tích từ khóa ngoại tuyến (Offline fallback): hoạt động độc lập ngay cả khi không có mạng.
 */
(function () {
  'use strict';

  var STORAGE_KEY_GEMINI = 'vnfinder_gemini_api_key';
  var STORAGE_KEY_WORKER = 'vnfinder_worker_url';
  var STORAGE_KEY_MODEL = 'vnfinder_gemini_model';

  var TIMEOUT_MS = 25000;
  var MAX_HISTORY = 8;
  var DEFAULT_MODEL = 'gemini-2.5-flash';

  var history = [];
  var busy = false;
  var els = {};

  function esc(s) {
    return String(s || '').replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }

  function getStoredApiKey() {
    return (window.GEMINI_API_KEY || localStorage.getItem(STORAGE_KEY_GEMINI) || '').trim();
  }

  function getStoredWorkerUrl() {
    return (window.VNFINDER_CHAT_URL || localStorage.getItem(STORAGE_KEY_WORKER) || '').trim();
  }

  function getStoredModel() {
    return localStorage.getItem(STORAGE_KEY_MODEL) || DEFAULT_MODEL;
  }

  function getActiveMode() {
    var worker = getStoredWorkerUrl();
    if (worker) return { mode: 'worker', label: 'Cloudflare Worker', detail: worker };
    var key = getStoredApiKey();
    if (key) return { mode: 'gemini', label: 'Gemini API (Trực tiếp)', detail: key.slice(0, 6) + '••••' + key.slice(-4) };
    return { mode: 'offline', label: 'Chế độ Ngoại tuyến', detail: 'Tự động phân tích từ khóa' };
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

    if (normT.indexOf('mua nao') !== -1 || normT.indexOf('thoi tiet') !== -1 || normT.indexOf('season') !== -1 || normT.indexOf('weather') !== -1) {
      var rep = lang === 'en' ? 'Central Vietnam (Da Nang, Quy Nhon, Nha Trang...) is best visited during the dry season (January - August) with clear skies and calm seas. From September to December is usually the rainy/typhoon season, so please check the forecast before going!' : 'Thời tiết miền Trung (Đà Nẵng, Quy Nhơn, Nha Trang...) đẹp nhất vào mùa khô (tháng 1 - tháng 8). Từ tháng 9 - tháng 12 thường có mưa bão, bạn nên xem trước dự báo thời tiết nhé!';
      return { reply: rep, profile: { prefs: [], boost: {}, avoid: [], intensity: 'normal', notes: '' }, alternatives: [] };
    }
    if (normT.indexOf('check-in la gi') !== -1 || normT.indexOf('check-in dung') !== -1 || normT.indexOf('tinh nang check-in') !== -1 || normT.indexOf('what is check-in') !== -1) {
      var rep2 = lang === 'en' ? 'The Check-in feature on VNFinder helps you mark the places you have visited on the map, like a miniature travel diary. You can open the "Check-in" tab to explore! [[go:checkin]]' : 'Tính năng Check-in trên VNFinder giúp bạn đánh dấu lại các địa danh đã ghé thăm trên bản đồ, như một cuốn nhật ký du lịch thu nhỏ. Bạn có thể mở tab "Check-in" để khám phá! [[go:checkin]]';
      return { reply: rep2, profile: { prefs: [], boost: {}, avoid: [], intensity: 'normal', notes: '' }, alternatives: [] };
    }
    if (normT.indexOf('lich trinh 3 ngay') !== -1 || normT.indexOf('goi y lich trinh') !== -1 || normT.indexOf('3-day') !== -1 || normT.indexOf('itinerary') !== -1) {
      var rep3 = lang === 'en' ? 'To create an itinerary, just open the "Itinerary" tab, type a destination (e.g., Da Lat, Quy Nhon), choose the number of nights, and select your preferences. I will automatically arrange the most optimal sightseeing spots for you! [[go:itinerary]]' : 'Để tạo lịch trình, bạn chỉ cần mở tab "Lịch trình", chọn điểm đến (VD: Đà Lạt, Quy Nhơn), chọn số đêm và chọn các sở thích của bạn. Mình sẽ tự động sắp xếp điểm tham quan tối ưu nhất! [[go:itinerary]]';
      return { reply: rep3, profile: { prefs: [], boost: {}, avoid: [], intensity: 'normal', notes: '' }, alternatives: [] };
    }
    if ((normT.indexOf('an gi') !== -1 || normT.indexOf('food') !== -1 || normT.indexOf('eat') !== -1) && normT.indexOf('hue') !== -1) {
      var rep4 = lang === 'en' ? 'In Hue, you must try: Hue beef noodle soup (Bun bo Hue), steamed flat rice dumplings (banh nam), water fern cake (banh beo), tapioca dumplings (banh bot loc), mussel rice, and alley sweet soup. Wishing you a delicious food tour!' : 'Đến Huế bạn nhất định phải thử: Bún bò Huế, bánh nậm, bánh bèo, bánh bột lọc, cơm hến và chè hẻm nhé. Chúc bạn có một chuyến food-tour thật ngon miệng!';
      return { reply: rep4, profile: { prefs: [], boost: {}, avoid: [], intensity: 'normal', notes: '' }, alternatives: [] };
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
    avoid = avoid.filter(function (p) { return prefs.indexOf(p) === -1; });
    prefs.forEach(function (p) { boost[p] = 1.5; });

    var parts = [];
    if (prefs.length) parts.push(lang === 'en' ? T('prefer {tags}', { tags: prefs }) : T('ưu tiên {tags}', { tags: prefs }));
    if (avoid.length) parts.push(lang === 'en' ? T('avoid {tags}', { tags: avoid }) : T('hạn chế {tags}', { tags: avoid }));
    if (intensity === 'low') parts.push(lang === 'en' ? 'relaxed pace' : 'nhịp độ nhẹ nhàng');
    if (intensity === 'high') parts.push(lang === 'en' ? 'active pace' : 'nhịp độ năng động');

    var K = (lang === 'en' && window.VN_CHAT_KNOWLEDGE_EN) ? window.VN_CHAT_KNOWLEDGE_EN : (window.VN_CHAT_KNOWLEDGE || {});
    var suggestions = Object.keys(K).filter(function(k) { return normT.indexOf(k) !== -1; }).slice(0, 2);
    var knowledgeReply = suggestions.length ? suggestions.map(function(k) { return K[k]; }).join('\n\n') : '';

    var reply = '';
    if (knowledgeReply) {
      reply = knowledgeReply + (parts.length ? '\n\n' : '');
    }

    if (parts.length) {
      var recStr = lang === 'en' ? 'I have noted: {parts}. Please select a destination and dates, then create the itinerary. [[go:itinerary]]' : 'Mình đã ghi nhận: {parts}. Bạn chọn điểm và ngày đi rồi tạo lịch trình nhé. [[go:itinerary]]';
      reply += T(recStr, { parts: parts.join('; ') });
    } else if (!knowledgeReply) {
      reply = lang === 'en' ? 'I didn\'t catch any specific preferences. Could you elaborate? E.g., "love the beach, seafood, traveling with parents".' : 'Mình chưa bắt được sở thích cụ thể. Bạn thử nói rõ hơn, ví dụ "thích biển, ăn hải sản, đi với bố mẹ".';
    }

    return { reply: reply, profile: { prefs: prefs, boost: boost, avoid: avoid, intensity: intensity, notes: '' }, alternatives: [] };
  }

  /* ---------------- Ngữ cảnh gửi kèm (RAG & Trip data) ---------------- */
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
          var searchQ = (window.VNChatTrip && typeof window.VNChatTrip.expandQuery === 'function')
            ? window.VNChatTrip.expandQuery(query)
            : query;
          ctx.candidates = window.VNScoring.retrieve(searchQ, pool, 12).map(function (c) {
            return { name: c.item.dish || c.item.name, kind: c.item.dish ? 'món ăn' : 'địa danh', desc: String(c.item.desc || '').slice(0, 140) };
          });
        }
      }
      if (window.VNChatTrip && typeof window.VNChatTrip.collect === 'function') {
        ctx.trip = window.VNChatTrip.collect();
      }
    } catch (e) { /* an toàn khi thiếu state */ }
    return ctx;
  }

  /* ---------------- Gọi Cloudflare Worker Proxy ---------------- */
  function callServer(workerUrl, userText) {
    var ctrl = new AbortController();
    var timer = setTimeout(function () { ctrl.abort(); }, TIMEOUT_MS);
    var body = {
      message: userText,
      messages: history.slice(-MAX_HISTORY).map(function (m) {
        return { role: m.role === 'model' ? 'assistant' : m.role, content: m.content };
      }).concat([{ role: 'user', content: userText }]),
      context: buildContext(userText)
    };
    if (window.VNChat && window.VNChat.buildSystem) {
      body.system = window.VNChat.buildSystem(userText);
    }
    return fetch(workerUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
      signal: ctrl.signal
    }).then(function (res) {
      clearTimeout(timer);
      if (!res.ok) throw new Error('Worker trả về HTTP ' + res.status);
      return res.json();
    }).catch(function (err) {
      clearTimeout(timer);
      throw err;
    });
  }

  /* ---------------- Gọi Trực Tiếp Google Gemini API ---------------- */
  function callGeminiDirect(apiKey, userText) {
    var ctrl = new AbortController();
    var timer = setTimeout(function () { ctrl.abort(); }, TIMEOUT_MS);
    var model = getStoredModel();
    var url = 'https://generativelanguage.googleapis.com/v1beta/models/' + encodeURIComponent(model) + ':generateContent?key=' + encodeURIComponent(apiKey);

    var contextData = buildContext(userText);
    var baseSystem = (window.VNChat && window.VNChat.buildSystem)
      ? window.VNChat.buildSystem(userText)
      : 'Bạn là trợ lý du lịch VNFinder, hỗ trợ du lịch Việt Nam.';

    var systemInstructionText = baseSystem + '\n\n' +
      'NGỮ CẢNH DỮ LIỆU CHUYẾN ĐI (JSON):\n' + JSON.stringify(contextData) + '\n\n' +
      'QUY TẮC:\n' +
      '1. Trả về JSON theo đúng định dạng được yêu cầu.\n' +
      '2. Khi khách gặp sự cố thời tiết (mưa, bão) hoặc sức khỏe (mệt, ốm) hoặc thời gian (trễ giờ), hãy đề xuất 1-3 phương án thay thế trong "alternatives".\n' +
      '3. Nếu người dùng muốn mở tab, thêm thẻ [[go:itinerary]], [[go:maps]], [[go:guide]], hoặc [[go:checkin]] ở cuối câu trả lời.\n' +
      '4. Trả lời thân thiện, súc tích, cùng ngôn ngữ với khách.';

    var contents = history.slice(-MAX_HISTORY).map(function (m) {
      return {
        role: m.role === 'assistant' ? 'model' : (m.role === 'model' ? 'model' : 'user'),
        parts: [{ text: String(m.content).slice(0, 1500) }]
      };
    });
    contents.push({
      role: 'user',
      parts: [{ text: userText }]
    });

    var schema = {
      type: "OBJECT",
      properties: {
        reply: { type: "STRING", description: "Lời đáp thân thiện, súc tích" },
        risk: { type: "STRING", enum: ["none", "low", "medium", "high"] },
        alternatives: {
          type: "ARRAY",
          items: {
            type: "OBJECT",
            properties: {
              title: { type: "STRING" },
              day: { type: "INTEGER" },
              slot: { type: "STRING" },
              replaces: { type: "STRING" },
              new_plan: { type: "STRING" },
              reason: { type: "STRING" },
              extra_time_min: { type: "INTEGER" },
              indoor: { type: "BOOLEAN" },
              generic: { type: "BOOLEAN" }
            },
            required: ["title", "new_plan"]
          }
        },
        unchanged: { type: "STRING" },
        profile: {
          type: "OBJECT",
          properties: {
            prefs: { type: "ARRAY", items: { type: "STRING" } },
            avoid: { type: "ARRAY", items: { type: "STRING" } },
            intensity: { type: "STRING", enum: ["low", "normal", "high"] },
            notes: { type: "STRING" }
          }
        }
      },
      required: ["reply"]
    };

    return fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        system_instruction: { parts: [{ text: systemInstructionText }] },
        contents: contents,
        generationConfig: {
          temperature: 0.4,
          maxOutputTokens: 2048,
          responseMimeType: "application/json",
          responseSchema: schema
        }
      }),
      signal: ctrl.signal
    }).then(function (res) {
      clearTimeout(timer);
      if (!res.ok) {
        return res.text().then(function (raw) {
          var err;
          try { err = JSON.parse(raw); } catch (e) {}
          var msg = (err && err.error && err.error.message) || ('Gemini HTTP ' + res.status);
          throw new Error(msg);
        });
      }
      return res.json();
    }).then(function (data) {
      var cand = data.candidates && data.candidates[0];
      var text = ((cand && cand.content && cand.content.parts) || []).map(function (p) { return p.text || ''; }).join('');
      var parsed;
      try {
        parsed = JSON.parse(text);
      } catch (e) {
        var a = text.indexOf('{'), b = text.lastIndexOf('}');
        if (a !== -1 && b > a) {
          try { parsed = JSON.parse(text.slice(a, b + 1)); } catch (e2) {}
        }
      }
      if (!parsed || typeof parsed.reply !== 'string') {
        return { reply: text || 'Mình chưa có câu trả lời cho nội dung này.', profile: {}, alternatives: [] };
      }
      return parsed;
    }).catch(function (err) {
      clearTimeout(timer);
      throw err;
    });
  }

  /* ---------------- Kiểm tra + áp hồ sơ vào ứng dụng ---------------- */
  function sanitizeProfile(p) {
    var valid = window.VNScoring ? window.VNScoring.TAGS : [
      'bien', 'nuirung', 'amthuc', 'disan', 'songnuoc', 'vanhoa', 'camtrai', 'checkin', 'sinhthai', 'giaitri'
    ];
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
    out.avoid = out.avoid.filter(function (t) { return out.prefs.indexOf(t) === -1; });
    return out;
  }

  function applyProfile(profile) {
    if (typeof state === 'undefined') return;
    state.profile = { boost: profile.boost, avoid: profile.avoid, intensity: profile.intensity, notes: profile.notes };
    if (profile.prefs.length) {
      document.querySelectorAll('.tag[data-tag]').forEach(function (btn) {
        var tag = btn.getAttribute('data-tag');
        var want = profile.prefs.indexOf(tag) !== -1;
        var isOn = (state.selectedPrefs || []).indexOf(tag) !== -1;
        if (want !== isOn) btn.click();
      });
    }
  }

  /* ---------------- Trích xuất thẻ điều hướng [[go:...]] ---------------- */
  function extractNavTags(text) {
    var navs = [];
    var cleaned = String(text || '').replace(/\[\[go:(itinerary|maps|guide|checkin|home|about)\]\]/gi, function (_, target) {
      target = target.toLowerCase();
      if (navs.indexOf(target) === -1) navs.push(target);
      return '';
    }).trim();
    return { text: cleaned, navs: navs };
  }

  function handleNavClick(target) {
    var panelMap = {
      itinerary: 'panel-lich-trinh',
      maps: 'panel-maps',
      guide: 'panel-guide',
      checkin: 'panel-checkin',
      home: 'panel-home',
      about: 'panel-about'
    };
    var panelId = panelMap[target];
    if (panelId) {
      var tabBtn = document.querySelector('.sh-tab[data-panel="' + panelId + '"]');
      if (tabBtn) {
        tabBtn.click();
      }
    }
  }

  /* ---------------- Giao diện tin nhắn ---------------- */
  function addMsg(role, html, cls) {
    var div = document.createElement('div');
    div.className = 'vnchat-msg ' + role + (cls ? ' ' + cls : '');
    div.innerHTML = html;
    els.log.appendChild(div);
    els.log.scrollTop = els.log.scrollHeight;
    return div;
  }

  function renderBotReply(data, onDone) {
    var profile = sanitizeProfile(data && data.profile);
    var rawReply = (data && typeof data.reply === 'string' && data.reply.trim()) || T('Mình đã cập nhật nhu cầu của bạn.');
    var parsed = extractNavTags(rawReply);
    var replyText = parsed.text;
    var navTargets = parsed.navs;

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
      if (window.VNI18n) window.VNI18n.set(btn, 'Tạo lịch trình theo nhu cầu này');
      else btn.textContent = 'Tạo lịch trình theo nhu cầu này';
      btn.addEventListener('click', function () { gen.click(); toggle(false); });
    }

    var node = addMsg('bot', '');

    // Cảnh báo nếu có
    if (data && data.warning) {
      var warnEl = document.createElement('div');
      warnEl.className = 'vnchat-warning-banner';
      warnEl.textContent = data.warning;
      node.appendChild(warnEl);
    }

    // Mức độ rủi ro (khi có sự cố bão, sức khỏe)
    if (data && (data.risk === 'high' || data.risk === 'medium' || data.risk === 'low')) {
      var riskLabel = {
        high: '⚠️ Cảnh báo an toàn cao',
        medium: '⚠️ Cần lưu ý điều kiện thực tế',
        low: 'ℹ️ Cần chú ý nhẹ'
      }[data.risk];
      var riskBadge = document.createElement('div');
      riskBadge.className = 'vnchat-risk-badge vnchat-risk-' + data.risk;
      riskBadge.textContent = riskLabel;
      node.appendChild(riskBadge);
    }

    var textNode = document.createElement('span');
    node.appendChild(textNode);

    var chars = replyText.split('');
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
        setTimeout(typeNext, 18);
      } else {
        // Đính kèm các nút điều hướng nhanh
        if (navTargets.length) {
          var navWrap = document.createElement('div');
          navWrap.className = 'vnchat-nav-actions';
          var navLabels = {
            itinerary: '🗓️ Mở Lịch trình',
            maps: '🗺️ Mở Bản đồ',
            guide: '🧭 Mở Cẩm nang',
            checkin: '📍 Mở Check-in',
            home: '🏠 Về Trang chủ',
            about: 'ℹ️ Về VNFinder'
          };
          navTargets.forEach(function (tgt) {
            var nbtn = document.createElement('button');
            nbtn.type = 'button';
            nbtn.className = 'vnchat-nav-btn';
            nbtn.textContent = navLabels[tgt] || ('Mở ' + tgt);
            nbtn.addEventListener('click', function () {
              handleNavClick(tgt);
            });
            navWrap.appendChild(nbtn);
          });
          node.appendChild(navWrap);
        }

        // Đính kèm các thẻ phương án thay thế sự cố (nếu có)
        if (data && data.alternatives && data.alternatives.length > 0 && window.VNChatTrip && window.VNChatTrip.renderAlternatives) {
          var altsCard = window.VNChatTrip.renderAlternatives(data.alternatives, function (alt) {
            addMsg('bot', '✅ <b>Đã áp dụng phương án:</b> ' + esc(alt.title) + ' vào lịch trình của bạn!');
          });
          node.appendChild(altsCard);
        }

        // Thông báo phần lịch trình giữ nguyên
        if (data && data.unchanged) {
          var unch = document.createElement('div');
          unch.className = 'vnchat-unchanged';
          unch.textContent = '✅ Giữ nguyên: ' + data.unchanged;
          node.appendChild(unch);
        }

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
      var replyScope = txt.outOfScope || T('Mình chỉ rành về du lịch Việt Nam thôi 😅 Bạn thử hỏi về điểm đến, lịch trình hoặc ẩm thực nhé!');
      history.push({ role: 'assistant', content: replyScope });
      renderBotReply({ reply: replyScope, profile: { prefs: [], avoid: [], intensity: 'normal', notes: '' } }, function () {
        busy = false;
        els.send.disabled = false;
        els.input.focus();
      });
      return;
    }

    var typingMsg = txt.typing || T('Đang suy nghĩ...');
    var typing = addMsg('bot', esc(typingMsg), 'typing');

    var workerUrl = getStoredWorkerUrl();
    var apiKey = getStoredApiKey();

    var run;
    if (workerUrl) {
      run = callServer(workerUrl, text);
    } else if (apiKey) {
      run = callGeminiDirect(apiKey, text);
    } else {
      run = Promise.resolve(localParse(text));
    }

    run.catch(function (err) {
      console.warn('[VNFinder Chat] Gọi API thất bại, chuyển sang bộ phân tích dự phòng:', err);
      var fallbackData = localParse(text);
      if (workerUrl || apiKey) {
        fallbackData.warning = '⚠️ Không thể kết nối tới AI API (' + (err.message || 'Lỗi mạng') + '). Đang tạm dùng phản hồi cục bộ.';
      }
      return fallbackData;
    }).then(function (data) {
      var profile = sanitizeProfile(data && data.profile);
      var reply = (data && typeof data.reply === 'string' && data.reply.trim()) || T('Mình đã cập nhật nhu cầu của bạn.');
      typing.remove();
      applyProfile(profile);
      history.push({ role: 'assistant', content: reply });
      return new Promise(function (resolve) {
        renderBotReply(data, resolve);
      });
    }).then(function () {
      busy = false;
      els.send.disabled = false;
      els.input.focus();
    }).catch(function (err) {
      console.error(err);
      typing.remove();
      addMsg('bot', '⚠️ Có lỗi xảy ra: ' + esc(err.message || err));
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
      updateStatusUI();
    } else {
      els.fab.innerHTML = '<i data-lucide="message-circle"></i>';
      toggleSettings(false);
    }
    if (window.lucide && window.lucide.createIcons) window.lucide.createIcons({ root: els.fab });
  }

  function toggleSettings(open) {
    var drawer = document.getElementById('vnchat-settings-drawer');
    if (!drawer) return;
    var isOpen = open === undefined ? drawer.hidden : !open;
    drawer.hidden = !isOpen;
    if (isOpen) {
      updateStatusUI();
      var keyInput = document.getElementById('vnchat-key-input');
      var workerInput = document.getElementById('vnchat-worker-input');
      if (keyInput) keyInput.value = localStorage.getItem(STORAGE_KEY_GEMINI) || '';
      if (workerInput) workerInput.value = localStorage.getItem(STORAGE_KEY_WORKER) || '';
    }
  }

  function updateStatusUI() {
    var mode = getActiveMode();
    var dot = document.getElementById('vnchat-status-dot');
    var modeEl = document.getElementById('vnchat-status-mode');
    var detailEl = document.getElementById('vnchat-status-detail');
    if (dot) {
      dot.className = 'vnchat-status-dot ' + (mode.mode === 'offline' ? 'offline' : (mode.mode === 'worker' ? 'worker' : ''));
    }
    if (modeEl) modeEl.textContent = mode.label;
    if (detailEl) detailEl.textContent = mode.detail;
  }

  function testConnection() {
    var resEl = document.getElementById('vnchat-test-result');
    var btn = document.getElementById('vnchat-test-btn');
    if (!resEl || !btn) return;

    resEl.hidden = false;
    resEl.className = 'vnchat-test-result';
    resEl.textContent = 'Đang kiểm tra kết nối...';
    btn.disabled = true;

    var workerUrl = getStoredWorkerUrl();
    var apiKey = getStoredApiKey();

    if (workerUrl) {
      fetch(workerUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: 'ping test',
          messages: [{ role: 'user', content: 'Chào bạn, đây là tin nhắn thử kết nối API.' }],
          context: { destination: 'Quy Nhơn' }
        })
      }).then(function (res) {
        if (!res.ok) throw new Error('Worker trả về mã lỗi HTTP ' + res.status);
        return res.json();
      }).then(function (d) {
        resEl.className = 'vnchat-test-result success';
        resEl.textContent = '✅ Kết nối Cloudflare Worker thành công! AI sẵn sàng phản hồi.';
        btn.disabled = false;
        updateStatusUI();
      }).catch(function (e) {
        resEl.className = 'vnchat-test-result error';
        resEl.textContent = '❌ Lỗi kết nối Worker: ' + (e.message || e);
        btn.disabled = false;
      });
    } else if (apiKey) {
      var model = getStoredModel();
      var url = 'https://generativelanguage.googleapis.com/v1beta/models/' + encodeURIComponent(model) + ':generateContent?key=' + encodeURIComponent(apiKey);
      fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ role: 'user', parts: [{ text: 'Trả về chuỗi JSON ngắn: {"reply":"Xin chào"}' }] }],
          generationConfig: { maxOutputTokens: 50 }
        })
      }).then(function (res) {
        if (!res.ok) {
          return res.text().then(function (t) {
            var j;
            try { j = JSON.parse(t); } catch (_) {}
            throw new Error((j && j.error && j.error.message) || ('HTTP ' + res.status));
          });
        }
        return res.json();
      }).then(function () {
        resEl.className = 'vnchat-test-result success';
        resEl.textContent = '✅ Kết nối Google Gemini API thành công! Mô hình ' + model + ' đã sẵn sàng.';
        btn.disabled = false;
        updateStatusUI();
      }).catch(function (e) {
        resEl.className = 'vnchat-test-result error';
        resEl.textContent = '❌ Lỗi kết nối Gemini API: ' + (e.message || e);
        btn.disabled = false;
      });
    } else {
      resEl.className = 'vnchat-test-result';
      resEl.textContent = 'ℹ️ Chưa cấu hình API Key hoặc Worker URL. Chatbot đang hoạt động ở chế độ ngoại tuyến.';
      btn.disabled = false;
      updateStatusUI();
    }
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
      '<button type="button" class="vnchat-settings-btn" id="vnchat-settings-btn" title="Cài đặt kết nối AI API" aria-label="Cài đặt kết nối AI API"><i data-lucide="settings"></i></button>' +
      '<button type="button" class="vnchat-minimize" id="vnchat-minimize" data-vni-aria="Thu nhỏ" aria-label="' + esc(T('Thu nhỏ')) + '">&minus;</button>' +
      '<button type="button" class="vnchat-close" id="vnchat-close" data-vni-aria="Đóng" aria-label="' + esc(T('Đóng')) + '">&times;</button>' +
      '</div></header>' +

      '<!-- Bảng Cài đặt API -->' +
      '<div class="vnchat-settings-drawer" id="vnchat-settings-drawer" hidden>' +
      '  <div class="vnchat-settings-head">' +
      '    <h4>Cấu hình AI Chatbot</h4>' +
      '    <button type="button" id="vnchat-settings-close" class="vnchat-settings-close-btn" aria-label="Đóng">&times;</button>' +
      '  </div>' +
      '  <div class="vnchat-settings-body">' +
      '    <div class="vnchat-status-card" id="vnchat-status-card">' +
      '      <div class="vnchat-status-dot" id="vnchat-status-dot"></div>' +
      '      <div class="vnchat-status-text">' +
      '        <strong id="vnchat-status-mode">Chế độ</strong>' +
      '        <span id="vnchat-status-detail">Chi tiết</span>' +
      '      </div>' +
      '    </div>' +
      '    <div class="vnchat-setting-group">' +
      '      <label for="vnchat-key-input"><strong>Google Gemini API Key</strong><a href="https://aistudio.google.com/apikey" target="_blank" rel="noopener">Lấy key miễn phí ↗</a></label>' +
      '      <div class="vnchat-input-row">' +
      '        <input type="password" id="vnchat-key-input" placeholder="AIzaSy..." autocomplete="off">' +
      '        <button type="button" id="vnchat-key-toggle-show" title="Hiện/Ẩn">👁️</button>' +
      '      </div>' +
      '      <div class="vnchat-btn-row">' +
      '        <button type="button" id="vnchat-key-save" class="vnchat-btn-primary">Lưu API Key</button>' +
      '        <button type="button" id="vnchat-key-clear" class="vnchat-btn-ghost">Xóa Key</button>' +
      '      </div>' +
      '    </div>' +
      '    <div class="vnchat-setting-group">' +
      '      <label for="vnchat-worker-input"><strong>Cloudflare Worker URL</strong><small>Proxy bảo mật trên server</small></label>' +
      '      <input type="url" id="vnchat-worker-input" placeholder="https://vnfinder-chat.workers.dev" autocomplete="off">' +
      '      <div class="vnchat-btn-row">' +
      '        <button type="button" id="vnchat-worker-save" class="vnchat-btn-primary">Lưu URL</button>' +
      '        <button type="button" id="vnchat-worker-clear" class="vnchat-btn-ghost">Xóa URL</button>' +
      '      </div>' +
      '    </div>' +
      '    <div class="vnchat-setting-group">' +
      '      <button type="button" id="vnchat-test-btn" class="vnchat-btn-test">⚡ Kiểm tra kết nối</button>' +
      '      <div id="vnchat-test-result" class="vnchat-test-result" hidden></div>' +
      '    </div>' +
      '  </div>' +
      '</div>' +

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

    // Cài đặt API
    var btnSettings = document.getElementById('vnchat-settings-btn');
    if (btnSettings) btnSettings.addEventListener('click', function () { toggleSettings(); });
    var btnCloseSettings = document.getElementById('vnchat-settings-close');
    if (btnCloseSettings) btnCloseSettings.addEventListener('click', function () { toggleSettings(false); });

    var keyInput = document.getElementById('vnchat-key-input');
    var btnToggleKey = document.getElementById('vnchat-key-toggle-show');
    if (btnToggleKey && keyInput) {
      btnToggleKey.addEventListener('click', function () {
        keyInput.type = keyInput.type === 'password' ? 'text' : 'password';
      });
    }

    var btnSaveKey = document.getElementById('vnchat-key-save');
    if (btnSaveKey && keyInput) {
      btnSaveKey.addEventListener('click', function () {
        var k = keyInput.value.trim();
        if (k) {
          localStorage.setItem(STORAGE_KEY_GEMINI, k);
          alert('Đã lưu Google Gemini API Key!');
        } else {
          localStorage.removeItem(STORAGE_KEY_GEMINI);
        }
        updateStatusUI();
      });
    }

    var btnClearKey = document.getElementById('vnchat-key-clear');
    if (btnClearKey && keyInput) {
      btnClearKey.addEventListener('click', function () {
        localStorage.removeItem(STORAGE_KEY_GEMINI);
        keyInput.value = '';
        alert('Đã xóa Gemini API Key.');
        updateStatusUI();
      });
    }

    var workerInput = document.getElementById('vnchat-worker-input');
    var btnSaveWorker = document.getElementById('vnchat-worker-save');
    if (btnSaveWorker && workerInput) {
      btnSaveWorker.addEventListener('click', function () {
        var u = workerInput.value.trim();
        if (u) {
          localStorage.setItem(STORAGE_KEY_WORKER, u);
          alert('Đã lưu Cloudflare Worker URL!');
        } else {
          localStorage.removeItem(STORAGE_KEY_WORKER);
        }
        updateStatusUI();
      });
    }

    var btnClearWorker = document.getElementById('vnchat-worker-clear');
    if (btnClearWorker && workerInput) {
      btnClearWorker.addEventListener('click', function () {
        localStorage.removeItem(STORAGE_KEY_WORKER);
        workerInput.value = '';
        alert('Đã xóa Cloudflare Worker URL.');
        updateStatusUI();
      });
    }

    var btnTest = document.getElementById('vnchat-test-btn');
    if (btnTest) {
      btnTest.addEventListener('click', testConnection);
    }

    var suggest = document.getElementById('vnchat-suggest');
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
    if (!txt.greeting) greet.setAttribute('data-vni-k', greetingMsg);
    if (window.lucide && window.lucide.createIcons) window.lucide.createIcons();

    updateStatusUI();
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

  var observer = new MutationObserver(function (mutations) {
    mutations.forEach(function (mutation) {
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
