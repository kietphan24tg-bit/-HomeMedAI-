# User Data Structure

## 1. User

Mỗi user nên có 2 nhóm dữ liệu chính:

- `profile`: thông tin cá nhân cơ bản
- `health_profile`: thông tin sức khỏe tổng quan

## 2. Profile

Các trường đề xuất:

- `full_name`
- `date_of_birth`
- `gender`
- `height_cm`
- `weight_kg`
- `address`

Ghi chú:

- Nên tách `height_cm`, `weight_kg` rõ đơn vị để tránh mơ hồ.
- Nếu cần theo dõi thay đổi cân nặng, chiều cao theo thời gian thì nên có thêm bảng lịch sử đo thay vì chỉ lưu 1 giá trị hiện tại.

## 3. Health Profile

Các trường đề xuất:

- `blood_type`
- `chronic_conditions`
- `allergies`

Quan hệ:

- một `health_profile` có nhiều `medical_records`
- một `health_profile` có nhiều `user_vaccinations`
- một `health_profile` có nhiều `prescriptions`

Ghi chú:

- `chronic_conditions` và `allergies` có thể lưu dạng mảng text ở bản đầu.
- Nếu cần tìm kiếm, lọc, thống kê tốt hơn thì nên tách thành bảng riêng.

## 4. Medical Record

`medical_record` là hồ sơ khám bệnh.

Các trường đề xuất:

- `name`
- `exam_date`
- `specialty`
- `facility_name`
- `doctor_name`
- `diagnosis`
- `notes`

Quan hệ:

- một `medical_record` có nhiều `attachments`
- một `medical_record` có nhiều `follow_up_appointments`

### 4.1. Medical Record Attachment

Các trường đề xuất:

- `medical_record_id`
- `file_name`
- `file_type`
- `file_url`

Ghi chú:

- `file_type` nên phân biệt `image`, `pdf`, `document` hoặc mime type.

### 4.2. Follow Up Appointment

Các trường đề xuất:

- `medical_record_id`
- `appointment_date`
- `purpose`
- `notes`
- `remind_before_days`

Ghi chú:

- Phần "một mảng các lịch tái khám" là hợp lý, nhưng nên tách thành bảng con để dễ quản lý nhắc lịch.

## 5. Vaccination

Theo đúng ngữ cảnh và UI hiện tại, phần tiêm chủng nên tách thành 3 bảng:

- `vaccination_recommendations`: danh sách vaccine khuyến nghị ban đầu của hệ thống
- `user_vaccinations`: hồ sơ vaccine của một user cho một loại vaccine
- `vaccination_doses`: từng mũi cụ thể đã tiêm hoặc đã lên lịch

Hiểu ngắn gọn:

- Bảng 1 trả lời: vaccine này cần tổng cộng bao nhiêu mũi
- Bảng 2 trả lời: user này đang theo dõi vaccine nào và tiến độ hiện tại ra sao
- Bảng 3 trả lời: từng mũi cụ thể đã tiêm hay đã đặt lịch là gì

### 5.1. Vaccination Recommendation

Đây là dữ liệu gốc của hệ thống.

Các trường đề xuất:

- `id`
- `code`
- `name`
- `disease_name`
- `total_doses_required`
- `notes`

Ví dụ data:

- `1 | BCG | BCG | Lao | 1 | Tiêm sớm sau sinh`
- `2 | COVID19 | COVID-19 | COVID-19 | 3 | Theo lịch khuyến nghị`
- `3 | MMR | MMR | Sởi - Quai bị - Rubella | 2 | Tiêm đủ 2 mũi`

### 5.2. User Vaccination

Đây là hồ sơ vaccine của một user đối với một loại vaccine.

Ví dụ:

- user A có hồ sơ vaccine `MMR`
- tổng khuyến nghị là `2`
- đã hoàn thành `1`
- trạng thái hiện tại là `in_progress`

Các trường đề xuất:

- `id`
- `health_profile_id`
- `recommendation_id`
- `completed_doses`
- `status`
- `notes`

Ghi chú:

- `status` có thể là `not_started`, `in_progress`, `completed`, `overdue`
- `completed_doses` có thể lưu để render nhanh, hoặc tính từ bảng `vaccination_doses`
- phần "dựa vào đó đánh giá" nên sinh ra từ `total_doses_required` và số mũi đã hoàn thành, không nên nhập tay

Ví dụ data:

