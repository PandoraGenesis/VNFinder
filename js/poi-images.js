/* =====================================================================
   js/poi-images.js  (bản 2 — ưu tiên ICON TƯỢNG TRƯNG, bỏ fetch ảnh
   thật làm mặc định)
   ---------------------------------------------------------------------
   LÝ DO ĐỔI CÁCH TIẾP CẬN:
   Bản trước dùng ảnh thật lấy từ Wikipedia (qua item.wikiTitle hoặc
   DICT_WIKI_TITLES) làm tầng ưu tiên thứ 2. Vấn đề là nhiều bài không
   có ảnh, hoặc API lỗi/rớt mạng, khiến hệ thống rơi xuống cùng MỘT ảnh
   dự phòng cho hàng loạt entry khác nhau (đúng như lỗi bạn thấy: "Lẩu
   nấm", "Ốc Sài Gòn", "Gà nướng" hiện chung một ảnh hải sản; "Khu Phòng
   tranh" và "Vườn hoa" hiện chung ảnh trụ sở/nhà thờ).

   Cách chắc chắn nhất để KHÔNG BAO GIỜ bị lệch/lặp ảnh: bỏ hẳn việc tải
   ảnh thật từ mạng làm mặc định, thay bằng ICON TƯỢNG TRƯNG (emoji) vẽ
   ngay tại chỗ bằng SVG data-URI — không gọi mạng nên không bao giờ lỗi,
   không bao giờ bị cache nhầm, và luôn khớp đúng LOẠI món ăn/địa điểm.

   BA TẦNG ƯU TIÊN:
   1) item.image     — ảnh thật do bạn tự chụp/tự chọn, gắn thẳng vào
                        entry. Dùng cho địa điểm cụ thể bạn muốn làm nổi
                        bật (không bắt buộc).
   2) EMOJI_MAP       — icon tượng trưng theo tên món/loại địa điểm,
                        khớp bằng cách tìm chuỗi con trong dish/name.
   3) CATEGORY_EMOJI  — icon chung theo buổi (sáng/trưa/tối/tham quan/
                        về đêm) nếu không khớp được EMOJI_MAP.

   (Không còn tầng "wikiTitle" tự động — nếu sau này bạn muốn thử lại
   ảnh thật cho MỘT entry cụ thể mà bạn đã tự kiểm tra kỹ, dùng thẳng
   item.image, không nên phụ thuộc lại vào fetch tự động.)
   ===================================================================== */

const EMOJI_MAP = {
  // để bảng dò đúng, các khoá DÀI/CỤ THỂ HƠN phải đứng trước khoá ngắn
  // (ví dụ "Bánh mì" trước "Mì", "Chợ đêm" trước "Chợ") — mảng
  // _EMOJI_KEYS_SORTED bên dưới tự sắp xếp lại theo độ dài nên bạn
  // không cần lo thứ tự khai báo trong object này.

  'Bánh mì': '🥖',
  'Bánh bao': '🥟',
  'Bánh cuốn': '🥟',
  'Bánh xèo': '🥞',
  'Bánh canh': '🍜',
  'Bánh hỏi': '🍜',
  'Xôi': '🍙',

  'Phở': '🍜', 'Bún': '🍜', 'Mì': '🍜', 'Hủ tiếu': '🍜', 'Cháo': '🍚',

  'Cơm': '🍚', 'Gỏi cuốn': '🥗',

  'Lẩu': '🍲', 'Nướng': '🍢', 'Hải sản': '🦐', 'Ốc': '🐌', 'Sushi': '🍣',

  'Cà phê': '☕', 'Trà': '🍵',

  'Chợ đêm': '🏮', 'Chợ': '🏪',
  'Công viên': '🌳', 'Vườn hoa': '🌷',
  'Chùa': '⛩️', 'Đền': '🛕', 'Nhà thờ': '⛪',
  'Bảo tàng': '🏛️', 'Phòng tranh': '🖼️', 'Di tích': '🏯',
  'Trung tâm thương mại': '🛍️', 'Khu mua sắm': '🛍️',
  'Phố đi bộ': '🚶', 'Quảng trường': '🏙️',
  'Rạp chiếu phim': '🎬', 'Rooftop Bar': '🍸', 'Bar': '🍸', 'Pub': '🍺', 'Bia': '🍺',
  'Khu vui chơi': '🎡'
};

// Sắp xếp sẵn các khoá theo độ dài giảm dần — tính một lần, dùng lại nhiều lần.
const _EMOJI_KEYS_SORTED = Object.keys(EMOJI_MAP).sort((a, b) => b.length - a.length);

const CATEGORY_EMOJI = {
  breakfast: '🍳', lunch: '🍽️', dinner: '🍽️',
  morningVisit: '📍', afternoonVisit: '📍', nightlife: '🌙'
};
const CATEGORY_COLOR = {
  breakfast: '#F5A623', lunch: '#F76C6C', dinner: '#6C63F7',
  morningVisit: '#4CAF93', afternoonVisit: '#4CAF93', nightlife: '#2C3E66'
};

function matchEmoji(item) {
  const label = item.dish || item.name || item.keyword || '';
  for (const key of _EMOJI_KEYS_SORTED) {
    if (label.includes(key)) return EMOJI_MAP[key];
  }
  return null;
}

/**
 * Tạo ảnh icon tượng trưng dạng SVG data-URI — không gọi mạng, không
 * bao giờ lỗi/vỡ ảnh, luôn render tức thì.
 */
function iconImage(category, emoji) {
  const color = CATEGORY_COLOR[category] || '#8a8a8a';
  const glyph = emoji || CATEGORY_EMOJI[category] || '📍';
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="400" height="260">
    <defs>
      <linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stop-color="${color}" stop-opacity="0.85"/>
        <stop offset="100%" stop-color="${color}" stop-opacity="1"/>
      </linearGradient>
    </defs>
    <rect width="100%" height="100%" fill="url(#g)"/>
    <text x="50%" y="52%" font-size="72" text-anchor="middle" dominant-baseline="middle">${glyph}</text>
  </svg>`;
  return 'data:image/svg+xml;utf8,' + encodeURIComponent(svg);
}

/**
 * Trả về URL ảnh cho một entry lịch trình — LUÔN trả về ngay lập tức
 * (đồng bộ, không phải async nữa vì không còn gọi mạng), theo thứ tự:
 *   item.image  >  icon theo EMOJI_MAP  >  icon chung theo category
 *
 * @param {object} item     entry gốc (breakfast/lunch/dinner/visit/nightlife)
 * @param {string} category 'breakfast' | 'lunch' | 'dinner' |
 *                          'morningVisit' | 'afternoonVisit' | 'nightlife'
 */
function resolveItemImage(item, category) {
  if (item.image) return item.image;
  const emoji = matchEmoji(item);
  return iconImage(category, emoji);
}
