/* ============================================================
   CHECK-IN — lưu & khôi phục lịch trình đã tạo ở tab "Lịch trình".

   KHÔNG sửa js/script.js (giữ nguyên bản gốc từ repo theo đúng ghi
   chú trong index.html). Thay vào đó, file này "bọc" lại hàm toàn
   cục renderResult() để sau mỗi lần nó vẽ lại kết quả, mình gắn thêm
   sự kiện thật cho nút "Lưu lịch trình" (vốn đang chỉ alert() suông).

   Dữ liệu dùng chung từ script.js (đều là biến toàn cục vì script.js
   không bọc trong IIFE/module): state, renderResult, fetchWikiImage,
   GRAY_PLACEHOLDER, cbText, destText, inputDays, updateDuration,
   checkWeatherAlert, startDateEl, endDateEl. File này LUÔN kiểm tra
   tồn tại (typeof ... !== 'undefined', hoặc phần tử có null hay
   không) trước khi dùng, để không vỡ nếu form Lịch trình sau này có
   thêm/bớt phần tử (vd. ô chọn điểm đến, ngày đi/về) mà lúc viết file
   này mình chưa thấy trong index.html.

   LƯU Ý: đây là site tĩnh, không có backend — toàn bộ lịch trình đã
   lưu nằm trong localStorage của trình duyệt (khoá "vnfinder_checkins"),
   chỉ tồn tại trên máy/trình duyệt hiện tại. Phù hợp để demo hackathon.
   ============================================================ */

