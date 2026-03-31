# UI ASCII Mobile — Quản lý thuốc đang có

## MÀN 1 — THUỐC ĐANG CÓ (DANH SÁCH)

```text
┌──────────────────────────────┐
│ 09:41                📶 78%  │
├──────────────────────────────┤
│ ← Thuốc đang có         ⋮    │
│ [Tìm tên thuốc...]   [Quét]  │
├──────────────────────────────┤
│ Thuốc trong tủ (3)           │
│                              │
│ ┌──────────────────────────┐ │
│ │ Paracetamol 500mg        │ │
│ │ Dạng: Viên nén           │ │
│ │ Còn: 12 viên | HSD 12/26 │ │
│ │ Nhắc: ON • T3,T5 07:00/20:00│
│ │ [Nhân bản]   [Xóa]       │ │
│ └──────────────────────────┘ │
│   chạm thẻ → mở Chi tiết     │
│                              │
│ ┌──────────────────────────┐ │
│ │ Oresol                   │ │
│ │ Dạng: Gói bột            │ │
│ │ Còn: 8 gói  | HSD 08/27  │ │
│ │ Nhắc: OFF                │ │
│ │ [Nhân bản]   [Xóa]       │ │
│ └──────────────────────────┘ │
│                              │
│ ┌──────────────────────────┐ │
│ │ Vitamin C 1000mg         │ │
│ │ Dạng: Viên sủi           │ │
│ │ Còn: 20 viên | HSD 02/27 │ │
│ │ Nhắc: ON • Mỗi ngày 08:00│ │
│ │ [Nhân bản]   [Xóa]       │ │
│ └──────────────────────────┘ │
│                              │
│                    ⊕ Thêm thuốc
├──────────────────────────────┤
│ [Lưu tạm]      [Lưu danh sách]│
└──────────────────────────────┘
```

## MÀN 2 — CHI TIẾT THUỐC (THÊM / SỬA)

```text
┌──────────────────────────────┐
│ 09:42                📶 78%  │
├──────────────────────────────┤
│ ← Chi tiết thuốc        Lưu  │
│            (Đang sửa)        │
├──────────────────────────────┤
│ [1] THÔNG TIN THUỐC          │
│ Tên thuốc *                  │
│ [ Paracetamol ]              │
│                              │
│ Dạng bào chế *               │
│ [ Viên nén ▼ ]               │
│                              │
│ Hàm lượng                    │
│ [ 500 ] [ mg ▼ ]             │
│ (hoặc nhập nhanh: 250mg/5mL) │
│                              │
│ Dùng cho (tag)               │
│ [ Sốt ] [ Đau đầu ] [+Tag]   │
│                              │
│ Ghi chú                      │
│ [ Uống sau ăn ]              │
├──────────────────────────────┤
│ [2] TỒN KHO                  │
│ Số lượng còn *               │
│ [ 12 ]  Đơn vị [ viên ▼ ]    │
│                              │
│ Hạn sử dụng *                │
│ [ 12/2026 ]                  │
│                              │
│ Vị trí lưu trữ               │
│ [ Tủ bếp tầng 2 ]            │
│                              │
│ Cảnh báo sắp hết             │
│ [ Bật ]  Ngưỡng [ 5 ] viên   │
├──────────────────────────────┤
│ [3] LỊCH NHẮC UỐNG THUỐC     │
│ Bật nhắc uống       [ ON ]   │
│ Ngày bắt đầu       [31/03/26]│
│ Tần suất           [Cách tuần▼]
│ Lặp mỗi            [ 2 ] tuần│
│ Ngày               T2 T3 T4 T5 T6 T7 CN
│                    [ ] [x] [ ] [x] [ ] [ ] [ ]
│ Giờ nhắc           [07:00][+]│
│                    [20:00][x]│
│ Nhắc trước         [10 phút▼]│
│ Kết thúc           [Sau 14 ngày▼]
│ Preview            Tuần 1,3,5... T3/T5
├──────────────────────────────┤
│ [Nhân bản thuốc này]         │
│ [Xóa thuốc]                  │
│                [Hủy] [Lưu]   │
└──────────────────────────────┘
```

## DROPDOWN A — DẠNG BÀO CHẾ

