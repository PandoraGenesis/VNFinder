/**
 * VNFinder — tab "Cẩm nang" (Bách khoa toàn thư Việt Nam)
 *
 * 1) Ảnh minh họa cho lưới "Bạn có biết": lấy trực tiếp từ Wikipedia tiếng
 *    Việt (MediaWiki Action API, prop=pageimages) — không dùng ảnh tĩnh
 *    trong assets/img của dự án (trừ khi thẻ đã được gắn sẵn ảnh thủ công
 *    trong HTML, lúc đó JS sẽ bỏ qua, không ghi đè).
 * 2) Ô tìm kiếm: lọc các thẻ "Bạn có biết" theo từ khóa gõ vào; nếu không
 *    có thẻ nào khớp, sau một nhịp ngừng gõ ngắn (debounce ~600ms), trang
 *    TỰ ĐỘNG tra cứu Wikipedia và hiển thị luôn một bài viết cho địa danh
 *    đó — không cần bấm Enter, và không thêm thẻ mới vào lưới cố định.
 * 3) Định vị thiết bị (Geolocation API) + Wikipedia geosearch: khi người
 *    dùng ở gần một địa danh có bài trên Wikipedia (bán kính 3km), lưới
 *    "Bạn có biết" được ẩn đi và một bài giới thiệu địa danh đó (kèm ảnh,
 *    tóm tắt, nguồn) được hiển thị thay thế.
 * 4) Ảnh cho bài viết theo vị trí/tìm kiếm: nếu trang Wikipedia không có
 *    sẵn ảnh đại diện, tự động tìm thêm trên Wikimedia Commons rồi tới
 *    Openverse (kho ảnh cấp phép mở tổng hợp từ nhiều nguồn Internet), có
 *    đối chiếu từ khóa với tên bài trước khi chấp nhận một ảnh.
 * 5) Song ngữ: khi giao diện chuyển sang EN, bài viết theo vị trí/tìm kiếm
 *    sẽ được tải lại từ bản tiếng Anh của Wikipedia (thông qua langlinks
 *    liên kết từ bài tiếng Việt gốc) để đảm bảo nội dung được dịch trọn
 *    vẹn; nếu bài đó chưa có bản tiếng Anh, nội dung tiếng Việt gốc vẫn
 *    được giữ. Nội dung tĩnh của các thẻ "Bạn có biết" được dịch qua từ
 *    điển dùng chung trong js/i18n.js như phần còn lại của trang.
 */
