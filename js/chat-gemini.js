// js/chat-gemini.js
// Gọi chatbot Gemini qua Worker proxy. Nạp file này TRƯỚC chat-assistant.js trong index.html.

(function () {
  const PROXY_URL = "https://your-worker.your-subdomain.workers.dev"; // TODO: đổi thành URL Worker của bạn
  const history = []; // {role: 'user' | 'model', text}

  const esc = (s) =>
    String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));

  // TODO: nối với dữ liệu thật của bạn (itinerary-data.js, weather.js, location.js, scoring.js...).
  // Chỉ gửi phần cần thiết để tiết kiệm token và nhanh hơn.
  function buildContext() {
    return {
      now: new Date().toISOString(),
      timezone: "Asia/Ho_Chi_Minh",
      // itinerary: window.currentItinerary,      // [{day, items:[{name, time, durationMin, area, type:'indoor|outdoor'}]}]
      // weather: window.currentWeather,          // dự báo theo ngày/điểm đến (từ weather.js)
      // userLocation: window.currentLocation,    // vị trí hiện tại nếu người dùng cho phép (location.js / geo.js)
      // preferences: window.userPrefs,           // ngân sách, số người, nhóm tuổi, sở thích
      // lang: document.documentElement.lang,     // ngôn ngữ giao diện (i18n.js)
    };
  }

  async function ask(message) {
    const res = await fetch(PROXY_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message, history, context: buildContext() }),
    });
    if (!res.ok) throw new Error("Chatbot đang bận, vui lòng thử lại.");
    const data = await res.json();

    history.push({ role: "user", text: message });
    history.push({ role: "model", text: data.reply || "" });
    if (history.length > 16) history.splice(0, history.length - 16);
    return data;
  }

  // Trả về HTML an toàn (đã escape) để chèn vào khung chat
  function render(data) {
    const risk = { high: "⚠️ Rủi ro cao", medium: "⚠️ Cần lưu ý", low: "ℹ️ Rủi ro thấp", none: "" }[data.risk_level] || "";
    const alts = (data.alternatives || [])
      .map(
        (a, i) => `
      <div class="alt-card">
        <div class="alt-title">Phương án ${i + 1}: ${esc(a.title)}</div>
        <div class="alt-row"><b>Thay cho:</b> ${esc(a.replaces)}</div>
        <div class="alt-row"><b>Làm gì:</b> ${esc(a.new_plan)}</div>
        <div class="alt-row"><b>Lý do:</b> ${esc(a.reason)}</div>
        <div class="alt-meta">
          ${a.affected_days?.length ? `Ngày ảnh hưởng: ${a.affected_days.map(esc).join(", ")}` : ""}
          ${Number.isInteger(a.extra_time_min) ? ` · Thời gian: ${a.extra_time_min > 0 ? "+" : ""}${a.extra_time_min} phút` : ""}
          ${a.extra_cost ? ` · Chi phí: ${esc(a.extra_cost)}` : ""}
        </div>
        <button class="alt-apply" data-alt-index="${i}">Áp dụng phương án này</button>
      </div>`
      )
      .join("");

    return `
      ${risk ? `<div class="chat-risk">${risk}</div>` : ""}
      <p>${esc(data.reply)}</p>
      ${alts}
      ${data.unchanged ? `<p class="chat-unchanged">✅ Giữ nguyên: ${esc(data.unchanged)}</p>` : ""}`;
  }

  window.GeminiChat = { ask, render, reset: () => (history.length = 0) };
})();

/* Cách dùng trong chat-assistant.js:

   const data = await GeminiChat.ask(userText);
   botBubble.innerHTML = GeminiChat.render(data);

   // Nút "Áp dụng": lấy data.alternatives[i] rồi cập nhật đúng ngày/điểm trong
   // itinerary-data.js, KHÔNG tạo lại toàn bộ lịch trình.
*/