```text
┌──────────────────────────────┐
│ CHỌN DẠNG BÀO CHẾ            │
│ [Tìm dạng thuốc...]          │
├──────────────────────────────┤
│ Nhóm uống                    │
│ ○ Viên nén                   │
│ ○ Viên nang                  │
│ ○ Viên sủi                   │
│ ○ Viên ngậm                  │
│ ○ Bột / Cốm gói              │
│ ○ Siro / Dung dịch uống      │
│ ○ Giọt uống                  │
├──────────────────────────────┤
│ Nhóm dùng ngoài              │
│ ○ Kem bôi  ○ Mỡ bôi  ○ Gel bôi│
│ ○ Xịt     ○ Nhỏ mắt ○ Nhỏ mũi │
│ ○ Nhỏ tai                    │
├──────────────────────────────┤
│ Nhóm khác                    │
│ ○ Thuốc đặt                  │
│ ○ Ống tiêm / Lọ tiêm         │
│ ○ Khác...                    │
└──────────────────────────────┘
```

## DROPDOWN B — ĐƠN VỊ HÀM LƯỢNG

```text
┌──────────────────────────────┐
│ CHỌN ĐƠN VỊ HÀM LƯỢNG        │
├──────────────────────────────┤
│ Khối lượng                   │
│ ○ mcg   ○ mg   ○ g           │
├──────────────────────────────┤
│ Nồng độ / thể tích           │
│ ○ mg/mL   ○ mg/5mL   ○ mL    │
│ ○ %                          │
├──────────────────────────────┤
│ Hoạt lực                     │
│ ○ IU   ○ UI                  │
├──────────────────────────────┤
│ Khác                         │
│ ○ mmol/L   ○ mEq/L   ○ Khác...│
└──────────────────────────────┘
```

## DROPDOWN C — ĐƠN VỊ SỐ LƯỢNG CÒN

```text
┌──────────────────────────────┐
│ CHỌN ĐƠN VỊ TỒN KHO          │
├──────────────────────────────┤
│ Đơn vị đếm                   │
│ ○ viên   ○ gói   ○ ống       │
│ ○ chai   ○ lọ    ○ tuýp      │
│ ○ hộp                        │
├──────────────────────────────┤
│ Đơn vị thể tích / khối lượng │
│ ○ mL    ○ g                  │
└──────────────────────────────┘
```

## BOTTOM SHEET — NHÂN BẢN

```text
           ┌──────────────────────┐
           │ Nhân bản thuốc?      │
           │ Từ: Paracetamol 500mg│
           │                      │
           │ ☑ Giữ lịch nhắc      │
           │ ☐ Reset SL + HSD     │
           │                      │
           │ [Hủy]      [Nhân bản]│
           └──────────────────────┘
```

## BOTTOM SHEET — XÓA

```text
           ┌──────────────────────┐
           │ Xóa thuốc này?       │
           │ "Paracetamol 500mg"  │
           │                      │
           │ ⚠ Xóa luôn lịch nhắc │
           │                      │
           │ [Hủy]         [Xóa]  │
           └──────────────────────┘
```

## LUỒNG UI HOÀN CHỈNH — TỪ GIA ĐÌNH ĐẾN QUẢN LÝ SỨC KHỎE

### MÀN A — DANH SÁCH GIA ĐÌNH

```text
┌──────────────────────────────┐
│ 09:40                📶 78%  │
├──────────────────────────────┤
│ Gia đình của tôi         ＋   │
│ [Tìm gia đình / mã mời...]   │
├──────────────────────────────┤
│ ┌──────────────────────────┐ │
│ │ Phan Family              │ │
│ │ 5 thành viên             │ │
│ │ Có 3 nhắc nhở hôm nay    │ │
│ │ [Xem chi tiết]           │ │
│ └──────────────────────────┘ │
│                              │
│ ┌──────────────────────────┐ │
│ │ Nhà ngoại                │ │
│ │ 2 thành viên             │ │
│ │ Không có cảnh báo        │ │
│ │ [Xem chi tiết]           │ │
│ └──────────────────────────┘ │
│                              │
│            [Tạo gia đình mới]│
└──────────────────────────────┘
```

### MÀN B — TỔNG QUAN GIA ĐÌNH

```text
┌──────────────────────────────┐
│ 09:41                📶 78%  │
├──────────────────────────────┤
│ ← Gia đình                   │
│                              │
│ Phan Family              ⋮   │
│ 5 thành viên • Tạo 03/2024   │
│ [NA] [NB] [PC] [BA] [+2]     │
├──────────────────────────────┤
│ THÀNH VIÊN                   │
│ ┌──────────────────────────┐ │
│ │ NA Nguyễn Văn An   >     │ │
│ │ Chủ gia đình • 38 tuổi   │ │
│ └──────────────────────────┘ │
│ ┌──────────────────────────┐ │
│ │ NB Nguyễn Thị Bình >     │ │
│ │ Vợ • 35 tuổi             │ │
│ └──────────────────────────┘ │
│ ┌──────────────────────────┐ │
│ │ PC Nguyễn Văn Cường >    │ │
│ │ Con trai • 8 tuổi        │ │
│ └──────────────────────────┘ │
│ ┌──────────────────────────┐ │
│ │ BA Nguyễn Văn Ba   >     │ │
│ │ Ba • 65 tuổi             │ │
│ └──────────────────────────┘ │
│                              │
│        ＋ Thêm thành viên     │
├──────────────────────────────┤
│ [Tủ thuốc] [Lịch] [Khẩn cấp] │
└──────────────────────────────┘
```

