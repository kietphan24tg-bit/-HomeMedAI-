# Auth/Session Docs

## Mục tiêu

Đây là trang index cho các tài liệu và lệnh kiểm tra liên quan đến `auth/session`.

## Tài liệu liên quan

- `modify.md`
  Tài liệu mô tả chi tiết những gì đã sửa trong luồng `auth/session`, lý do sửa, flow hiện tại, và mức đảm bảo hiện có.

- `auth-session-qa.md`
  Checklist QA để test tay các case quan trọng trước release.

## Kiểm tra tự động hiện có

- `npm run check:auth-session`
  Guard script kiểm tra các invariant quan trọng của flow:
    - `bootstrap/sign-in` fail-fast nếu hydrate `/me` lỗi
    - rollback session khi setup phiên thất bại
    - interceptor refresh chạy cho cả `401` và `403`
    - refresh flow yêu cầu `refresh_token`
    - redirect chính trỏ về typed route protected tabs hợp lệ

- `npm run test:auth-session-runtime`
  Chạy runtime tests cho các module auth/session đã được tách ra để test:
    - `src/auth/session-core.ts`
    - `src/api/refresh-core.ts`

    Các case chính hiện được cover:
    - bootstrap không có refresh token
    - bootstrap fail khi hydrate `/me`
    - interactive session rollback khi `/me` fail
    - interactive session success path
    - refresh cho `401` và `403`
    - skip refresh cho auth endpoints
    - serialize concurrent refresh attempts
    - clear session khi thiếu refresh token

- `npm run lint`
  Kiểm tra lint toàn repo

- `npm run typecheck`
  Kiểm tra TypeScript toàn repo

- `npm run check-all`
  Chạy chuỗi kiểm tra chính gồm:
    - typecheck
    - lint
    - format check
    - auth/session guard
    - auth/session runtime tests

## Trạng thái hiện tại

Tại thời điểm cập nhật tài liệu này:

- `npm run check:auth-session`: pass
- `npm run test:auth-session-runtime`: pass
- `npm run lint`: pass
- `npm run typecheck`: pass

## Giới hạn hiện tại

Repo hiện chưa có test runner đầy đủ cho UI/integration tests, nên phần xác minh hiện đang dừng ở:

- runtime tests tự chạy cho auth/session core
- source-level guard checks
- static verification
- manual QA checklist

Muốn nâng độ tin cậy release cao hơn nữa, bước tiếp theo là dựng test runner và thêm runtime tests cho:

- `bootstrap`
- refresh interceptor
- login rollback khi `/me` fail
- logout + relaunch
- redirect sau login/post-login
