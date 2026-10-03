/**
 * Song Hành — AI Travel Assistant Logic (Vanilla JS)
 */

/* ============ 1. MOCK DATA ============ */
const VIETNAM_PROVINCES = [
  {
    label: 'Miền Bắc',
    options: [
      'Hà Nội', 'Lai Châu', 'Điện Biên', 'Sơn La', 'Lạng Sơn', 'Quảng Ninh', 'Cao Bằng',
      'Tuyên Quang', 'Lào Cai', 'Thái Nguyên',
      'Phú Thọ', 'Bắc Ninh', 'Hưng Yên',
      'Hải Phòng', 'Ninh Bình'
    ]
  },
  {
    label: 'Miền Trung & Tây Nguyên',
    options: [
      'Huế', 'Thanh Hóa', 'Nghệ An', 'Hà Tĩnh', 'Quảng Trị',
      'Đà Nẵng', 'Quảng Ngãi', 'Gia Lai',
      'Đắk Lắk', 'Khánh Hòa', 'Lâm Đồng'
    ]
  },
  {
    label: 'Miền Nam',
    options: [
      'Đồng Nai', 'Hồ Chí Minh',
      'Tây Ninh', 'Đồng Tháp', 'Vĩnh Long',
      'Cần Thơ', 'Cà Mau', 'An Giang'
    ]
  }
];

const DESTINATION_LOCATIONS = {
  'Tuyên Quang': ['Tuyên Quang', 'Huyện Sơn Dương', 'Hà Giang', 'Huyện Đồng Văn', 'Huyện Mèo Vạc'],
  'Lào Cai': ['Lào Cai', 'Thị xã Sa Pa', 'Huyện Bắc Hà', 'Yên Bái', 'Thị xã Nghĩa Lộ', 'Huyện Mù Cang Chải'],
  'Thái Nguyên': ['Thái Nguyên', 'Phổ Yên', 'Huyện Đại Từ', 'Bắc Kạn', 'Huyện Ba Bể'],
  'Phú Thọ': ['Việt Trì', 'Vĩnh Yên', 'Thị xã Tam Đảo', 'Hòa Bình', 'Huyện Mai Châu'],
  'Bắc Ninh': ['Bắc Ninh', 'Từ Sơn', 'Bắc Giang', 'Huyện Việt Yên', 'Huyện Lục Ngạn'],
  'Hưng Yên': ['Hưng Yên', 'Thị xã Mỹ Hào', 'Khu đô thị Ecopark', 'Thái Bình', 'Huyện Tiền Hải'],
  'Hải Phòng': ['Hải Phòng', 'Huyện Cát Hải', 'Hải Dương', 'Chí Linh'],
  'Ninh Bình': ['Ninh Bình', 'Huyện Hoa Lư', 'Huyện Gia Viễn', 'Phủ Lý', 'Nam Định'],
  'Quảng Trị': ['Đông Hà', 'Thị xã Quảng Trị', 'Huyện Vĩnh Linh', 'Đồng Hới', 'Huyện Bố Trạch'],
  'Đà Nẵng': ['Đà Nẵng', 'Huyện Hòa Vang', 'Hội An', 'Tam Kỳ', 'Thị xã Điện Bàn'],
  'Quảng Ngãi': ['Quảng Ngãi', 'Thị xã Đức Phổ', 'Huyện Bình Sơn (Lý Sơn)', 'Kon Tum', 'Huyện Đắk Hà', 'Huyện Măng Đen'],
  'Gia Lai': ['Pleiku', 'Thị xã An Khê', 'Huyện Chư Sê', 'Quy Nhơn', 'Thị xã An Nhơn', 'Huyện Tây Sơn'],
  'Đắk Lắk': ['Buôn Ma Thuột', 'Thị xã Buôn Hồ', 'Huyện Krông Pắc', 'Tuy Hòa', 'Thị xã Sông Cầu'],
  'Khánh Hòa': ['Nha Trang', 'Cam Ranh', 'Huyện đảo Trường Sa', 'Phan Rang - Tháp Chàm', 'Huyện Ninh Hải'],
  'Lâm Đồng': ['Đà Lạt', 'Bảo Lộc', 'Gia Nghĩa', 'Phan Thiết', 'Thị xã La Gi'],
  'Đồng Nai': ['Biên Hòa', 'Long Khánh', 'Huyện Nhơn Trạch', 'Đồng Xoài', 'Thị xã Bình Long'],
  'Hồ Chí Minh': ['Hồ Chí Minh', 'Thủ Đức', 'Huyện Cần Giờ', 'Vũng Tàu', 'Thủ Dầu Một', 'Huyện Côn Đảo'],
  'Tây Ninh': ['Tây Ninh', 'Thị xã Trảng Bàng', 'Thị xã Hòa Thành', 'Tân An', 'Huyện Bến Lức'],
  'Đồng Tháp': ['Cao Lãnh', 'Sa Đéc', 'Hồng Ngự', 'Mỹ Tho', 'Thị xã Cai Lậy'],
  'Vĩnh Long': ['Vĩnh Long', 'Thị xã Bình Minh', 'Bến Tre', 'Huyện Châu Thành', 'Trà Vinh'],
  'Cần Thơ': ['Cần Thơ', 'Huyện Phong Điền', 'Sóc Trăng', 'Vị Thanh'],
  'Cà Mau': ['Cà Mau', 'Huyện Năm Căn', 'Huyện Ngọc Hiển', 'Bạc Liêu', 'Thị xã Giá Rai'],
  'An Giang': ['Long Xuyên', 'Châu Đốc', 'Thị xã Tịnh Biên', 'Rạch Giá', 'Phú Quốc', 'Hà Tiên']
};

function getDistrictsForProvince(provinceName) {
  if (DESTINATION_LOCATIONS[provinceName]) {
    return DESTINATION_LOCATIONS[provinceName];
  }
  return ['Trung tâm khu vực', 'Vùng ven', 'Các huyện lân cận'];
}

const DESTINATIONS = []; // Removed, now using ALL_DESTINATIONS from data.js

const PREFERENCES_MAP = {
  bien: 'Coastal',
  nuirung: 'Highland',
  amthuc: 'Urban',
  disan: 'Heritage',
  songnuoc: 'Delta',
  vanhoa: 'Culture',
  camtrai: 'Highland',
  checkin: 'Urban',
  sinhthai: 'Delta',
  giaitri: 'Coastal'
};

/* ============ 2. DOM Elements ============ */
const inputDays = document.getElementById('days');
const btnMinus = document.getElementById('btn-minus');
const btnPlus = document.getElementById('btn-plus');
const presetBtns = document.querySelectorAll('.preset-btn');

const cbTrigger = document.getElementById('departure-trigger');
const cbText = document.getElementById('departure-text');
const cbDropdown = document.getElementById('departure-dropdown');
const cbSearch = document.getElementById('departure-search');
const cbClear = document.getElementById('departure-clear');
const cbList = document.getElementById('departure-list');
const cbChevron = document.getElementById('departure-chevron');

const destText = document.getElementById('destination-text');
const destDropdown = document.getElementById('destination-dropdown');
const destSearch = document.getElementById('destination-search');
const destClear = document.getElementById('destination-clear');
const destList = document.getElementById('destination-list');
const destChevron = document.getElementById('destination-chevron');
const destTrigger = document.getElementById('destination-trigger');
const destAzEl = document.getElementById('dest-loc-az');
const destBubbleEl = document.getElementById('dest-loc-az-bubble');

const tagButtons = document.querySelectorAll('.tag');
const generateBtn = document.getElementById('generate-btn');
const resultSection = document.getElementById('result');
const smartDistanceAlert = document.getElementById('smart-distance-alert');

// A-Z Initialization for Destination
if (destAzEl) {
  const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');
  let html = letters.map(l => `<button type="button" class="az-btn" data-letter="${l}">${l}</button>`).join('');
  destAzEl.innerHTML = html;

  let isDraggingDestAZ = false;

  function handleDestAZMove(e) {
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const target = document.elementFromPoint(clientX, clientY);

    if (target && target.classList.contains('az-btn')) {
      const letter = target.getAttribute('data-letter');

      if (destBubbleEl) {
        destBubbleEl.textContent = letter;
        const targetRect = target.getBoundingClientRect();
        const topPos = targetRect.top + targetRect.height / 2;
        destBubbleEl.style.position = 'fixed';
        destBubbleEl.style.top = `${topPos}px`;
        destBubbleEl.style.left = `${targetRect.left - 60}px`;
        destBubbleEl.classList.add('show');
      }

      if (isDraggingDestAZ || e.type === 'touchmove' || e.type === 'pointerdown') {
        const groupTarget = destList.querySelector(`[data-group="${letter}"]`);
        if (groupTarget) {
          destAzEl.parentElement.scrollTo({ top: groupTarget.offsetTop, behavior: 'instant' });
        }
      }
    }
  }

  destAzEl.addEventListener('pointerdown', (e) => {
    isDraggingDestAZ = true;
    handleDestAZMove(e);
  });
  window.addEventListener('pointerup', () => {
    isDraggingDestAZ = false;
    if (destBubbleEl) destBubbleEl.classList.remove('show');
  });
  destAzEl.addEventListener('pointermove', handleDestAZMove);
  destAzEl.addEventListener('touchmove', handleDestAZMove, { passive: true });

  // Keep the A-Z bar synced when the user scrolls the name list directly
  // (instead of dragging on the A-Z bar itself).
  function syncDestAZWithList() {
    if (isDraggingDestAZ || destAzEl.style.display === 'none') return;

    const listRect = destList.getBoundingClientRect();
    let activeLetter = null;
    destList.querySelectorAll('[data-group]').forEach(group => {
      if (group.getBoundingClientRect().top - listRect.top <= 8) {
        activeLetter = group.getAttribute('data-group');
      }
    });
    if (!activeLetter) return;

    const azBtn = destAzEl.querySelector(`[data-letter="${activeLetter}"]`);
    if (!azBtn) return;

    const azRect = destAzEl.getBoundingClientRect();
    const btnRect = azBtn.getBoundingClientRect();
    if (btnRect.top < azRect.top || btnRect.bottom > azRect.bottom) {
      destAzEl.scrollTo({
        top: azBtn.offsetTop - destAzEl.clientHeight / 2 + azBtn.clientHeight / 2,
        behavior: 'instant'
      });
    }
  }
  destList.addEventListener('scroll', syncDestAZWithList, { passive: true });
}

