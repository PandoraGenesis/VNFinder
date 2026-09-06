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
    weatherDesc.innerHTML = `Dự báo thời tiết tại <b>${dest}</b> từ ngày <b>${startDate}</b> đến ngày <b>${endDate}</b>:
      <ul style="margin-top: 4px; padding-left: 20px; margin-bottom: 0;">
        <li>Thời tiết dự kiến khá đẹp, trời nắng ráo</li>
        <li>Nhiệt độ dao động 24 - 30°C</li>
        <li>Rất thích hợp cho các hoạt động trải nghiệm ngoài trời</li>
      </ul>`;

    // Render daily forecast
    const rightCol = document.getElementById('weather-daily-forecast');
    if (rightCol) {
      let dailyHtml = '';
      const icons = ['sun', 'cloud-sun', 'cloud-rain', 'sun', 'cloud'];
      const colors = ['#f59e0b', '#f59e0b', '#3b82f6', '#f59e0b', '#94a3b8'];
      const temps = ['30°C', '28°C', '25°C', '29°C', '27°C'];

      let [d, m, y] = startDate.split('/');
      let currentDate = new Date(y, m - 1, d);
      let daysToShow = state.duration || 3;
      state.weatherForecast = [];

      for (let i = 0; i < daysToShow; i++) {
        let displayDate = `${currentDate.getDate().toString().padStart(2, '0')}/${(currentDate.getMonth() + 1).toString().padStart(2, '0')}`;
        let icon = icons[i % icons.length];
        let color = colors[i % colors.length];
        let temp = temps[i % temps.length];
        state.weatherForecast.push(icon);

        dailyHtml += `
          <div style="text-align: center; flex: 0 0 auto; min-width: 48px;">
            <p style="font-size: 0.75rem; font-weight: 600; margin-bottom: 8px; color: rgba(230, 81, 0, 0.7);">${displayDate}</p>
            <i data-lucide="${icon}" style="width: 24px; height: 24px; color: ${color}; margin: 0 auto;"></i>
            <p style="font-size: 0.9rem; font-weight: 700; margin-top: 8px; color: var(--warn);">${temp}</p>
          </div>
        `;
        currentDate.setDate(currentDate.getDate() + 1);
      }
      rightCol.innerHTML = dailyHtml;
      window.lucide.createIcons({ root: rightCol });
    }

    // Khối này vừa được vẽ lại toàn bộ bằng tiếng Việt (weatherDesc + rightCol
    // đều nằm trong weatherAlert) — nếu trang đang ở chế độ "en" thì dịch lại
    // ngay, tránh việc đổi ngày/điểm đến trong lúc đang xem bản EN làm khối
    // thời tiết quay về tiếng Việt.
    if (window.applyCurrentLanguage) window.applyCurrentLanguage(weatherAlert);
  } else {
    weatherAlert.hidden = true;
  }
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

/* ---------------------------------------------------------------------------
   CẤU HÌNH NGUỒN ẢNH (tuỳ chọn) — Google Programmable Search Engine
   ---------------------------------------------------------------------------
   Đây là nguồn cho kết quả ảnh SÁT NGHĨA NHẤT với từ khoá (đúng như ảnh Google
   Hình ảnh trả về), nhưng KHÔNG có khoá dùng chung sẵn trong app vì đây là dịch
   vụ gắn với từng tài khoản Google Cloud (miễn phí 100 lượt/ngày, sau đó tính phí).
   Cách lấy khoá (khoảng 5 phút, không cần thẻ tín dụng cho mức miễn phí):
     1) Vào https://programmablesearchengine.google.com/ -> "Thêm" một công cụ tìm
        kiếm mới -> bật "Tìm kiếm trên toàn Web" -> vào Settings bật "Image search"
        (Tìm kiếm hình ảnh) -> copy mã "Search engine ID" (đây là giá trị `cx`).
     2) Vào https://console.cloud.google.com/apis/library/customsearch.googleapis.com
        -> bật "Custom Search API" -> mục Credentials -> "Create credentials" ->
        "API key" -> copy khoá đó (đây là giá trị `googleApiKey`).
   Dán 2 giá trị vào bên dưới để kích hoạt. Để trống ('') thì app tự động BỎ QUA
   bước này và dùng ngay các nguồn ảnh miễn phí, không cần khoá (Openverse,
   Wikimedia Commons, Wikipedia) — app vẫn chạy bình thường.

   LƯU Ý BẢO MẬT: đây là file JS chạy thẳng trên trình duyệt, nên bất kỳ khoá nào
   dán vào đây đều LỘ CÔNG KHAI cho ai xem mã nguồn trang (View Source/DevTools).
   Với API key có giới hạn "HTTP referrer" theo đúng domain của bạn (thiết lập
   trong Google Cloud Console) thì mức rủi ro chỉ là người khác dùng ké hạn mức
   miễn phí của bạn — vẫn nên bật giới hạn referrer này. Nếu triển khai cho nhiều
   người dùng công khai, cách an toàn hơn là đặt khoá ở một API trung gian phía
   server (proxy) rồi gọi qua đó thay vì gọi thẳng Google từ trình duyệt.
--------------------------------------------------------------------------- */
const IMAGE_SOURCE_CONFIG = {
  googleApiKey: '', // <- dán API key vào đây để bật tìm ảnh qua Google
  googleCx: ''       // <- dán Search engine ID (cx) vào đây để bật tìm ảnh qua Google
};

