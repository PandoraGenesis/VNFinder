# Máy chủ trung gian cho chatbot VNFinder

Chatbot không gọi LLM trực tiếp từ trình duyệt, vì khóa API đặt trong JavaScript phía người dùng thì ai cũng đọc được. Worker này giữ khóa ở máy chủ.

## Triển khai (Cloudflare Workers, gói miễn phí)

```bash
npm install -g wrangler
cd worker
wrangler login
wrangler secret put GEMINI_API_KEY   # Dán Google Gemini API Key khi được hỏi
wrangler deploy
```

Lệnh cuối in ra địa chỉ dạng `https://vnfinder-chat.<tài khoản>.workers.dev`.

## Nối với web

Bạn có 2 cách rất dễ dàng:

### Cách 1: Cấu hình ngay trên giao diện web (Khuyến nghị)
1. Mở box chat trên trang web.
2. Bấm vào biểu tượng bánh răng **Cài đặt** (⚙️) ở góc trên bên phải khung chat.
3. Dán địa chỉ Worker URL vừa tạo vào ô **Cloudflare Worker URL** rồi bấm **Lưu URL** (hoặc dán trực tiếp **Gemini API Key** nếu muốn gọi trực tiếp).
4. Bấm nút **⚡ Kiểm tra kết nối** để kiểm tra ngay.

### Cách 2: Gán cố định trong code
Thêm một dòng vào `index.html`, đặt **trước** thẻ `<script src="js/chat-assistant.js">`:

```html
<script>window.VNFINDER_CHAT_URL = 'https://vnfinder-chat.<tài khoản>.workers.dev';</script>
```

Nếu chưa cấu hình Worker hoặc API Key, chatbot sẽ tự động dùng bộ phân tích từ khóa ngoại tuyến (không cần mạng).

## Chống lạm dụng

Worker chỉ nhận request từ các origin trong `ALLOWED_ORIGINS` và giới hạn kích thước đầu vào, nhưng header Origin có thể bị giả mạo ngoài trình duyệt. Hãy đặt thêm một rule Rate Limiting trong bảng điều khiển Cloudflare (ví dụ 20 request mỗi phút cho mỗi IP) và đặt hạn mức chi tiêu cho khóa API.
