# Trang Quản Lý Công Việc Cá Nhân

Ứng dụng quản lý công việc cá nhân với Kanban Board, deadline tracking, thông báo, và thống kê.

## ✨ Tính Năng

- ✅ **Thêm/Sửa/Xóa công việc** - Kanban Board với 3 trạng thái (TODO, In Progress, Done)
- 🔍 **Tìm kiếm và lọc** - Theo tên, trạng thái, mức độ ưu tiên
- 💾 **Lưu localStorage** - Dữ liệu không mất khi tắt trình duyệt
- ⏰ **Deadline tracking** - Đặt deadline, cảnh báo khi gần hạn
- 🔔 **Thông báo** - Toast + Browser Push Notification
- 📊 **Thống kê** - Tiến độ, hiệu suất, xu hướng, phân loại task
- 📱 **Responsive** - Mobile, tablet, desktop

## 🛠️ Stack Công Nghệ

- **Next.js 16** + **React 19** + **TypeScript**
- **Zustand** (state management)
- **shadcn/ui** + **Tailwind CSS**
- **React Hook Form** + **Zod** (validation)
- **Recharts** (biểu đồ)
- **Sonner** (toast notifications)

## 📦 Yêu Cầu

- Node.js 18+
- npm hoặc yarn

## 🚀 Hướng Dẫn Cài Đặt & Chạy

### 1. Clone Repository
```bash
git clone https://github.com/ThomasTran17/Personal-Task-Management.git
cd personal-task-management
```

### 2. Cài Đặt Dependencies
```bash
npm install
```

### 3. Chạy Ứng Dụng
```bash
npm run dev
```
Mở `http://localhost:3000` trong trình duyệt.

### 4. Build Production
```bash
npm run build
npm run start
```

## 📁 Cấu Trúc Dự Án

```
src/
├── app/                  # Next.js pages
├── components/
│   ├── kanban/          # Kanban board components
│   ├── stats/           # Statistics components
│   ├── shared/          # Shared components (Sidebar, BottomNav)
│   └── ui/              # shadcn/ui components
├── store/               # Zustand store (taskStore)
├── hooks/               # Custom hooks (notifications, validation)
├── lib/                 # Utilities (deadline, statistics helpers)
└── types/               # TypeScript interfaces
```

## 💡 Quyết Định Kỹ Thuật

### 1. Zustand + localStorage (State Management)
- **Lý do**: Nhẹ, không cần boilerplate như Redux. Middleware `persist` tự động lưu vào localStorage.
- Task được lưu tự động, dữ liệu không bị mất khi refresh.

### 2. Multi-layer Deadline Notifications
- **Toast** (Sonner): Hiển thị khi user đang sử dụng app
- **Browser Push**: Hiển thị ngoài app, cần HTTPS để hoạt động
- Kiểm tra deadline mỗi 1 phút, thông báo khi gần 1 ngày hoặc 1 giờ trước hạn

### 3. Kanban Board
- 3 cột: TODO, In Progress, Done
- Responsive: desktop 3 cột, mobile dùng tabs
- Sử dụng Radix UI Tabs cho accessibility

### 4. Statistics Page
- **Progress**: Thanh tiến độ hoàn thành
- **Efficiency**: Tỷ lệ task hoàn thành
- **Trend**: Biểu đồ xu hướng theo ngày
- **Breakdown**: Phân loại task theo trạng thái & priority

### 5. Form Validation
- **React Hook Form**: Quản lý form state hiệu quả
- **Zod**: Schema validation type-safe

### 6. UI: shadcn/ui + Tailwind
- Copy-paste components, customizable
- Built on Radix UI (accessibility-first)
- Fully responsive

##  Cách Sử Dụng

- **Thêm task**: Nhấp "New Task" → Điền thông tin → Create
- **Sửa task**: Nhấp vào task → Cập nhật → Update
- **Xóa task**: Nhấp nút delete → Xác nhận
- **Tìm kiếm**: Dùng thanh search
- **Lọc**: Theo trạng thái, priority
- **Xem thống kê**: Vào tab Statistics
- **Thông báo**: Cho phép Notification khi trình duyệt hỏi

## ⚠️ Lưu Ý

1. Dữ liệu lưu **localStorage** - xóa cache sẽ mất dữ liệu

