/**
 * js/i18n-auto.js
 * ---------------------------------------------------------------------
 * Dịch tự động phần nội dung ĐỘNG (món ăn / địa danh / mô tả do hệ thống
 * sinh ra trong tab Lịch trình) sang tiếng Anh khi người dùng chuyển ngôn
 * ngữ — không cần khai báo sẵn từng câu trong js/i18n.js.
 *
 * Cách hoạt động:
 * - Bất kỳ đoạn text nào cần dịch tự động được bọc trong 1 phần tử có
 *   class "i18n-dyn", giữ nguyên bản gốc tiếng Việt trong data-vi.
 * - Khi chuyển sang "en": nếu bản dịch đã có trong cache (bộ nhớ hoặc
 *   localStorage) thì hiển thị ngay; nếu chưa có, gọi API dịch máy
 *   (MyMemory Translation API, miễn phí, hỗ trợ CORS) rồi cập nhật nội
 *   dung khi có kết quả, đồng thời lưu cache để lần sau không cần gọi lại.
 * - Khi chuyển về "vn": luôn khôi phục lại đúng bản gốc trong data-vi,
 *   không cần gọi API nên tức thời.
 * - Một MutationObserver theo dõi khu vực kết quả (#result): mỗi khi
 *   lịch trình được tạo/render lại, nội dung mới sẽ tự dịch ngay nếu
 *   trang đang ở chế độ tiếng Anh.
 *
 * Mỗi phần tử .i18n-dyn được gắn thêm 2 thuộc tính nội bộ để chống lặp:
 * - data-i18n-state: ngôn ngữ đang hiển thị thực tế ("vn" | "en" | "en-pending")
 * - data-i18n-src:   bản gốc (data-vi) tại thời điểm dịch gần nhất
 * Nhờ đó, nếu MutationObserver tự kích hoạt lại do chính việc set
 * textContent gây ra, hàm sẽ nhận ra phần tử đã ở đúng trạng thái và bỏ
 * qua ngay, tránh dịch lặp lại vô hạn và gọi API trùng lặp.
 *
 * Muốn thêm nội dung động cần dịch tự động ở nơi khác trong trang: chỉ
 * cần bọc phần tử bằng class "i18n-dyn" + thuộc tính data-vi, không cần
 * sửa gì thêm ở file này.
 */

const AUTO_I18N_CACHE_KEY = 'vnfinder_auto_i18n_cache_v1';
let autoI18nCache = {};
try {
  autoI18nCache = JSON.parse(localStorage.getItem(AUTO_I18N_CACHE_KEY) || '{}');
} catch (e) {
  autoI18nCache = {};
}

// Gộp các request dịch đang chạy cho cùng 1 chuỗi gốc, tránh gọi API
// nhiều lần cùng lúc khi có nhiều thẻ dùng chung một tên món ăn/địa danh.
const pendingTranslations = {};

function saveAutoI18nCache() {
  try {
    localStorage.setItem(AUTO_I18N_CACHE_KEY, JSON.stringify(autoI18nCache));
  } catch (e) {
    // Bỏ qua nếu localStorage đầy hoặc bị trình duyệt chặn
  }
}

async function translateTextAuto(text) {
  const key = text.trim();
  if (!key) return text;
  if (autoI18nCache[key]) return autoI18nCache[key];
  if (pendingTranslations[key]) return pendingTranslations[key];

  const request = (async () => {
    try {
      const url = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(key)}&langpair=vi|en`;
      const res = await fetch(url);
      const data = await res.json();
      const translated = (data && data.responseData && data.responseData.translatedText)
        ? data.responseData.translatedText
        : key;
      autoI18nCache[key] = translated;
      saveAutoI18nCache();
      return translated;
    } catch (e) {
      console.error('Lỗi dịch tự động:', e);
      return key; // Nếu lỗi mạng: tạm giữ nguyên bản gốc
    } finally {
      delete pendingTranslations[key];
    }
  })();

  pendingTranslations[key] = request;
  return request;
}

// Dịch (hoặc khôi phục) một phần tử .i18n-dyn duy nhất, có cập nhật
// data-i18n-state / data-i18n-src để MutationObserver không tự lặp lại.
async function applyAutoTranslationToElement(el, lang) {
  const original = el.getAttribute('data-vi');
  if (!original) return;

  if (lang === 'vn') {
    el.textContent = original;
    el.dataset.i18nState = 'vn';
    el.dataset.i18nSrc = original;
    return;
  }

  // lang === 'en'
  el.dataset.i18nState = 'en-pending';
  el.dataset.i18nSrc = original;

  const translated = await translateTextAuto(original);

  // Chỉ áp dụng nếu người dùng chưa chuyển lại về tiếng Việt trong lúc
  // chờ kết quả, và nội dung gốc của phần tử chưa bị thay đổi (ví dụ do
  // lịch trình được tạo lại) trong lúc chờ.
  if (document.documentElement.lang === 'en' && el.getAttribute('data-vi') === original) {
    el.textContent = translated;
    el.dataset.i18nState = 'en';
  }
}

// Áp dụng dịch tự động cho toàn bộ phần tử .i18n-dyn bên trong `root`.
// Phần tử nào đã ở đúng trạng thái/ngôn ngữ với đúng bản gốc hiện tại thì
// được bỏ qua ngay — đây chính là chốt chặn vòng lặp MutationObserver.
function applyAutoTranslation(root, lang) {
  if (!root) return;
  const nodes = root.querySelectorAll('.i18n-dyn');
  nodes.forEach((el) => {
    const original = el.getAttribute('data-vi');
    if (!original) return;
    if (el.dataset.i18nState === lang && el.dataset.i18nSrc === original) return;
    applyAutoTranslationToElement(el, lang);
  });
}
window.applyAutoTranslation = applyAutoTranslation;

// Theo dõi khu vực kết quả lịch trình: nội dung mới sinh ra sẽ tự dịch ngay
// nếu trang đang ở chế độ tiếng Anh (ví dụ: tạo lịch trình trong lúc đang
// xem bản EN). Nhờ chốt chặn ở applyAutoTranslation phía trên, các mutation
// do chính module này gây ra (khi set textContent) sẽ bị bỏ qua ngay ở lần
// quét kế tiếp thay vì kích hoạt dịch lặp lại vô hạn.
function observeDynamicContent(container) {
  if (!container) return;
  const observer = new MutationObserver(() => {
    if (document.documentElement.lang === 'en') {
      applyAutoTranslation(container, 'en');
    }
  });
  observer.observe(container, { childList: true, subtree: true });
}

document.addEventListener('DOMContentLoaded', () => {
  const resultSection = document.getElementById('result');
  if (resultSection) observeDynamicContent(resultSection);
});
