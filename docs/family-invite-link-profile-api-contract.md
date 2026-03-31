# Family Invite Link Profile API Contract

## Mục tiêu

Backend cần bổ sung contract để hỗ trợ đúng flow sau:

1. User đã có account và vừa đăng nhập
2. User chọn `Tôi đã có gia đình`
3. User nhập mã mời
4. App hiển thị danh sách thành viên trong gia đình đó chưa có tài khoản
5. User chọn đúng thành viên tương ứng với mình
6. Backend link account hiện tại vào `profile` và `health_profile` đã có sẵn của thành viên đó
7. User vào app bình thường

Hiện OpenAPI chưa expose đủ contract cho flow này.

## Tổng quan API cần bổ sung

Backend cần thêm 2 API:

1. `GET /families/invite/linkable-profiles?invite_code=...`
2. `POST /families/invite/link-profile`

## API 1: List linkable profiles by invite code

### Endpoint

`GET /families/invite/linkable-profiles?invite_code=...`

### Mục đích

Sau khi user nhập mã mời hợp lệ, API này trả về danh sách `profile` trong family có thể claim.

Danh sách này chỉ gồm các profile:

- thuộc family của invite code
- chưa có tài khoản
- tức `linked_user_id = null`

### Auth

- yêu cầu user đã đăng nhập
- dùng access token hiện tại

### Request

#### Query params

```text
invite_code: string
```

### Response 200

```json
{
    "family_id": "a2bb5ec0-2f54-4d6b-8f21-6d56b4cfa111",
    "family_name": "Gia đình Nguyễn",
    "invite_code": "ABC123",
    "profiles": [
        {
            "profile_id": "bf94402d-5f25-4d07-847d-cff4b2ac1111",
            "health_profile_id": "9b2bcdb8-3f9d-46dd-9cb5-4d9c9d771111",
            "full_name": "Nguyễn Văn An",
            "dob": "2005-09-14",
            "gender": "male",
            "avatar_url": null,
            "status": "SHADOW",
            "linked_user_id": null
        },
        {
            "profile_id": "6cb760e4-479f-47c0-b4e5-7c5a0e221111",
            "health_profile_id": "7994d8cc-d1b0-4c67-90f8-1d7c32951111",
            "full_name": "Nguyễn Thị Lan",
            "dob": "2010-06-01",
            "gender": "female",
            "avatar_url": null,
            "status": "PENDING_LINK",
            "linked_user_id": null
        }
    ]
}
```

### Ý nghĩa các field

- `family_id`: family của mã mời
- `family_name`: tên family để FE hiển thị xác nhận
- `profiles`: danh sách profile có thể claim
- `profile_id`: profile mà user có thể chọn
- `health_profile_id`: health profile hiện gắn với profile đó
- `linked_user_id`: luôn phải là `null` trong response này
- `status`: nên là `SHADOW` hoặc `PENDING_LINK`

### Business rules

API chỉ trả ra profile thỏa tất cả điều kiện:

- thuộc family của invite code
- chưa bị xóa
- chưa linked với user khác
- được phép claim theo business

### Các case lỗi nên có

#### 400 Bad Request

- invite code rỗng hoặc sai format

#### 401 Unauthorized

- chưa đăng nhập hoặc token không hợp lệ

#### 404 Not Found

- invite code không tồn tại

#### 410 Gone

- invite code hết hạn hoặc bị thu hồi

#### 409 Conflict

- user hiện tại đã có family/profile không được phép claim thêm theo rule business

### Response lỗi ví dụ

```json
{
    "detail": "Invite code has expired"
}
```

## API 2: Link current account to selected profile

### Endpoint

`POST /families/invite/link-profile`

### Mục đích

Sau khi user chọn một profile trong danh sách linkable, API này sẽ:

- link account hiện tại vào profile đó
- giữ nguyên dữ liệu profile đã có
- giữ nguyên `health_profile` đã có
- tạo membership nếu cần
- đánh dấu first-login flow đã hoàn tất

### Auth

- yêu cầu user đã đăng nhập
- dùng access token hiện tại

### Request body

```json
{
    "invite_code": "ABC123",
    "profile_id": "bf94402d-5f25-4d07-847d-cff4b2ac1111"
}
```

### Response 200