// Tách từ khóa thành các "token" có nghĩa (bỏ từ quá ngắn/hư từ) để chấm điểm độ
// liên quan giữa tiêu đề/trang ảnh trả về và từ khóa gốc — dùng chung cho MỌI nguồn
// ảnh bên dưới (Google, Openverse, Commons, Wikipedia) để lọc kết quả lạc đề như nhau.
const IMG_STOP_WORDS = new Set(['việt', 'nam', 'tỉnh', 'thành', 'phố', 'huyện', 'thị', 'xã', 'quận']);
function tokenize(q) {
  return q
    .toLowerCase()
    .normalize('NFC')
    .split(/[\s,]+/)
    .filter(w => w.length >= 3 && !IMG_STOP_WORDS.has(w));
}
function titleRelevanceScore(title, tokens) {
  if (!tokens.length) return 0;
  const t = (title || '').toLowerCase().normalize('NFC');
  return tokens.reduce((score, tok) => score + (t.includes(tok) ? 1 : 0), 0);
}

// Tên/tiêu đề file gợi ý đây là tài liệu lưu trữ, văn bản hành chính, bản scan báo
// cũ... (rất hay bị Commons trả về nhầm vì công cụ tìm kiếm của Commons search CẢ
// nội dung OCR bên trong file — nên một bản scan biên bản họp thời Pháp thuộc vẫn
// có thể "khớp" với từ khóa món ăn/địa danh nếu văn bản đó có nhắc tới từ đó ở đâu đó).
const DOCUMENT_LIKE_TITLE = /discours|session|rapport|bulletin|compte.?rendu|proc[eè]s.?verbal|d[eé]cret|arr[eê]t[eé]|journal officiel|chambre consultative|resolution|r[eé]solution|circulaire|convention|trait[eé]|indochine fran[cç]aise.*\d{4}|tonkin.*\d{4}|annam.*\d{4}|nh[àa]\s*xu[aấ]t\s*b[aả]n|\bnxb\b|t[uủ]{1,2}\s*s[aá]ch|th[uư]\s*x[aã]|[aấ]n\s*h[aà]nh|t[aá]i\s*b[aả]n|in\s*l[aầ]n\s*th[uứ]|di[eễ]n\s*ngh[iĩ]a|h[oồ]i\s*th[uứ]|to[aà]n\s*th[uư]|ch[iía]nh\s*s[uử]|d[iị]ch\s*gi[aả]|bi[eê]n\s*kh[aả]o|kh[aả]o\s*c[uứ]u|ni[eê]n\s*gi[aá]m|k[yỷ]\s*y[eế]u|v[aă]n\s*kh[oố]|th[uư]\s*vi[eệ]n\s*qu[oố]c\s*gia|microfilm|photocopy|b[aả]n\s*scan|scan(?:ned)?[\s_-]?(?:page|doc|book)/i;

// Ảnh có phải "trông giống trang sách/tài liệu scan" hay không, dựa trên tỉ lệ khung
// hình — bổ sung cho bộ lọc theo TÊN FILE ở trên (vì nhiều bản scan sách/tạp chí cũ
// không có tên file gợi ý rõ ràng, nhưng luôn có tỉ lệ gần khổ giấy A4/A5 dọc, khác
// hẳn ảnh chụp món ăn/địa danh thực tế thường vuông hoặc ngang).
function looksLikeScannedPage(width, height) {
  if (!width || !height) return false;
  const ratio = height / width;
  return ratio >= 1.32 && width <= 1600; // gần khổ giấy dọc (A4 ≈ 1.41) và không phải ảnh chụp độ phân giải cao
}

