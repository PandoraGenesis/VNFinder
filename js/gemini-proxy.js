// Cloudflare Worker: proxy gọi Gemini để KHÔNG lộ API key ở phía trình duyệt.
// Triển khai:  wrangler secret put GEMINI_API_KEY   (dán key khi được hỏi)
// Nếu thư mục worker/ của bạn đang dùng nền tảng khác (Vercel, Netlify...), logic giữ nguyên, chỉ đổi cách export.

const MODEL = "gemini-3.8-flash";
const ENDPOINT = `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent`;

// Thêm domain thật của website (và localhost khi dev)
const ALLOWED_ORIGINS = ["https://your-domain.com", "http://localhost:5500", "http://127.0.0.1:5500"];

const SYSTEM_PROMPT = `Bạn là trợ lý du lịch của website hướng dẫn du lịch Việt Nam.
Nhiệm vụ: hỗ trợ khách điều chỉnh lịch trình ĐANG CÓ khi gặp vấn đề về thời tiết, sức khỏe hoặc thời gian.

NGUYÊN TẮC BẮT BUỘC:
1. Luôn dựa trên "NGỮ CẢNH CHUYẾN ĐI" được cung cấp (lịch trình, thời tiết, ràng buộc của khách). Không bịa địa điểm, giá, giờ mở cửa. Nếu thiếu dữ liệu thì nói rõ là cần kiểm tra lại.
2. Khi khách gặp sự cố (mưa bão, mệt/ốm, trễ chuyến, thiếu thời gian...), LUÔN đề xuất TỐI THIỂU 2 phương án thay thế phù hợp, thực hiện được ngay.
3. Mỗi phương án chỉ thay đổi PHẦN BỊ ẢNH HƯỞNG (thường là 1 điểm hoặc 1 buổi). Giữ nguyên các ngày/điểm còn lại, giữ nguyên khách sạn và di chuyển liên tỉnh nếu có thể.
4. Ưu tiên phương án gần vị trí hiện tại, cùng khu vực, thời lượng tương đương, chi phí tương đương.
5. Về sức khỏe: chỉ đưa lời khuyên chung (nghỉ ngơi, giảm cường độ, uống đủ nước...). Nếu triệu chứng nghiêm trọng hoặc kéo dài, khuyên đi cơ sở y tế gần nhất. Không chẩn đoán, không kê thuốc.
6. Về thời tiết có nguy cơ cao (bão, lũ, sạt lở): đặt risk_level = "high", ưu tiên an toàn và khuyên theo dõi cảnh báo chính thức.
7. Trả lời bằng ngôn ngữ của khách, giọng thân thiện, ngắn gọn.`;

const SCHEMA = {
  type: "OBJECT",
  properties: {
    reply: { type: "STRING", description: "Lời trả lời ngắn gọn cho khách" },
    risk_level: { type: "STRING", enum: ["none", "low", "medium", "high"] },
    alternatives: {
      type: "ARRAY",
      items: {
        type: "OBJECT",
        properties: {
          title: { type: "STRING" },
          reason: { type: "STRING", description: "Vì sao phương án này phù hợp" },
          replaces: { type: "STRING", description: "Hoạt động/điểm đến bị thay thế" },
          new_plan: { type: "STRING", description: "Hoạt động/điểm đến thay thế và cách thực hiện" },
          affected_days: { type: "ARRAY", items: { type: "INTEGER" } },
          extra_time_min: { type: "INTEGER", description: "Thời gian phát sinh (phút), âm nếu tiết kiệm" },
          extra_cost: { type: "STRING" },
        },
        required: ["title", "reason", "replaces", "new_plan", "affected_days"],
      },
    },
    unchanged: { type: "STRING", description: "Những phần lịch trình được giữ nguyên" },
  },
  required: ["reply", "risk_level", "alternatives", "unchanged"],
};

function json(data, status, cors) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { "Content-Type": "application/json", ...cors },
  });
}

export default {
  async fetch(request, env) {
    const origin = request.headers.get("Origin") || "";
    const cors = {
      "Access-Control-Allow-Origin": ALLOWED_ORIGINS.includes(origin) ? origin : ALLOWED_ORIGINS[0],
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
    };

    if (request.method === "OPTIONS") return new Response(null, { headers: cors });
    if (request.method !== "POST") return json({ error: "Method not allowed" }, 405, cors);

    let body;
    try {
      body = await request.json();
    } catch {
      return json({ error: "JSON không hợp lệ" }, 400, cors);
    }

    const { message, history = [], context = {} } = body;
    if (typeof message !== "string" || !message.trim() || message.length > 1500) {
      return json({ error: "Tin nhắn không hợp lệ" }, 400, cors);
    }

    const contextText = JSON.stringify(context).slice(0, 20000); // giới hạn kích thước

    const payload = {
      system_instruction: { parts: [{ text: SYSTEM_PROMPT }] },
      contents: [
        ...history.slice(-8).map((m) => ({
          role: m.role === "user" ? "user" : "model",
          parts: [{ text: String(m.text).slice(0, 2000) }],
        })),
        {
          role: "user",
          parts: [{ text: `NGỮ CẢNH CHUYẾN ĐI (JSON):\n${contextText}\n\nCÂU HỎI CỦA KHÁCH:\n${message}` }],
        },
      ],
      generationConfig: {
        temperature: 0.4,
        responseMimeType: "application/json",
        responseSchema: SCHEMA,
      },
    };

    let res;
    try {
      res = await fetch(ENDPOINT, {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-goog-api-key": env.GEMINI_API_KEY },
        body: JSON.stringify(payload),
      });
    } catch {
      return json({ error: "Không kết nối được tới Gemini" }, 502, cors);
    }

    if (!res.ok) {
      const detail = await res.text();
      console.log("Gemini error", res.status, detail);
      return json({ error: "Gemini trả lỗi", status: res.status }, 502, cors);
    }

    const data = await res.json();
    const text = data?.candidates?.[0]?.content?.parts?.map((p) => p.text || "").join("") || "";
    try {
      return json(JSON.parse(text), 200, cors);
    } catch {
      // Phòng khi model trả text thường
      return json({ reply: text || "Xin lỗi, mình chưa trả lời được.", risk_level: "none", alternatives: [], unchanged: "" }, 200, cors);
    }
  },
};