/* ============ 3. STATE ============ */
let state = {
  duration: '',
  departure: '',
  destination: '',
  destLevel: 1,
  destProvince: '',
  isCbOpen: false,
  isDestOpen: false,
  selectedPrefs: [],
  // Hồ sơ du lịch do chatbot trích xuất: { boost:{thẻ:hệ số}, avoid:[thẻ], intensity, notes }
  profile: {},
  // Chỉ bật true khi dự báo thời tiết lấy từ nguồn thật (hiện còn là dữ liệu mẫu)
  weatherIsReal: false,
  // Mảng lưu các điểm đã check-in (dạng Set, mỗi phần tử là "day-session-index")
  checkedDestinations: {}
};

/* ============ 4. LOGIC ============ */

// A. Duration Stepper
function updateDuration(val) {
  val = Number(val);
  if (isNaN(val)) val = 0;
  val = Math.max(0, val);
  state.duration = val;
  // Khi chưa có giá trị (0) thì để ô trống thay vì hiển thị cố định số "0"
  inputDays.value = val === 0 ? '' : val;

  presetBtns.forEach(btn => {
    if (parseInt(btn.dataset.days) === val) {
      btn.classList.add('active');
    } else {
      btn.classList.remove('active');
    }
  });

  checkWeatherAlert();
}

btnMinus.addEventListener('click', () => updateDuration(state.duration - 1));
btnPlus.addEventListener('click', () => updateDuration(state.duration + 1));
inputDays.addEventListener('change', (e) => updateDuration(parseInt(e.target.value) || 0));

presetBtns.forEach(btn => {
  btn.addEventListener('click', () => updateDuration(parseInt(btn.dataset.days)));
});

// B. Combobox Departure
function renderComboboxList(filterText = '') {
  let html = '';
  VIETNAM_PROVINCES.forEach(group => {
    const filteredOpts = group.options.filter(o => o.toLowerCase().includes(filterText.toLowerCase()));
    if (filteredOpts.length > 0) {
      html += `<div class="combobox-group">
                 <div class="combobox-group-label">${group.label}</div>`;
      filteredOpts.forEach(opt => {
        const isSelected = opt === state.departure;
        html += `<button type="button" class="combobox-option ${isSelected ? 'selected' : ''}" data-value="${opt}">
                   <span>${opt}</span>
                   ${isSelected ? `<i data-lucide="check" class="check-icon"></i>` : ''}
                 </button>`;
      });
      html += `</div>`;
    }
  });

  if (!html) {
    html = `<div style="padding: 1rem; text-align: center; color: var(--slate-soft); font-size: 0.9rem;">Không tìm thấy khu vực nào</div>`;
  }

  cbList.innerHTML = html;
  window.lucide.createIcons();

  // Attach events
  const opts = cbList.querySelectorAll('.combobox-option');
  opts.forEach(opt => {
    opt.addEventListener('click', () => {
      state.departure = opt.dataset.value;
      cbText.textContent = state.departure;
      cbText.style.color = 'var(--ink)';
      closeCombobox();
    });
  });
}

function renderDestinationList(filterText = '') {
  let html = '';
  const backBtn = document.getElementById('dest-back-btn');

  if (state.destLevel === 1) {
    if (destAzEl) destAzEl.style.display = 'flex';
    if (backBtn) backBtn.hidden = true;
    destSearch.placeholder = "Tìm kiếm điểm đến...";

    // Level 1: Choose Province, group by A-Z
    let allProvinces = [];
    VIETNAM_PROVINCES.forEach(group => {
      allProvinces.push(...group.options);
    });

    // Filter and Sort
    const filteredOpts = allProvinces.filter(o => o.toLowerCase().includes(filterText.toLowerCase()));

    const grouped = {};
    filteredOpts.forEach(opt => {
      let cleanOpt = opt;
      let letter = cleanOpt.charAt(0).toUpperCase();
      if (letter === 'Đ') letter = 'Đ';
      else if (!/[A-Z]/.test(letter)) letter = '#';
      if (!grouped[letter]) grouped[letter] = [];
      grouped[letter].push(opt);
    });

    const sortedKeys = Object.keys(grouped).sort((a, b) => {
      if (a === '#') return 1;
      if (b === '#') return -1;
      return a.localeCompare(b, 'vi');
    });

    sortedKeys.forEach(key => {
      html += `<div class="loc-group" data-group="${key}">
                 <div class="loc-group-title">${key}</div>`;

      grouped[key].sort((a, b) => a.localeCompare(b, 'vi')).forEach(opt => {
        const isSelected = opt === state.destProvince;
        const hasDistricts = DESTINATION_LOCATIONS[opt] ? true : false;
        html += `<button type="button" class="loc-item level-1-opt ${isSelected ? 'selected' : ''}" data-value="${opt}" style="display: flex; align-items: center; justify-content: flex-start; gap: 8px;">
                   ${hasDistricts ? `<i data-lucide="chevron-right" style="width: 16px; height: 16px; color: var(--slate);"></i>` : `<span style="width: 16px; display: inline-block;"></span>`}
                   <span>${opt}</span>
                 </button>`;
      });
      html += `</div>`;
    });
  } else {
    if (destAzEl) destAzEl.style.display = 'flex';
    if (backBtn) backBtn.hidden = false;
    destSearch.placeholder = "Tìm kiếm quận/huyện...";

    const districts = getDistrictsForProvince(state.destProvince);
    const filteredOpts = districts.filter(o => o.toLowerCase().includes(filterText.toLowerCase()));

    const grouped = {};
    filteredOpts.forEach(opt => {
      let cleanOpt = opt;
      let letter = cleanOpt.charAt(0).toUpperCase();
      if (letter === 'Đ') letter = 'Đ';
      else if (!/[A-Z]/.test(letter)) letter = '#';
      if (!grouped[letter]) grouped[letter] = [];
      grouped[letter].push(opt);
    });

    const sortedKeys = Object.keys(grouped).sort((a, b) => {
      if (a === '#') return 1;
      if (b === '#') return -1;
      return a.localeCompare(b, 'vi');
    });

    sortedKeys.forEach(key => {
      html += `<div class="loc-group" data-group="${key}">
                 <div class="loc-group-title">${key}</div>`;

      grouped[key].sort((a, b) => a.localeCompare(b, 'vi')).forEach(opt => {
        const fullVal = `${opt}, ${state.destProvince}`;
        const isSelected = fullVal === state.destination;
        html += `<button type="button" class="loc-item level-2-opt ${isSelected ? 'selected' : ''}" data-value="${opt}" style="display: flex; align-items: center; justify-content: flex-start; gap: 8px;">
                   ${isSelected ? `<i data-lucide="check" class="check-icon" style="width: 16px; height: 16px;"></i>` : `<span style="width: 16px; display: inline-block;"></span>`}
                   <span>${opt}</span>
                 </button>`;
      });
      html += `</div>`;
    });
  }

  if (!html) {
    html = `<div class="loc-empty">Không tìm thấy khu vực nào</div>`;
  }

  destList.innerHTML = html;
  window.lucide.createIcons();

  // Attach events
  if (state.destLevel === 1) {
    const opts = destList.querySelectorAll('.level-1-opt');
    opts.forEach(opt => {
      opt.addEventListener('click', (e) => {
        e.stopPropagation();
        const val = opt.dataset.value;
        state.destProvince = val;

        if (DESTINATION_LOCATIONS[val]) {
          state.destLevel = 2;
          destSearch.value = '';
          renderDestinationList();
          destSearch.focus();
        } else {
          state.destination = val;
          destText.textContent = state.destination;
          destText.style.color = 'var(--ink)';
          closeDestCombobox();
          checkWeatherAlert();
        }
      });
    });
  } else {
    const opts = destList.querySelectorAll('.level-2-opt');
    opts.forEach(opt => {
      opt.addEventListener('click', () => {
        const district = opt.dataset.value;
        state.destination = `${district}, ${state.destProvince}`;
        destText.textContent = state.destination;
        destText.style.color = 'var(--ink)';
        closeDestCombobox();
        checkWeatherAlert();
      });
    });
  }
}

// Ensure backBtn has the event listener only once
const destBackBtn = document.getElementById('dest-back-btn');
if (destBackBtn && !destBackBtn.dataset.bound) {
  destBackBtn.dataset.bound = true;
  destBackBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    state.destLevel = 1;
    destSearch.value = '';
    renderDestinationList();
    destSearch.focus();
  });
}

function toggleCombobox() {
  state.isCbOpen = !state.isCbOpen;
  if (state.isCbOpen) {
    cbDropdown.hidden = false;
    cbChevron.classList.add('open');
    renderComboboxList();
    cbSearch.focus();
  } else {
    cbDropdown.hidden = true;
    cbChevron.classList.remove('open');
  }
}

function closeCombobox() {
  state.isCbOpen = false;
  cbDropdown.hidden = true;
  cbChevron.classList.remove('open');
}

/* 
  Departure combobox logic is now handled by js/location.js 
  cbTrigger.addEventListener('click', toggleCombobox);
  cbSearch.addEventListener('input', ...);
  cbClear.addEventListener('click', ...);
*/

// Close outside click
document.addEventListener('click', (e) => {
  if (document.getElementById('departure-container') && !document.getElementById('departure-container').contains(e.target)) {
    closeCombobox();
  }
  if (document.getElementById('destination-container') && !document.getElementById('destination-container').contains(e.target)) {
    closeDestCombobox();
  }
});

function toggleDestCombobox() {
  state.isDestOpen = !state.isDestOpen;

  // Close departure dropdown if open
  const depDropdown = document.getElementById('departure-dropdown');
  if (depDropdown && !depDropdown.hidden) {
    depDropdown.hidden = true;
  }

  if (state.isDestOpen) {
    destDropdown.hidden = false;
    destChevron.classList.add('open');
    if (!state.destProvince) {
      state.destLevel = 1; // Default to level 1 if no province selected
    }
    renderDestinationList(destSearch.value);
    destSearch.focus();
  } else {
    destDropdown.hidden = true;
    destChevron.classList.remove('open');
  }
}

function closeDestCombobox() {
  state.isDestOpen = false;
  destDropdown.hidden = true;
  destChevron.classList.remove('open');
}
window.closeDestCombobox = closeDestCombobox;

if (destTrigger) destTrigger.addEventListener('click', toggleDestCombobox);
if (destSearch) {
  destSearch.addEventListener('input', (e) => {
    const val = e.target.value;
    destClear.hidden = val.length === 0;
    renderDestinationList(val);
  });
}
if (destClear) {
  destClear.addEventListener('click', () => {
    destSearch.value = '';
    destClear.hidden = true;
    renderDestinationList();
    destSearch.focus();
  });
}

