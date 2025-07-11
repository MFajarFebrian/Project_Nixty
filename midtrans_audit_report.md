# Midtrans Codebase Audit Report

## Issues Found

| Issue Type | File/Location | Line(s) | Description | Recommendation |
|------------|---------------|---------|-------------|----------------|
| **Duplicate Endpoints** | `server/api/checkout/initiate.post.js` vs `server/api/midtrans/initiate-transaction.post.js` | Lines 1-92 vs 1-152 | Two different endpoints for payment initiation with similar functionality | **Keep `/api/checkout/initiate`** - better structured, includes email validation, proper error handling |
| **SDK Method Mismatch** | `server/api/checkout/initiate.post.js` | Line 83 | Uses `snap.createTransactionToken()` | ✅ **Correct method** |
| **SDK Method Mismatch** | `server/api/midtrans/initiate-transaction.post.js` | Line 135 | Uses `snap.createTransaction()` | ❌ **Incorrect method** - should use `createTransactionToken()` |
| **SDK Method Mismatch** | `server/api/profile/transactions/repay.post.js` | Line 113 | Uses `snap.createTransaction()` | ❌ **Incorrect method** - should use `createTransactionToken()` |
| **Webhook Duplication** | `server/api/checkout/webhook.post.js` vs `server/api/midtrans/notification.post.js` | Lines 1-87 vs 1-296 | Two webhook handlers for the same purpose | **Keep `/api/midtrans/notification`** - more comprehensive, includes license processing |
| **enabled_payments Config** | `server/api/checkout/initiate.post.js` | Lines 70-75 | Hardcoded payment methods including non-QRIS options | **Restrict to QRIS only**: `["qris"]` |
| **enabled_payments Config** | `pages/checkout.vue` | Line 444 | Frontend restricts to QRIS/GoPay only | ✅ **Correct implementation** |
| **Missing Error Handling** | `server/api/midtrans/initiate-transaction.post.js` | Lines 96-108 | User fetch error handling exists but continues silently | ⚠️ **Adequate but could be improved** |
| **Missing Error Handling** | `server/api/midtrans/status.get.js` | Lines 33-42 | Returns success:false instead of throwing error | ⚠️ **Inconsistent error handling pattern** |
| **Database Query Method** | `server/api/midtrans/initiate-transaction.post.js` | Line 33 | Uses `db.query()` instead of `db.execute()` | ⚠️ **Inconsistent with other files** |
| **Legacy Code** | `server/api/checkout/webhook.post.js` | Lines 1-87 | Simpler webhook implementation | **Remove after migration** |
| **Version Handling** | `pages/product/[slug]/checkout.vue` | Line 246 | Calls same endpoint as main checkout but with different structure | ⚠️ **Potential inconsistency** |

## Summary of Recommendations

### 1. **Endpoint Consolidation**
- **Remove**: `server/api/checkout/initiate.post.js` (legacy)
- **Keep**: `server/api/midtrans/initiate-transaction.post.js` (but fix SDK method)
- **Remove**: `server/api/checkout/webhook.post.js` (legacy)
- **Keep**: `server/api/midtrans/notification.post.js` (primary webhook)

### 2. **SDK Method Corrections**
```javascript
// Fix in server/api/midtrans/initiate-transaction.post.js:135
const transactionToken = await snap.createTransactionToken(parameter);

// Fix in server/api/profile/transactions/repay.post.js:113
const transactionToken = await snap.createTransactionToken(parameter);
```

### 3. **QRIS-Only Configuration**
```javascript
// Update server/api/checkout/initiate.post.js:70-75 to:
enabled_payments: ["qris"]
```

### 4. **Files to Monitor for enabled_payments**
- `server/api/checkout/initiate.post.js` (line 70)
- `pages/checkout.vue` (line 444) - ✅ Already correct
- `server/api/midtrans/initiate-transaction.post.js` (no enabled_payments config)
- `server/api/profile/transactions/repay.post.js` (no enabled_payments config)

### 5. **Error Handling Improvements**
- Standardize error handling patterns across all endpoints
- Consider throwing errors instead of returning error objects for consistency

## Next Steps
1. Implement SDK method fixes
2. Update enabled_payments configuration
3. Remove legacy endpoints after testing
4. Standardize error handling patterns
5. Test payment flow end-to-end with QRIS restriction
