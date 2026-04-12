# All table

**1. profiles**

Thông tin cá nhân trong tab Hồ sơ.

| **Field**                        | **Nghĩa**                            |
| -------------------------------- | ------------------------------------ |
| id                               | ID hồ sơ                             |
| owner_user_id                    | user sở hữu hồ sơ                    |
| linked_user_id                   | user được liên kết nếu là hồ sơ thật |
| full_name                        | họ tên                               |
| date_of_birthhoặcdob             | ngày sinh                            |
| gender                           | giới tính:male,female,other          |
| height_cm                        | chiều cao cm                         |
| weight_kg                        | cân nặng kg                          |
| address                          | địa chỉ                              |
| avatar_url                       | ảnh đại diện                         |
| status                           | trạng thái hồ sơ                     |
| created_at,updated_at,deleted_at | thời gian tạo/cập nhật/xóa mềm       |

Lưu ý: UI cóemail,phone. Nên lấyemail,phone_numbertừusers; nếu BE muốn cho mỗi hồ sơ có số riêng thì thêmphone_numbervàoprofiles.

**2. health_details**

Thông tin sức khỏe tổng quát.

| **Field**                           | **Nghĩa**                          |
| ----------------------------------- | ---------------------------------- |
| id                                  | ID bản ghi sức khỏe                |
| profile_id                          | hồ sơ sở hữu, unique               |
| blood_type                          | nhóm máu:A+,A-,B+,B-,O+,O-,AB+,AB- |
| chronic_diseases                    | bệnh nền, dạng list string         |
| drug_allergies                      | dị ứng thuốc, list string          |
| food_allergies                      | dị ứng thực phẩm, list string      |
| notes                               | ghi chú y tế quan trọng            |
| emergency_contact -> trong gia đình | liên hệ khẩn cấp                   |
| updated_at                          | thời điểm cập nhật                 |

BE hiện cóallergiesnhưng UI tách**dị ứng thuốc**và**dị ứng thực phẩm**, nên nên thêmdrug_allergies,food_allergieshoặc thống nhấtallergieskèmallergy_type.

**3. medical_records**

Hồ sơ khám bệnh.

| **Field**                                                          | **Nghĩa**                                     |
| ------------------------------------------------------------------ | --------------------------------------------- |
| id                                                                 | ID hồ sơ khám                                 |
| profile_id                                                         | hồ sơ bệnh nhân                               |
| created_by -> user hoặc khi tham gia gia đình thì owner có thể tạo | user tạo                                      |
| titlehoặcrecord_name                                               | tên hồ sơ, ví dụ “Khám tim mạch định kỳ”      |
| visit_date                                                         | ngày khám                                     |
| specialty                                                          | chuyên khoa, ví dụcardiology,general,internal |
| ~~department~~                                                     | khoa/chuyên khoa hiển thị                     |
| hospital_name                                                      | bệnh viện/phòng khám                          |
| doctor_name                                                        | bác sĩ điều trị/phụ trách                     |
| diagnosis_name                                                     | chẩn đoán                                     |
| ~~diagnosis_slug~~                                                 | slug chẩn đoán, nếu cần tra cứu               |
| symptoms                                                           | triệu chứng, list string hoặc text            |
| test_results                                                       | kết quả xét nghiệm                            |
| doctor_advice                                                      | lời dặn bác sĩ                                |
| notes                                                              | ghi chú thêm                                  |
| created_at,updated_at,deleted_at                                   | thời gian tạo/cập nhật/xóa mềm                |

-> phần này có vài field trùng. Tóm lại một field và còn thiếu nối với table đơn thuốc

BE hiện códiagnosis_name,doctor_name,hospital_name,visit_date,specialty,notes, nhưng UI còn cầntitle,department,symptoms,test_results,doctor_advice.

**4. medical_record_attachments**

File/ảnh đính kèm hồ sơ khám.

| **Field**         | **Nghĩa**                                |
| ----------------- | ---------------------------------------- |
| id                | ID file                                  |
| medical_record_id | hồ sơ khám liên quan                     |
| file_name         | tên file                                 |
| file_type         | loại file:image,pdf,doc,excel, mime type |
| file_url          | URL file                                 |
| created_at        | thời gian tải lên                        |

-> có cần phải tách ra 1 table không ?