async function searchWiki(q, lang) {
  try {
    const url = `https://${lang}.wikipedia.org/w/api.php?action=query&generator=search&gsrsearch=${encodeURIComponent(q)}&gsrlimit=5&prop=pageimages&piprop=thumbnail|original&pithumbsize=800&format=json&origin=*`;
    const res = await fetch(url);
    const data = await res.json();
    if (data.query && data.query.pages) {
      const pages = Object.values(data.query.pages).filter(page => {
        if (!page || !(page.thumbnail || page.original)) return false;
        if (DOCUMENT_LIKE_TITLE.test((page.title || '').toLowerCase())) return false;
        const thumb = page.thumbnail;
        if (thumb && looksLikeScannedPage(thumb.width, thumb.height)) return false;
        return true;
      });
      if (pages.length) {
        // Ưu tiên trang có tiêu đề chứa từ khóa tìm kiếm (khớp thật). SỬA LỖI QUAN
        // TRỌNG: trước đây khi KHÔNG trang nào khớp tiêu đề (score = 0 cho tất cả),
        // code vẫn cứ lấy đại kết quả xếp hạng đầu của full-text search (pages[0]) —
        // đây chính là nguyên nhân các trang hoàn toàn không liên quan (vd. một
        // cuốn sách/tài liệu cũ chỉ tình cờ được xếp hạng cao) vẫn bị hiển thị làm
        // ảnh minh hoạ. Giờ nếu không có trang nào khớp, trả về null để hàm gọi
        // chuyển sang thử nguồn ảnh khác hoặc biến thể từ khóa khác, thay vì liều
        // lĩnh hiển thị một ảnh sai hoàn toàn.
        const tokens = tokenize(q);
        const scored = pages
          .map(page => ({ page, score: titleRelevanceScore(page.title, tokens) }))
          .sort((a, b) => b.score - a.score);
        if (scored[0].score > 0) {
          const best = scored[0].page;
          if (best.thumbnail) return best.thumbnail.source;
          if (best.original) return best.original.source;
        }
      }
    }
  } catch (e) {
    console.error(e);
  }
  return null;
}

function isUsablePhoto(page) {
  if (!page || !page.imageinfo || !page.imageinfo[0]) return false;
  const info = page.imageinfo[0];
  const urlStr = ((info.thumburl || info.url) || '').toLowerCase();
  // Chỉ nhận file ảnh chụp thực tế — loại PDF/DJVU/TIFF/SVG (thường là văn bản scan,
  // bản đồ, sơ đồ kỹ thuật... không phải ảnh minh hoạ món ăn/địa danh).
  if (!/\.(jpe?g|png|webp)(?:\?|$)/.test(urlStr)) return false;
  const title = (page.title || '').toLowerCase();
  if (DOCUMENT_LIKE_TITLE.test(title)) return false;
  if (looksLikeScannedPage(info.thumbwidth, info.thumbheight)) return false;
  return true;
}

// Wikimedia Commons: kho ảnh chụp thực tế lớn hơn nhiều so với chỉ tìm bài viết
// Wikipedia — tăng đáng kể khả năng tìm được ảnh đúng cho các món ăn/địa danh ít
// nổi tiếng mà Wikipedia không có hẳn một bài viết riêng.
async function searchCommons(q, limit) {
  try {
    limit = limit || 1;
    // Luôn xin nhiều hơn số cần dùng để còn dư mà lọc bỏ file không phù hợp.
    const fetchLimit = Math.max(limit, 8);
    const url = `https://commons.wikimedia.org/w/api.php?action=query&generator=search&gsrsearch=${encodeURIComponent(q)}&gsrnamespace=6&gsrlimit=${fetchLimit}&prop=imageinfo&iiprop=url&iiurlwidth=800&format=json&origin=*`;
    const res = await fetch(url);
    const data = await res.json();
    if (data.query && data.query.pages) {
      const pages = Object.values(data.query.pages).filter(isUsablePhoto);
      if (pages.length) {
        // Ưu tiên lọc theo tên file có chứa từ khóa (khớp thật) trước, chỉ ngẫu
        // nhiên hoá TRONG nhóm đã khớp để vẫn có sự đa dạng giữa các thẻ — tránh
        // chọn ngẫu nhiên trong TOÀN BỘ kết quả full-text (bắt cả mô tả/OCR trong
        // file) vốn là nguyên nhân chính gây ảnh sai/lệch chủ đề trước đây.
        const tokens = tokenize(q);
        const relevant = pages.filter(p => titleRelevanceScore(p.title, tokens) > 0);
        // SỬA LỖI QUAN TRỌNG: trước đây khi KHÔNG file nào khớp tên/tiêu đề, code vẫn
        // random trong TOÀN BỘ kết quả full-text (biến `pages` chưa lọc theo độ liên
        // quan) — nghĩa là có thể chọn ngẫu nhiên bất kỳ file nào chỉ tình cờ được xếp
        // hạng cao trong tìm kiếm toàn văn (kể cả một cuốn sách quét, ảnh không liên
        // quan...). Giờ nếu không có file nào thật sự khớp, trả về null để chuyển
        // sang thử nguồn/từ khóa khác thay vì hiển thị một ảnh sai hoàn toàn.
        if (!relevant.length) return null;
        const pick = relevant[Math.floor(Math.random() * relevant.length)];
        return pick.imageinfo[0].thumburl || pick.imageinfo[0].url;
      }
    }
  } catch (e) {
    console.error(e);
  }
  return null;
}

