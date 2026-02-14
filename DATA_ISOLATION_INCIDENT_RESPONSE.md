# Data Isolation Incident Response

This runbook covers manual, non-destructive remediation for previously mixed dashboard records after the forward fix.

## Scope

- Collection: `userdashboards`
- Key ownership field: `userId`
- Symptom: one account sees another account's dashboard data after login switching

## Before You Change Data

1. Put the app in maintenance mode (or communicate a short write freeze window).
2. Back up affected records before any edits.
3. Record exact document `_id` values and expected owner `userId`.

## Identify Potentially Affected Records

Use Mongo shell or MongoDB Compass filters.

### 1) Find records missing ownership fields

```javascript
db.userdashboards.find({ $or: [{ userId: { $exists: false } }, { userId: null }, { userId: "" }] })
```

### 2) Find multiple records for the same user (should usually be 1)

```javascript
db.userdashboards.aggregate([
  { $group: { _id: "$userId", count: { $sum: 1 }, ids: { $push: "$_id" } } },
  { $match: { count: { $gt: 1 } } }
])
```

### 3) Inspect suspicious records manually

Check goals/tasks/jobs content against account expectations before editing.

## Backup Commands

Back up the full collection:

```bash
mongodump --db <db_name> --collection userdashboards --out ./backup-userdashboards
```

Back up selected documents by `_id`:

```javascript
db.userdashboards.find({ _id: { $in: [ObjectId("..."), ObjectId("...")] } })
```

Export results from Compass or shell before updates.

## Manual Correction Strategy

1. Keep the document that clearly matches the account owner.
2. Move/copy valid records to the correct `userId` only when verified.
3. Remove duplicates only after backup and verification.
4. Never bulk delete without `_id`-scoped confirmation.

Example targeted owner correction:

```javascript
db.userdashboards.updateOne(
  { _id: ObjectId("RECORD_ID_TO_FIX") },
  { $set: { userId: "CORRECT_USER_ID" } }
)
```

Example duplicate removal (only after backup and validation):

```javascript
db.userdashboards.deleteOne({ _id: ObjectId("DUPLICATE_RECORD_ID") })
```

## Verification Checklist

1. Login as User A, confirm only User A data appears.
2. Logout, login as User B, confirm no User A data appears.
3. Simulate failed dashboard GET for User B and verify stale User A data does not flash.
4. Switch back to User A and verify data isolation remains correct.
5. Repeat in two tabs/sessions to confirm no cross-user hydration.