**5. follow_up_appointments**

Hẹn tái khám.

| **Field**                      | **Nghĩa**                 |
| ------------------------------ | ------------------------- |
| id                             | ID lịch tái khám          |
| medical_record_id              | hồ sơ khám gốc            |
| appointment_date               | ngày/giờ hẹn              |
| purpose                        | mục đích tái khám         |
| facility_namehoặchospital_name | nơi tái khám              |
| department                     | khoa/phòng khám, nếu có   |
| doctor_name                    | bác sĩ tái khám, nếu có   |
| notes                          | ghi chú                   |
| remind_before_days             | nhắc trước bao nhiêu ngày |
| reminder_enabled               | bật/tắt nhắc              |
| created_at                     | thời gian tạo             |

-> giao diện hiện tại chỉ có ngày hẹn. Tôi nghĩ sẽ thêm ghi chú vào

**6. prescriptions**

Đơn thuốc kê trong hồ sơ khám.

| **Field**                                                           | **Nghĩa**                      |
| ------------------------------------------------------------------- | ------------------------------ |
| id                                                                  | ID đơn thuốc                   |
| profile_id                                                          | hồ sơ bệnh nhân                |
| medical_record_id -> khi có nằm trong một hồ sơ khám bệnh thì sẽ có | hồ sơ khám liên quan, nullable |
| prescribed_date                                                     | ngày kê đơn                    |
| doctor_name                                                         | bác sĩ kê                      |
| notes                                                               | ghi chú đơn                    |
| created_at                                                          | thời gian tạo                  |

-> đơn thuốc dùng chung cho mục đơn thuốc trong tab sức khỏe luôn

Ngày kê đơn và bác sĩ kê trong UI ko có. Hãy bỏ đi (maybe) => table này nghĩ không cần mà dùng trong một hồ sơ khám sẽ gồm sẽ gồm các thuốc

**7. prescription_items**

Thuốc trong đơn.

| **Field**               | **Nghĩa**                         |
| ----------------------- | --------------------------------- |
| id                      | ID dòng thuốc                     |
| prescription_id ->bỏ    | đơn thuốc cha                     |
| medicine_name           | tên thuốc                         |
| dosage_value            | hàm lượng số, ví dụ500            |
| dosage_unit             | đơn vị hàm lượng, ví dụmg,ml      |
| dosage_per_use_value    | liều dùng mỗi lần                 |
| dosage_per_use_unit     | đơn vị mỗi lần, ví dụ viên/gói/ml |
| schedulehoặcinstruction | lịch dùng/hướng dẫn uống          |
| meal_time               | trước/sau/trong bữa ăn            |
| notes                   | ghi chú                           |

-Thêm field số lượng tồn kho, hạn sử dụng, vị trí lưu trữ, ngưỡng cảnh báo, lịch nhắc

**8. medicine_inventory**

-> phần này đồng bộ với thuốc

Thuốc đang có/tủ thuốc.

| **Field**                                | **Nghĩa**                                    |
| ---------------------------------------- | -------------------------------------------- |
| id                                       | ID thuốc tồn kho                             |
| family_id                                | tủ thuốc theo gia đình                       |
| profile_id                               | nullable, nếu thuốc gắn riêng một người      |
| medicine_name                            | tên thuốc                                    |
| medicine_type                            | dạng bào chế: viên nén, gói bột, viên sủi... |
| descriptionhoặcinstruction               | mô tả/công dụng/hướng dẫn                    |
| dosage_value,dosage_unit                 | hàm lượng                                    |
| dosage_per_use_value,dosage_per_use_unit | liều dùng/lần                                |
| use_tags                                 | dùng cho: sốt, đau đầu...                    |
| quantity_stock                           | số lượng còn                                 |
| unit                                     | đơn vị tồn kho                               |
| expiry_date                              | hạn sử dụng                                  |
| storage_location                         | vị trí lưu trữ                               |
| min_stock_alert                          | ngưỡng cảnh báo sắp hết                      |
| expiry_alert_days_before                 | cảnh báo trước hạn dùng bao nhiêu ngày       |
| low_stock_alert_enabled                  | bật cảnh báo sắp hết                         |
| created_at,updated_at                    | thời gian tạo/cập nhật                       |