// Openverse (openverse.org): công cụ tìm kiếm ảnh Creative Commons tổng hợp từ
// Flickr, bảo tàng, kho ảnh mở... — nguồn ẢNH CHỤP THỰC TẾ rộng hơn nhiều so với
// Wikimedia đơn thuần, KHÔNG cần đăng ký khoá API, giúp mở rộng khả năng tìm đúng
// ảnh cho các món ăn/địa danh nhỏ, ít được viết bài trên Wikipedia/Commons.
async function searchOpenverse(q, limit) {
  try {
    limit = limit || 6;
    const url = `https://api.openverse.org/v1/images/?q=${encodeURIComponent(q)}&page_size=${limit}&mature=false`;
    const res = await fetch(url);
    if (!res.ok) return null;
    const data = await res.json();
    const results = (data.results || [])
      .filter(r => (r.url || r.thumbnail))
      .filter(r => !DOCUMENT_LIKE_TITLE.test((r.title || '').toLowerCase()))
      .filter(r => !looksLikeScannedPage(r.width, r.height));
    if (!results.length) return null;
    const tokens = tokenize(q);
    const scored = results
      .map(r => ({ r, score: titleRelevanceScore(r.title, tokens) }))
      .sort((a, b) => b.score - a.score);
    // SỬA LỖI QUAN TRỌNG: trước đây khi không kết quả nào khớp tiêu đề, code vẫn lấy
    // đại results[0] (kết quả xếp hạng đầu của Openverse cho riêng biến thể từ khóa
    // này) — dễ ra ảnh hoàn toàn lạc đề (ảnh nghệ thuật, hoạ tiết, bìa sách...) như
    // các ảnh trừu tượng màu đỏ/mận trong ảnh chụp màn hình người dùng gửi. Giờ trả
    // về null để chuyển sang nguồn/từ khóa tiếp theo.
    if (scored[0].score === 0) return null;
    const best = scored[0].r;
    return best.url || best.thumbnail;
  } catch (e) {
    console.error(e);
  }
  return null;
}

// Google Programmable Search Engine (Custom Search JSON API), chế độ tìm ảnh —
// nguồn cho kết quả SÁT NGHĨA NHẤT với từ khoá, tương đương Google Hình ảnh, vì
// chỉ mục ảnh của Google bao phủ gần như toàn bộ web (blog ẩm thực, báo du lịch,
// review quán ăn...). Chỉ chạy khi đã cấu hình khoá ở IMAGE_SOURCE_CONFIG phía trên.
async function searchGoogleImages(q, limit) {
  if (!IMAGE_SOURCE_CONFIG.googleApiKey || !IMAGE_SOURCE_CONFIG.googleCx) return null;
  try {
    limit = limit || 6;
    const url = `https://www.googleapis.com/customsearch/v1?key=${encodeURIComponent(IMAGE_SOURCE_CONFIG.googleApiKey)}&cx=${encodeURIComponent(IMAGE_SOURCE_CONFIG.googleCx)}&searchType=image&safe=active&num=${limit}&q=${encodeURIComponent(q)}`;
    const res = await fetch(url);
    if (!res.ok) return null; // vd. sai khoá, hết hạn mức miễn phí trong ngày...
    const data = await res.json();
    const items = (data.items || [])
      .filter(it => it.link)
      .filter(it => !DOCUMENT_LIKE_TITLE.test(`${it.title || ''}`.toLowerCase()));
    if (!items.length) return null;
    const tokens = tokenize(q);
    const scored = items
      .map(it => ({ it, score: titleRelevanceScore(`${it.title || ''} ${it.snippet || ''}`, tokens) }))
      .sort((a, b) => b.score - a.score);
    // Cùng nguyên tắc sửa lỗi như các nguồn ảnh khác: không khớp tiêu đề/mô tả nào
    // thì trả về null thay vì liều lĩnh lấy items[0].
    if (scored[0].score === 0) return null;
    const best = scored[0].it;
    return best.link;
  } catch (e) {
    console.error(e);
  }
  return null;
}

