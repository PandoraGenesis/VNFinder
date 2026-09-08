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


## ✨ Tính Năng Chính

* **Tìm kiếm địa điểm:** Tra cứu điểm đến/điểm khởi hành theo bộ lọc chỉ mục A-Z, kèm bộ lọc theo miền/vùng (region filter).
* **Gợi ý lịch trình (Lịch Trình Đề Xuất):** Tự động sinh kế hoạch theo khoảng thời gian người dùng chọn, có stepper để chọn số đêm lưu trú, chia mỗi ngày thành các khung giờ sáng/trưa/chiều/tối.
* **Dữ liệu lịch trình theo tầng (tiered data):** Nội dung gợi ý được lấy từ một tập dữ liệu thực tế phân theo địa phương, thay vì sinh nội dung chung chung ngẫu nhiên.
* **Bản đồ tương tác:** Hiển thị bản đồ bằng Leaflet + OpenStreetMap, dữ liệu ranh giới quốc gia/tỉnh/xã ở định dạng GeoJSON, kèm chỉ mục tìm kiếm địa danh riêng (`search-index.json`).
* **Tài khoản người dùng (Auth):** Đăng nhập/đăng ký để lưu lịch trình hoặc tùy chỉnh cá nhân.
* **Check-in địa điểm:** Cho phép người dùng đánh dấu đã ghé thăm một địa danh.
* **Cẩm nang du lịch (Guide):** Trang nội dung giới thiệu/hướng dẫn du lịch theo từng vùng miền.
* **Đa ngôn ngữ (i18n):** Toàn bộ giao diện hỗ trợ song ngữ Việt/Anh; nội dung lịch trình sinh động được tự động dịch qua MyMemory API khi cần.
* **Quản lý ảnh điểm tham quan:** Ảnh minh họa cho từng địa danh/POI được tổ chức và tải riêng, hỗ trợ xem dạng lightbox.


## 🛠️ Công Nghệ & Kiến Trúc

* **Nền tảng:** HTML/CSS/JavaScript thuần, không phụ thuộc framework, chạy trực tiếp trên trình duyệt.
* **Bản đồ & định tuyến:** Leaflet làm engine hiển thị bản đồ, OpenStreetMap làm nguồn tile.
* **Dữ liệu địa lý:** GeoJSON theo 3 cấp — ranh giới quốc gia (`vn-boundary.geojson`), tỉnh/thành (`provinces.geojson`), và xã/phường theo từng mã tỉnh (`data/maps/wards/`), cùng dữ liệu đảo (`islands.geojson`).
* **Dịch tự động:** `i18n-auto.js` gọi MyMemory API để dịch nội dung lịch trình được sinh động, bổ sung cho lớp i18n tĩnh có sẵn.
* **Tách module theo tính năng:** Mỗi tính năng (auth, check-in, guide, lịch trình, bản đồ...) có cặp file CSS/JS riêng để dễ bảo trì.


## 📁 Cấu Trúc Thư Mục

```text
VNFinder/
├── assets/
│   └── img/                       # Ảnh minh họa địa danh, ảnh hero, ảnh cẩm nang du lịch
├── css/
│   ├── auth.css                   # Giao diện đăng nhập/đăng ký
│   ├── checkin.css                # Giao diện tính năng check-in địa điểm
│   ├── custom.css                 # Style tùy chỉnh bổ sung
│   ├── guide.css                  # Giao diện trang cẩm nang du lịch
│   ├── intro.css                  # Style cho màn hình giới thiệu/mở đầu
│   ├── itinerary.css              # Giao diện thẻ lịch trình (card layout) + lightbox ảnh
│   ├── maps.css                   # Style riêng cho tab bản đồ
│   └── style.css                  # Style tổng thể của ứng dụng
├── data/
│   ├── maps/
│   │   ├── README.md              # Ghi chú về nguồn/định dạng dữ liệu bản đồ
│   │   ├── islands.geojson        # Dữ liệu ranh giới các đảo
│   │   ├── provinces.geojson      # Dữ liệu ranh giới cấp tỉnh/thành
│   │   ├── search-index.json      # Chỉ mục tìm kiếm địa danh cho bản đồ
│   │   └── wards/                 # Dữ liệu ranh giới cấp xã/phường, theo mã tỉnh
│   └── vn-boundary.geojson        # Ranh giới quốc gia Việt Nam
├── js/
│   ├── auth.js                    # Logic đăng nhập/đăng ký
│   ├── checkin.js                 # Logic tính năng check-in địa điểm
│   ├── data.js                    # Dữ liệu địa danh tĩnh
│   ├── guide.js                   # Logic trang cẩm nang du lịch
│   ├── i18n-auto.js               # Dịch tự động nội dung động qua MyMemory API
│   ├── i18n.js                    # Lớp đa ngôn ngữ tĩnh (VN/EN)
│   ├── itinerary-data.js          # Dữ liệu lịch trình theo tầng, phân theo địa phương
│   ├── location.js                # Logic tìm kiếm/chọn địa điểm
│   ├── maps.js                    # Logic hiển thị bản đồ, tương tác với dữ liệu GeoJSON
│   ├── nav.js                     # Logic điều hướng giữa các tab/panel
│   ├── nights-stepper.js          # Bộ chọn số đêm lưu trú
│   ├── poi-images.js              # Quản lý/tải ảnh cho từng điểm tham quan (POI)
│   ├── region-filter.js           # Logic lọc địa danh theo miền/vùng
│   └── script.js                  # Logic chính, khởi tạo và liên kết các module
├── .gitignore
├── LICENSE
├── tinh-thanh-cong-thong-tin-du-lich-url.csv
└── README.md
```