// C. Tags and Alert Logic
function checkWeatherAlert() {
  const weatherAlert = document.getElementById('weather-alert');
  const weatherDesc = document.getElementById('weather-alert-desc');
  const startDateInput = document.getElementById('start-date');
  const endDateInput = document.getElementById('end-date');

  if (!weatherAlert || !weatherDesc || !startDateInput || !endDateInput) return;

  const startDate = startDateInput.value;
  const endDate = endDateInput.value;
  const dest = state.destination;

  // Đồng bộ số ngày lịch trình theo đúng khoảng Ngày đến -> Ngày đi (ngày làm nguồn dữ liệu chính)
  if (startDate && endDate) {
    const [sd, sm, sy] = startDate.split('/');
    const [ed, em, ey] = endDate.split('/');
    const startD = new Date(sy, sm - 1, sd);
    const endD = new Date(ey, em - 1, ed);
    const diffDays = Math.round((endD - startD) / (1000 * 60 * 60 * 24)) + 1;
    if (diffDays >= 1 && diffDays <= 30 && diffDays !== state.duration) {
      updateDuration(diffDays);
      return; // updateDuration() sẽ tự gọi lại checkWeatherAlert() với state.duration đã đồng bộ
    }
  }

  if (startDate && endDate && dest) {
    weatherAlert.hidden = false;
    loadRealWeather(dest, startDate, weatherDesc);
  } else {
    weatherAlert.hidden = true;
    state.weatherForecast = [];
    state.weatherIsReal = false;
  }
}

/**
 * Lấy dự báo thật từ Open-Meteo (js/weather.js) cho điểm đến và khoảng ngày đã chọn.
 * Không bao giờ hiển thị số liệu mẫu: lỗi mạng thì báo lỗi và lịch trình vẫn tạo bình thường.
 * Mọi chữ hiển thị đi qua js/i18n-ext.js nên tự đổi ngôn ngữ khi người dùng bấm VN/EN.
 */
const __weatherCache = {};
function loadRealWeather(dest, startDate, weatherDesc) {
  const T = (k, p) => (window.VNI18n ? window.VNI18n.t(k, p) : k);
  const rightCol = document.getElementById('weather-daily-forecast');
  const days = state.duration || 3;
  const province = state.destProvince || dest.split(',').pop().trim();
  const cacheKey = [dest, startDate, days].join('|');
  const token = (state.__weatherToken = (state.__weatherToken || 0) + 1);

  state.weatherForecast = [];
  state.weatherIsReal = false;
  state.__weatherRerender = null;

  // Thông báo trạng thái (đang tải / lỗi): VNI18n.set đăng ký để tự dịch khi đổi ngôn ngữ
  const status = (key, params) => {
    if (token !== state.__weatherToken) return;
    if (window.VNI18n) window.VNI18n.set(weatherDesc, key, params); else weatherDesc.textContent = key;
    if (rightCol) rightCol.innerHTML = '';
  };

  const render = (list) => {
    if (token !== state.__weatherToken) return;
    const valid = list.filter(Boolean);
    if (!valid.length) { status('Chưa có dữ liệu thời tiết cho khoảng ngày này.'); return; }

    state.weatherForecast = list.map(d => (d ? d.icon : 'cloud'));
    state.weatherIsReal = true;
    state.__weatherRerender = () => render(list);

    // Khối này tự vẽ lại từ đầu nên bỏ đăng ký của thông báo trạng thái cũ
    weatherDesc.removeAttribute('data-vni-k');
    weatherDesc.removeAttribute('data-vni-p');

    const tmin = Math.min(...valid.map(d => d.tmin));
    const tmax = Math.max(...valid.map(d => d.tmax));
    const rainy = valid.filter(d => d.rain).length;
    const estimated = valid.some(d => d.estimated);
    const advice = rainy === 0
      ? T('Phù hợp cho các hoạt động ngoài trời.')
      : T('Có {rainy}/{total} ngày nhiều khả năng mưa. Lịch trình sẽ ưu tiên địa điểm trong nhà vào những ngày này.', { rainy, total: valid.length });
    weatherDesc.innerHTML = `${escapeHtml(T('Thời tiết tại {dest}:', { dest }))}
      <ul style="margin-top: 4px; padding-left: 20px; margin-bottom: 0;">
        <li>${escapeHtml(T('Nhiệt độ dao động {tmin} - {tmax}°C', { tmin, tmax }))}</li>
        <li>${escapeHtml(advice)}</li>
        ${estimated ? `<li><i>${escapeHtml(T('Các ngày xa hơn 15 ngày được ước tính theo thời tiết cùng kỳ năm trước.'))}</i></li>` : ''}
      </ul>`;

    if (rightCol) {
      rightCol.innerHTML = list.map(d => {
        if (!d) return '';
        const dd = `${String(d.date.getDate()).padStart(2, '0')}/${String(d.date.getMonth() + 1).padStart(2, '0')}`;
        const tip = T(d.label) + (d.estimated ? T(' (ước tính)') : '');
        return `
          <div style="text-align: center; flex: 0 0 auto; min-width: 48px;" title="${escapeHtml(tip)}">
            <p style="font-size: 0.75rem; font-weight: 600; margin-bottom: 8px; color: rgba(230, 81, 0, 0.7);">${dd}</p>
            <i data-lucide="${d.icon}" style="width: 24px; height: 24px; color: ${d.color}; margin: 0 auto;"></i>
            <p style="font-size: 0.9rem; font-weight: 700; margin-top: 8px; color: var(--warn);">${d.tmax}°C</p>
            ${d.pop != null && !d.estimated ? `<p style="font-size: 0.7rem; margin-top: 2px; color: #3b82f6;">${d.pop}%</p>` : ''}
          </div>`;
      }).join('');
      if (window.lucide) window.lucide.createIcons({ root: rightCol });
    }
  };

  if (__weatherCache[cacheKey]) { render(__weatherCache[cacheKey]); return; }
  if (!window.VNGeo || !window.VNWeather) { status('Chưa tải được mô-đun thời tiết.'); return; }

  status('Đang tải dự báo thời tiết tại {dest}...', { dest });

  const [dd, mm, yy] = startDate.split('/');
  const startD = new Date(Number(yy), Number(mm) - 1, Number(dd));

  window.VNGeo.locate(dest, province).then(pt => {
    if (!pt) throw new Error('no-coord');
    return window.VNWeather.fetchDays(pt.lat, pt.lng, startD, days);
  }).then(list => {
    __weatherCache[cacheKey] = list;
    render(list);
  }).catch(err => {
    console.warn('[VNFinder Weather]', err);
    status(err && err.message === 'no-coord'
      ? 'Chưa xác định được vị trí điểm đến để lấy dự báo. Lịch trình vẫn được tạo bình thường.'
      : 'Không lấy được dự báo thời tiết (lỗi kết nối). Lịch trình vẫn được tạo bình thường.');
  });
}

// Đổi ngôn ngữ: vẽ lại khối thời tiết đang hiển thị (nếu có)
if (window.VNI18n && !window.__vniWeatherBound) {
  window.__vniWeatherBound = true;
  window.VNI18n.onChange(() => { if (state.__weatherRerender) state.__weatherRerender(); });
}

const startDateEl = document.getElementById('start-date');
const endDateEl = document.getElementById('end-date');

if (window.flatpickr && window.flatpickr.l10ns && window.flatpickr.l10ns.vn) {
  window.flatpickr.l10ns.vn.months.longhand = [
    "Tháng 1", "Tháng 2", "Tháng 3", "Tháng 4", "Tháng 5", "Tháng 6",
    "Tháng 7", "Tháng 8", "Tháng 9", "Tháng 10", "Tháng 11", "Tháng 12"
  ];
}

const flatpickrConfig = {
  dateFormat: "d/m/Y",
  locale: "vn",
  disableMobile: true,
  position: "below",
  onReady: function (selectedDates, dateStr, instance) {
    const btnContainer = document.createElement("div");
    btnContainer.className = "flatpickr-buttons";
    btnContainer.innerHTML = `
      <button type="button" class="btn-clear">Clear</button>
      <button type="button" class="btn-today">Today</button>
    `;
    instance.calendarContainer.appendChild(btnContainer);

    btnContainer.querySelector('.btn-clear').addEventListener('click', () => {
      instance.clear();
      instance.close();
      checkWeatherAlert();
    });
    btnContainer.querySelector('.btn-today').addEventListener('click', () => {
      instance.setDate(new Date());
      instance.close();
      checkWeatherAlert();
    });

    const numInputWrapper = instance.calendarContainer.querySelector('.numInputWrapper');
    if (numInputWrapper) {
      numInputWrapper.style.display = 'none';

      const yearSelect = document.createElement("select");
      yearSelect.className = "flatpickr-monthDropdown-months flatpickr-year-select";

      const currentYear = new Date().getFullYear();
      for (let i = currentYear - 5; i <= currentYear + 10; i++) {
        const option = document.createElement("option");
        option.value = i;
        option.text = i;
        yearSelect.appendChild(option);
      }
      yearSelect.value = instance.currentYear;

      yearSelect.addEventListener("change", function (e) {
        instance.currentYearElement.value = e.target.value;
        instance.changeYear(e.target.value);
      });

      numInputWrapper.parentNode.insertBefore(yearSelect, numInputWrapper.nextSibling);
    }
  },
  onYearChange: function (selectedDates, dateStr, instance) {
    const yearSelect = instance.calendarContainer.querySelector('.flatpickr-year-select');
    if (yearSelect) {
      yearSelect.value = instance.currentYear;
    }
  },
  onChange: function () {
    checkWeatherAlert();
  }
};

if (startDateEl) flatpickr(startDateEl, Object.assign({}, flatpickrConfig, { position: "auto left" }));
if (endDateEl) flatpickr(endDateEl, Object.assign({}, flatpickrConfig, { position: "auto right" }));

tagButtons.forEach((btn) => {
  btn.addEventListener("click", () => {
    const tag = btn.dataset.tag;
    btn.classList.toggle("active");
    if (state.selectedPrefs.includes(tag)) {
      state.selectedPrefs = state.selectedPrefs.filter(t => t !== tag);
    } else {
      state.selectedPrefs.push(tag);
    }
    checkWeatherAlert();
  });
});

// Init tags and alert
checkWeatherAlert();

/* ============ DYNAMIC ITINERARY DATA ============ */
// Dữ liệu chi tiết theo từng điểm đến cấp 2 (ITINERARY_DATA, PROVINCE_FALLBACK,
// GENERIC_FALLBACK) được nạp từ js/itinerary-data.js, load trước file này.

