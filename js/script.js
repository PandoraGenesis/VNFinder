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
    weatherDesc.innerHTML = `Dự báo thời tiết tại <b>${dest}</b> từ <b>${startDate}</b> đến <b>${endDate}</b>:
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

      for (let i = 0; i < daysToShow; i++) {
        let displayDate = `${currentDate.getDate().toString().padStart(2, '0')}/${(currentDate.getMonth() + 1).toString().padStart(2, '0')}`;
        let icon = icons[i % icons.length];
        let color = colors[i % colors.length];
        let temp = temps[i % temps.length];

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

async function fetchWikiImage(query, fallbackQuery) {
  async function trySearch(q, lang) {
    try {
      const url = `https://${lang}.wikipedia.org/w/api.php?action=query&generator=search&gsrsearch=${encodeURIComponent(q)}&gsrlimit=1&prop=pageimages&piprop=thumbnail|original&pithumbsize=800&format=json&origin=*`;
      const res = await fetch(url);
      const data = await res.json();
      if (data.query && data.query.pages) {
        const page = Object.values(data.query.pages)[0];
        if (page) {
          if (page.thumbnail) return page.thumbnail.source;
          if (page.original) return page.original.source;
        }
      }
    } catch (e) {
      console.error(e);
    }
    return null;
  }

  // 1. Tìm chính xác từ khóa trên Wikipedia tiếng Việt
  let result = await trySearch(query, 'vi');
  if (result) return result;

  // 2. Rút gọn từ khóa (bỏ bớt từ cuối) rồi thử lại
  if (query.split(' ').length > 2) {
    const shortQuery = query.split(' ').slice(0, 2).join(' ');
    result = await trySearch(shortQuery, 'vi');
    if (result) return result;
  }

  // 3. Thêm "Việt Nam" để tăng độ chính xác cho các từ khóa dễ trùng với nước khác
  result = await trySearch(`${query} Việt Nam`, 'vi');
  if (result) return result;

  // 4. Thử trên Wikipedia tiếng Anh
  result = await trySearch(query, 'en');
  if (result) return result;

  // 5. Lùi về từ khóa cấp tỉnh/thành — vẫn liên quan địa lý, tốt hơn ảnh sai địa danh
  if (fallbackQuery) {
    result = await trySearch(fallbackQuery, 'vi');
    if (result) return result;
  }

  // 6. Không tìm được ảnh phù hợp: giữ khung ảnh trung tính thay vì hiển thị nhầm địa danh khác
  return null;
}

const GRAY_PLACEHOLDER = 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbGw9IiNlMmU4ZjAiLz48L3N2Zz4=';

/**
 * Lấy đúng bộ dữ liệu (ẩm thực + địa danh) cho một điểm đến cấp 2 cụ thể.
 * Ưu tiên: dữ liệu riêng (ITINERARY_DATA) -> dữ liệu chung cấp tỉnh (PROVINCE_FALLBACK)
 * -> phương án cuối cùng (GENERIC_FALLBACK). Không bao giờ ghép ngẫu nhiên các từ rời rạc.
 */
function resolveItineraryPool(destination, province) {
  const data = (typeof ITINERARY_DATA !== 'undefined') ? ITINERARY_DATA : {};
  const fallback = (typeof PROVINCE_FALLBACK !== 'undefined') ? PROVINCE_FALLBACK : {};
  const generic = (typeof GENERIC_FALLBACK !== 'undefined') ? GENERIC_FALLBACK : null;
  if (data[destination]) return data[destination];
  if (fallback[province]) return fallback[province];
  return generic || { breakfast: [], morningVisit: [], lunch: [], afternoonVisit: [], dinner: [], nightlife: [] };
}

/**
 * Chọn `count` phần tử từ `arr` cho ngày thứ `dayIndex` (0-based), không lặp lại cho
 * tới khi hết dữ liệu (rồi mới quay vòng). `seed` đổi mỗi lần bấm "Tạo lịch trình" để
 * các lần tạo khác nhau có sự đa dạng, nhưng trong CÙNG một lịch trình thì không trùng.
 */
function pickForDay(arr, dayIndex, count, seed) {
  if (!arr || arr.length === 0) return [];
  const n = arr.length;
  const offset = seed % n;
  const out = [];
  for (let i = 0; i < count; i++) {
    out.push(arr[(offset + dayIndex * count + i) % n]);
  }
  return out;
}