### MÀN C — HỒ SƠ THÀNH VIÊN (Tổng quan khi nhấn vào 1 người)

```text
┌──────────────────────────────┐
│ 09:41                📶 78%  │
├──────────────────────────────┤
│ ← Phan Family            ✏    │
│                              │
│          [Ảnh]               │
│   Nguyễn Thị Bình            │
│   Vợ • 35 tuổi • Nữ          │
├──────────────────────────────┤
│ [Cá nhân] [Y tế] [Lịch sử]   │
├──────────────────────────────┤
│ THÔNG TIN CÁ NHÂN            │
│                              │
│ Họ và tên *                  │
│ [ Nguyễn Thị Bình ]          │
│                              │
│ Ngày sinh *                  │
│ [ 12/03/1991 ]               │
│                              │
│ Giới tính *                  │
│ [ Nữ ▼ ]                     │
│                              │
│ Vai trò trong gia đình       │
│ [ Vợ ▼ ]                     │
│                              │
│ Chiều cao         Cân nặng   │
│ [ 160 ] cm        [ 55 ] kg  │
│                              │
│ Số điện thoại                │
│ [ 0909 123 457 ]             │
│                              │
│ CCCD / CMND                  │
│ [ 079 xxx xxx xxx ]          │
│                              │
│ Số BHYT                      │
│ [ GD 4017 xxxxxxxxx ]       │
│                              │
│ Địa chỉ                     │
│ [ 123 Nguyễn Trãi, Q.1, HCM]│
│                              │
│                   [Hủy] [Lưu]│
└──────────────────────────────┘
```

### MÀN C2 — TAB Y TẾ (Thông tin y tế cơ bản + khẩn cấp)

```text
┌──────────────────────────────┐
│ 09:41                📶 78%  │
├──────────────────────────────┤
│ ← Phan Family            ✏    │
│   Nguyễn Thị Bình            │
│ [Cá nhân] [Y tế] [Lịch sử]   │
├──────────────────────────────┤
│ CHỈ SỐ SỨC KHỎE              │
│ ┌──────────────────────────┐ │
│ │ BMI  21.5  Bình thường   │ │
│ │ 160 cm • 55 kg           │ │
│ │ (tự tính từ tab Cá nhân) │ │
│ └──────────────────────────┘ │
│                              │
│ THÔNG TIN Y TẾ CƠ BẢN        │
│                              │
│ Nhóm máu                    │
│ [ O+ ▼ ]                     │
│                              │
│ Bệnh nền                    │
│ [Tăng huyết áp] [+Thêm]      │
│                              │
│ Dị ứng thuốc                 │
│ [Penicillin] [+Thêm]         │
│                              │
│ Dị ứng thực phẩm             │
│ [Hải sản] [+Thêm]            │
│                              │
│ Ghi chú y tế quan trọng      │
│ [ Tiền sử mổ ruột thừa 2018]│
├──────────────────────────────┤
│ LIÊN HỆ KHẨN CẤP             │
│                              │
│ Người liên hệ 1             │
│ [ Nguyễn Văn An ]            │
│ Quan hệ [ Chồng ▼ ]          │
│ SĐT [ 0909 123 456 ]         │
│                              │
│ Người liên hệ 2             │
│ [ Trần Thị Lan ]             │
│ Quan hệ [ Mẹ ruột ▼ ]        │
│ SĐT [ 0912 345 678 ]         │
│                              │
│ [+ Thêm người liên hệ]       │
├──────────────────────────────┤
│ THUỐC ĐANG DÙNG         Tất cả>
│ ┌──────────────────────────┐ │
│ │ 1. Amlodipine 5mg        │ │
│ │    Sáng 1 viên • sau ăn  │ │
│ │ 2. Omeprazole 20mg       │ │
│ │    Sáng 1 viên • trước ăn│ │
│ │ 3. Candesartan 8mg       │ │
│ │    Tối 1 viên • sau ăn   │ │
│ └──────────────────────────┘ │
│                              │
│                   [Hủy] [Lưu]│
└──────────────────────────────┘
```

### MÀN C3 — TAB LỊCH SỬ (Khám bệnh + Tiêm chủng + Chỉ số + Tái khám)