/* ĐÃ BỎ toàn bộ pipeline tìm ảnh minh hoạ qua Google/Bing/Yahoo/Openverse/
   Wikimedia Commons/Wikipedia (trước đây nằm ở đây, ~370 dòng) — đây chính
   là nguồn gây ra lỗi nhiều thẻ khác nhau hiển thị TRÙNG một ảnh không liên
   quan (do proxy scrape rớt mạng/timeout thì tự rơi về từ khoá chung, hoặc
   Wikipedia/Commons search nhầm sang tài liệu/ảnh không liên quan). Card giờ
   không còn ảnh, xem js/poi-images.js nếu sau này muốn thêm icon tượng trưng. */

/**
 * Lấy đúng bộ dữ liệu (ẩm thực + địa danh) cho một điểm đến cấp 2 cụ thể.
 * Ưu tiên: dữ liệu riêng (ITINERARY_DATA) -> dữ liệu chung cấp tỉnh (PROVINCE_FALLBACK)
 * -> phương án cuối cùng (GENERIC_FALLBACK). Không bao giờ ghép ngẫu nhiên các từ rời rạc.
 */
const MIN_ITEMS_PER_SLOT = 3;
const ITINERARY_SLOTS = ['breakfast', 'morningVisit', 'lunch', 'afternoonVisit', 'dinner', 'nightlife'];

// Khoá trùng lặp: món ăn so theo `dish`, địa danh so theo `name` (không phân biệt hoa/thường).
function itemDedupeKey(item) {
  return ((item.dish || item.name || '') + '').trim().toLowerCase();
}

/**
 * Gộp danh sách gợi ý cho MỘT buổi (vd. "dinner") từ cả 3 tầng dữ liệu theo thứ tự
 * ưu tiên: riêng huyện/tỉnh cụ thể -> chung cấp tỉnh -> phương án cuối toàn quốc.
 *
 * SỬA LỖI LẶP LẠI: trước đây hàm này DỪNG gộp ngay khi đạt MIN_ITEMS_PER_SLOT (3) mục,
 * nên với những điểm đến chỉ có đúng 3 (hoặc rất ít) món/địa danh ở tầng dữ liệu riêng,
 * pool cuối cùng cũng chỉ có 3 mục — khiến những ngày sau trong cùng một lịch trình
 * (2 ngày, 5 ngày...) buộc phải lặp lại y hệt các mục của ngày đầu. Giờ hàm LUÔN gộp
 * (và loại trùng) TOÀN BỘ cả 3 tầng, để pool có nhiều lựa chọn nhất có thể — dữ liệu
 * riêng của điểm đến vẫn được ưu tiên xuất hiện trước (và do đó được chọn trước) nhờ
 * thứ tự tầng truyền vào, nhưng khi lịch trình nhiều ngày cần thêm lựa chọn, hệ thống
 * vẫn còn dữ liệu THẬT (không bịa) ở tầng tỉnh/tầng chung để luân phiên thay vì lặp lại.
 */
function mergeSlotItems(slotKey, layers) {
  const merged = [];
  const seen = new Set();
  
  layers.forEach((layer, layerIndex) => {
    const arr = (layer && layer[slotKey]) || [];
    arr.forEach(item => {
      const key = itemDedupeKey(item);
      if (!key || seen.has(key)) return;
      
      if (layerIndex > 0) {
        let isDuplicate = false;
        
        for (const existingItem of merged) {
          const existingKey = itemDedupeKey(existingItem);
          // Lọc trùng khi tên thực sự bao hàm nhau (vd: "Gà nướng Bản Đôn" và "Gà nướng")
          if (existingKey.includes(key) || key.includes(existingKey)) {
            isDuplicate = true;
            break;
          }
        }
        if (isDuplicate) return;
      }
      
      seen.add(key);
      merged.push(item);
    });
  });
  return merged;
}

/**
 * LỌC DỮ LIỆU CẤP TỈNH THEO ĐỊA PHƯƠNG.
 *
 * Dữ liệu cấp tỉnh (PROVINCE_FALLBACK / EXTENDED_PROVINCE_DATA) từng được trộn nguyên vào
 * mọi điểm đến của tỉnh. Với tỉnh gồm nhiều vùng khác nhau (ví dụ Gia Lai sau sáp nhập gồm
 * Pleiku ở Tây Nguyên và Quy Nhơn ven biển), người chọn Quy Nhơn lại nhận gợi ý ở Pleiku
 * khi dữ liệu riêng của Quy Nhơn hết (lịch trình từ ngày thứ 2 trở đi).
 *
 * Khi điểm đến CÓ dữ liệu riêng, mỗi mục cấp tỉnh được phân loại:
 *   - "drop"    (loại hẳn): tỉnh có khai báo PROVINCE_REGIONS (itinerary-data.js) và điểm đến
 *               thuộc vùng KHÁC vùng mà dữ liệu cấp tỉnh mô tả. Dùng cho trường hợp đã xác nhận hai
 *               vùng cách xa nhau (Quy Nhơn so với Pleiku). Điểm đến được bù bằng dữ liệu riêng
 *               của các địa phương cùng vùng.
 *   - "foreign" (xếp sau): mục thuộc địa phương anh em, tức đã nằm trong dữ liệu riêng của địa
 *               phương đó hoặc nhắc tên địa phương đó. Không loại, vì ở nhiều tỉnh các điểm này
 *               nằm gần nhau (Lào Cai - Sa Pa); chỉ bị trừ điểm để mục của đúng địa phương hoặc
 *               trung tính được chọn trước (js/scoring.js).
 *   - "keep"    các mục còn lại.
 * Mục sinh tự động (synthetic) không thuộc địa phương nào nên luôn giữ lại làm phương án cuối.
 */
function localityName(key) {
  return String(key || '').split(',')[0].trim()
    .replace(/^(Thành phố|Thị xã|Huyện|Quận|Thị trấn|TP\.?)\s+/i, '').trim();
}

function itemMentionsAny(item, names) {
  const text = [item.name, item.dish, item.desc, item.tips, item.keyword, item.address,
    Array.isArray(item.suggestedSpots) ? item.suggestedSpots.join(' ') : '']
    .join(' ').toLowerCase();
  return names.some(n => n.length >= 4 && text.includes(n.toLowerCase()));
}

function adaptLayerForLocality(layer, classify) {
  if (!layer) return layer;
  const out = {};
  ITINERARY_SLOTS.forEach(slotKey => {
    const kept = [];
    (layer[slotKey] || []).forEach(item => {
      if (item.synthetic) { kept.push(item); return; }
      const verdict = classify(item);
      if (verdict === 'drop') return;
      // Bản sao nông để gắn cờ mà không sửa dữ liệu gốc
      kept.push(verdict === 'foreign' ? Object.assign({}, item, { _foreign: true }) : item);
    });
    out[slotKey] = kept;
  });
  return out;
}

function resolveItineraryPool(destination, province) {
  const data = (typeof ITINERARY_DATA !== 'undefined') ? ITINERARY_DATA : {};
  const fallback = (typeof PROVINCE_FALLBACK !== 'undefined') ? PROVINCE_FALLBACK : {};
  const extended = (typeof EXTENDED_PROVINCE_DATA !== 'undefined') ? EXTENDED_PROVINCE_DATA : {};
  const generic = (typeof GENERIC_FALLBACK !== 'undefined') ? GENERIC_FALLBACK : null;
  const regionCfg = (typeof PROVINCE_REGIONS !== 'undefined') ? PROVINCE_REGIONS[province] : null;

  const own = data[destination];
  let fallbackLayer = fallback[province];
  let extendedLayer = extended[province];
  const mateLayers = [];

  // Chỉ xử lý khi người dùng chọn một địa phương cụ thể có dữ liệu riêng
  if (own && destination.includes(',')) {
    const myName = localityName(destination);
    const inList = (list, name) => list.some(s => name.toLowerCase().includes(String(s).toLowerCase()));

    // Vùng của điểm đến (nếu tỉnh có khai báo vùng)
    const regions = regionCfg && Array.isArray(regionCfg.regions) ? regionCfg.regions : [];
    const myRegion = regions.findIndex(list => inList(list, myName));
    const outOfScope = myRegion !== -1 && myRegion !== regionCfg.provinceLayerRegion;

    const siblingKeys = Object.keys(data).filter(k =>
      k !== destination && k.includes(',') && k.split(',').pop().trim() === province);

    // Địa phương cùng vùng: mượn dữ liệu riêng, không coi là "ngoại lai"
    const mateKeys = myRegion === -1 ? [] : siblingKeys.filter(k => inList(regions[myRegion], localityName(k)));
    mateKeys.forEach(k => {
      const copy = {};
      ITINERARY_SLOTS.forEach(slotKey => {
        // Không mượn mục chung chung kiểu "Quán cà phê trung tâm huyện": nó chỉ đúng với địa phương gốc
        copy[slotKey] = ((data[k] || {})[slotKey] || [])
          .filter(it => !/trung tâm (huyện|thị xã|thị trấn)/i.test(it.name || it.dish || ''))
          .map(it => Object.assign({}, it, { _near: true }));
      });
      mateLayers.push(copy);
    });

    const otherKeys = siblingKeys.filter(k => !mateKeys.includes(k));
    const siblingNames = otherKeys.map(localityName).filter(n => n && n !== myName);
    const claimed = new Set();
    otherKeys.forEach(k => ITINERARY_SLOTS.forEach(slotKey => {
      ((data[k] || {})[slotKey] || []).forEach(it => claimed.add(itemDedupeKey(it)));
    }));

    const classify = (item) => {
      if (outOfScope) return 'drop';
      if (claimed.has(itemDedupeKey(item)) || itemMentionsAny(item, siblingNames)) return 'foreign';
      return 'keep';
    };

    fallbackLayer = adaptLayerForLocality(fallbackLayer, classify);
    extendedLayer = adaptLayerForLocality(extendedLayer, classify);
  }

  const layers = [];
  if (own) layers.push(own);
  mateLayers.forEach(l => layers.push(l));
  if (fallbackLayer) layers.push(fallbackLayer);
  if (extendedLayer) layers.push(extendedLayer);

  // Người dùng yêu cầu KHÔNG dùng gợi ý chung chung nếu đã có dữ liệu chính xác.
  // Do đó, chỉ dùng GENERIC_FALLBACK khi điểm đến này hoàn toàn chưa có dữ liệu.
  if (layers.length === 0 && generic) {
    const customizedGeneric = JSON.parse(JSON.stringify(generic));
    ITINERARY_SLOTS.forEach(slotKey => {
      if (customizedGeneric[slotKey]) {
        customizedGeneric[slotKey].forEach(item => {
          if (item.name) {
            item.name = item.name + ' tại ' + (province || destination);
          }
        });
      }
    });
    layers.push(customizedGeneric);
  }

  const pool = {};
  ITINERARY_SLOTS.forEach(slotKey => {
    pool[slotKey] = mergeSlotItems(slotKey, layers);
  });
  return pool;
}