const SESSION_ITEM_COUNTS = {
  breakfast: 2,
  morningVisit: 2,
  lunch: 3,
  afternoonVisit: 2,
  dinner: 2,
  nightlife: 1
};

/**
 * Sinh lịch trình đầy đủ cho `totalDays` ngày, dựa trên điểm đến cấp 2 cụ thể.
 * Mỗi ngày có 4 buổi: sáng (ẩm thực + tham quan), trưa (ẩm thực), chiều (tham quan),
 * tối (ẩm thực + trải nghiệm về đêm).
 */
function buildFullItinerary(destination, province, totalDays) {
  const pool = resolveItineraryPool(destination, province);
  const seed = Math.floor(Math.random() * 9973); // số nguyên tố lớn để trộn đều giữa các lần tạo
  const itinerary = {};

  for (let day = 1; day <= totalDays; day++) {
    const dayIndex = day - 1;
    itinerary[day] = {
      morning: {
        food: pickForDay(pool.breakfast, dayIndex, SESSION_ITEM_COUNTS.breakfast, seed),
        visit: pickForDay(pool.morningVisit, dayIndex, SESSION_ITEM_COUNTS.morningVisit, seed)
      },
      noon: {
        food: pickForDay(pool.lunch, dayIndex, SESSION_ITEM_COUNTS.lunch, seed)
      },
      afternoon: {
        visit: pickForDay(pool.afternoonVisit, dayIndex, SESSION_ITEM_COUNTS.afternoonVisit, seed)
      },
      evening: {
        food: pickForDay(pool.dinner, dayIndex, SESSION_ITEM_COUNTS.dinner, seed),
        visit: pickForDay(pool.nightlife, dayIndex, SESSION_ITEM_COUNTS.nightlife, seed)
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
  const badgeIcon = kind === 'nightlifeVisit' ? 'moon-star' : (isFood ? 'utensils' : 'map-pin');
  const hours = SLOT_HOURS[slotKey] || '';
  const safeTitle = escapeHtml(title);
  const safeBody = escapeHtml(bodyText);
  const safeKeyword = escapeHtml(item.keyword || title);
  const safeProvince = escapeHtml(provinceStr);

  return `
       <div class="destination-card ${isFood ? 'food-card' : 'visit-card'} ${state.checkedDestinations[`${state.selectedDay}-${slotKey}-${safeKeyword}`] ? 'is-checked' : ''}">
      <div class="dest-image-wrap" onclick="openImageLightbox(this)">
        <img src="${GRAY_PLACEHOLDER}" alt="${safeTitle}" data-keyword="${safeKeyword}" data-fallback-keyword="${safeProvince}" class="dynamic-dest-img">
        <div class="dest-overlay"></div>
        <span class="dest-type-badge"><i data-lucide="${badgeIcon}"></i></span>
        <i data-lucide="maximize-2" class="dest-expand-icon"></i>
        <h3 class="dest-title i18n-dyn" data-vi="${safeTitle}">${safeTitle}</h3>
        <label class="dest-checkin-label" onclick="event.stopPropagation()">
          <input type="checkbox" class="dest-checkin-cb" data-key="${state.selectedDay}-${slotKey}-${safeKeyword}" ${state.checkedDestinations[`${state.selectedDay}-${slotKey}-${safeKeyword}`] ? 'checked' : ''}>
          <span class="dest-checkin-mark"></span>
        </label>

        </div>
      <div class="dest-body">
        <div class="dest-meta">
          <div><i data-lucide="clock" class="meta-icon"></i> ${hours}</div>
          <div><i data-lucide="map" class="meta-icon"></i> ${safeProvince}</div>
        </div>
        <div class="dest-tips">
          <h4><i data-lucide="info" class="tips-icon"></i> ${isFood ? 'Mô tả' : 'Local Tips'}</h4>
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
    <div class="dest-subgroup-header">
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

  // Tải hình ảnh bất đồng bộ từ Wikipedia (giữ khung ảnh trung tính nếu không tìm được ảnh phù hợp)
  document.querySelectorAll('.dynamic-dest-img').forEach(async (img) => {
    const keyword = img.getAttribute('data-keyword');
    const fallbackKeyword = img.getAttribute('data-fallback-keyword');
    if (keyword) {
      const actualImgUrl = await fetchWikiImage(keyword, fallbackKeyword);
      if (actualImgUrl) {
        img.src = actualImgUrl;
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

/* ============ 6. Khởi tạo ============ */
window.lucide.createIcons();
