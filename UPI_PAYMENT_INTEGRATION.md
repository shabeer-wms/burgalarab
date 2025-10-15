# UPI Payment Integration

## Overview
This document describes the UPI payment QR code integration in the restaurant management system's waiter module.

## Implementation Details

### UPI Information
- **UPI ID**: `sayedshahloobp-1@oksbi`
- **QR Code Image**: `/public/upi-qr-code.jpg`

### Features Added

#### 1. OrderManagement Component (`src/components/staff/OrderManagement.tsx`)
- Added UPI QR code modal that appears when "Pay Now" is clicked and UPI is selected as payment method
- Modal displays:
  - QR code image (with fallback to generated QR code)
  - UPI ID for manual entry
  - Order total amount
  - Payment instructions
  - "Payment Completed" and "Cancel" buttons

#### 2. BillingPayments Component (`src/components/staff/BillingPayments.tsx`)
- Added UPI QR code modal for billing tab payments
- Same features as OrderManagement but integrated with billing workflow
- Shows QR code when UPI is selected before processing payment

### User Flow

#### From Waiter Dashboard - New Order Tab:
1. Waiter adds items to cart
2. Clicks "Send to Kitchen" button
3. Selects "Pay Now" option
4. Payment method dialog appears
5. Selects "UPI" as payment method
6. Clicks "Complete Payment"
7. **UPI QR Code modal appears** showing:
   - QR code to scan
   - UPI ID: sayedshahloobp-1@oksbi
   - Amount to pay
   - Payment instructions
8. Customer scans QR code or manually enters UPI ID
9. Customer completes payment in their UPI app
10. Waiter clicks "Payment Completed" button
11. Order is created with "paid" status and bill is generated

#### From Waiter Dashboard - Billing Tab:
1. Waiter navigates to "Billing & Payments" tab
2. Finds order with "pending" payment status
3. Clicks "Generate Bill" button
4. Selects "UPI" as payment method
5. Clicks "Generate Bill & Process Payment"
6. **UPI QR Code modal appears** (same as above)
7. After payment, waiter clicks "Payment Completed"
8. Order payment status is updated to "paid"

### Technical Details

#### Dependencies
- `qrcode.react` - For generating fallback QR codes
- QR code image stored in `/public/upi-qr-code.jpg`

#### State Management
- `showUpiQrModal` - Controls visibility of UPI QR modal
- Modal has z-index of 60 to appear above payment method dialog (z-index 50)

#### Payment Processing
- UPI payment follows same flow as other payment methods
- After "Payment Completed" is clicked, it calls the existing `processPayment('upi')` or `generateBill()` functions
- No changes to backend/database logic required

### Files Modified
1. `src/components/staff/OrderManagement.tsx`
   - Added `showUpiQrModal` state
   - Modified payment button to check for UPI method
   - Added UPI QR modal component

2. `src/components/staff/BillingPayments.tsx`
   - Added `showUpiQrModal` state
   - Modified "Generate Bill & Process Payment" button
   - Added UPI QR modal component
   - Added `QRCodeCanvas` import

3. `public/upi-qr-code.jpg`
   - New QR code image file

### Styling
- Modal uses existing Tailwind CSS classes
- Responsive design with proper spacing
- Clear visual hierarchy with:
  - Blue background for instructions
  - Primary color highlight for amount
  - Border around QR code for emphasis

### Future Enhancements
- Add payment verification status
- Add timer for payment timeout
- Add copy-to-clipboard for UPI ID
- Add support for multiple UPI IDs
- Add payment confirmation from UPI gateway (if integration available)

## Testing
1. Login as waiter
2. Create new order with items
3. Click "Send to Kitchen" → "Pay Now"
4. Select UPI payment method
5. Verify QR code modal appears with correct information
6. Test "Payment Completed" and "Cancel" buttons
7. Repeat for billing tab workflow

## Screenshots Location
The QR code image is located at:
- **File Path**: `c:\Users\HP\Desktop\restaurent-managent-5\public\upi-qr-code.jpg`
- **URL in App**: `/upi-qr-code.jpg`

## Notes
- QR code includes UPI payment URL format: `upi://pay?pa=sayedshahloobp-1@oksbi&pn=Restaurant&cu=OMR`
- Fallback QR code is generated dynamically if image fails to load
- Modal prevents accidental closure during payment processing