/**
 * SỬA LỖI LẶP LẠI (phần 2): thuật toán cũ `pickForDay(arr, dayIndex, count, seed)` chọn
 * theo công thức (offset + dayIndex*count + i) % n. Khi pool `arr` chỉ có đúng (hoặc gần
 * đúng) `count` phần tử — vốn RẤT PHỔ BIẾN với dữ liệu hiện có — thì dayIndex*count chia
 * hết (hoặc gần hết) cho n, nên mọi ngày đều rơi về CÙNG một bộ chỉ số, tức mọi ngày hiện
 * y hệt nhau. Thay bằng cơ chế "túi xáo bài" (giống cách chia bài Tetris ngẫu nhiên): xáo
 * trộn toàn bộ pool rồi rút dần KHÔNG hoàn lại; khi rút hết một vòng mới xáo trộn lại vòng
 * kế tiếp. Nhờ đó:
 *  - Trong CÙNG một ngày không bao giờ có 2 mục trùng nhau (kiểm tra thêm bằng `usedKeysThisDay`
 *    để không trùng ngay cả khi việc rút rơi đúng vào ranh giới xáo vòng mới).
 *  - Giữa các ngày, một mục chỉ có thể xuất hiện lại SAU KHI toàn bộ các mục khác trong pool
 *    đã được dùng hết một lượt (thay vì lặp lại ngay từ ngày kế tiếp như trước).
 *  - Nếu pool nhỏ hơn `count` (rất hiếm), buộc phải lặp trong ngày vì không đủ lựa chọn khác.
 */
function seededRandom(seed) {
  let s = seed % 2147483647;
  if (s <= 0) s += 2147483646;
  return function () {
    s = (s * 16807) % 2147483647;
    return (s - 1) / 2147483646;
  };
}