// Cạo ảnh từ Google Images qua proxy AllOrigins (giải pháp thay thế khi không có API key)
async function searchGoogleImagesScrape(q) {
  try {
    const url = `https://api.allorigins.win/get?url=${encodeURIComponent('https://www.google.com/search?tbm=isch&q=' + encodeURIComponent(q))}`;
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 2500); // Giới hạn timeout 2.5s tránh treo
    const res = await fetch(url, { signal: controller.signal });
    clearTimeout(timeoutId);
    if (!res.ok) return null;
    const data = await res.json();
    const html = data.contents;
    // Tìm các link ảnh thumbnail của Google (thường bắt đầu bằng https://encrypted-tbn0.gstatic.com/images?q=tbn:)
    const matches = [...html.matchAll(/src="(https:\/\/encrypted-tbn0\.gstatic\.com\/images\?q=tbn:[^"]+)"/g)];
    if (matches.length > 0) {
      return matches[0][1];
    }
  } catch (e) {
    console.error(e);
  }
  return null;
}

async function searchBingImagesScrape(q) {
  try {
    const url = `https://api.allorigins.win/get?url=${encodeURIComponent('https://www.bing.com/images/search?q=' + encodeURIComponent(q))}`;
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 2500); 
    const res = await fetch(url, { signal: controller.signal });
    clearTimeout(timeoutId);
    if (!res.ok) return null;
    const data = await res.json();
    const html = data.contents;
    const matches = [...html.matchAll(/murl&quot;:&quot;(https:\/\/[^&]+)&quot;/g)];
    if (matches.length > 0) {
      return matches[0][1];
    }
  } catch (e) {
    console.error(e);
  }
  return null;
}

async function searchYahooImagesScrape(q) {
  try {
    const url = `https://api.allorigins.win/get?url=${encodeURIComponent('https://images.search.yahoo.com/search/images?p=' + encodeURIComponent(q))}`;
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 2500); 
    const res = await fetch(url, { signal: controller.signal });
    clearTimeout(timeoutId);
    if (!res.ok) return null;
    const data = await res.json();
    const html = data.contents;
    const matches = [...html.matchAll(/src='(https:\/\/tse[0-9]\.mm\.bing\.net[^']+)'/g)];
    if (matches.length > 0) {
      return matches[0][1];
    }
  } catch (e) {
    console.error(e);
  }
  return null;
}

// Thử lần lượt TẤT CẢ nguồn ảnh cho một biến thể từ khoá cụ thể, theo thứ tự ưu
// tiên: Google API -> Bing Scrape -> Yahoo Scrape -> Google Scrape -> Openverse -> Wikimedia Commons -> Wikipedia.
async function trySourcesForQuery(q) {
  let r = await searchGoogleImages(q, 6);
  if (r) return r;
  r = await searchBingImagesScrape(q);
  if (r) return r;
  r = await searchYahooImagesScrape(q);
  if (r) return r;
  r = await searchGoogleImagesScrape(q);
  if (r) return r;
  r = await searchOpenverse(q, 6);
  if (r) return r;
  r = await searchCommons(q, 3);
  if (r) return r;
  r = await searchWiki(q, 'vi');
  if (r) return r;
  return null;
}

const IMAGE_PROMISE_CACHE = {};

function getMappedSearchQuery(query) {
  const q = query.toLowerCase();
  if (q.includes('phở')) return 'Phở';
  if (q.includes('cà phê') || q.includes('cafe')) return 'Vietnamese iced coffee';
  if (q.includes('cơm')) return 'Cơm tấm';
  if (q.includes('bún')) return 'Bún bò Huế'; // mượn tạm ảnh bún bò cho các món bún
  if (q.includes('hủ tiếu')) return 'Hủ tiếu';
  if (q.includes('ốc') || q.includes('hải sản') || q.includes('nướng') || q.includes('lẩu')) return 'Seafood';
  if (q.includes('cút lộn') || q.includes('hột vịt lộn') || q.includes('ăn vặt')) return 'Balut (food)';
  if (q.includes('đêm') || q.includes('bùi viện') || q.includes('phố ẩm thực')) return 'Bùi Viện';
  if (q.includes('phố đi bộ')) return 'Nguyễn Huệ (đường)';
  if (q.includes('bánh mì') || q.includes('bánh mỳ')) return 'Bánh mì';
  if (q.includes('chợ nổi') || q.includes('cần thơ')) return 'Chợ nổi Cái Răng';
  if (q.includes('nhà thờ') || q.includes('đức bà')) return 'Nhà thờ Đức Bà Sài Gòn';
  if (q.includes('dinh độc lập')) return 'Dinh Độc Lập';
  if (q.includes('chợ bến thành')) return 'Chợ Bến Thành';
  return null;
}

