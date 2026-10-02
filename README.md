<div align="center">

# VNFINDER

**Vietnam travel itinerary planner web app.**  
*Ứng dụng web lập kế hoạch và gợi ý lịch trình du lịch Việt Nam.*

![HTML5](https://img.shields.io/badge/HTML5-E34F26?style=for-the-badge&logo=html5&logoColor=white)
![CSS3](https://img.shields.io/badge/CSS3-1572B6?style=for-the-badge&logo=css3&logoColor=white)
![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black)
![Leaflet](https://img.shields.io/badge/Leaflet-199900?style=for-the-badge&logo=leaflet&logoColor=white)
![OpenStreetMap](https://img.shields.io/badge/OpenStreetMap-7EBC6F?style=for-the-badge&logo=openstreetmap&logoColor=white)

[🇻🇳 Tiếng Việt](#-tiếng-việt) • [🇬🇧 English](#-english)

</div>

---

<h2 id="tiếng-việt">🇻🇳 Tiếng Việt</h2>

## 📌 Giới Thiệu Dự Án

**VNFinder** là một ứng dụng web giúp người dùng tra cứu địa điểm và tự động tạo lịch trình du lịch tại Việt Nam. Dự án hướng tới việc biến quá trình lên kế hoạch cho một chuyến đi — vốn thường rời rạc giữa tìm địa điểm, xem bản đồ, và sắp xếp thời gian biểu — thành một trải nghiệm liền mạch trên một giao diện duy nhất, hỗ trợ song ngữ Việt - Anh.

Đặc biệt, dự án được tích hợp các thuật toán hỗ trợ thông minh để cá nhân hóa hoàn toàn trải nghiệm du lịch của người dùng. Đây là dự án tham dự cuộc thi **Gia Lai Youth HackAIthon 2026**.

## ✨ Tính Năng Nổi Bật

* **Trợ lý Ảo Thông Minh (AI Chatbot):** Hộp thoại trò chuyện tích hợp sẵn giúp người dùng hỏi đáp về địa điểm, ẩm thực và gợi ý chuyến đi. Hỗ trợ cơ chế "dự phòng ngoại tuyến" (offline fallback) thông minh, có khả năng phân tích từ khóa và trả lời câu hỏi trực tiếp không cần mạng Internet.
* **Gợi ý lịch trình tự động:** Tự động sinh kế hoạch theo khoảng thời gian người dùng chọn, tối ưu hóa các điểm tham quan dựa trên nhu cầu (nghỉ dưỡng, khám phá, ẩm thực...) và nhịp độ (nhẹ nhàng, năng động). 
* **Tìm kiếm đa lớp (2-Level Location Picker):** Tra cứu điểm đến/điểm khởi hành theo bộ lọc chỉ mục A-Z, kết hợp bộ lọc theo vùng miền (Bắc, Trung, Nam, Tây Nguyên...).
* **Bản đồ tương tác thời gian thực:** Tích hợp Leaflet + OpenStreetMap. Hiển thị ranh giới quốc gia, tỉnh, xã bằng file GeoJSON. Đặc biệt cho phép ghim vị trí, đo khoảng cách và xem định tuyến đường đi trực quan.
* **Đa ngôn ngữ mượt mà (Dynamic i18n):** Toàn bộ giao diện hỗ trợ song ngữ Việt/Anh, tự động cập nhật ngôn ngữ động bằng `MutationObserver` (kể cả khung chat và các nội dung đang hiển thị) mà không cần tải lại trang. Các dữ liệu lịch trình phức tạp được hỗ trợ dịch tự động qua MyMemory API.
* **Cẩm nang du lịch Wikipedia:** Tra cứu địa danh trực tiếp thông qua Wikipedia API dựa trên tọa độ (GPS) hoặc từ khóa tìm kiếm.
* **Tài khoản & Đồng bộ Đám mây (Cloud Sync):** Đăng nhập, đăng ký và lưu trữ dữ liệu người dùng (lịch trình yêu thích, điểm check-in) an toàn lên đám mây thông qua JSONBin.io.
* **Tự động bù trừ tỷ lệ hiển thị (Auto-scale Compensation):** Tự động phát hiện cài đặt độ thu phóng của hệ điều hành (thông qua `devicePixelRatio`) để điều chỉnh lại giao diện web, đảm bảo tỷ lệ hiển thị 100% cực kỳ sắc nét và nhất quán trên mọi màn hình.

## 🛠️ Công Nghệ & Kiến Trúc

* **Nền tảng Core:** HTML5, CSS3, Vanilla JavaScript (Không sử dụng Framework nặng, tối ưu hóa tốc độ tải trang).
* **Bản đồ & Định tuyến:** LeafletJS, OpenStreetMap Tile Server.
* **Xử lý Dữ liệu Địa lý:** Dữ liệu cấp 3 (Quốc gia, Tỉnh/Thành, Xã/Phường) tổ chức dưới dạng GeoJSON.
* **APIs Bên Thứ 3:**
  * `Wikipedia API`: Trích xuất thông tin bách khoa toàn thư cho địa danh.
  * `MyMemory API`: Dịch thuật tự động dự phòng.
  * `JSONBin.io API`: Lưu trữ dữ liệu người dùng.
* **Xử lý Giao diện:** Sử dụng Flatpickr cho bộ chọn ngày giờ, và hệ thống Icon từ thư viện Lucide.

## 📁 Cấu Trúc Thư Mục

```text
VNFinder/
├── assets/img/                    # Tài nguyên hình ảnh, logo, og-image, banner
├── css/                           # Các stylesheet được module hóa
│   ├── style.css                  # Style gốc toàn cục
│   ├── chat.css                   # Giao diện hộp thoại trợ lý ảo
│   ├── maps.css                   # Giao diện bản đồ Leaflet
│   ├── custom.css                 # Tùy chỉnh DatePicker (Flatpickr) & Location Picker
│   └── ...                        # auth, checkin, guide, intro, itinerary
├── data/                          # Tập dữ liệu JSON & GeoJSON nội bộ
│   ├── maps/wards/                # Ranh giới cấp xã/phường
│   ├── islands.geojson            # Dữ liệu biển đảo
│   └── vn-boundary.geojson        # Ranh giới Việt Nam
├── js/                            # Mã nguồn JavaScript (Vanilla JS)
│   ├── script.js                  # Khởi tạo và điều phối các module
│   ├── chat-*.js                  # Logic Trợ lý AI (Content, Knowledge, Assistant)
│   ├── i18n*.js                   # Logic đa ngôn ngữ và dịch tự động
│   ├── maps.js                    # Tương tác bản đồ
│   ├── auth.js                    # Đăng nhập & đồng bộ JSONBin
│   └── ...                        # checkin, data, guide, location, nav, region-filter
├── index.html                     # Trang ứng dụng duy nhất (Single Page App thuần)
└── README.md
```

## 🚀 Hướng Dẫn Cài Đặt & Vận Hành

#### 1. Tải Mã Nguồn

```bash
git clone https://github.com/PandoraGenesis/VNFinder.git
cd VNFinder
```

#### 2. Khởi Chạy Ứng Dụng

Ứng dụng được viết hoàn toàn bằng Client-side scripting (Front-end thuần), không yêu cầu `npm install` hay cài đặt thư viện rườm rà.

- **Chạy qua Local Server (Khuyên dùng):** Tránh lỗi CORS khi trình duyệt đọc các file cục bộ (`.json`, `.geojson`).
```bash
python -m http.server 8000
```
Sau đó truy cập `http://localhost:8000` trên trình duyệt.

- **Mở trực tiếp (Chế độ xem trước):** Click đúp vào file `index.html`. Một số tính năng tải dữ liệu địa lý có thể không hoạt động trên một số trình duyệt bảo mật cao.

## 👥 Nhóm Thực Hiện
- **Đơn vị:** Trường THPT Quốc Học Quy Nhơn.
- **Mục tiêu:** Tham gia cuộc thi **Gia Lai Youth HackAIthon 2026**.

## 📜 Giấy Phép
Dự án được phân phối dưới giấy phép MIT License.

---

<h2 id="english">🇬🇧 English</h2>

## 📌 Project Introduction

**VNFinder** is a comprehensive web application designed to help users look up destinations and automatically generate highly personalized travel itineraries across Vietnam. The project aims to consolidate trip planning — usually scattered across multiple platforms for finding places, checking maps, and building schedules — into one seamless, bilingual experience on a single interface.

Additionally, the project integrates smart algorithms to deeply personalize the user travel experience. This is an entry project for the **Gia Lai Youth HackAIthon 2026**.

## ✨ Key Features

* **Smart AI Chatbot:** Built-in chat assistant that helps users inquire about destinations, local cuisine, and travel plans. It features a robust "offline fallback" parser that intelligently identifies keywords and answers common questions directly without requiring an internet connection.
* **Automated Itinerary Generation:** Dynamically generates plans based on chosen dates, optimizing sightseeing spots according to personal preferences (relaxation, adventure, culinary) and pace (relaxed vs active).
* **2-Level Location Picker:** Quickly look up destinations or departure points through an A-Z index combined with regional filters (North, Central, South, Highlands, etc.).
* **Real-time Interactive Maps:** Integrated with Leaflet and OpenStreetMap. Visualizes national, provincial, and ward boundaries via GeoJSON. Allows users to pin locations, measure distances, and visually route their trips.
* **Dynamic Multilingual Support (i18n):** The entire UI supports seamless switching between English and Vietnamese without reloading the page. It utilizes a custom `MutationObserver` to instantly translate active elements (like the chatbox UI), while complex dynamic itinerary data is auto-translated using the MyMemory API.
* **Wikipedia Travel Guide:** Look up detailed encyclopedic information for landmarks directly via the Wikipedia API based on GPS coordinates or search queries.
* **Cloud Synchronization (Auth):** Securely sign in/up and save user data (favorite itineraries, check-in spots) to the cloud using JSONBin.io.
* **Auto-scale Compensation:** Automatically detects the operating system's zoom settings (via `devicePixelRatio`) and counters it within the web UI, guaranteeing a sharp and consistently sized 100% scale rendering across all devices.

## 🛠️ Technology & Architecture

* **Core Stack:** HTML5, CSS3, Vanilla JavaScript (No heavy frameworks, highly optimized for loading speed).
* **Mapping & Routing:** LeafletJS Engine, OpenStreetMap Tile Server.
* **Geospatial Processing:** 3-tier boundary data (National, Provincial, Ward) stored as raw GeoJSON formats.
* **Third-Party APIs:**
  * `Wikipedia API`: Contextual extraction for travel guides.
  * `MyMemory API`: Dynamic text translation.
  * `JSONBin.io API`: Cloud-based user state storage.
* **UI Components:** Flatpickr for date selection, Lucide library for SVG iconography.

## 📁 Directory Structure

```text
VNFinder/
├── assets/img/                    # Destination photos, logos, banners
├── css/                           # Modular stylesheets
│   ├── style.css                  # Global root styles
│   ├── chat.css                   # Chatbot UI styling
│   ├── maps.css                   # Leaflet map styling
│   ├── custom.css                 # Flatpickr & 2-Level Location Picker overrides
│   └── ...                        # auth, checkin, guide, intro, itinerary
├── data/                          # Local JSON & GeoJSON datasets
│   ├── maps/wards/                # Ward-level boundaries
│   ├── islands.geojson            # Island boundaries
│   └── vn-boundary.geojson        # Vietnam national boundaries
├── js/                            # Vanilla JavaScript source files
│   ├── script.js                  # Main entry, coordinates all modules
│   ├── chat-*.js                  # AI Assistant logic (Content, Knowledge, Assistant)
│   ├── i18n*.js                   # Multilingual logic & auto-translation
│   ├── maps.js                    # Map interactions
│   ├── auth.js                    # Authentication & JSONBin sync
│   └── ...                        # checkin, data, guide, location, nav, region-filter
├── index.html                     # Single Page Application root
└── README.md
```

## 🚀 Installation & Operation Guide

#### 1. Clone the Repository

```bash
git clone https://github.com/PandoraGenesis/VNFinder.git
cd VNFinder
```

#### 2. Run the Application

This is a pure Client-side HTML/CSS/JS project. There is no need for `npm install` or complex build tools.

- **Run via Local Server (Recommended):** Avoids strict CORS browser policies when fetching local `.json` and `.geojson` files.
```bash
python -m http.server 8000
```
Then visit `http://localhost:8000` in your web browser.

- **Open Directly (Preview Mode):** Simply double-click `index.html`. Note that some geospatial data loading features might be blocked by browser security protocols.

## 👥 Project Team
- **School:** Quoc Hoc Quy Nhon High School.
- **Event:** Gia Lai Youth HackAIthon 2026.

## 📜 License
Released under the MIT license.