(function () {
  'use strict';

  const WIKI_API = 'https://vi.wikipedia.org/w/api.php';
  const WIKI_API_EN = 'https://en.wikipedia.org/w/api.php';
  const COMMONS_API = 'https://commons.wikimedia.org/w/api.php';
  const OPENVERSE_API = 'https://api.openverse.org/v1/images/';

  function wikiFetch(apiBase, params) {
    const url = new URL(apiBase);
    params.format = 'json';
    params.formatversion = '2';
    params.origin = '*';
    Object.keys(params).forEach(function (k) {
      url.searchParams.set(k, params[k]);
    });
    return fetch(url.toString()).then(function (res) {
      if (!res.ok) throw new Error('Wikipedia API error: ' + res.status);
      return res.json();
    });
  }

  function escapeHtml(str) {
    const div = document.createElement('div');
    div.textContent = str == null ? '' : String(str);
    return div.innerHTML;
  }

  // ===================================================================
  // Ảnh bổ sung từ Internet khi trang Wikipedia không có sẵn ảnh đại diện
  // — dùng cho bài viết theo vị trí/tìm kiếm (không áp dụng cho lưới 6 thẻ
  // tĩnh, vốn đã có fallback riêng). Thử lần lượt Wikimedia Commons rồi
  // Openverse (kho ảnh được cấp phép mở, tổng hợp từ nhiều nguồn trên
  // Internet), và chỉ chấp nhận kết quả nào có tiêu đề/nhãn trùng ít nhất
  // một từ khóa chính với tên bài viết — một bước đối chiếu tự động để
  // giảm rủi ro gắn nhầm ảnh không liên quan, trước khi hiển thị cho
  // người dùng.
  function normalizeKeywords(str) {
    return (str || '')
      .toLowerCase()
      .normalize('NFD').replace(/[\u0300-\u036f]/g, '') // bỏ dấu tiếng Việt để so khớp linh hoạt hơn
      .replace(/[^a-z0-9\s]/g, ' ')
      .split(/\s+/)
      .filter(function (w) { return w.length >= 3; });
  }

  function titlesOverlap(a, b) {
    const kwA = normalizeKeywords(a);
    const kwB = normalizeKeywords(b);
    return kwA.some(function (k) { return kwB.indexOf(k) !== -1; });
  }

  function findSupplementalImage(query) {
    return findCommonsImage(query).then(function (img) {
      return img || findOpenverseImage(query);
    }).catch(function () {
      return findOpenverseImage(query);
    });
  }

  function findCommonsImage(query) {
    return wikiFetch(COMMONS_API, {
      action: 'query',
      generator: 'search',
      gsrsearch: query,
      gsrnamespace: 6,
      gsrlimit: 5,
      prop: 'imageinfo',
      iiprop: 'url',
      iiurlwidth: 800
    }).then(function (data) {
      const pages = (data.query && data.query.pages) || [];
      for (let i = 0; i < pages.length; i++) {
        const p = pages[i];
        const fileTitle = (p.title || '').replace(/^File:/, '').replace(/\.[a-zA-Z0-9]+$/, '');
        if (titlesOverlap(query, fileTitle)) {
          const info = p.imageinfo && p.imageinfo[0];
          const src = info && (info.thumburl || info.url);
          if (src) return src;
        }
      }
      return null;
    }).catch(function () { return null; });
  }

  function findOpenverseImage(query) {
    const url = new URL(OPENVERSE_API);
    url.searchParams.set('q', query);
    url.searchParams.set('page_size', '5');
    return fetch(url.toString()).then(function (res) {
      if (!res.ok) throw new Error('Openverse API error: ' + res.status);
      return res.json();
    }).then(function (data) {
      const results = data.results || [];
      for (let i = 0; i < results.length; i++) {
        const r = results[i];
        if (titlesOverlap(query, r.title || '')) {
          const src = r.thumbnail || r.url;
          if (src) return src;
        }
      }
      return null;
    }).catch(function () { return null; });
  }

  // ===================================================================
  // 1. Ảnh minh họa cho lưới "Bạn có biết" — lấy trực tiếp từ Wikipedia
  // ===================================================================
  function loadGridImages() {
    // Thẻ nào đã được gắn sẵn ảnh thủ công (vd. src có sẵn trong HTML) thì
    // giữ nguyên ảnh đó, không để API Wikipedia ghi đè lên.
    const cards = Array.prototype.slice.call(
      document.querySelectorAll('#guideGrid .guide-card[data-wiki-title]')
    ).filter(function (c) {
      const img = c.querySelector('[data-wiki-img]');
      return !(img && img.getAttribute('src'));
    });
    if (!cards.length) return;

    const titles = cards.map(function (c) {
      return c.dataset.wikiTitle.replace(/_/g, ' ');
    });

    wikiFetch(WIKI_API, {
      action: 'query',
      titles: titles.join('|'),
      prop: 'pageimages',
      piprop: 'thumbnail',
      pithumbsize: 500,
      redirects: 1
    }).then(function (data) {
      const pages = (data.query && data.query.pages) || [];
      const normalizedFrom = {};
      ((data.query && data.query.normalized) || []).forEach(function (n) {
        normalizedFrom[n.to] = n.from;
      });
      const redirectFrom = {};
      ((data.query && data.query.redirects) || []).forEach(function (r) {
        redirectFrom[r.to] = r.from;
      });

      cards.forEach(function (card) {
        const wantTitle = card.dataset.wikiTitle.replace(/_/g, ' ');
        const page = pages.filter(function (p) {
          if (!p || !p.title) return false;
          if (p.title === wantTitle) return true;
          if (redirectFrom[p.title] === wantTitle) return true;
          if (normalizedFrom[p.title] === wantTitle) return true;
          return false;
        })[0];

        if (page && page.thumbnail && page.thumbnail.source) {
          setCardImage(card, page.thumbnail.source);
        } else {
          searchFallbackImage(card, wantTitle);
        }
      });
    }).catch(function () {
      cards.forEach(function (card) {
        searchFallbackImage(card, card.dataset.wikiTitle.replace(/_/g, ' '));
      });
    });
  }

  // Nếu tên bài không khớp trực tiếp (bài đổi tên, chưa có ảnh…), tìm theo
  // từ khóa gần đúng nhất bằng chính công cụ tìm kiếm của Wikipedia.
  function searchFallbackImage(card, keyword) {
    wikiFetch(WIKI_API, {
      action: 'query',
      generator: 'search',
      gsrsearch: keyword,
      gsrlimit: 1,
      prop: 'pageimages',
      piprop: 'thumbnail',
      pithumbsize: 500
    }).then(function (data) {
      const pages = (data.query && data.query.pages) || [];
      const src = pages[0] && pages[0].thumbnail && pages[0].thumbnail.source;
      if (src) {
        setCardImage(card, src);
        return;
      }
      // Wikipedia không có ảnh -> bắt buộc tìm ảnh dự phòng trên Commons
      // rồi Openverse, đảm bảo thẻ nào cũng có ảnh hiển thị.
      findSupplementalImage(keyword).then(function (imgUrl) {
        if (imgUrl) setCardImage(card, imgUrl);
      });
    }).catch(function () {
      // Lỗi gọi Wikipedia -> vẫn thử tìm ảnh dự phòng thay vì bỏ cuộc.
      findSupplementalImage(keyword).then(function (imgUrl) {
        if (imgUrl) setCardImage(card, imgUrl);
      });
    });
  }

  function setCardImage(card, src) {
    const img = card.querySelector('[data-wiki-img]');
    if (!img) return;
    img.addEventListener('load', function () {
      img.classList.add('is-loaded');
    });
    img.src = src;
  }

  // ===================================================================
  // 2. Tìm kiếm trong lưới "Bạn có biết" + tự động tra cứu Wikipedia
  // ===================================================================
  let searchDebounceTimer = null;
  let searchRequestSeq = 0;

  function initSearch() {
    const input = document.getElementById('guideSearchInput');
    const cards = Array.prototype.slice.call(document.querySelectorAll('#guideGrid .guide-card'));
    const emptyState = document.getElementById('guideEmptyState');
    if (!input) return;

    input.addEventListener('input', function () {
      const rawTerm = input.value;
      const term = rawTerm.trim().toLowerCase();
      let visibleCount = 0;

      cards.forEach(function (card) {
        const haystack = ((card.dataset.search || '') + ' ' + card.textContent).toLowerCase();
        const match = !term || haystack.indexOf(term) !== -1;
        card.classList.toggle('is-hidden', !match);
        if (match) visibleCount++;
      });

      if (searchDebounceTimer) {
        clearTimeout(searchDebounceTimer);
        searchDebounceTimer = null;
      }
      if (emptyState) emptyState.hidden = true;

      if (!term) {
        // Xoá sạch ô tìm kiếm -> quay về lưới gốc, huỷ mọi bài viết tìm kiếm
        showGrid();
        setStatus('', null);
        return;
      }

      if (visibleCount > 0) {
        // Đã có thẻ khớp sẵn trong 6 bài dựng sẵn -> hiện lưới luôn, không
        // cần gọi thêm Wikipedia.
        showGrid();
        setStatus('', null);
        return;
      }

      // Không có thẻ nào khớp -> sau khi người dùng ngừng gõ một nhịp ngắn,
      // TỰ ĐỘNG tra cứu trên Wikipedia và hiển thị bài viết luôn — không
      // cần bấm Enter. KHÔNG thêm thẻ mới vào lưới cố định; bài chỉ hiện
      // tạm thời ở khu vực bài viết theo vị trí, giống cơ chế định vị GPS.
      searchDebounceTimer = setTimeout(function () {
        resolveAndShowSearchArticle(rawTerm);
      }, 600);
    });

    // Vẫn giữ Enter / bấm kính lúp như một cách tra cứu ngay lập tức (bỏ
    // qua thời gian chờ debounce), nhưng không còn là thao tác bắt buộc.
    input.addEventListener('keydown', function (e) {
      if (e.key === 'Enter') {
        e.preventDefault();
        if (searchDebounceTimer) {
          clearTimeout(searchDebounceTimer);
          searchDebounceTimer = null;
        }
        resolveAndShowSearchArticle(input.value);
      }
    });

    const icon = document.querySelector('.guide-searchbar__icon');
    if (icon) {
      icon.style.cursor = 'pointer';
      icon.addEventListener('click', function () {
        if (searchDebounceTimer) {
          clearTimeout(searchDebounceTimer);
          searchDebounceTimer = null;
        }
        resolveAndShowSearchArticle(input.value);
      });
    }
  }

  // Giữ nguyên từ khóa người dùng nhập, không chèn thêm chữ "Việt Nam".
  // Duyệt qua danh sách kết quả để loại bỏ bài viết nước ngoài rõ ràng
  // (vd. Petronas/Malaysia) và bài dạng "Danh sách..."/"Các..." chung
  // chung, ưu tiên trả về bài viết cụ thể phù hợp nhất.
  function searchVietnamWikipediaTitle(query) {
    const url = new URL(WIKI_API);
    url.searchParams.set('action', 'query');
    url.searchParams.set('list', 'search');
    url.searchParams.set('srsearch', query);
    url.searchParams.set('utf8', '1');
    url.searchParams.set('format', 'json');
    url.searchParams.set('origin', '*');
    return fetch(url.toString())
      .then(function (res) {
        if (!res.ok) throw new Error('Wiki search failed');
        return res.json();
      })
      .then(function (data) {
        const results = (data.query && data.query.search) || [];
        if (results.length > 0) {
          for (let i = 0; i < results.length; i++) {
            const title = results[i].title;
            const snippet = (results[i].snippet || '').toLowerCase();
            const lowerTitle = title.toLowerCase();
            if (lowerTitle.includes('petronas') || snippet.includes('malaysia') || snippet.includes('kuala lumpur')) {
              continue;
            }
            if (lowerTitle.startsWith('danh sách') || lowerTitle.startsWith('các ')) {
              continue;
            }
            return title;
          }
          return results[0].title;
        }
        return query;
      })
      .catch(function () {
        return query;
      });
  }

function resolveAndShowSearchArticle(rawQuery) {
  const query = (rawQuery || '').trim();
  if (!query) return;
  const isEn = currentGuideLang === 'en';
  const reqId = ++searchRequestSeq;

  setStatus(isEn ? 'Searching the encyclopedia for “' + query + '”…' : 'Đang tìm “' + query + '” trên Bách khoa toàn thư…', null);

  searchVietnamWikipediaTitle(query).then(function (title) {
    if (reqId !== searchRequestSeq) return; // đã có lượt tìm kiếm mới hơn, bỏ kết quả cũ
    if (!title) {
      setStatus(
        isEn
          ? 'No Vietnam-related Wikipedia article found for “' + query + '”.'
          : 'Không tìm thấy bài viết nào liên quan đến Việt Nam cho “' + query + '” trên Wikipedia.',
        'error'
      );
      return;
    }
    currentLocationTitle = title;
    currentLocationSource = 'search';
    setStatus(
      isEn ? 'Showing results for “' + title + '”' : 'Kết quả tìm kiếm cho “' + title + '”',
      'success'
    );
    renderLocationArticle(title, null, null, 'search');
  });
}

// ===================================================================
// 3 & 4. Định vị thiết bị + bài viết theo vị trí (song ngữ)
// ===================================================================
let currentGuideLang = 'vn';
let watchId = null;
let lastQueriedCoords = null;
let lastQueryTime = 0;
let currentLocationTitle = null;
let currentLocationSource = 'geo'; // 'geo' (định vị GPS) hoặc 'search' (ô tìm kiếm)
let renderRequestSeq = 0;

function $(id) { return document.getElementById(id); }

function haversineKm(lat1, lon1, lat2, lon2) {
  const R = 6371;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function setStatus(text, kind) {
  const el = $('guideGeoStatus');
  if (!el) return;
  if (!text) {
    el.hidden = true;
    el.textContent = '';
    return;
  }
  el.hidden = false;
  el.textContent = text;
  el.className = 'guide-geo-status' + (kind ? ' is-' + kind : '');
}

function currentLangFromToggle() {
  const active = document.querySelector('.lang-btn.active');
  const txt = active && active.textContent.trim().toLowerCase();
  return txt === 'en' ? 'en' : 'vn';
}

function initGeo() {
  const btn = $('guideGeoBtn');
  const backBtn = $('guideBackBtn');
  currentGuideLang = currentLangFromToggle();

  if (!btn || !('geolocation' in navigator)) {
    if (btn) btn.disabled = true;
    setStatus('Trình duyệt của bạn không hỗ trợ định vị.', 'error');
    return;
  }

  btn.addEventListener('click', requestLocation);
  if (backBtn) backBtn.addEventListener('click', showGrid);

  // Đồng bộ ngôn ngữ của bài viết theo vị trí khi người dùng bấm VN/EN
  document.querySelectorAll('.lang-btn').forEach(function (b) {
    b.addEventListener('click', function (e) {
      const lang = e.target.textContent.trim().toLowerCase();
      if (lang !== 'en' && lang !== 'vn') return;
      currentGuideLang = lang;
      const article = $('guideLocationArticle');
      if (currentLocationTitle && article && !article.hidden) {
        renderLocationArticle(currentLocationTitle, lastQueriedCoords, null, currentLocationSource);
      }
    });
  });

  // Tự động xin quyền định vị ngay lần đầu người dùng mở tab Cẩm nang
  let autoAsked = false;
  document.querySelectorAll('.sh-tab[data-panel="panel-guide"]').forEach(function (tab) {
    tab.addEventListener('click', function () {
      if (!autoAsked) {
        autoAsked = true;
        requestLocation();
      }
    });
  });

  // Nếu người dùng mở thẳng vào tab Cẩm nang qua URL hash (#panel-guide)
  if (window.location.hash === '#panel-guide') {
    autoAsked = true;
    requestLocation();
  }
}

function requestLocation() {
  const btn = $('guideGeoBtn');
  if (btn) btn.disabled = true;
  setStatus('Đang xin quyền truy cập vị trí thiết bị…', null);

  if (watchId !== null) {
    navigator.geolocation.clearWatch(watchId);
  }

  watchId = navigator.geolocation.watchPosition(onPositionSuccess, onPositionError, {
    enableHighAccuracy: true,
    maximumAge: 15000,
    timeout: 15000
  });
}

function onPositionSuccess(pos) {
  const btn = $('guideGeoBtn');
  if (btn) btn.disabled = false;

  const lat = pos.coords.latitude;
  const lon = pos.coords.longitude;
  const now = Date.now();

  if (lastQueriedCoords) {
    const movedKm = haversineKm(lastQueriedCoords.lat, lastQueriedCoords.lon, lat, lon);
    // Chỉ truy vấn lại Wikipedia nếu thiết bị di chuyển > 300m hoặc đã
    // quá 60 giây kể từ lần truy vấn trước, để tránh gọi API liên tục.
    if (movedKm < 0.3 && now - lastQueryTime < 60000) return;
  }

  lastQueriedCoords = { lat: lat, lon: lon };
  lastQueryTime = now;
  findNearbyLandmark(lat, lon);
}

function onPositionError(err) {
  const btn = $('guideGeoBtn');
  if (btn) btn.disabled = false;
  let msg = 'Không thể lấy vị trí của bạn. Vui lòng thử lại.';
  if (err && err.code === err.PERMISSION_DENIED) {
    msg = 'Bạn đã từ chối quyền truy cập vị trí. Hãy bật lại quyền định vị trong trình duyệt để dùng tính năng này.';
  }
  setStatus(msg, 'error');
}

function findNearbyLandmark(lat, lon) {
  setStatus('Đang tìm địa danh gần vị trí của bạn…', null);

  wikiFetch(WIKI_API, {
    action: 'query',
    list: 'geosearch',
    gscoord: lat + '|' + lon,
    gsradius: 3000,
    gslimit: 1
  }).then(function (data) {
    const results = (data.query && data.query.geosearch) || [];
    if (!results.length) {
      setStatus('Chưa tìm thấy địa danh nào trong bán kính 3km quanh vị trí hiện tại.', null);
      return;
    }
    const place = results[0];
    currentLocationTitle = place.title;
    currentLocationSource = 'geo';
    setStatus('Đã tìm thấy địa danh gần bạn: ' + place.title, 'success');
    renderLocationArticle(place.title, { lat: lat, lon: lon }, place.dist, 'geo');
  }).catch(function () {
    setStatus('Không thể kết nối tới Wikipedia để tra cứu địa danh. Vui lòng thử lại sau.', 'error');
  });
}

function renderLocationArticle(title, coords, distMeters, source) {
  const card = $('guideLocationCard');
  const article = $('guideLocationArticle');
  const grid = $('guideGrid');
  const empty = $('guideEmptyState');
  if (!card || !article || !grid) return;

  const mode = source || 'geo';
  const reqId = ++renderRequestSeq;

  card.className = 'guide-location-card is-loading';
  card.innerHTML = '<div class="guide-location-card__body"><p>' +
    (currentGuideLang === 'en' ? 'Loading landmark information…' : 'Đang tải thông tin địa danh…') +
    '</p></div>';
  article.hidden = false;
  grid.hidden = true;
  if (empty) empty.hidden = true;

  const isEn = currentGuideLang === 'en';
  const summaryPromise = isEn ? fetchEnglishSummary(title) : fetchVietnameseSummary(title);

  summaryPromise.then(function (info) {
    if (reqId !== renderRequestSeq) return; // đã có bài khác được yêu cầu hiển thị sau đó

    if (!info) {
      card.className = 'guide-location-card is-empty';
      card.innerHTML = '<div class="guide-location-card__body"><p>' +
        (isEn ? 'No detailed information available for this location yet.' :
          'Chưa có thông tin chi tiết cho địa danh này.') + '</p></div>';
      return;
    }

    card.className = 'guide-location-card';
    const distText = typeof distMeters === 'number'
      ? (isEn
        ? 'About ' + Math.round(distMeters) + 'm from your current location'
        : 'Cách vị trí hiện tại của bạn khoảng ' + Math.round(distMeters) + 'm')
      : '';

    // Bài từ ô tìm kiếm dùng đúng khung "? Bạn có biết" như lưới thẻ;
    // bài từ định vị GPS vẫn giữ nhãn "Gần bạn" như trước.
    const eyebrowHtml = mode === 'search'
      ? '<span class="guide-card__badge guide-location-card__badge"><span class="guide-card__badge-mark">?</span>' +
      (isEn ? 'Did you know' : 'Bạn có biết') + '</span>'
      : '<span class="guide-location-card__eyebrow">' + (isEn ? 'Near you' : 'Gần bạn') + '</span>';

    card.innerHTML =
      '<div class="guide-location-card__media">' +
      (info.image ? '<img src="' + info.image + '" alt="' + escapeHtml(info.title) + '">' : '') +
      '</div>' +
      '<div class="guide-location-card__body">' +
      eyebrowHtml +
      '<h3 class="guide-location-card__title">' + escapeHtml(info.title) + '</h3>' +
      (distText ? '<p class="guide-location-card__dist">' + distText + '</p>' : '') +
      '<p class="guide-location-card__extract">' + escapeHtml(info.extract) + '</p>' +
      '<a class="guide-location-card__link" href="' + info.pageUrl + '" target="_blank" rel="noopener">' +
      '<i data-lucide="external-link"></i>' +
      (isEn ? 'Read more on Wikipedia' : 'Xem thêm trên Wikipedia') +
      '</a>' +
      '</div>';

    if (window.lucide) window.lucide.createIcons({ root: card });
  });
}

const GOOGLE_SEARCH_API_KEY = 'THAY_BANG_API_KEY_CUA_BAN';
const GOOGLE_SEARCH_CX = 'THAY_BANG_CX_ID_CUA_BAN';

function fetchExternalSummary(query) {
  const url = new URL('https://www.googleapis.com/customsearch/v1');
  url.searchParams.set('key', GOOGLE_SEARCH_API_KEY);
  url.searchParams.set('cx', GOOGLE_SEARCH_CX);
  url.searchParams.set('q', query + ' du lịch Việt Nam');
  return fetch(url.toString()).then(function (res) {
    if (!res.ok) throw new Error('Google Search API error');
    return res.json();
  }).then(function (data) {
    const items = data.items || [];
    if (items.length > 0) {
      const firstItem = items[0];
      let imageUrl = null;
      if (firstItem.pagemap && firstItem.pagemap.cse_image && firstItem.pagemap.cse_image.length > 0) {
        imageUrl = firstItem.pagemap.cse_image[0].src;
      }
      return {
        title: firstItem.title.replace(/ - .*/, ''),
        extract: firstItem.snippet || 'Xem thêm chi tiết tại liên kết nguồn đính kèm.',
        image: imageUrl,
        pageUrl: firstItem.link,
        qid: null
      };
    }
    return null;
  }).catch(function () { return null; });
}

function fetchVietnameseSummary(title) {
  return wikiFetch(WIKI_API, {
    action: 'query',
    titles: title,
    prop: 'extracts|pageimages|info|pageprops',
    exintro: 1,
    explaintext: 1,
    piprop: 'thumbnail',
    pithumbsize: 800,
    inprop: 'url',
    ppprop: 'wikibase_item',
    redirects: 1
  }).then(function (data) {
    const pages = (data.query && data.query.pages) || [];
    const page = pages[0];

    // Nếu Wikipedia không có dữ liệu, chuyển sang tìm kiếm ngoài (Google/Du lịch)
    if (!page || page.missing) {
      return fetchExternalSummary(title);
    }

    const info = {
      title: page.title,
      extract: (page.extract || '').trim() || 'Chưa có mô tả chi tiết cho địa danh này trên Wikipedia.',
      image: page.thumbnail && page.thumbnail.source,
      pageUrl: page.fullurl || ('https://vi.wikipedia.org/wiki/' + encodeURIComponent(title.replace(/ /g, '_'))),
      qid: page.pageprops && page.pageprops.wikibase_item
    };

    if (info.image) return info;

    return findSupplementalImage(page.title).then(function (imgUrl) {
      info.image = imgUrl || null;
      return info;
    });
  }).catch(function () {
    // Lỗi kết nối Wikipedia cũng sẽ kích hoạt tìm kiếm Google
    return fetchExternalSummary(title);
  });
}

// Lấy bản tiếng Anh thông qua interwiki langlinks của chính bài tiếng
// Việt (đảm bảo cùng một địa danh); nếu bài chưa có bản EN, dùng lại
// nội dung tiếng Việt gốc để không bỏ trống bài viết.
function fetchEnglishSummary(viTitle) {
  return wikiFetch(WIKI_API, {
    action: 'query',
    titles: viTitle,
    prop: 'langlinks',
    lllang: 'en',
    redirects: 1
  }).then(function (data) {
    const pages = (data.query && data.query.pages) || [];
    const page = pages[0];
    const enTitle = page && page.langlinks && page.langlinks[0] && page.langlinks[0].title;

    if (!enTitle) return fetchVietnameseSummary(viTitle);

    return wikiFetch(WIKI_API_EN, {
      action: 'query',
      titles: enTitle,
      prop: 'extracts|pageimages|info',
      exintro: 1,
      explaintext: 1,
      piprop: 'thumbnail',
      pithumbsize: 800,
      inprop: 'url',
      redirects: 1
    }).then(function (enData) {
      const enPages = (enData.query && enData.query.pages) || [];
      const enPage = enPages[0];
      if (!enPage || enPage.missing) return fetchVietnameseSummary(viTitle);

      const info = {
        title: enPage.title,
        extract: (enPage.extract || '').trim() || 'No detailed description available yet.',
        image: enPage.thumbnail && enPage.thumbnail.source,
        pageUrl: enPage.fullurl || ('https://en.wikipedia.org/wiki/' + encodeURIComponent(enTitle.replace(/ /g, '_')))
      };

      if (info.image) return info;

      return findSupplementalImage(enPage.title).then(function (imgUrl) {
        info.image = imgUrl || null;
        return info;
      });
    });
  }).catch(function () { return fetchVietnameseSummary(viTitle); });
}

function showGrid() {
  const article = $('guideLocationArticle');
  const grid = $('guideGrid');
  if (article) article.hidden = true;
  if (grid) grid.hidden = false;
  currentLocationTitle = null;
  currentLocationSource = 'geo';
}

document.addEventListener('DOMContentLoaded', function () {
  if (!document.getElementById('panel-guide')) return;
  loadGridImages();
  initSearch();
  initGeo();
});
}) ();