```text
┌──────────────────────────────┐
│ 09:42                📶 78%  │
├──────────────────────────────┤
│ ← Phan Family                │
│   Nguyễn Thị Bình            │
│ [Cá nhân] [Y tế] [Lịch sử]   │
├──────────────────────────────┤
│ HỒ SƠ KHÁM BỆNH        Tất cả>
│ ┌──────────────────────────┐ │
│ │ 15/03/2026               │ │
│ │ BV Đại học Y Dược        │ │
│ │ Khoa Tim mạch            │ │
│ │ BS. Lê Văn Hùng          │ │
│ │ CĐ: Tăng huyết áp gđ 1  │ │
│ └──────────────────────────┘ │
│ ┌──────────────────────────┐ │
│ │ 02/01/2026               │ │
│ │ PK Hoàn Mỹ Sài Gòn      │ │
│ │ Khoa Nội tổng quát       │ │
│ │ BS. Trần Minh             │ │
│ │ CĐ: Viêm dạ dày         │ │
│ └──────────────────────────┘ │
│             ＋ Thêm hồ sơ khám│
├──────────────────────────────┤
│ TIÊM CHỦNG              Tất cả>
│ ┌──────────────────────────┐ │
│ │ Hoàn thành 75%           │ │
│ │ ████████████░░░░         │ │
│ │ 6 / 8 mũi khuyến nghị    │ │
│ └──────────────────────────┘ │
├──────────────────────────────┤
│ CHỈ SỐ SỨC KHỎE THEO THỜI GIAN>
│ ┌──────────────────────────┐ │
│ │ Huyết áp   130/85 mmHg   │ │
│ │ (đo 15/03/2026)          │ │
│ │                          │ │
│ │ Cân nặng   55 → 54 → 55 │ │
│ │            01   02   03  │ │
│ │            ─────────────  │ │
│ │        58 │              │ │
│ │        55 │    ·  ·  ·   │ │
│ │        52 │              │ │
│ └──────────────────────────┘ │
├──────────────────────────────┤
│ LỊCH TÁI KHÁM SẮP TỚI       │
│ ┌──────────────────────────┐ │
│ │ 15/04/2026               │ │
│ │ BV Đại học Y Dược        │ │
│ │ Khoa Tim mạch            │ │
│ │ Tái khám huyết áp        │ │
│ │ Nhắc trước 1 ngày   [ON]  │ │
│ └──────────────────────────┘ │
│ ┌──────────────────────────┐ │
│ │ 01/07/2026               │ │
│ │ PK Hoàn Mỹ Sài Gòn      │ │
│ │ Nội soi dạ dày           │ │
│ │ Nhắc trước 2 ngày   [ON]  │ │
│ └──────────────────────────┘ │
│        ＋ Thêm lịch tái khám  │
└──────────────────────────────┘
```

### MÀN C3a — CHI TIẾT 1 LẦN KHÁM BỆNH

```text
┌──────────────────────────────┐
│ 09:42                📶 78%  │
├──────────────────────────────┤
│ ← Hồ sơ khám bệnh       ✏    │
├──────────────────────────────┤
│ THÔNG TIN KHÁM               │
│                              │
│ Ngày khám *                  │
│ [ 15/03/2026 ]               │
│                              │
│ Bệnh viện / Phòng khám *     │
│ [ BV Đại học Y Dược ]        │
│                              │
│ Khoa / Chuyên khoa           │
│ [ Tim mạch ▼ ]               │
│                              │
│ Bác sĩ điều trị              │
│ [ BS. Lê Văn Hùng ]          │
├──────────────────────────────┤
│ KẾT QUẢ KHÁM                 │
│                              │
│ Chẩn đoán *                  │
│ [ Tăng huyết áp giai đoạn 1]│
│                              │
│ Triệu chứng                 │
│ [Đau đầu] [Chóng mặt] [+Tag]│
│                              │
│ Kết quả xét nghiệm          │
│ [ Cholesterol 5.8 mmol/L,   │
│   Creatinine 0.9 mg/dL ]    │
│                              │
│ Lời dặn bác sĩ              │
│ [ Giảm muối, tập thể dục   │
│   30p/ngày, tái khám 1 tháng]│
├──────────────────────────────┤
│ ĐƠN THUỐC KÊ                 │
│ ┌──────────────────────────┐ │
│ │ 1. Amlodipine 5mg        │ │
│ │    1 viên/ngày • sáng    │ │
│ │ 2. Candesartan 8mg       │ │
│ │    1 viên/ngày • tối     │ │
│ └──────────────────────────┘ │
│ [Thêm vào tủ thuốc gia đình] │
├──────────────────────────────┤
│ FILE ĐÍNH KÈM                │
│ ┌──────────────────────────┐ │
│ │ 📄 xet-nghiem-mau.pdf    │ │
│ │ 📷 don-thuoc-scan.jpg    │ │
│ └──────────────────────────┘ │
│ [📷 Chụp ảnh] [📎 Tải file lên]│
├──────────────────────────────┤
│ HẸN TÁI KHÁM                 │
│ Ngày [ 15/04/2026 ]          │
│ Nhắc nhở [ Bật ] trước 1 ngày│
├──────────────────────────────┤
│                   [Hủy] [Lưu]│
└──────────────────────────────┘
```