async function fetchDestImage(query, options) {
  options = options || {};
  const kind = options.kind || 'visit'; // 'food' | 'visit' | 'nightlifeVisit'
  const fallbackQuery = (options.fallbackQuery || '').trim(); // tên tỉnh/thành của điểm đến

  const cacheKey = `${query}_${fallbackQuery}_${kind}`;
  if (IMAGE_PROMISE_CACHE[cacheKey]) {
    return IMAGE_PROMISE_CACHE[cacheKey];
  }

  const fetchPromise = (async () => {
    // Nếu có từ khóa ánh xạ chung chung (để dễ tìm hơn trên Wikipedia tiếng Anh/Việt)
    const mappedQuery = getMappedSearchQuery(query);
    if (mappedQuery) {
      let r = await searchWiki(mappedQuery, 'vi');
      if (r) return r;
      r = await searchWiki(mappedQuery, 'en');
      if (r) return r;
      r = await searchCommons(mappedQuery, 3);
      if (r) return r;
    }

    const queryVariants = [];

    if (kind === 'food' || kind === 'nightlifeVisit') {
      // Đối với món ăn, ưu tiên tìm đúng tên món ăn trước, vì gắn tên tỉnh vào dễ làm Wikipedia 
      // trả về ảnh phong cảnh của tỉnh đó (vd: "Phở bò Hồ Chí Minh" -> ra ảnh nhà thờ Đức Bà)
      queryVariants.push(query);
      if (fallbackQuery && !query.toLowerCase().includes(fallbackQuery.toLowerCase())) {
        queryVariants.push(`${query} ${fallbackQuery}`);
      }
    } else {
      // Đối với địa danh, ưu tiên gắn tên tỉnh/thành trước để tránh nhầm với địa danh cùng tên ở nơi khác
      if (fallbackQuery && !query.toLowerCase().includes(fallbackQuery.toLowerCase())) {
        queryVariants.push(`${query} ${fallbackQuery}`);
      }
      queryVariants.push(query);
    }

    if (query.split(' ').length > 2) {
      queryVariants.push(query.split(' ').slice(0, 2).join(' '));
    }
    queryVariants.push(`${query} Việt Nam`);

    for (const q of queryVariants) {
      const result = await trySourcesForQuery(q);
      if (result) return result;
    }

    return null;
  })();

  IMAGE_PROMISE_CACHE[cacheKey] = fetchPromise;
  let result = await fetchPromise;
  
  if (result) return result;

  // Thử trên Wikipedia tiếng Anh (đôi khi có ảnh mà bản tiếng Việt không có)
  result = await searchWiki(query, 'en');
  if (result) return result;

  // Lùi về từ khóa CHUNG theo loại nội dung (ẩm thực Việt Nam / tỉnh-thành) thay vì
  // luôn dùng đúng 1 từ khóa duy nhất cho mọi thẻ — tránh việc nhiều món ăn hay địa
  // danh khác nhau trong cùng một buổi lại hiển thị chung một ảnh giống hệt nhau.
  const genericTerm = kind === 'food' ? 'ẩm thực Việt Nam' : (fallbackQuery || 'phong cảnh Việt Nam');
  result = await searchOpenverse(genericTerm, 6);
  if (result) return result;
  result = await searchCommons(genericTerm, 6);
  if (result) return result;
  result = await searchWiki(genericTerm, 'vi');
  if (result) return result;

  // Không tìm được ảnh phù hợp: giữ khung ảnh trung tính thay vì hiển thị nhầm địa danh khác
  return null;
}

const GRAY_PLACEHOLDER = 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbGw9IiNlMmU4ZjAiLz48L3N2Zz4=';

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

