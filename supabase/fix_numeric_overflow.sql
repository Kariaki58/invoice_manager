-- Fix numeric field overflow for VAT and withholding tax
-- These fields need to store calculated amounts, not percentages
-- Change from DECIMAL(5,2) to DECIMAL(12,2) to match subtotal and total

ALTER TABLE invoices 
  ALTER COLUMN vat TYPE DECIMAL(12,2),
  ALTER COLUMN withholding_tax TYPE DECIMAL(12,2);

-- Also update settings table for consistency (though these are percentages)
-- But keep them as DECIMAL(5,2) since percentages won't exceed 100