BE hiện có phần tồn kho cơ bản, nhưng UI chi tiết thuốc còn cầnstorage_location,use_tags,dosage\_\*, và lịch nhắc uống.

**9. medicine_reminders**

Lịch nhắc uống thuốc.

| **Field**             | **Nghĩa**                         |
| --------------------- | --------------------------------- |
| id                    | ID lịch nhắc                      |
| medicine_inventory_id | thuốc liên quan                   |
| enabled               | bật/tắt nhắc                      |
| start_date            | ngày bắt đầu                      |
| repeat_every_value    | lặp mỗi bao nhiêu                 |
| repeat_every_unit     | đơn vị lặp: day/week              |
| active_days           | ngày trong tuần, ví dụ\[1,3]      |
| times                 | giờ nhắc, ví dụ\["07:00","20:00"] |
| remind_before_minutes | nhắc trước bao nhiêu phút         |

**10. vaccination_recommendations**

Danh mục vaccine khuyến nghị.

| **Field**    | **Nghĩa**               |
| ------------ | ----------------------- |
| id           | ID khuyến nghị          |
| code         | mã vaccine              |
| name         | tên vaccine             |
| disease_name | bệnh phòng ngừa         |
| total_doses  | tổng số mũi khuyến nghị |
| notes        | ghi chú                 |
| created_at   | thời gian tạo           |

**11. user_vaccinations**

Theo dõi vaccine của từng hồ sơ.

| **Field**         | **Nghĩa**                                                      |
| ----------------- | -------------------------------------------------------------- |
| id                | ID theo dõi vaccine                                            |
| profile_id        | hồ sơ bệnh nhân                                                |
| recommendation_id | vaccine khuyến nghị                                            |
| user_id           | user thao tác, nullable                                        |
| status            | trạng thái:completed,in_progress,scheduled,overdue,not_started |
| created_at        | thời gian tạo                                                  |

**12. vaccination_doses**

Từng mũi tiêm.

| **Field**           | **Nghĩa**                                                 |
| ------------------- | --------------------------------------------------------- |
| id                  | ID mũi tiêm                                               |
| user_vaccination_id | vaccine theo hồ sơ                                        |
| dose_index          | mũi thứ mấy                                               |
| administered_at     | ngày đã tiêm                                              |
| scheduled_at        | ngày hẹn tiêm                                             |
| location            | nơi tiêm/cơ sở y tế                                       |
| reaction            | phản ứng sau tiêm                                         |
| proof_url           | ảnh/file bằng chứng                                       |
| reminder_enabled    | bật nhắc lịch tiêm                                        |
| remind_before_days  | nhắc trước bao nhiêu ngày                                 |
| dose_status         | trạng thái mũi:ADMINISTERED,SCHEDULED,OVERDUE,UNSCHEDULED |

BE hiện cóproof_url,location,administered_at,scheduled_at; UI còn cầnreaction,reminder_enabled,remind_before_days.

**13. health_metric_readings**

Thống kê sức khỏe: huyết áp, cân nặng, đường huyết.

| **Field**      | **Nghĩa**                      |
| -------------- | ------------------------------ |
| id             | ID lần đo                      |
| profile_id     | hồ sơ bệnh nhân                |
| metric_type    | loại chỉ số:bp,weight,glucose  |
| measured_at    | ngày giờ đo                    |
| systolic       | huyết áp tâm thu               |
| diastolic      | huyết áp tâm trương            |
| heart_rate     | nhịp tim                       |
| weight_kg      | cân nặng                       |
| glucose_mmol_l | đường huyết mmol/L             |
| status         | đánh giá: bình thường/cao/thấp |
| notes          | ghi chú                        |
| created_at     | thời gian tạo                  |

-> table này đảm bảo chuẩn như UI

**Quan hệ chính**

users 1-n profiles;profiles 1-1 health_details;profiles 1-n medical_records;medical_records 1-n medical_record_attachments;medical_records 1-n follow_up_appointments;profiles 1-n prescriptions;medical_records 0-1/n prescriptions;prescriptions 1-n prescription_items;families 1-n medicine_inventory;medicine_inventory 1-n medicine_reminders;profiles 1-n user_vaccinations;vaccination_recommendations 1-n user_vaccinations;user_vaccinations 1-n vaccination_doses;profiles 1-n health_metric_readings.