function resolveItineraryPool(destination, province) {
  const data = (typeof ITINERARY_DATA !== 'undefined') ? ITINERARY_DATA : {};
  const fallback = (typeof PROVINCE_FALLBACK !== 'undefined') ? PROVINCE_FALLBACK : {};
  const extended = (typeof EXTENDED_PROVINCE_DATA !== 'undefined') ? EXTENDED_PROVINCE_DATA : {};
  const generic = (typeof GENERIC_FALLBACK !== 'undefined') ? GENERIC_FALLBACK : null;

  const layers = [];
  if (data[destination]) layers.push(data[destination]);
  if (fallback[province]) layers.push(fallback[province]);
  if (extended[province]) layers.push(extended[province]);
  
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
function buildSlotSequence(pool, totalDays, count, rng, weatherArray) {
  const days = [];
  if (!pool || pool.length === 0) {
    for (let d = 0; d < totalDays; d++) days.push([]);
    return days;
  }

  let bag = shuffleWithRng(pool, rng);
  for (let d = 0; d < totalDays; d++) {
    const dayItems = [];
    const usedKeysThisDay = new Set();
    const isRainy = weatherArray && weatherArray[d] && weatherArray[d].includes('rain');

    while (dayItems.length < count) {
      if (bag.length === 0) {
        bag = shuffleWithRng(pool, rng); // hết vòng: xáo lại toàn bộ pool cho vòng tiếp theo
      }
      
      // Ưu tiên indoor nếu mưa, outdoor nếu nắng
      let idx = -1;
      if (isRainy) {
        idx = bag.findIndex(it => !usedKeysThisDay.has(itemDedupeKey(it)) && isIndoorItem(it));
      } else {
        idx = bag.findIndex(it => !usedKeysThisDay.has(itemDedupeKey(it)) && !isIndoorItem(it));
      }
      
      // Nếu không tìm được item thoả điều kiện thời tiết, lấy item đầu tiên chưa dùng
      if (idx === -1) {
        idx = bag.findIndex(it => !usedKeysThisDay.has(itemDedupeKey(it)));
      }

      if (idx === -1) idx = 0; // pool nhỏ hơn count: đành chấp nhận trùng trong ngày, không còn lựa chọn khác
      const [item] = bag.splice(idx, 1);
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
    sequences[slotKey] = buildSlotSequence(pool[slotKey], totalDays, sessionCounts[slotKey], rng, state.weatherForecast);
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
  const bodyText = isFood ? item.desc : (item.tips || item.desc || '');
  const badgeIcon = kind === 'nightlifeVisit' ? 'moon-star' : (isFood ? 'utensils' : 'landmark');
  const hours = SLOT_HOURS[slotKey] || '';
  const safeTitle = escapeHtml(title);
  const safeBody = escapeHtml(bodyText);
  const safeKeyword = escapeHtml(item.keyword || title);
  const safeProvince = escapeHtml(provinceStr);
  const checkKey = `${state.selectedDay}-${slotKey}-${safeKeyword}`;
  const isChecked = !!state.checkedDestinations[checkKey];

  // Đăng ký thẻ vào bộ nhớ tạm để cửa sổ chi tiết + nút chỉ đường có thể tra lại đầy đủ dữ liệu
  const cardId = window.__cardRegistry.length;
  window.__cardRegistry.push({ item, kind, slotKey, provinceStr, title });

  return `
    <div class="destination-card ${isFood ? 'food-card' : 'visit-card'} ${isChecked ? 'is-checked' : ''}" data-card-id="${cardId}" onclick="openDestDetail(event, ${cardId})">
      <div class="dest-image-wrap" onclick="event.stopPropagation(); openImageLightbox(this)">
        <img src="${GRAY_PLACEHOLDER}" alt="${safeTitle}" data-keyword="${safeKeyword}" data-fallback-keyword="${safeProvince}" data-kind="${kind}" class="dynamic-dest-img">
        <div class="dest-overlay"></div>
        <button type="button" class="dest-locate-btn" title="Chỉ đường trên bản đồ" onclick="event.stopPropagation(); goToMapWithItem(${cardId})">
          <i data-lucide="map-pin"></i>
        </button>
        <i data-lucide="maximize-2" class="dest-expand-icon"></i>
        <h3 class="dest-title i18n-dyn" data-vi="${safeTitle}">${safeTitle}</h3>
        <label class="dest-checkin-label" onclick="event.stopPropagation()" title="Đánh dấu đã trải nghiệm">
          <input type="checkbox" class="dest-checkin-cb" data-key="${checkKey}" ${isChecked ? 'checked' : ''}>
          <span class="dest-checkin-mark"></span>
        </label>
      </div>
      <div class="dest-body">
        <div class="dest-meta"><i data-lucide="clock" class="meta-icon"></i> ${hours}</div>
        <div class="dest-tips">
          <p class="i18n-dyn" data-vi="${safeBody}">${safeBody}</p>
        </div>
      </div>
    </div>
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

  // Tải hình ảnh bất đồng bộ (Google Images nếu đã cấu hình khoá + Openverse + Wikimedia
  // Commons + Wikipedia, giữ khung ảnh trung tính nếu không tìm được ảnh phù hợp)
  document.querySelectorAll('.dynamic-dest-img').forEach(async (img) => {
    const keyword = img.getAttribute('data-keyword');
    const fallbackKeyword = img.getAttribute('data-fallback-keyword');
    const kind = img.getAttribute('data-kind');
    if (keyword) {
      const actualImgUrl = await fetchDestImage(keyword, { kind, fallbackQuery: fallbackKeyword });
      if (actualImgUrl) {
        img.src = actualImgUrl;
      } else {
        const fbStr = kind === 'food' ? 'food,vietnam' : 'travel,vietnam';
        img.src = `https://loremflickr.com/600/400/${fbStr}?lock=${Math.floor(Math.random() * 1000)}`;
      }
    }
  });

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