- `101 | 10 | 1 | 1 | completed | Đã tiêm đủ`
- `102 | 10 | 2 | 3 | completed | Đã hoàn thành 3 mũi`
- `103 | 10 | 3 | 2 | completed | Đã hoàn thành 2 mũi`
- `104 | 11 | 3 | 1 | in_progress | Còn thiếu 1 mũi`

### 5.3. Vaccination Dose

Đây là từng mũi cụ thể trong hồ sơ vaccine của user.

Các trường đề xuất:

- `id`
- `user_vaccination_id`
- `dose_number`
- `status`
- `taken_date`
- `scheduled_date`
- `facility_name`
- `remind_before_days`
- `proof_image_url`
- `notes`

Ghi chú:

- `status` có thể là `scheduled`, `completed`, `missed`
- với mũi đã tiêm thì dùng `taken_date`
- với mũi mới lên lịch thì dùng `scheduled_date`
- quy tắc "nhắc trước 1 ngày" có thể lưu mặc định là `1`
- `proof_image_url` dùng cho ảnh sổ tiêm hoặc ảnh minh chứng

Ví dụ data:

- `1001 | 103 | 1 | completed | 2010-06-01 | null | Trạm Y tế | null | image1.jpg | Đã tiêm`
- `1002 | 103 | 2 | completed | 2011-01-01 | null | Trạm Y tế | null | image2.jpg | Đã tiêm`
- `1003 | 104 | 2 | scheduled | null | 2026-03-26 | BV Chợ Rẫy | 1 | null | Đặt lịch mũi 2`

### 5.4. Cách map với UI hiện tại

Màn danh sách vaccine như:

- `BCG (Lao) - 1/1 mũi`
- `COVID-19 - 3/3 mũi`
- `MMR - 2/2 mũi`

thì dữ liệu hiển thị sẽ lấy từ:

- `vaccination_recommendations.name`
- `vaccination_recommendations.disease_name`
- `user_vaccinations.completed_doses`
- `vaccination_recommendations.total_doses_required`
- `user_vaccinations.status`

Màn chi tiết vaccine như:

- `Mũi 1`
- `01/06/2010`
- `Trạm Y tế`
- `Đã tiêm`

thì dữ liệu sẽ lấy từ bảng `vaccination_doses`

Popup "Thêm mũi đã tiêm":

- `dose_number`
- `taken_date`
- `facility_name`
- `proof_image_url`

Popup "Đặt lịch tiêm":

- `scheduled_date`
- `facility_name`
- `remind_before_days`

## 6. Prescription

Phần đơn thuốc hiện tại đang trộn giữa "toa thuốc" và "từng thuốc trong toa". Nên tách ra 2 bảng:

- `prescriptions`: thông tin toa thuốc
- `prescription_items`: từng loại thuốc trong toa

### 6.1. Prescription

Các trường đề xuất:

- `health_profile_id`
- `medical_record_id` nullable
- `prescribed_date`
- `doctor_name`
- `notes`

Ghi chú:

- Nếu đơn thuốc phát sinh từ một lần khám cụ thể thì nên liên kết với `medical_record_id`.

### 6.2. Prescription Item

Các trường đề xuất:

- `prescription_id`
- `medicine_name`
- `unit` enum
- `quantity`
- `start_date`
- `dosage`
- `times_per_day`
- `intake_time`
- `meal_time`
- `notes`

Ghi chú:

- Các trường bạn đưa ra là đúng, nhưng nên nằm ở `prescription_item`, không phải toàn bộ `prescription`
- `unit` enum có thể gồm `tablet`, `capsule`, `ml`, `pack`, `bottle`, `tube`
- `intake_time` có thể là sáng, trưa, chiều, tối hoặc dạng text/mảng
- `meal_time` có thể là `before_meal`, `after_meal`, `with_meal`

## 7. Kết luận

Cấu trúc hiện tại là đúng hướng và phần vaccine đã được chuẩn hóa theo đúng UI:

1. `vaccination_recommendations`: danh mục vaccine khuyến nghị
2. `user_vaccinations`: hồ sơ vaccine của user
3. `vaccination_doses`: các mũi cụ thể đã tiêm hoặc đã lên lịch

Nếu cần, bước tiếp theo mình có thể viết tiếp file này sang:

- database tables hoàn chỉnh
- Prisma schema
- SQL schema
- TypeScript interfaces