```json
{
    "success": true,
    "family_id": "a2bb5ec0-2f54-4d6b-8f21-6d56b4cfa111",
    "profile_id": "bf94402d-5f25-4d07-847d-cff4b2ac1111",
    "health_profile_id": "9b2bcdb8-3f9d-46dd-9cb5-4d9c9d771111",
    "linked_user_id": "81d3eb78-4ea1-4054-96e1-7ed909da1111",
    "membership_created": true,
    "post_login_flow_completed": true
}
```

### Business rules

Backend khi xử lý API này phải:

1. verify `invite_code` hợp lệ
2. verify `profile_id` thuộc family của invite code
3. verify profile chưa linked user nào
4. verify user hiện tại được phép claim profile này
5. set `linked_user_id = current_user.id`
6. giữ nguyên `health_profile` đang gắn với profile
7. tạo membership nếu membership chưa tồn tại
8. set `post_login_flow_completed = true`

### Điều backend không được làm sai

Backend không nên:

- tạo profile mới khi `profile_id` đã được truyền lên
- tạo health profile mới nếu health profile cũ đã tồn tại
- link một profile đã có `linked_user_id`

### Các case lỗi nên có

#### 400 Bad Request

- thiếu `invite_code`
- thiếu `profile_id`
- request body sai format

#### 401 Unauthorized

- chưa đăng nhập hoặc token sai

#### 404 Not Found

- invite code không tồn tại
- profile không tồn tại

#### 409 Conflict

- profile đã được linked bởi user khác
- profile không thuộc family của invite code
- user hiện tại không được phép claim profile này

#### 410 Gone

- invite code hết hạn hoặc bị thu hồi

### Response lỗi ví dụ

```json
{
    "detail": "Profile has already been linked"
}
```

## FE flow cần dựa vào 2 API này

```text
user login success
-> chọn "Tôi đã có gia đình"
-> nhập invite_code
-> GET /families/invite/linkable-profiles?invite_code=...
-> render list profiles chưa có account
-> user chọn 1 profile
-> POST /families/invite/link-profile
-> success
-> go /(tabs)
```

## Quan hệ dữ liệu backend cần đảm bảo

Khi link thành công:

- account hiện tại phải trỏ vào `profile` đã chọn
- `health_profile` đang gắn với profile đó phải được giữ nguyên
- user vào app phải nhìn thấy đúng dữ liệu cũ của người đó

Tức là về business:

- account mới không lấy profile mới rỗng
- account mới phải “nhận” đúng profile cũ đã có trong family

## Gợi ý response model

### `LinkableProfileResponse`

```json
{
    "profile_id": "uuid",
    "health_profile_id": "uuid",
    "full_name": "string",
    "dob": "YYYY-MM-DD",
    "gender": "male",
    "avatar_url": "string | null",
    "status": "SHADOW",
    "linked_user_id": null
}
```

### `ListLinkableProfilesResponse`

```json
{
    "family_id": "uuid",
    "family_name": "string",
    "invite_code": "string",
    "profiles": []
}
```

### `LinkProfileResponse`

```json
{
    "success": true,
    "family_id": "uuid",
    "profile_id": "uuid",
    "health_profile_id": "uuid",
    "linked_user_id": "uuid",
    "membership_created": true,
    "post_login_flow_completed": true
}
```

## Nếu backend muốn reuse endpoint cũ

Nếu backend muốn reuse `POST /families/join`, thì vẫn cần ít nhất:

- 1 API list profile chưa có account theo invite code
- và `POST /families/join` phải nhận thêm `profile_id`

Ví dụ:

```json
{
    "invite_code": "ABC123",
    "profile_id": "bf94402d-5f25-4d07-847d-cff4b2ac1111",
    "action": "accept"
}
```

Nhưng cách này kém rõ hơn việc tách hẳn:

- `linkable-profiles`
- `link-profile`

## Kết luận

Để FE thực hiện đúng flow đã chốt, backend cần bổ sung hoặc làm rõ 2 contract:

1. `GET /families/invite/linkable-profiles?invite_code=...`
2. `POST /families/invite/link-profile`

Chỉ khi có 2 API này, FE mới làm chuẩn được flow:

- nhập mã mời
- hiện danh sách thành viên chưa có tài khoản
- chọn đúng thành viên
- link account hiện tại vào `profile` và `health_profile` có sẵn