### MÀN C3b — LỊCH TIÊM CHỦNG

```text
┌──────────────────────────────┐
│ 09:43                📶 78%  │
├──────────────────────────────┤
│ ← Tiêm chủng            ＋    │
│   Nguyễn Thị Bình            │
│   Hoàn thành 75% (6/8 mũi)   │
│   ████████████░░░░           │
├──────────────────────────────┤
│ ĐÃ TIÊM (6)                  │
│ ┌──────────────────────────┐ │
│ │ ✔ COVID-19 (Pfizer)      │ │
│ │   Mũi 3/3 • 20/08/2023  │ │
│ │   VNVC Quận 1            │ │
│ └──────────────────────────┘ │
│ ┌──────────────────────────┐ │
│ │ ✔ Cúm mùa 2025          │ │
│ │   Mũi 1/1 • 10/10/2025  │ │
│ │   PK Hoàn Mỹ             │ │
│ └──────────────────────────┘ │
│ ┌──────────────────────────┐ │
│ │ ✔ Viêm gan B             │ │
│ │   Mũi 3/3 • 15/06/2020  │ │
│ │   BV Đại học Y Dược      │ │
│ └──────────────────────────┘ │
│ ... (xem thêm)               │
├──────────────────────────────┤
│ CHƯA TIÊM / SẮP ĐẾN (2)     │
│ ┌──────────────────────────┐ │
│ │ ○ Cúm mùa 2026          │ │
│ │   Khuyến nghị: 10/2026   │ │
│ │   Nhắc nhở         [Bật] │ │
│ └──────────────────────────┘ │
│ ┌──────────────────────────┐ │
│ │ ○ Uốn ván (nhắc lại)    │ │
│ │   Khuyến nghị: 06/2030   │ │
│ │   Nhắc nhở         [Tắt] │ │
│ └──────────────────────────┘ │
├──────────────────────────────┤
│         ＋ Thêm mũi tiêm      │
└──────────────────────────────┘
```

### MÀN C3b-detail — CHI TIẾT / THÊM MŨI TIÊM

```text
┌──────────────────────────────┐
│ 09:43                📶 78%  │
├──────────────────────────────┤
│ ← Chi tiết mũi tiêm     Lưu  │
├──────────────────────────────┤
│ Tên vaccine *                │
│ [ COVID-19 (Pfizer) ]        │
│                              │
│ Mũi thứ *                   │
│ [ 3 ] / tổng [ 3 ] mũi       │
│                              │
│ Ngày tiêm *                  │
│ [ 20/08/2023 ]               │
│                              │
│ Nơi tiêm                     │
│ [ VNVC Quận 1 ]              │
│                              │
│ Số lô vaccine                │
│ [ FN1234 ]                   │
│                              │
│ Phản ứng sau tiêm            │
│ [ Sốt nhẹ, đau tay 1 ngày ] │
│                              │
│ Mũi tiếp theo                │
│ ( ) Đã hoàn tất              │
│ (•) Còn mũi tiếp             │
│ Ngày dự kiến [ -- ]          │
│ Nhắc nhở        [ Bật ]      │
├──────────────────────────────┤
│ FILE ĐÍNH KÈM                │
│ 📷 giay-xac-nhan-tiem.jpg    │
│ [📷 Chụp ảnh] [📎 Tải file lên]│
├──────────────────────────────┤
│                   [Hủy] [Lưu]│
└──────────────────────────────┘
```

### MÀN C3c — CHỈ SỐ SỨC KHỎE THEO THỜI GIAN

