# Database Fix: Numeric Field Overflow

## Issue
The `vat` and `withholding_tax` columns in the `invoices` table were defined as `DECIMAL(5,2)`, which can only store values up to 999.99. However, the application stores calculated amounts (not percentages), which can exceed this limit for large invoices.

## Solution
Run the following SQL in your Supabase SQL Editor to fix the column types:

```sql
ALTER TABLE invoices 
  ALTER COLUMN vat TYPE DECIMAL(12,2),
  ALTER COLUMN withholding_tax TYPE DECIMAL(12,2);
```

This changes both columns to `DECIMAL(12,2)`, matching the `subtotal` and `total` columns, allowing values up to 9,999,999,999.99.

## Alternative: Use the migration file
You can also run the SQL from `supabase/fix_numeric_overflow.sql` which contains the same fix.

## Verification
After running the migration, verify the change:
```sql
SELECT column_name, data_type, numeric_precision, numeric_scale
FROM information_schema.columns
WHERE table_name = 'invoices' 
  AND column_name IN ('vat', 'withholding_tax');
```

Expected result:
- `vat`: DECIMAL(12,2)
- `withholding_tax`: DECIMAL(12,2)