## 🚀 Hướng Dẫn Cài Đặt & Vận Hành

#### 1. Clone Repository

```bash
    git clone https://github.com/PandoraGenesis/VNFinder.git
    cd VNFinder
```

#### 2. Chạy Ứng Dụng

Vì đây là dự án HTML/CSS/JS thuần, không cần build hay cài dependency. Có hai cách chạy:

- **Mở trực tiếp:** Mở file `index.html` bằng trình duyệt.
- **Chạy qua local server (khuyên dùng, tránh lỗi CORS khi fetch dữ liệu GeoJSON/JSON):**
```bash
    python -m http.server 8000
```
Sau đó truy cập `http://localhost:8000` trên trình duyệt.


## 👥 Nhóm Thực Hiện
- Trường: THPT Quốc Học Quy Nhơn


## 📜 Giấy Phép
Phát hành theo giấy phép MIT.

---

<h2 id="english">🇬🇧 English</h2>

## 📌 Project Introduction

**VNFinder** is a web app that helps users look up destinations and automatically generate travel itineraries across Vietnam. The project aims to turn trip planning — usually scattered across finding places, checking maps, and building a schedule — into one seamless experience on a single interface, with bilingual Vietnamese-English support.


## ✨ Key Features

* **Location search:** Look up destinations/departure points through an A-Z index filter, plus a region filter.
* **Suggested itinerary generator:** Automatically builds a plan for the chosen date range, with a stepper to pick the number of nights, splitting each day into morning/noon/afternoon/evening slots.
* **Tiered itinerary data:** Suggested content is pulled from a real, locality-level dataset rather than generic randomized content.
* **Interactive map:** Map rendering via Leaflet + OpenStreetMap, with national/provincial/ward boundary data in GeoJSON, plus a dedicated place search index (`search-index.json`).
* **User accounts (Auth):** Sign in/sign up to save itineraries or personal customizations.
* **Location check-in:** Lets users mark a destination as visited.
* **Travel guide:** A content page introducing/guiding travel by region.
* **Multilingual (i18n):** The whole interface supports Vietnamese/English; dynamically generated itinerary content is auto-translated via the MyMemory API when needed.
* **Point-of-interest image management:** Illustrative images per destination/POI are organized and loaded separately, with lightbox viewing.


## 🛠️ Technology & Architecture

* **Stack:** Plain HTML/CSS/JavaScript, no framework dependency, runs directly in the browser.
* **Maps & routing:** Leaflet as the map rendering engine, OpenStreetMap as the tile source.
* **Geographic data:** Three-tier GeoJSON — national boundary (`vn-boundary.geojson`), provincial boundaries (`provinces.geojson`), and ward-level boundaries per province code (`data/maps/wards/`), plus island data (`islands.geojson`).
* **Auto-translation:** `i18n-auto.js` calls the MyMemory API to translate dynamically generated itinerary content, complementing the existing static i18n layer.
* **Feature-based modularity:** Each feature (auth, check-in, guide, itinerary, maps...) has its own CSS/JS pair for easier maintenance.


## 📁 Directory Structure

```text
VNFinder/
├── assets/
│   └── img/                       # Destination photos, hero images, travel guide images
├── css/
│   ├── auth.css                   # Sign-in/sign-up UI
│   ├── checkin.css                # Location check-in UI
│   ├── custom.css                 # Additional custom styling
│   ├── guide.css                  # Travel guide page UI
│   ├── intro.css                  # Intro/landing screen styling
│   ├── itinerary.css              # Itinerary card layout + image lightbox
│   ├── maps.css                   # Styling specific to the map tab
│   └── style.css                  # Overall app styling
├── data/
│   ├── maps/
│   │   ├── README.md              # Notes on map data source/format
│   │   ├── islands.geojson        # Island boundary data
│   │   ├── provinces.geojson      # Provincial-level boundary data
│   │   ├── search-index.json      # Place search index for the map
│   │   └── wards/                 # Ward-level boundary data, by province code
│   └── vn-boundary.geojson        # Vietnam national boundary
├── js/
│   ├── auth.js                    # Sign-in/sign-up logic
│   ├── checkin.js                 # Location check-in logic
│   ├── data.js                    # Static location dataset
│   ├── guide.js                   # Travel guide page logic
│   ├── i18n-auto.js               # Auto-translation of dynamic content via MyMemory API
│   ├── i18n.js                    # Static bilingual layer (VN/EN)
│   ├── itinerary-data.js          # Tiered itinerary data, organized by locality
│   ├── location.js                # Location search/selection logic
│   ├── maps.js                    # Map rendering logic, interacts with GeoJSON data
│   ├── nav.js                     # Tab/panel navigation logic
│   ├── nights-stepper.js          # Stay-length (nights) stepper control
│   ├── poi-images.js              # Loads/manages images per point of interest (POI)
│   ├── region-filter.js           # Region-based destination filtering
│   └── script.js                  # Main logic, initializes and wires up modules
├── .gitignore
├── LICENSE
├── tinh-thanh-cong-thong-tin-du-lich-url.csv
└── README.md
```


## 🚀 Installation & Operation Guide

#### 1. Clone the Repository

```bash
    git clone https://github.com/PandoraGenesis/VNFinder.git
    cd VNFinder
```

#### 2. Run the App

This is a plain HTML/CSS/JS project — no build step or dependencies required. Two ways to run it:

- **Open directly:** Open `index.html` in a browser.
- **Run via a local server (recommended, avoids CORS issues when fetching GeoJSON/JSON data):**
```bash
    python -m http.server 8000
```
Then visit `http://localhost:8000` in your browser.


## 👥 Project Team
- School: Quoc Hoc Quy Nhon High School


## 📜 License
Released under the MIT license.