```text
┌──────────────────────────────┐
│ 09:44                📶 78%  │
├──────────────────────────────┤
│ ← Chỉ số sức khỏe       ＋    │
│   Nguyễn Thị Bình            │
├──────────────────────────────┤
│ [Huyết áp] [Cân nặng] [Đường huyết]
├──────────────────────────────┤
│ HUYẾT ÁP                     │
│                              │
│ Mới nhất: 130/85 mmHg       │
│ Đo lúc 15/03/2026 08:00      │
│ Trạng thái: ⚠ Hơi cao       │
│                              │
│ Biểu đồ 3 tháng             │
│ mmHg                         │
│ 140│      ·                  │
│ 130│  ·       ·   ·          │
│ 120│                         │
│  85│  ·   ·   ·   ·          │
│  80│      ·                  │
│    └──┬───┬───┬───┬──        │
│     01  02  03  15           │
│     /01 /02 /03 /03          │
│                              │
│ LỊCH SỬ ĐO                   │
│ ┌──────────────────────────┐ │
│ │ 15/03/26  130/85  ⚠ Cao  │ │
│ │ 01/03/26  125/82  Bình thường│
│ │ 15/02/26  128/80  Bình thường│
│ │ 01/02/26  132/88  ⚠ Cao  │ │
│ │ 15/01/26  135/85  ⚠ Cao  │ │
│ └──────────────────────────┘ │
│                              │
│         ＋ Thêm lần đo mới    │
├──────────────────────────────┤
│ [Xuất báo cáo PDF]           │
└──────────────────────────────┘
```

### MÀN C3c-input — NHẬP CHỈ SỐ SỨC KHỎE

```text
┌──────────────────────────────┐
│ 09:44                📶 78%  │
├──────────────────────────────┤
│ ← Thêm lần đo           Lưu  │
├──────────────────────────────┤
│ Loại chỉ số *                │
│ [ Huyết áp ▼ ]               │
│                              │
│ Tâm thu (systolic) *         │
│ [ 130 ] mmHg                 │
│                              │
│ Tâm trương (diastolic) *     │
│ [ 85 ] mmHg                  │
│                              │
│ Nhịp tim                     │
│ [ 72 ] bpm                   │
│                              │
│ Ngày đo *                    │
│ [ 15/03/2026 ]               │
│                              │
│ Giờ đo                       │
│ [ 08:00 ]                    │
│                              │
│ Ghi chú                      │
│ [ Đo sau khi ngủ dậy ]      │
├──────────────────────────────┤
│                   [Hủy] [Lưu]│
└──────────────────────────────┘
```

### MÀN C3d — LỊCH TÁI KHÁM CHI TIẾT

```text
┌──────────────────────────────┐
│ 09:44                📶 78%  │
├──────────────────────────────┤
│ ← Lịch tái khám         ＋    │
│   Nguyễn Thị Bình            │
├──────────────────────────────┤
│ SẮP TỚI                      │
│ ┌──────────────────────────┐ │
│ │ 15/04/2026               │ │
│ │ BV Đại học Y Dược        │ │
│ │ Khoa Tim mạch            │ │
│ │ BS. Lê Văn Hùng          │ │
│ │ Tái khám huyết áp        │ │
│ │ Nhắc trước [ 1 ngày ▼ ]   │ │
│ │ [Sửa] [Hủy lịch]         │ │
│ └──────────────────────────┘ │
│ ┌──────────────────────────┐ │
│ │ 01/07/2026               │ │
│ │ PK Hoàn Mỹ Sài Gòn      │ │
│ │ Nội soi dạ dày           │ │
│ │ Nhắc trước [ 2 ngày ▼ ]   │ │
│ │ [Sửa] [Hủy lịch]         │ │
│ └──────────────────────────┘ │
├──────────────────────────────┤
│ ĐÃ KHÁM                      │
│ ┌──────────────────────────┐ │
│ │ ✔ 15/03/2026             │ │
│ │ BV Đại học Y Dược        │ │
│ │ Tim mạch • Đã đi khám    │ │
│ └──────────────────────────┘ │
│ ┌──────────────────────────┐ │
│ │ ✔ 02/01/2026             │ │
│ │ PK Hoàn Mỹ Sài Gòn      │ │
│ │ Nội tổng quát • Đã đi khám│ │
│ └──────────────────────────┘ │
├──────────────────────────────┤
│         ＋ Thêm lịch tái khám │
└──────────────────────────────┘
```

### MÀN C3d-input — THÊM / SỬA LỊCH TÁI KHÁM

```text
┌──────────────────────────────┐
│ 09:45                📶 78%  │
├──────────────────────────────┤
│ ← Thêm lịch tái khám    Lưu  │
├──────────────────────────────┤
│ Ngày tái khám *              │
│ [ 15/04/2026 ]               │
│                              │
│ Giờ hẹn                      │
│ [ 08:30 ]                    │
│                              │
│ Bệnh viện / Phòng khám *     │
│ [ BV Đại học Y Dược ]        │
│                              │
│ Khoa / Chuyên khoa           │
│ [ Tim mạch ▼ ]               │
│                              │
│ Bác sĩ                      │
│ [ BS. Lê Văn Hùng ]          │
│                              │
│ Mục đích tái khám            │
│ [ Kiểm tra huyết áp định kỳ]│
│                              │
│ Cần chuẩn bị                 │
│ [ Nhịn ăn 8h nếu xét nghiệm]│
│                              │
│ Nhắc nhở                     │
│ [ Bật ]                      │
│ Nhắc trước [ 1 ngày ▼ ]      │
│ Nhắc thêm  [ Sáng hôm đó ▼ ]│
├──────────────────────────────┤
│                   [Hủy] [Lưu]│
└──────────────────────────────┘
```

