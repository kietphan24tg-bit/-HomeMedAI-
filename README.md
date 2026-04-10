# 🏥 HomeMedAI - Technical Documentation

## Dự án mobile ứng dụng React Native & Expo phục vụ quản lý sức khỏe gia đình.

## 🏗 Kiến trúc Dự án (Architecture)

Dự án sử dụng kiến trúc **Modular Screen-based**, chia phân vùng theo chức năng màn hình để dễ dàng mở rộng và bảo trì.

### 1. Cấu trúc Thư mục (Project Structure)

```text
├── app/                  # Expo Router (File-based Routing)
│   ├── (tabs)/          # Giao diện chính sau khi Login (Tab Navigation)
│   ├── _layout.tsx      # Root Layout, cấu hình Provider & Fonts
│   └── onboarding.tsx   # Luồng giới thiệu & Auth ban đầu
├── src/
│   ├── screens/         # Chứa Logic & UI chính của từng màn hình
│   │   ├── family/      # Quản lý thành viên & nhóm gia đình
│   │   ├── health/      # Hồ sơ bệnh án, tiêm chủng, đơn thuốc
│   │   └── home/        # Dashboard tổng hợp thông tin
│   ├── components/      # Reusable Components
│   │   ├── ui/          # Các UI nguyên tử (Button, Input, Badge...)
│   │   └── profile/     # Các component chuyên biệt cho hồ sơ
│   ├── data/            # Mock data & Static configuration
│   ├── styles/          # Design System (tokens, shared styles)
│   └── utils/           # Helper functions (color-palette, formatting...)
└── assets/              # Fonts, Images, Icons
```

### 2. Luồng Điều hướng (Navigation Flow)

Ứng dụng sử dụng **Expo Router v3**:

- **Root**: Kiểm tra trạng thái Auth/Onboarding tại `app/index.tsx`.
- **Onboarding Stack**: Chạy luồng Welcome -> Auth tại `app/onboarding.tsx`.
- **Main Tabs**: Sau khi vào app, điều hướng chính nằm trong `app/(tabs)/_layout.tsx`.

---

## 🎨 Design System & Styling

### Design Tokens (`src/styles/tokens.ts`)

Tất cả các hằng số màu sắc, khoảng cách (spacing), bo góc (radius) phải được lấy từ file `tokens.ts`. Tuyệt đối không hardcode giá trị màu lạ trong file UI.

### Hệ thống Màu sắc Thông minh (`src/utils/color-palette.ts`)

Ứng dụng sử dụng cơ chế màu sắc xác định (Deterministic):

- **getAvatarGradient(index/key)**: Tạo gradient cho avatar dựa trên vị trí hoặc tên thành viên.
- **recordColors(specialty)**: Tự động trả về bộ mapping màu dựa trên chuyên khoa (Tim mạch, Nhi...).
- **CATEGORY_PALETTES**: Danh sách các cặp màu (text + background contrast) cho các thẻ danh sách.

---

### Nguyên tắc code UI:

1. **SafeAreaView**: Luôn dùng `SafeAreaView` từ thư viện `react-native-safe-area-context`.
2. **Icons**: Sử dụng bộ `@expo/vector-icons` (ưu tiên Ionicons).
3. **Mock Data**: Khi tạo data mới, hãy cập nhật vào `src/data/` và định nghĩa Type tương ứng trong `src/types/`.

### Lệnh chạy (Scripts):

- `npm start`: Chạy Expo server.
- `npm run lint`: Kiểm tra code style.
- `npm run typecheck`: Kiểm tra TypeScript toàn repo.
- `npm run check:auth-session`: Kiểm tra các invariant quan trọng của flow auth/session.
- `npm run test:auth-session-runtime`: Chạy runtime tests cho session core và refresh coordinator.
- `npm run check-all`: Chạy toàn bộ chuỗi kiểm tra chính.
- `npm run reset-project`: Cài đặt lại môi trường mẫu (Thận trọng khi dùng).

### Tài liệu Auth/Session

- `modify.md`: mô tả các thay đổi đã áp dụng cho auth/session.
- `auth-session-qa.md`: checklist QA thủ công trước release.
- `docs/auth-session.md`: trang index cho docs và command liên quan auth/session.

---

## 📦 Dependencies quan trọng

- `expo-router`: Hệ thống điều hướng.
- `expo-linear-gradient`: Xử lý màu sắc gradient cho avatar/cards.
- `react-native-safe-area-context`: Quản lý vùng an toàn trên các thiết bị mobile mới.

---
