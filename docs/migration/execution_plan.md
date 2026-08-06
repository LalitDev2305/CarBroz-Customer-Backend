# Phase P2 Execution Plan — Real-time Tracking & Multi-Channel Notifications

Comprehensive execution plan for Phase P2 capabilities.

## 1. Capabilities Overview

1. **Real-time Tracking Engine**:
   - `StartTrackingSessionUseCase.ts`
   - `UpdateLiveGpsLocationUseCase.ts`
   - `GetLiveTrackingTimelineUseCase.ts`
   - State Machine: `VEHICLE_PICKUP` → `IN_TRANSIT` → `SERVICE_IN_PROGRESS` → `QUALITY_CHECK` → `COMPLETED`.
2. **Notification Orchestration Engine**:
   - Multi-channel dispatch (Push via FCM, SMS, Email, In-App).
   - Template engine, retry strategy, and dead-letter queues.

---

## 2. API & Endpoint Inventory

- `POST /api/v1/tracking/sessions/start` (Initialize live tracking session)
- `PUT /api/v1/tracking/sessions/:id/location` (Partner GPS coordinate ping)
- `GET /api/v1/tracking/sessions/:bookingId` (Fetch customer live timeline)
- `POST /api/v1/notifications/device-token` (Register FCM device token)
- `POST /api/v1/notifications/send` (Internal multi-channel notification dispatch)

---

## 3. SDUI Screens

- `tracking_timeline_screen`
- `live_job_map_screen`
- `notification_center_screen`

---

## 4. Technology & Swappable Providers

- **Push Notifications**: Firebase Cloud Messaging (FCM - **FREE**). Swappable to OneSignal via `IPushNotificationProvider`.
- **Email Notifications**: Resend (**FREE Tier** 3,000/mo). Swappable to AWS SES / SendGrid via `IEmailProvider`.
- **SMS Notifications**: Fast2SMS (**Low Cost**). Swappable to Twilio / Msg91 via `ISmsProvider`.