function shuffleWithRng(arr, rng) {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function isIndoorItem(item) {
  const text = ((item.name || item.dish || '') + ' ' + (item.desc || '')).toLowerCase();
  const indoorKeywords = ['bảo tàng', 'chợ', 'quán', 'nhà hàng', 'đình', 'chùa', 'trung tâm thương mại', 'cà phê', 'di tích', 'trong nhà'];
  return indoorKeywords.some(kw => text.includes(kw));
}

/**
 * Sinh sẵn danh sách gợi ý cho TOÀN BỘ `totalDays` ngày của một buổi (vd. tất cả bữa sáng
 * của cả chuyến đi), dùng cơ chế "túi xáo bài" mô tả ở trên.
 */
function buildSlotSequence(pool, totalDays, count, rng, weatherArray, slotKey) {
  const days = [];
  if (!pool || pool.length === 0) {
    for (let d = 0; d < totalDays; d++) days.push([]);
    return days;
  }

  let bag = shuffleWithRng(pool, rng);
  for (let d = 0; d < totalDays; d++) {
    const dayItems = [];
    const usedKeysThisDay = new Set();
    const isRainy = weatherArray && weatherArray[d] && (weatherArray[d].includes('rain') || weatherArray[d].includes('lightning'));

    while (dayItems.length < count) {
      if (bag.length === 0) {
        bag = shuffleWithRng(pool, rng); // hết vòng: xáo lại toàn bộ pool cho vòng tiếp theo
      }
      
      // Chọn theo điểm số (js/scoring.js): sở thích, nhịp độ, thời tiết, đa dạng trong buổi.
      // Nếu scoring.js không tải được thì quay về cách chọn cũ theo trong nhà/ngoài trời.
      let idx = -1;
      let why = [];
      if (window.VNScoring) {
        const r = window.VNScoring.pickIndex(bag, {
          slotKey: slotKey,
          prefs: state.selectedPrefs || [],
          profile: state.profile || {},
          isRainy: !!isRainy,
          weatherReal: !!state.weatherIsReal,
          usedKeys: usedKeysThisDay,
          keyFn: itemDedupeKey,
          dayItems: dayItems,
          coordOf: (it) => (window.VNGeo ? window.VNGeo.peek(it.name, state.destProvince || (state.destination || '').split(',').pop().trim()) : null),
          rng: rng
        });
        idx = r.index;
        why = r.why;
      } else if (isRainy) {
        idx = bag.findIndex(it => !usedKeysThisDay.has(itemDedupeKey(it)) && isIndoorItem(it));
      } else {
        idx = bag.findIndex(it => !usedKeysThisDay.has(itemDedupeKey(it)) && !isIndoorItem(it));
      }

      // Nếu không tìm được item thoả điều kiện, lấy item đầu tiên chưa dùng
      if (idx === -1) {
        idx = bag.findIndex(it => !usedKeysThisDay.has(itemDedupeKey(it)));
        why = [];
      }

      if (idx === -1) idx = 0; // pool nhỏ hơn count: đành chấp nhận trùng trong ngày, không còn lựa chọn khác
      const [picked] = bag.splice(idx, 1);
      // Bản sao nông để gắn lý do gợi ý mà không sửa dữ liệu gốc
      const item = why.length ? Object.assign({}, picked, { _why: why }) : picked;
      dayItems.push(item);
      usedKeysThisDay.add(itemDedupeKey(item));
    }
    days.push(dayItems);
  }
  return days;
}

/**
 * Sinh lịch trình đầy đủ cho `totalDays` ngày, dựa trên điểm đến cấp 2 cụ thể.
 * Mỗi ngày có 4 buổi: sáng (ẩm thực + tham quan), trưa (ẩm thực), chiều (tham quan),
 * tối (ẩm thực + trải nghiệm về đêm).
 */
function buildFullItinerary(destination, province, totalDays) {
  const pool = resolveItineraryPool(destination, province);
  // Seed nguyên dương lớn để trộn đều giữa các lần bấm "Tạo lịch trình" khác nhau,
  // nhưng vẫn tái lập được (deterministic) TRONG một lần tạo duy nhất.
  const seed = Math.floor(Math.random() * 2147483646) + 1;
  const rng = seededRandom(seed);

  const sessionCounts = {
    breakfast: 3,
    morningVisit: 3,
    lunch: 3,
    afternoonVisit: 3,
    dinner: 3,
    nightlife: 3
  };

  // Sinh trước chuỗi gợi ý cho CẢ CHUYẾN ĐI theo từng buổi (không còn tính rời rạc từng
  // ngày một cách độc lập), để cơ chế "túi xáo bài" biết chính xác những gì đã dùng.
  const sequences = {};
  ITINERARY_SLOTS.forEach(slotKey => {
    sequences[slotKey] = buildSlotSequence(pool[slotKey], totalDays, sessionCounts[slotKey], rng, state.weatherForecast, slotKey);
  });

  const itinerary = {};
  for (let day = 1; day <= totalDays; day++) {
    const dayIndex = day - 1;
    itinerary[day] = {
      morning: {
        food: sequences.breakfast[dayIndex] || [],
        visit: sequences.morningVisit[dayIndex] || []
      },
      noon: {
        food: sequences.lunch[dayIndex] || []
      },
      afternoon: {
        visit: sequences.afternoonVisit[dayIndex] || []
      },
      evening: {
        food: sequences.dinner[dayIndex] || [],
        visit: sequences.nightlife[dayIndex] || []
      }
    };
  }

  return itinerary;
}

// D. Generate Logic
generateBtn.addEventListener("click", () => {
  if (!state.duration || !state.departure || !state.destination || !startDateEl.value || !endDateEl.value) {
    alert("Vui lòng điền đầy đủ các thông tin: Ngày đến/đi, Số ngày, Điểm khởi hành và Điểm đến trước khi tạo lịch trình.");
    return;
  }
  if (state.selectedPrefs.length === 0) {
    alert("Vui lòng chọn ít nhất một sở thích trải nghiệm.");
    return;
  }

  generateBtn.disabled = true;
  generateBtn.innerHTML = `<i data-lucide="loader-circle" class="cta-icon spin"></i><span>Đang phân tích & tối ưu...</span>`;
  window.lucide.createIcons();

  setTimeout(() => {
    // Điểm đến cấp 2 cụ thể (vd: "Pleiku, Gia Lai") và tỉnh tương ứng
    const provinceStr = state.destProvince || state.destination.split(',').pop().trim();

    // Thu thập thông tin số người (nếu có) để tối ưu nhịp độ chuyến đi
    const chEl = document.getElementById('guests-children');
    const adEl = document.getElementById('guests-adults');
    const seEl = document.getElementById('guests-seniors');
    state.guests = {
      children: chEl ? (parseInt(chEl.value, 10) || 0) : 0,
      adults: adEl ? (parseInt(adEl.value, 10) || 0) : 0,
      seniors: seEl ? (parseInt(seEl.value, 10) || 0) : 0
    };
    if ((state.guests.children > 0 || state.guests.seniors > 0) && !state.profile.intensity) {
      state.profile.intensity = 'low';
    }

    // Thu thập chi phí dự kiến mỗi người (nếu có)
    const bgEl = document.getElementById('budget-per-person');
    state.budgetPerPerson = bgEl ? (parseInt(bgEl.value.replace(/\D/g, ''), 10) || 0) : 0;

    // Lọc Sở Thích Theo Địa Lý (Quy tắc 1)
    const coastalProvinces = ['Quảng Ninh', 'Hải Phòng', 'Thanh Hóa', 'Nghệ An', 'Hà Tĩnh', 'Quảng Bình', 'Quảng Trị', 'Huế', 'Đà Nẵng', 'Quảng Nam', 'Quảng Ngãi', 'Bình Định', 'Phú Yên', 'Khánh Hòa', 'Ninh Thuận', 'Bình Thuận', 'Bà Rịa - Vũng Tàu', 'Hồ Chí Minh', 'Tiền Giang', 'Bến Tre', 'Trà Vinh', 'Sóc Trăng', 'Bạc Liêu', 'Cà Mau', 'Kiên Giang'];
    const mountainProvinces = ['Hà Giang', 'Cao Bằng', 'Bắc Kạn', 'Tuyên Quang', 'Lào Cai', 'Lai Châu', 'Điện Biên', 'Sơn La', 'Hòa Bình', 'Yên Bái', 'Lạng Sơn', 'Thái Nguyên', 'Gia Lai', 'Đắk Lắk', 'Lâm Đồng', 'Đắk Nông', 'Kon Tum'];
    
    if (!coastalProvinces.some(p => provinceStr.includes(p))) {
      state.selectedPrefs = state.selectedPrefs.filter(p => p !== 'bien');
    }
    if (!mountainProvinces.some(p => provinceStr.includes(p))) {
      state.selectedPrefs = state.selectedPrefs.filter(p => p !== 'nuirung');
    }

    // Số ngày lấy trực tiếp từ khoảng Ngày đến -> Ngày đi (đã đồng bộ trong checkWeatherAlert)
    state.generatedItinerary = buildFullItinerary(state.destination, provinceStr, state.duration);
    state.checkedDestinations = {};

    state.selectedWeek = 1;
    state.selectedDay = 1;

    renderResult();

    generateBtn.disabled = false;
    generateBtn.innerHTML = `<i data-lucide="sparkles" class="cta-icon"></i><span>Tạo Lịch Trình Ngay</span>`;
    window.lucide.createIcons();
  }, 1200);
});

/* ============ 5. Render ============ */

// Khung giờ mặc định hiển thị theo từng buổi (không cần dữ liệu riêng cho từng món)
const SLOT_HOURS = {
  breakfast: '06:00 - 08:00',
  morningVisit: '08:00 - 11:00',
  lunch: '11:00 - 13:00',
  afternoonVisit: '13:30 - 17:00',
  dinner: '18:00 - 21:00',
  nightlife: '19:00 - 23:00'
};

// Nhãn + icon cho từng nhóm nội dung trong 1 buổi
const SUBGROUP_META = {
  food: { label: 'Ẩm thực gợi ý', icon: 'utensils' },
  visit: { label: 'Địa danh tham quan', icon: 'map-pin' },
  nightlifeVisit: { label: 'Trải nghiệm về đêm', icon: 'moon-star' }
};

function escapeHtml(str) {
  return String(str == null ? '' : str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

// Vẽ 1 thẻ (card) cho 1 món ăn hoặc 1 địa danh
function renderDestCard(item, kind, slotKey, provinceStr) {
  const isFood = kind === 'food';
  const title = isFood ? item.dish : item.name;
  
  const descText = item.desc || '';
  const tipsText = item.tips || '';
  
  const safeTitle = escapeHtml(title);
  const safeDesc = escapeHtml(descText || tipsText || title);
  
  // Thông tin mở rộng
  const priceFallback = isFood ? (FOOD_PRICE_FALLBACK_BY_SLOT[slotKey] || FOOD_PRICE_FALLBACK_BY_SLOT.lunch) : VISIT_TICKET_FALLBACK;
  const priceVal = escapeHtml(isFood ? (item.priceRange || priceFallback) : (item.ticketPrice || priceFallback));
  
  const locVal = escapeHtml(isFood ? ((item.suggestedSpots && item.suggestedSpots.length) ? item.suggestedSpots.join('; ') : FOOD_SPOT_FALLBACK) : (item.address || VISIT_ADDRESS_FALLBACK_TPL(provinceStr)));

  const displayTips = escapeHtml(tipsText || (isFood ? "Vào giờ cao điểm quán có thể đông, bạn nên sắp xếp thời gian hợp lý nhé." : "Một trải nghiệm văn hóa địa phương tuyệt vời đang chờ đón bạn!"));

  const safeKeyword = escapeHtml(item.keyword || title);
  const safeProvince = escapeHtml(provinceStr);
  const checkKey = `${state.selectedDay}-${slotKey}-${safeKeyword}`;
  const isChecked = !!state.checkedDestinations[checkKey];

  const cardId = window.__cardRegistry.length;
  window.__cardRegistry.push({ item, kind, slotKey, provinceStr, title });

  const vni = window.VNI18n;
  const whyHtml = (vni && item._why && item._why.length)
    ? `<div class="dest-why" style="margin-top: 0.75rem; font-size: 0.8rem; color: var(--accent); display:flex; gap:0.4rem; align-items:flex-start;"><i data-lucide="sparkles" class="meta-icon" style="width:14px; height:14px; margin-top:2px; flex-shrink:0;"></i> <span>${item._why.slice(0, 2).map(w => vni.reasonSpan(w)).join(' · ')}</span></div>`
    : '';
  const unverifiedHtml = (vni && item.synthetic)
    ? `<div class="dest-why dest-why--unverified" style="margin-top: 0.75rem; font-size: 0.8rem; color: #ea580c; display:flex; gap:0.4rem; align-items:flex-start;"><i data-lucide="info" class="meta-icon" style="width:14px; height:14px; margin-top:2px; flex-shrink:0;"></i> <span>${vni.reasonSpan({ k: 'unverified' })}</span></div>`
    : '';

  // Theme colors
  const themeColor = isFood ? '#ea580c' : '#059669';
  const themeBg = isFood ? 'rgba(234, 88, 12, 0.05)' : 'rgba(5, 150, 105, 0.05)';
  const themeBadgeBg = isFood ? 'rgba(234, 88, 12, 0.1)' : 'var(--accent-soft)';
  const badgeIcon = isFood ? 'utensils' : 'map-pin';

  return `
    <article class="destination-card ${isFood ? 'food-card' : 'visit-card'} ${isChecked ? 'is-checked' : ''}" data-card-id="${cardId}" onclick="openDestDetail(event, ${cardId})" style="background: var(--vn-surface); border: 1px solid var(--border); border-radius: 16px; overflow: hidden; box-shadow: 0 4px 15px rgba(0,0,0,0.03);">
      <div class="dest-card-header" style="display: flex; align-items: flex-start; gap: 0.65rem; padding: 1rem 1rem 0;">
        <button type="button" class="dest-type-badge" style="background: ${themeBadgeBg};" title="Chỉ đường trên bản đồ" onclick="event.stopPropagation(); goToMapWithItem(${cardId})">
          <i data-lucide="${badgeIcon}" style="color: ${themeColor};"></i>
        </button>
        <h4 class="dest-title i18n-dyn" data-vi="${safeTitle}" style="flex: 1; margin: 0; font-family: var(--font-display); font-size: 1.05rem; font-weight: 700; color: var(--ink); line-height: 1.3;">${safeTitle}</h4>
        <label class="dest-checkin-label" onclick="event.stopPropagation()" title="Đánh dấu đã trải nghiệm">
          <input type="checkbox" class="dest-checkin-cb" data-key="${checkKey}" ${isChecked ? 'checked' : ''}>
          <span class="dest-checkin-mark"></span>
        </label>
      </div>
      <div class="dest-body" style="padding: 0.75rem 1rem 1rem;">
        <p class="dest-meta i18n-dyn" data-vi="${safeDesc}" style="color: var(--slate-soft); margin-bottom: 1rem; font-size: 0.85rem; line-height: 1.5; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden;">${safeDesc}</p>
        
        <div class="dest-highlight" style="color: var(--ink); font-weight: 500; font-size: 0.85rem; margin-bottom: 0.5rem; display: flex; gap: 0.4rem; align-items: flex-start;">
          <i data-lucide="wallet" class="meta-icon" style="color: #059669; width: 16px; height: 16px; margin-top: 2px; flex-shrink: 0;"></i> 
          <span><strong class="i18n-dyn" data-vi="Giá:">Giá:</strong> <span class="i18n-dyn" data-vi="${priceVal}">${priceVal}</span></span>
        </div>
        
        <div class="dest-highlight" style="color: var(--ink); font-weight: 500; font-size: 0.85rem; margin-bottom: 0.5rem; display: flex; gap: 0.4rem; align-items: flex-start;">
          <i data-lucide="navigation" class="meta-icon" style="color: var(--blue); width: 16px; height: 16px; margin-top: 2px; flex-shrink: 0;"></i> 
          <span><strong class="i18n-dyn" data-vi="${isFood ? 'Gợi ý quán' : 'Địa điểm'}:">${isFood ? 'Gợi ý quán' : 'Địa điểm'}:</strong> <span class="i18n-dyn" data-vi="${locVal}">${locVal}</span></span>
        </div>
        
        <div class="dest-tips" style="margin-top: 1rem; padding: 0.75rem; background: ${themeBg}; border-radius: 8px; border-left: 3px solid ${themeColor};">
          <p style="margin: 0; color: ${themeColor}; font-size: 0.85rem; display: flex; gap: 0.4rem; align-items: flex-start;">
            <i data-lucide="lightbulb" style="width: 14px; height: 14px; flex-shrink: 0; margin-top: 2px;"></i> 
            <span><strong class="i18n-dyn" data-vi="Mẹo nhỏ:">Mẹo nhỏ:</strong> <span class="i18n-dyn" data-vi="${displayTips}">${displayTips}</span></span>
          </p>
        </div>
        
        ${unverifiedHtml || whyHtml}
      </div>
    </article>
  `;
}

// Vẽ 1 nhóm nhỏ (vd: "Ẩm thực gợi ý") gồm tiêu đề + lưới thẻ, bỏ qua nếu rỗng
function renderSubGroup(groupKey, items, kind, slotKey, provinceStr) {
  if (!items || items.length === 0) return '';
  const meta = SUBGROUP_META[groupKey];
  let html = `
    <div class="dest-subgroup-header dest-subgroup-${groupKey}">
      <i data-lucide="${meta.icon}"></i>
      <span>${meta.label}</span>
    </div>
    <div class="destination-grid">
  `;
  items.forEach(item => {
    html += renderDestCard(item, kind, slotKey, provinceStr);
  });
  html += `</div>`;
  return html;
}

function renderResult() {
  window.__cardRegistry = []; // reset để id thẻ luôn khớp với lần render hiện tại
  const totalDays = state.duration || 1;
  let html = `
    <div class="result-header" style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:16px;">
      <div style="flex: 1; min-width: 120px;"></div>
      <h2 style="margin: 0; text-align: center; white-space: nowrap;">Lịch Trình Đề Xuất</h2>
      <div style="flex: 1; display: flex; justify-content: flex-end; min-width: 120px;">
        <button type="button" id="save-itinerary-btn" class="save-itinerary-btn">
          <i data-lucide="bookmark" style="width:18px; height:18px;"></i> Lưu lịch trình
        </button>
      </div>
    </div>
  `;

  // Week Selector (Only if >= 14 days)
  if (totalDays >= 14) {
    const totalWeeks = Math.ceil(totalDays / 7);
    html += `
      <div class="timeline-panel timeline-box" style="margin-top: 1.5rem;">
        <h3>Tuần</h3>
        <div class="timeline-scroll center-scroll">
    `;
    for (let w = 1; w <= totalWeeks; w++) {
      const isActive = (w === state.selectedWeek);
      html += `<button type="button" class="week-btn ${isActive ? 'active' : ''}" data-week="${w}">Tuần ${w}</button>`;
    }
    html += `
        </div>
      </div>
    `;
  }

  // Day Selector
  html += `
    <div class="timeline-panel timeline-box" style="margin-top: ${totalDays >= 14 ? '1rem' : '1.5rem'}; margin-bottom: 2rem;">
      <h3>Ngày</h3>
      <div class="timeline-scroll center-scroll">
  `;

  let startDay = 1;
  let endDay = totalDays;
  if (totalDays >= 14) {
    startDay = (state.selectedWeek - 1) * 7 + 1;
    endDay = Math.min(state.selectedWeek * 7, totalDays);
  }

  for (let d = startDay; d <= endDay; d++) {
    const isActive = (d === state.selectedDay);
    html += `<button type="button" class="circle-btn ${isActive ? 'active' : ''}" data-day="${d}">${d}</button>`;
  }

  html += `
      </div>
    </div>
  `;

  // Destination Grid for Selected Day
  const dayItinerary = state.generatedItinerary[state.selectedDay] || {};
  const provinceStr = state.destProvince || (state.destination ? state.destination.split(',').pop().trim() : '');

  // Nút xem tuyến đường của ngày đang chọn (tọa độ tra bằng js/geo.js, vẽ bằng js/maps.js)
  if (window.VNI18n && state.generatedItinerary[state.selectedDay] && state.generatedItinerary[state.selectedDay].morning) {
    html += `
      <div class="day-route-bar">
        <button type="button" class="day-route-btn" id="day-route-btn" onclick="handleShowDayRoute()">
          <i data-lucide="route"></i> ${window.VNI18n.span('Xem tuyến đường ngày {day}', { day: state.selectedDay })}
        </button>
        <span class="day-route-hint" id="day-route-hint">${window.VNI18n.span('Dùng các địa danh bạn đã đánh dấu, hoặc gợi ý đầu tiên của mỗi buổi.')}</span>
      </div>`;
  }

  html += `<div style="opacity: 0; animation: fadeIn 0.3s forwards;">`;
  if (!dayItinerary.morning) {
    html += `<div style="text-align:center; padding:3rem; color:var(--slate-soft);">Chưa có hoạt động nào cho ngày này.</div>`;
  } else {
    const sessions = [
      {
        id: 'morning', title: '🌅 Buổi Sáng', gradient: 'linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%)',
        groups: [
          { groupKey: 'food', kind: 'food', slotKey: 'breakfast', items: dayItinerary.morning.food },
          { groupKey: 'visit', kind: 'visit', slotKey: 'morningVisit', items: dayItinerary.morning.visit }
        ]
      },
      {
        id: 'noon', title: '🍲 Buổi Trưa', gradient: 'linear-gradient(135deg, #34d399 0%, #10b981 100%)',
        groups: [
          { groupKey: 'food', kind: 'food', slotKey: 'lunch', items: dayItinerary.noon.food }
        ]
      },
      {
        id: 'afternoon', title: '☀️ Buổi Chiều', gradient: 'linear-gradient(135deg, #60a5fa 0%, #3b82f6 100%)',
        groups: [
          { groupKey: 'visit', kind: 'visit', slotKey: 'afternoonVisit', items: dayItinerary.afternoon.visit }
        ]
      },
      {
        id: 'evening', title: '🌙 Buổi Tối', gradient: 'linear-gradient(135deg, #818cf8 0%, #4f46e5 100%)',
        groups: [
          { groupKey: 'food', kind: 'food', slotKey: 'dinner', items: dayItinerary.evening.food },
          { groupKey: 'nightlifeVisit', kind: 'nightlifeVisit', slotKey: 'nightlife', items: dayItinerary.evening.visit }
        ]
      }
    ];

    sessions.forEach(session => {
      html += `
        <div style="
          margin: 2.5rem 0 1.5rem;
          padding: 1rem 1.5rem;
          background: ${session.gradient};
          color: white;
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.75rem;
          box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
        ">
          <h3 style="margin: 0; font-size: 1.25rem; font-weight: 700; color: white;">${session.title}</h3>
        </div>
      `;

      session.groups.forEach(group => {
        html += renderSubGroup(group.groupKey, group.items, group.kind, group.slotKey, provinceStr);

      });
    });
  }
  html += `</div>`;

  // Add simple fade animation
  if (!document.getElementById('fade-anim-style')) {
    const style = document.createElement('style');
    style.id = 'fade-anim-style';
    style.innerHTML = `@keyframes fadeIn { to { opacity: 1; } }`;
    document.head.appendChild(style);
  }

  resultSection.innerHTML = html;
  resultSection.hidden = false;
  window.lucide.createIcons();

  // Toàn bộ #result vừa được vẽ lại bằng tiếng Việt (tiêu đề buổi, nhãn
  // nhóm, nút Lưu lịch trình...), kể cả khi chỉ đổi ngày/tuần chứ không tạo
  // lịch trình mới. Nếu trang đang ở chế độ "en", dịch lại ngay lập tức —
  // đây là chỗ khắc phục lỗi nội dung động quay về tiếng Việt khi chuyển
  // ngày/tuần trong lúc đang xem bản EN.
  if (window.applyCurrentLanguage) window.applyCurrentLanguage(resultSection);

  // Gắn checkbox check-in cho từng điểm đến
  resultSection.querySelectorAll('.dest-checkin-cb').forEach(cb => {
    cb.addEventListener('change', () => {
      const key = cb.dataset.key;
      if (cb.checked) {
        state.checkedDestinations[key] = true;
      } else {
        delete state.checkedDestinations[key];
      }
      // Cập nhật visual trạng thái card
      const card = cb.closest('.destination-card');
      if (card) card.classList.toggle('is-checked', cb.checked);
    });
    // Áp dụng trạng thái đã check trước đó vào card
    const card = cb.closest('.destination-card');
    if (card && cb.checked) card.classList.add('is-checked');
  });

  // Gắn nút Lưu lịch trình thật (thay thế onclick giả của script.js)
  var saveBtn = document.getElementById('save-itinerary-btn');
  if (saveBtn && typeof window.handleSaveItinerary === 'function') {
    saveBtn.onclick = function (e) { e.preventDefault(); window.handleSaveItinerary(); };
  }

  if (!state.isRerendering) {
    resultSection.scrollIntoView({ behavior: "smooth", block: "start" });
  }
  state.isRerendering = false;

  // Events for Week and Day buttons
  const weekBtns = resultSection.querySelectorAll('.week-btn');
  weekBtns.forEach(btn => {
    btn.addEventListener('click', (e) => {
      state.selectedWeek = parseInt(e.target.getAttribute('data-week'));
      state.selectedDay = (state.selectedWeek - 1) * 7 + 1;
      state.isRerendering = true;
      renderResult();
    });
  });

  const dayBtns = resultSection.querySelectorAll('.circle-btn');
  dayBtns.forEach(btn => {
    btn.addEventListener('click', (e) => {
      state.selectedDay = parseInt(e.target.getAttribute('data-day'));
      state.isRerendering = true;
      renderResult();
    });
  });
}

/* ĐÃ BỎ lightbox xem ảnh phóng to (openImageLightbox/closeImageLightbox) —
   không còn ảnh trên card nên không còn gì để phóng to. Nếu index.html còn
   khối <div id="image-lightbox">...</div>, xoá luôn khối đó cho gọn (không
   bắt buộc, để lại cũng không gây lỗi vì không còn gì gọi tới nó nữa). */

/* ============ Chuyển sang tab Bản đồ kèm điểm đến ============ */
/**
 * Chọn các điểm tham quan của ngày để vẽ tuyến: ưu tiên mục người dùng đã đánh dấu,
 * nếu chưa đánh dấu mục nào thì lấy gợi ý đầu tiên (điểm cao nhất) của mỗi buổi.
 */
function collectDayRouteStops(day) {
  const d = state.generatedItinerary[day];
  if (!d) return [];
  const slots = [
    { slotKey: 'morningVisit', items: d.morning && d.morning.visit },
    { slotKey: 'afternoonVisit', items: d.afternoon && d.afternoon.visit },
    { slotKey: 'nightlife', items: d.evening && d.evening.visit }
  ];
  const ticked = [];
  const firsts = [];
  slots.forEach(({ slotKey, items }) => {
    const real = (items || []).filter(it => !it.synthetic); // tên ghép tự động không có vị trí thật để vẽ tuyến
    real.forEach((item, idx) => {
      const key = `${day}-${slotKey}-${escapeHtml(item.keyword || item.name)}`;
      if (state.checkedDestinations[key]) ticked.push(item);
      if (idx === 0) firsts.push(item);
    });
  });
  return ticked.length >= 2 ? ticked : firsts;
}

async function handleShowDayRoute() {
  const btn = document.getElementById('day-route-btn');
  const hint = document.getElementById('day-route-hint');
  if (!btn || btn.disabled) return;
  const vni = window.VNI18n;
  const say = (key, params) => { if (hint) { if (vni) vni.set(hint, key, params); else hint.textContent = key; } };
  if (!window.VNGeo || !window.VNMaps) { say('Chưa tải được mô-đun bản đồ.'); return; }

  const province = state.destProvince || (state.destination ? state.destination.split(',').pop().trim() : '');
  const picks = collectDayRouteStops(state.selectedDay);
  if (picks.length < 2) { say('Cần ít nhất 2 địa danh để vẽ tuyến.'); return; }

  btn.disabled = true;
  const found = [];
  for (let i = 0; i < picks.length; i++) {
    say('Đang xác định vị trí {i}/{n}: {name}', { i: i + 1, n: picks.length, name: picks[i].name });
    const pt = await window.VNGeo.geocode(picks[i].name, province);
    if (pt) found.push({ name: picks[i].name, lat: pt.lat, lng: pt.lng });
  }
  btn.disabled = false;

  if (found.length < 2) {
    say('Chưa tìm được vị trí đủ để vẽ tuyến. Thử đánh dấu các địa danh khác.');
    return;
  }
  const skipped = picks.length - found.length;
  if (skipped) say('Đã bỏ qua {n} địa danh không tìm thấy vị trí.', { n: skipped });
  else say('Đã vẽ tuyến trên tab Bản đồ.');
  window.VNMaps.showDayRoute(found, vni ? vni.t('Ngày {day}', { day: state.selectedDay }) : `Ngày ${state.selectedDay}`);
}
window.handleShowDayRoute = handleShowDayRoute;


function goToMapWithItem(cardId) {
  const entry = (window.__cardRegistry || [])[cardId];
  if (!entry) return;
  const { item, kind, title, provinceStr } = entry;
  const isFood = kind === 'food';

  // Với món ăn: ưu tiên khu vực/quán gợi ý (nếu có) để chỉ đường tới đúng khu vực;
  // với địa danh: dùng tên địa danh kèm địa chỉ mô tả (nếu có), hoặc tỉnh/thành.
  let query;
  if (isFood && item.suggestedSpots && item.suggestedSpots.length) {
    query = item.suggestedSpots[0];
  } else if (!isFood && item.address) {
    query = `${title}, ${item.address}`;
  } else {
    query = `${title}, ${provinceStr}`;
  }

  // Lưu điểm đến để js/maps.js có thể đọc và tự tìm kiếm khi tab Bản đồ được mở.
  // Lưu ý: đây là cơ chế bàn giao best-effort — nếu js/maps.js hiện tại của bạn dùng
  // ID khác cho ô tìm kiếm, chỉ cần đọc sessionStorage.getItem('vnfinder_pending_map_query')
  // lúc tab Bản đồ được kích hoạt để tự động tìm kiếm điểm đến này.
  try {
    sessionStorage.setItem('vnfinder_pending_map_query', query);
  } catch (e) {
    // Bỏ qua nếu sessionStorage bị trình duyệt chặn
  }

  const mapTab = document.querySelector('[data-panel="panel-maps"]');
  if (mapTab) mapTab.click();

  // Thử điền sẵn vào ô tìm kiếm bản đồ nếu đã có trên trang (best-effort)
  setTimeout(() => {
    const mapInput = document.getElementById('vnmap-search-input');
    if (mapInput) {
      mapInput.value = query;
      mapInput.dispatchEvent(new Event('input', { bubbles: true }));
      mapInput.dispatchEvent(new Event('change', { bubbles: true }));
      mapInput.focus();
    }
  }, 150);
}

/* ============ Cửa sổ chi tiết (Ẩm thực / Địa danh) ============ */
// Khi một mục dữ liệu chưa được bổ sung giá/địa chỉ cụ thể, thay vì hiện "Đang cập nhật"
// (gây cảm giác thiếu thông tin), hiển thị một mức tham khảo hợp lý theo loại buổi/kiểu
// nội dung — vẫn là thông tin thật, mang tính tổng quát, không bịa số liệu chính xác giả.
const FOOD_PRICE_FALLBACK_BY_SLOT = {
  breakfast: '20.000 – 40.000đ/phần (tham khảo quán ăn sáng bình dân)',
  lunch: '30.000 – 60.000đ/phần (tham khảo quán cơm/quán ăn trưa bình dân)',
  dinner: '80.000 – 200.000đ/phần (tham khảo quán ăn tối, có thể chia sẻ theo nhóm)'
};
const FOOD_SPOT_FALLBACK = 'Quán ăn địa phương/khu chợ gần trung tâm — hỏi thêm tại nơi lưu trú để có địa chỉ cụ thể';
const VISIT_ADDRESS_FALLBACK_TPL = provinceStr => `Khu vực trung tâm ${provinceStr || 'điểm đến'} — hỏi thêm tại nơi lưu trú hoặc trên bản đồ để có địa chỉ chi tiết`;
const VISIT_TICKET_FALLBACK = 'Miễn phí, hoặc vé tham khảo 10.000 – 50.000đ tuỳ điểm (một số nơi thu phí gửi xe)';

// Dòng thông tin NGẮN, quan trọng nhất cho 1 entry — dùng để hiện thẳng trên
// card (thay cho ảnh) và cũng chính là dòng đầu tiên trong popup chi tiết,
// nên chỉ viết logic 1 chỗ này rồi tái dùng ở cả 2 nơi.
function getPrimaryHighlight(item, kind, slotKey, provinceStr) {
  if (kind === 'food') {
    const priceFallback = FOOD_PRICE_FALLBACK_BY_SLOT[slotKey] || FOOD_PRICE_FALLBACK_BY_SLOT.lunch;
    return { icon: 'wallet', label: 'Giá tham khảo', value: item.priceRange || priceFallback };
  }
  return { icon: 'map-pin', label: 'Địa điểm', value: item.address || VISIT_ADDRESS_FALLBACK_TPL(provinceStr) };
}

function buildDetailInfoRows(entry) {
  const { item, kind, slotKey, provinceStr } = entry;
  const rows = [];
  if (kind === 'food') {
    rows.push(getPrimaryHighlight(item, kind, slotKey, provinceStr));
    const spots = (item.suggestedSpots && item.suggestedSpots.length) ? item.suggestedSpots.join('; ') : FOOD_SPOT_FALLBACK;
    rows.push({ icon: 'store', label: 'Gợi ý quán / khu vực', value: spots });
    rows.push({ icon: 'clock', label: 'Khung giờ gợi ý', value: SLOT_HOURS[slotKey] || '' });
  } else {
    rows.push(getPrimaryHighlight(item, kind, slotKey, provinceStr));
    rows.push({ icon: 'clock', label: 'Khung giờ gợi ý', value: SLOT_HOURS[slotKey] || '' });
    rows.push({ icon: 'ticket', label: 'Giá vé tham khảo', value: item.ticketPrice || VISIT_TICKET_FALLBACK });
  }
  return rows;
}

function openDestDetail(e, cardId) {
  const entry = (window.__cardRegistry || [])[cardId];
  if (!entry) return;
  const { item, kind, title } = entry;
  const isFood = kind === 'food';

  const modal = document.getElementById('dest-detail-modal');
  const card = document.getElementById('dest-detail-card');
  if (!modal || !card) return;

  const cardEl = e.currentTarget;

  const badgeEl = document.getElementById('dest-detail-badge');
  const badgeText = isFood ? 'Ẩm thực' : (kind === 'nightlifeVisit' ? 'Về đêm' : 'Tham quan');
  badgeEl.textContent = badgeText;

  // Tiêu đề và mô tả là nội dung tự do (tên món/địa danh, mô tả do dữ liệu
  // sinh ra) — không nằm trong dict tĩnh, nên phải bọc "i18n-dyn" + data-vi
  // để js/i18n-auto.js dịch tự động, giống hệt cơ chế của các thẻ trong tab
  // Lịch trình. Trước đây gán thẳng bằng textContent nên phần này chưa bao
  // giờ được dịch, kể cả khi bấm nút EN.
  const titleEl = document.getElementById('dest-detail-title');
  titleEl.classList.add('i18n-dyn');
  titleEl.setAttribute('data-vi', title);
  titleEl.textContent = title;

  const descText = isFood ? (item.desc || '') : (item.tips || item.desc || '');
  const descEl = document.getElementById('dest-detail-desc');
  descEl.classList.add('i18n-dyn');
  descEl.setAttribute('data-vi', descText);
  descEl.textContent = descText;

  const rows = buildDetailInfoRows(entry);
  const gridEl = document.getElementById('dest-detail-info-grid');
  gridEl.innerHTML = rows.map(r => `
    <div class="dest-detail-info-row">
      <i data-lucide="${r.icon}"></i>
      <div>
        <span class="dest-detail-info-label">${escapeHtml(r.label)}</span>
        <span class="dest-detail-info-value i18n-dyn" data-vi="${escapeHtml(r.value)}">${escapeHtml(r.value)}</span>
      </div>
    </div>
  `).join('');

  // Modal chi tiết vừa được vẽ lại (badge, tiêu đề, mô tả, các dòng thông
  // tin) — dịch lại ngay nếu trang đang ở chế độ "en", vì trước đây modal
  // chỉ được dịch tình cờ nếu người dùng bấm nút chuyển ngữ SAU khi đã mở
  // modal, còn mở modal trong lúc đang xem bản EN thì luôn hiện tiếng Việt.
  if (window.applyCurrentLanguage) window.applyCurrentLanguage(modal);

  // Hiệu ứng: thẻ "phóng to" từ đúng vị trí vừa bấm ra giữa trang
  const startRect = cardEl.getBoundingClientRect();
  const finalWidth = Math.min(window.innerWidth * 0.9, 640);
  
  // HIỂN THỊ MODAL TRƯỚC ĐỂ TRÌNH DUYỆT TÍNH ĐƯỢC KÍCH THƯỚC (nhưng chưa vẽ lên màn hình vì JS đang chạy)
  modal.hidden = false;
  document.body.style.overflow = 'hidden';
  window.lucide.createIcons({ root: card });
  
  // Đo chiều cao thực tế của nội dung với chiều rộng cuối cùng
  card.style.transition = 'none';
  card.style.width = finalWidth + 'px';
  card.style.height = 'auto';
  const contentHeight = card.offsetHeight;
  
  const finalHeight = Math.min(contentHeight, window.innerHeight * 0.85, 680);
  const finalTop = (window.innerHeight - finalHeight) / 2;
  const finalLeft = (window.innerWidth - finalWidth) / 2;

  // Đặt lại kích thước ban đầu để chuẩn bị animate
  card.style.top = startRect.top + 'px';
  card.style.left = startRect.left + 'px';
  card.style.width = startRect.width + 'px';
  card.style.height = startRect.height + 'px';
  card.style.opacity = '0.4';

  // Ép trình duyệt tính lại layout trước khi chuyển sang trạng thái cuối để transition chạy đúng
  void card.offsetWidth;

  requestAnimationFrame(() => {
    card.style.transition = 'top 0.35s cubic-bezier(0.22, 1, 0.36, 1), left 0.35s cubic-bezier(0.22, 1, 0.36, 1), width 0.35s cubic-bezier(0.22, 1, 0.36, 1), height 0.35s cubic-bezier(0.22, 1, 0.36, 1), opacity 0.25s ease';
    card.style.top = finalTop + 'px';
    card.style.left = finalLeft + 'px';
    card.style.width = finalWidth + 'px';
    card.style.height = finalHeight + 'px';
    card.style.opacity = '1';
  });
}

function closeDestDetail() {
  const modal = document.getElementById('dest-detail-modal');
  const card = document.getElementById('dest-detail-card');
  if (!modal) return;
  modal.hidden = true;
  document.body.style.overflow = '';
  if (card) {
    card.style.transition = '';
    card.style.top = '';
    card.style.left = '';
    card.style.width = '';
    card.style.height = '';
    card.style.opacity = '';
  }
}

document.addEventListener('DOMContentLoaded', () => {
  const detailModal = document.getElementById('dest-detail-modal');
  if (!detailModal) return;
  const closeBtn = document.getElementById('dest-detail-close');
  if (closeBtn) closeBtn.addEventListener('click', closeDestDetail);
  const backdrop = detailModal.querySelector('.dest-detail-backdrop');
  if (backdrop) backdrop.addEventListener('click', closeDestDetail);
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && !detailModal.hidden) closeDestDetail();
  });
});

/* ============ 6. Khởi tạo ============ */
window.lucide.createIcons();