(function () {
    'use strict';

    var STORAGE_KEY = 'vnfinder_checkins';
    var MAX_SAVED = 20; // giới hạn để localStorage không phình to quá

    // Ảnh cục bộ đã có sẵn trong assets/img — ưu tiên dùng trước khi phải
    // gọi Wikipedia, để hiện ngay lập tức và đúng chủ đề chính của dự án.
    var PROVINCE_IMAGES = {
        'Hà Nội': 'assets/img/ho-guom.webp',
        'Hồ Chí Minh': 'assets/img/tp-hcm.webp',
        'Đà Nẵng': 'assets/img/da-nang.webp',
        'Gia Lai': 'assets/img/bien-ho-hero.webp',
        'Cần Thơ': 'assets/img/cho-noi-can-tho.webp',
        'Huế': 'assets/img/hue.webp',
        'Lào Cai': 'assets/img/sa-pa.webp'
    };

    function qs(id) { return document.getElementById(id); }

    /* ---------------------- Lưu trữ (localStorage) ---------------------- */

    function getCheckins() {
        try {
            var raw = localStorage.getItem(STORAGE_KEY);
            var parsed = raw ? JSON.parse(raw) : [];
            return Array.isArray(parsed) ? parsed : [];
        } catch (e) {
            return [];
        }
    }

    function saveCheckins(list) {
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
            return true;
        } catch (e) {
            console.error('Không lưu được lịch trình vào localStorage.', e);
            return false;
        }
    }

    /* ---------------------- Ảnh điểm khởi hành / điểm đến ---------------------- */

    function fetchInternetImage(keyword) {
        var urlVI = 'https://vi.wikipedia.org/w/api.php?action=query&generator=search&gsrsearch=' + encodeURIComponent(keyword) + '&gsrlimit=1&prop=pageimages&piprop=thumbnail&pithumbsize=500&format=json&formatversion=2&origin=*';
        var urlEN = 'https://en.wikipedia.org/w/api.php?action=query&generator=search&gsrsearch=' + encodeURIComponent(keyword) + '&gsrlimit=1&prop=pageimages&piprop=thumbnail&pithumbsize=500&format=json&formatversion=2&origin=*';

        return fetch(urlVI)
            .then(function(res) { return res.json(); })
            .then(function(data) {
                var pages = (data.query && data.query.pages) || [];
                var src = pages[0] && pages[0].thumbnail && pages[0].thumbnail.source;
                if (src) return src;
                
                return fetch(urlEN)
                    .then(function(res) { return res.json(); })
                    .then(function(data) {
                        var enPages = (data.query && data.query.pages) || [];
                        return enPages[0] && enPages[0].thumbnail && enPages[0].thumbnail.source;
                    });
            });
    }

    // Vài huyện thuộc Bình Định cũ (nay sáp nhập vào Gia Lai) — đúng chủ đề
    // chính của dự án — ưu tiên khớp riêng trước khi khớp theo tên tỉnh.
    function matchLocalImage(fullText) {
        if (/(quy nhơn|tây sơn|an nhơn|bình định)/i.test(fullText || '')) {
            return 'assets/img/tay-son.webp';
        }
        if (/sa pa/i.test(fullText || '')) {
            return 'assets/img/sa-pa.webp';
        }
        return null;
    }

    function resolveLocationImage(displayText, provinceHint, imgEl) {
        if (!imgEl) return;
        var local = matchLocalImage(displayText) || (provinceHint && PROVINCE_IMAGES[provinceHint]) || PROVINCE_IMAGES[displayText];
        if (local) {
            imgEl.src = local;
            return;
        }
        // Không có ảnh cục bộ phù hợp — tìm kiếm ảnh động trên Wikipedia
        imgEl.src = (typeof GRAY_PLACEHOLDER !== 'undefined') ? GRAY_PLACEHOLDER : 'assets/img/nen.webp';
        if (displayText) {
            fetchInternetImage(displayText).then(function (url) {
                if (url) imgEl.src = url;
            }).catch(function () { /* giữ ảnh placeholder nếu lỗi */ });
        }
    }

    /* ---------------------- Lưu lịch trình hiện tại ---------------------- */

    function handleSaveItinerary() {
        if (typeof state === 'undefined' || !state.generatedItinerary || !state.duration) {
            alert('Chưa có lịch trình để lưu — hãy tạo lịch trình trước đã nhé.');
            return;
        }

        var trip = {
            departure: state.departure || '',
            destination: state.destination || '',
            destProvince: state.destProvince || '',
            duration: state.duration,
            selectedWeek: state.selectedWeek || 1,
            selectedDay: state.selectedDay || 1,
            generatedItinerary: state.generatedItinerary,
            // Chỉ tồn tại nếu form đã có ô chọn ngày (start-date/end-date) —
            // hiện index.html chưa có nên 2 giá trị này thường sẽ rỗng.
            startDate: (typeof startDateEl !== 'undefined' && startDateEl) ? startDateEl.value : '',
            endDate: (typeof endDateEl !== 'undefined' && endDateEl) ? endDateEl.value : '',
            savedAt: Date.now()
        };

        var trips = getCheckins();
        trips.unshift(trip);
        if (trips.length > MAX_SAVED) trips = trips.slice(0, MAX_SAVED);

        if (saveCheckins(trips)) {
            renderCheckinPanel();
            alert('Đã lưu lịch trình! Xem lại ở mục "Check-in".');
        } else {
            alert('Có lỗi khi lưu lịch trình, vui lòng thử lại.');
        }
    }
    // Cần lộ ra window vì đây là hàm được gọi bằng onclick gắn trực tiếp
    // (xem wireSaveButton) — không bắt buộc phải lộ ra ngoài nếu chỉ dùng
    // addEventListener, nhưng để dự phòng cho cách gắn sự kiện khác.
    window.handleSaveItinerary = handleSaveItinerary;

    // Sau mỗi lần renderResult() (định nghĩa trong script.js) vẽ lại kết
    // quả — kể cả khi đổi ngày/tuần — nút "Lưu lịch trình" cũng được vẽ
    // lại từ đầu (template string trong script.js), nên phải gắn lại sự
    // kiện mỗi lần như vậy thay vì gắn 1 lần duy nhất lúc tải trang.
    function wireSaveButton() {
        var btn = document.querySelector('.save-itinerary-btn');
        if (!btn) return;
        // Gán thẳng .onclick để THAY THẾ hoàn toàn onclick="alert(...)" có
        // sẵn trong HTML do script.js sinh ra — không dùng addEventListener
        // ở đây vì sẽ khiến cả 2 (alert cũ + hàm mới) cùng chạy 1 lúc.
        btn.onclick = function (e) {
            if (e) e.preventDefault();
            handleSaveItinerary();
        };
    }

    /* ---------------------- Khôi phục 1 lịch trình đã lưu ---------------------- */

    function restoreCheckin(index) {
        var trips = getCheckins();
        var trip = trips[index];
        if (!trip || typeof state === 'undefined') return;

        state.departure = trip.departure;
        state.destination = trip.destination;
        state.destProvince = trip.destProvince;
        state.generatedItinerary = trip.generatedItinerary;
        state.selectedWeek = trip.selectedWeek || 1;
        state.selectedDay = trip.selectedDay || 1;

        if (typeof updateDuration === 'function') {
            updateDuration(trip.duration);
        } else if (typeof inputDays !== 'undefined' && inputDays) {
            inputDays.value = trip.duration;
        }

        if (typeof cbText !== 'undefined' && cbText && trip.departure) {
            cbText.textContent = trip.departure;
            cbText.style.color = 'var(--ink)';
        }
        if (typeof destText !== 'undefined' && destText && trip.destination) {
            destText.textContent = trip.destination;
            destText.style.color = 'var(--ink)';
        }

        // Chỉ áp dụng nếu form đã có ô chọn ngày kiểu flatpickr — hiện
        // index.html chưa có nên nhánh này thường bị bỏ qua.
        if (typeof startDateEl !== 'undefined' && startDateEl && trip.startDate) {
            if (startDateEl._flatpickr) startDateEl._flatpickr.setDate(trip.startDate, true);
            else startDateEl.value = trip.startDate;
        }
        if (typeof endDateEl !== 'undefined' && endDateEl && trip.endDate) {
            if (endDateEl._flatpickr) endDateEl._flatpickr.setDate(trip.endDate, true);
            else endDateEl.value = trip.endDate;
        }
        if (typeof checkWeatherAlert === 'function') checkWeatherAlert();

        // Chuyển qua tab "Lịch trình" bằng đúng cơ chế điều hướng chính của
        // trang (nav.js), rồi mới vẽ lại kết quả đã khôi phục.
        var lichTrinhTab = document.querySelector('.sh-tab[data-panel="panel-lich-trinh"]');
        if (lichTrinhTab) lichTrinhTab.click();

        if (typeof renderResult === 'function') renderResult();
    }

    function deleteCheckin(index) {
        var trips = getCheckins();
        trips.splice(index, 1);
        saveCheckins(trips);
        renderCheckinPanel();
    }

    /* ---------------------- Vẽ danh sách Check-in ---------------------- */

    function formatSavedAt(ts) {
        if (!ts) return '';
        try {
            return new Date(ts).toLocaleString('vi-VN', {
                day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit'
            });
        } catch (e) {
            return '';
        }
    }

    function cardTemplate(trip, idx) {
        var departure = trip.departure || 'Chưa rõ';
        var destination = trip.destination || 'Chưa rõ';
        return '' +
            '<div class="checkin-card" data-index="' + idx + '" tabindex="0" role="button" ' +
            'aria-label="Xem lại lịch trình từ ' + escapeHTML(departure) + ' đến ' + escapeHTML(destination) + '">' +
            '  <button type="button" class="checkin-delete" data-delete-index="' + idx + '" aria-label="Xoá lịch trình này" title="Xoá">' +
            '    <i data-lucide="x"></i>' +
            '  </button>' +
            '  <div class="checkin-side checkin-departure">' +
            '    <img loading="lazy" decoding="async" class="checkin-side-img" data-checkin-img="departure-' + idx + '" alt="' + escapeHTML(departure) + '">' +
            '    <div class="checkin-side-overlay"></div>' +
            '    <div class="checkin-side-text">' +
            '      <span class="checkin-eyebrow">Điểm khởi hành</span>' +
            '      <span class="checkin-place">' + escapeHTML(departure) + '</span>' +
            '    </div>' +
            '  </div>' +
            '  <div class="checkin-plane"><i data-lucide="plane" class="checkin-plane-icon"></i></div>' +
            '  <div class="checkin-side checkin-destination">' +
            '    <img loading="lazy" decoding="async" class="checkin-side-img" data-checkin-img="destination-' + idx + '" alt="' + escapeHTML(destination) + '">' +
            '    <div class="checkin-side-overlay"></div>' +
            '    <div class="checkin-side-text checkin-side-text--right">' +
            '      <span class="checkin-eyebrow">Điểm đến</span>' +
            '      <span class="checkin-place">' + escapeHTML(destination) + '</span>' +
            '    </div>' +
            '  </div>' +
            '  <div class="checkin-meta">' + (trip.duration ? trip.duration + ' ngày · ' : '') + 'Đã lưu ' + formatSavedAt(trip.savedAt) + '</div>' +
            '</div>';
    }

    function escapeHTML(str) {
        var div = document.createElement('div');
        div.textContent = str;
        return div.innerHTML;
    }

    function renderCheckinPanel() {
        var list = qs('checkin-list');
        var emptyMsg = qs('checkin-empty');
        if (!list) return;

        var trips = getCheckins();

        if (trips.length === 0) {
            list.innerHTML = '';
            if (emptyMsg) emptyMsg.hidden = false;
            return;
        }
        if (emptyMsg) emptyMsg.hidden = true;

        list.innerHTML = trips.map(cardTemplate).join('');

        if (window.lucide && typeof window.lucide.createIcons === 'function') {
            window.lucide.createIcons();
        }

        trips.forEach(function (trip, idx) {
            var depImg = list.querySelector('[data-checkin-img="departure-' + idx + '"]');
            var destImg = list.querySelector('[data-checkin-img="destination-' + idx + '"]');
            resolveLocationImage(trip.departure, trip.departure, depImg);
            resolveLocationImage(trip.destination, trip.destProvince, destImg);
        });

        list.querySelectorAll('.checkin-card').forEach(function (card) {
            var idx = parseInt(card.dataset.index, 10);
            card.addEventListener('click', function (e) {
                if (e.target.closest('.checkin-delete')) return;
                restoreCheckin(idx);
            });
            card.addEventListener('keydown', function (e) {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    restoreCheckin(idx);
                }
            });
        });

        list.querySelectorAll('.checkin-delete').forEach(function (btn) {
            btn.addEventListener('click', function (e) {
                e.stopPropagation();
                deleteCheckin(parseInt(btn.dataset.deleteIndex, 10));
            });
        });
    }

    /* ---------------------- Khởi động ---------------------- */

    function bootstrap() {
        // Bọc lại renderResult() (định nghĩa trong script.js) để mỗi lần nó
        // vẽ lại kết quả xong, gắn lại đúng nút Lưu thật — không đụng gì tới
        // nội dung/logic vẽ lịch trình bên trong script.js.
        if (typeof window.renderResult === 'function') {
            var originalRenderResult = window.renderResult;
            window.renderResult = function () {
                var out = originalRenderResult.apply(this, arguments);
                wireSaveButton();
                return out;
            };
        }

        // Tab Check-in cũng tự vẽ lại danh sách mỗi lần được mở, phòng khi
        // có thay đổi từ nơi khác (vd. mở 2 tab trình duyệt cùng lúc).
        var checkinTab = document.querySelector('.sh-tab[data-panel="panel-checkin"]');
        if (checkinTab) checkinTab.addEventListener('click', renderCheckinPanel);

        renderCheckinPanel();
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', bootstrap);
    } else {
        bootstrap();
    }
})();