### MÀN E — TỦ THUỐC GIA ĐÌNH

```text
┌──────────────────────────────┐
│ 09:41                📶 78%  │
├──────────────────────────────┤
│ ← Tủ thuốc gia đình      ＋   │
│ Phan Family                  │
│                              │
│ 6 LOẠI                       │
│ Sắp hết hạn 3                │
│ Sắp hết     1                │
│ Còn đủ      2                │
├──────────────────────────────┤
│ [Tìm thuốc trong tủ...]      │
├──────────────────────────────┤
│ Sắp hết hạn (3)              │
│ ┌──────────────────────────┐ │
│ │ Paracetamol 500mg     >  │ │
│ │ HSD: 20/04/2026          │ │
│ │ 8 / 20 viên              │ │
│ │ ████████░░░░░░░░         │ │
│ └──────────────────────────┘ │
│ ┌──────────────────────────┐ │
│ │ Amoxicillin 500mg     >  │ │
│ │ HSD: 25/03/2026          │ │
│ │ 6 / 21 viên              │ │
│ │ ██████░░░░░░░░░░         │ │
│ └──────────────────────────┘ │
│                              │
│ Sắp hết (1)                  │
│ ┌──────────────────────────┐ │
│ │ Siro ho Prospan       >  │ │
│ │ HSD: 15/07/2026          │ │
│ │ 1 / 3 chai               │ │
│ │ ██░░░░░░░░░░░░░░         │ │
│ └──────────────────────────┘ │
└──────────────────────────────┘
```

### MÀN F — TỔNG HỢP NHẮC NHỞ GIA ĐÌNH

```text
┌──────────────────────────────┐
│ 09:42                📶 78%  │
├──────────────────────────────┤
│ ← Lịch nhắc gia đình         │
│ Hôm nay, 31/03/2026          │
├──────────────────────────────┤
│ 07:00                        │
│ ┌──────────────────────────┐ │
│ │ NB • Amlodipine 5mg      │ │
│ │ Buổi sáng • Sau ăn       │ │
│ │ [Đã uống] [Bỏ qua]       │ │
│ └──────────────────────────┘ │
│                              │
│ 10:00                        │
│ ┌──────────────────────────┐ │
│ │ PC • Vitamin C           │ │
│ │ 1 viên sủi               │ │
│ │ [Đã uống] [Bỏ qua]       │ │
│ └──────────────────────────┘ │
│                              │
│ 20:00                        │
│ ┌──────────────────────────┐ │
│ │ BA • Paracetamol 500mg   │ │
│ │ T3/T5 • Cách 2 tuần      │ │
│ │ [Đã uống] [Bỏ qua]       │ │
│ └──────────────────────────┘ │
└──────────────────────────────┘
```

### MÀN G — THÔNG TIN KHẨN CẤP GIA ĐÌNH

```text
┌──────────────────────────────┐
│ 09:43                📶 78%  │
├──────────────────────────────┤
│ ← Khẩn cấp                   │
│ Phan Family                  │
├──────────────────────────────┤
│ Người liên hệ chính          │
│ Nguyễn Văn An               │
│ 0909 123 456                │
├──────────────────────────────┤
│ Hồ sơ ưu tiên truy cập       │
│ ┌──────────────────────────┐ │
│ │ Nguyễn Văn Ba            │ │
│ │ Nhóm máu: O+             │ │
│ │ Bệnh nền: Tăng huyết áp  │ │
│ │ Dị ứng: Penicillin       │ │
│ │ Thuốc đang dùng: 3       │ │
│ │ [Mở thẻ y tế nhanh]      │ │
│ └──────────────────────────┘ │
└──────────────────────────────┘
```

### LUỒNG TƯƠNG TÁC HOÀN CHỈNH

