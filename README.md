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

## Push Notifications (Android)

- Add `google-services.json` from Firebase into the app root.
- `app.json` already sets `expo.android.googleServicesFile`.
- Use EAS/dev-client build to receive real FCM tokens (Expo Go does not support device push tokens).

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

## 🚀 Cách chạy dự án (Local)

### 1. Chuẩn bị môi trường

- Node.js LTS (khuyến nghị >= 20)
- npm
- Expo CLI (qua `npx expo ...`)
- Android Studio (nếu chạy emulator Android)
- Điện thoại Android cùng mạng LAN với máy dev (nếu test máy thật)

### 2. Cài dependencies

```powershell
npm install
```

### 3. Cấu hình biến môi trường

File `.env` (đang dùng local backend):

```env
EXPO_PUBLIC_BE_URL=http://192.168.1.7:8080
EXPO_PUBLIC_MOCK_API=false
```

Lưu ý:

- `EXPO_PUBLIC_BE_URL` phải là IP LAN máy chạy backend để điện thoại thật truy cập được.
- Đảm bảo backend đang chạy và mở cổng tương ứng.

### 3.1. Khi đổi mạng Wi-Fi: cập nhật IPv4 LAN nhanh

Mỗi lần máy dev đổi sang mạng khác, IP LAN có thể thay đổi. Cập nhật theo quy trình sau:

1. Tìm IPv4 của máy dev:

```powershell
ipconfig
```

Tìm adapter đang dùng Wi-Fi/Ethernet và lấy dòng `IPv4 Address` (ví dụ `192.168.1.25`).

2. Cập nhật `.env`:

```env
EXPO_PUBLIC_BE_URL=http://<IPv4_MOI>:8080
```

Ví dụ:

```env
EXPO_PUBLIC_BE_URL=http://192.168.1.25:8080
```

3. Kiểm tra backend từ máy dev:

```powershell
curl http://<IPv4_MOI>:8080/health
```

4. Khởi động lại Expo để nhận biến môi trường mới:

```powershell
npx expo start -c
```

Lưu ý quan trọng:

- Không dùng `localhost`/`127.0.0.1` khi test bằng điện thoại thật.
- Điện thoại và máy dev phải cùng mạng LAN.
- Nếu vẫn lỗi network, kiểm tra Firewall Windows có chặn cổng `8080` hay không.

### 4. Chạy app

```powershell
npx expo start -c
```

Một số lệnh hữu ích:

- `npm run android`: chạy Android (native run)
- `npm run android:device`: chạy trên thiết bị Android thật
- `npm run typecheck`: kiểm tra TypeScript

---

## 📱 Cài APK đã build sẵn (không cần QR)

Khi đã có file `.apk`, chỉ cần gửi cho người dùng để tự cài trên Android.

### 1. Gửi file APK

- Gửi qua Zalo/Telegram/Drive hoặc copy trực tiếp bằng cáp USB.
- Khuyến nghị đặt tên theo version, ví dụ: `homemedai-v1.0.3.apk`.

### 2. Cài trên điện thoại Android

1. Mở file `.apk` trong File Manager.
2. Nếu máy báo chặn, bật quyền cài từ nguồn không xác định cho app đang mở file.
3. Chọn `Install` để cài app.

### 3. Cập nhật phiên bản mới

- Gửi file APK mới cho người dùng.
- Cài đè lên bản cũ để giữ dữ liệu đăng nhập (trừ khi thay đổi chữ ký ký ứng dụng).

Lưu ý:

- Nếu APK khác chữ ký với bản đang cài, cần gỡ bản cũ trước khi cài bản mới.
- Sau khi cài bản mới, nên đăng xuất/đăng nhập lại để đồng bộ token push ổn định.

---

## 🔔 Ghi chú cho Push Notification

- Đặt `google-services.json` ở root app (đã khai báo trong `app.json`).
- Nếu test interactive push/action buttons, ưu tiên test trên bản APK đã cài thay vì chỉ dùng Expo Go.
- Sau khi cài bản mới, nên đăng xuất/đăng nhập lại để đồng bộ token thiết bị lên backend.
