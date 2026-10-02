# Máy chủ trung gian cho chatbot VNFinder

Chatbot không gọi LLM trực tiếp từ trình duyệt, vì khóa API đặt trong JavaScript phía người dùng thì ai cũng đọc được. Worker này giữ khóa ở máy chủ.

## Triển khai (Cloudflare Workers, gói miễn phí)

```bash
npm install -g wrangler
cd worker
wrangler login
wrangler secret put ANTHROPIC_API_KEY   # dán khóa API khi được hỏi
wrangler deploy
```

Lệnh cuối in ra địa chỉ dạng `https://vnfinder-chat.<tài khoản>.workers.dev`.

## Nối với web

Thêm một dòng vào `index.html`, đặt **trước** thẻ `<script src="js/chat-assistant.js">`:

```html
<script>window.VNFINDER_CHAT_URL = 'https://vnfinder-chat.<tài khoản>.workers.dev';</script>
```

Để trống thì chatbot tự dùng bộ phân tích từ khóa trên trình duyệt (không cần mạng).

## Chống lạm dụng

Worker chỉ nhận request từ các origin trong `ALLOWED_ORIGINS` và giới hạn kích thước đầu vào, nhưng header Origin có thể bị giả mạo ngoài trình duyệt. Hãy đặt thêm một rule Rate Limiting trong bảng điều khiển Cloudflare (ví dụ 20 request mỗi phút cho mỗi IP) và đặt hạn mức chi tiêu cho khóa API.