```text
A. Danh sách gia đình
 └─ chọn 1 gia đình ─────────────→ B. Tổng quan gia đình

B. Tổng quan gia đình
 ├─ chạm thành viên ─────────────→ C. Hồ sơ thành viên (tab Cá nhân)
 ├─ bấm [Tủ thuốc] ──────────────→ E. Tủ thuốc gia đình
 ├─ bấm [Lịch] ──────────────────→ F. Lịch nhắc gia đình
 ├─ bấm [Khẩn cấp] ──────────────→ G. Thông tin khẩn cấp
 └─ bấm [Thêm thành viên] ───────→ C (form trống)

C. Hồ sơ thành viên — tab Cá nhân
 ├─ đổi tab [Y tế] ──────────────→ C2. Tab Y tế
 └─ đổi tab [Lịch sử] ──────────→ C3. Tab Lịch sử

C2. Tab Y tế
 ├─ chỉnh nhóm máu, bệnh nền, dị ứng, liên hệ khẩn cấp
 └─ bấm [Thuốc đang dùng > Tất cả] → Màn 1 (Danh sách thuốc)

C3. Tab Lịch sử
 ├─ bấm 1 hồ sơ khám ────────────→ C3a. Chi tiết lần khám
 │    ├─ bấm [Thêm vào tủ thuốc] → Màn 2 (tự điền từ đơn thuốc)
 │    └─ bấm [📷 Chụp / 📎 Tải] → đính kèm file
 ├─ bấm [Tiêm chủng > Tất cả] ──→ C3b. Lịch tiêm chủng
 │    └─ bấm 1 mũi tiêm ─────────→ C3b-detail. Chi tiết mũi tiêm
 ├─ bấm [Chỉ số sức khỏe >] ────→ C3c. Biểu đồ chỉ số
 │    └─ bấm ＋ ──────────────────→ C3c-input. Nhập chỉ số mới
 └─ bấm 1 lịch tái khám ─────────→ C3d. Lịch tái khám
      └─ bấm ＋ ──────────────────→ C3d-input. Thêm lịch tái khám

E. Tủ thuốc gia đình
 ├─ chạm 1 thuốc ────────────────→ Màn 2 — Chi tiết thuốc (Sửa)
 ├─ bấm ＋ ──────────────────────→ Màn 2 — Chi tiết thuốc (Thêm mới)
 ├─ bấm [Nhân bản] ──────────────→ Sheet Nhân bản → Màn 2 (bản sao)
 └─ bấm [Xóa] ───────────────────→ Sheet Xóa → quay lại E

Màn 2 — Chi tiết thuốc
 ├─ dropdown Dạng bào chế ────────→ Dropdown A
 ├─ dropdown Đơn vị hàm lượng ───→ Dropdown B
 ├─ dropdown Đơn vị tồn kho ─────→ Dropdown C
 ├─ Lưu ─────────────────────────→ quay E hoặc Màn 1
 └─ Hủy ─────────────────────────→ quay lại, không đổi

F. Lịch nhắc gia đình
 ├─ bấm [Đã uống] ───────────────→ cập nhật trạng thái tuân thủ
 ├─ bấm [Bỏ qua] ────────────────→ ghi nhận bỏ lỡ / lý do
 └─ chạm item ───────────────────→ Màn 2 hoặc C3d (tùy loại nhắc)

G. Thông tin khẩn cấp
 ├─ bấm [Mở thẻ y tế nhanh] ─────→ thẻ y tế tóm tắt cho cấp cứu
 └─ bấm số điện thoại ───────────→ gọi nhanh người liên hệ
```

### NAVIGATION TỔNG THỂ TRÊN MOBILE

```text
A. Gia đình
  ↓
B. Tổng quan gia đình
  ├── C. Thành viên
  │     ├── Tab Cá nhân (họ tên, ngày sinh, giới tính, CCCD, BHYT...)
  │     ├── Tab Y tế (BMI, nhóm máu, bệnh nền, dị ứng, liên hệ khẩn cấp, thuốc đang dùng)
  │     └── Tab Lịch sử
  │           ├── C3a. Hồ sơ khám bệnh (ngày, BV, BS, chẩn đoán, đơn thuốc, file đính kèm)
  │           ├── C3b. Tiêm chủng (vaccine, mũi, ngày, nơi tiêm, phản ứng)
  │           │     └── C3b-detail. Chi tiết mũi tiêm
  │           ├── C3c. Chỉ số sức khỏe theo thời gian (huyết áp, cân nặng, đường huyết)
  │           │     └── C3c-input. Nhập chỉ số mới
  │           └── C3d. Lịch tái khám
  │                 └── C3d-input. Thêm/sửa lịch tái khám
  ├── E. Tủ thuốc gia đình
  │     ├── Màn 1. Danh sách thuốc
  │     └── Màn 2. Chi tiết thuốc (thêm / sửa / lịch nhắc)
  │           ├── Dropdown A (dạng bào chế)
  │           ├── Dropdown B (đơn vị hàm lượng)
  │           └── Dropdown C (đơn vị tồn kho)
  ├── F. Lịch nhắc gia đình (uống thuốc + tái khám + tiêm chủng)
  └── G. Khẩn cấp (thẻ y tế nhanh + gọi liên hệ)
```