/* ============ Lightbox xem ảnh phóng to ============ */
function openImageLightbox(wrapEl) {
  const img = wrapEl.querySelector('img.dynamic-dest-img');
  const titleEl = wrapEl.querySelector('.dest-title');
  if (!img || !img.src) return;

  const lightbox = document.getElementById('image-lightbox');
  const lightboxImg = document.getElementById('image-lightbox-img');
  const lightboxCaption = document.getElementById('image-lightbox-caption');
  if (!lightbox || !lightboxImg) return;

  lightboxImg.src = img.src;
  lightboxImg.alt = img.alt || '';
  if (lightboxCaption) lightboxCaption.textContent = titleEl ? titleEl.textContent : (img.alt || '');
  lightbox.hidden = false;
  document.body.style.overflow = 'hidden';
}

function closeImageLightbox() {
  const lightbox = document.getElementById('image-lightbox');
  if (!lightbox) return;
  lightbox.hidden = true;
  document.body.style.overflow = '';
}

document.addEventListener('DOMContentLoaded', () => {
  const lightbox = document.getElementById('image-lightbox');
  if (!lightbox) return;
  const closeBtn = document.getElementById('image-lightbox-close');
  if (closeBtn) closeBtn.addEventListener('click', closeImageLightbox);
  lightbox.addEventListener('click', (e) => {
    if (e.target === lightbox) closeImageLightbox();
  });
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && !lightbox.hidden) closeImageLightbox();
  });
});

/* ============ Chuyển sang tab Bản đồ kèm điểm đến ============ */
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

function buildDetailInfoRows(entry) {
  const { item, kind, slotKey, provinceStr } = entry;
  const rows = [];
  if (kind === 'food') {
    const priceFallback = FOOD_PRICE_FALLBACK_BY_SLOT[slotKey] || FOOD_PRICE_FALLBACK_BY_SLOT.lunch;
    rows.push({ icon: 'wallet', label: 'Giá tham khảo', value: item.priceRange || priceFallback });
    const spots = (item.suggestedSpots && item.suggestedSpots.length) ? item.suggestedSpots.join('; ') : FOOD_SPOT_FALLBACK;
    rows.push({ icon: 'store', label: 'Gợi ý quán / khu vực', value: spots });
    rows.push({ icon: 'clock', label: 'Khung giờ gợi ý', value: SLOT_HOURS[slotKey] || '' });
  } else {
    rows.push({ icon: 'map-pin', label: 'Địa điểm', value: item.address || VISIT_ADDRESS_FALLBACK_TPL(provinceStr) });
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
  const srcImg = cardEl.querySelector('img.dynamic-dest-img');
  const imgEl = document.getElementById('dest-detail-img');
  imgEl.src = srcImg ? srcImg.src : GRAY_PLACEHOLDER;
  imgEl.alt = title;

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
  const finalHeight = Math.min(window.innerHeight * 0.85, 680);
  const finalTop = (window.innerHeight - finalHeight) / 2;
  const finalLeft = (window.innerWidth - finalWidth) / 2;

  card.style.transition = 'none';
  card.style.top = startRect.top + 'px';
  card.style.left = startRect.left + 'px';
  card.style.width = startRect.width + 'px';
  card.style.height = startRect.height + 'px';
  card.style.opacity = '0.4';

  modal.hidden = false;
  document.body.style.overflow = 'hidden';
  window.lucide.createIcons({ root: card });

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
