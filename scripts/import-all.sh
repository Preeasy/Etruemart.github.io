#!/bin/bash
# Import all seed batches sequentially
# Usage: bash scripts/import-all.sh <your-domain> <your-secret>

DOMAIN="${1:-localhost:3000}"
SECRET="${2:-Etruemart-2026-Secret-Key}"
TOTAL_BATCHES=12

echo "=== Starting batch import to $DOMAIN ==="
echo "Total batches: $TOTAL_BATCHES"
echo ""

for i in $(seq 0 $((TOTAL_BATCHES - 1))); do
  BATCH=$(printf "%02d" $i)
  echo -n "Batch $BATCH: "
  
  RESULT=$(curl -s -X POST "$DOMAIN/api/import-seed?secret=$SECRET&batch=$i" 2>&1)
  
  if echo "$RESULT" | grep -q '"success":true'; then
    CREATED=$(echo "$RESULT" | grep -o '"created":[0-9]*' | cut -d: -f2)
    TOTAL=$(echo "$RESULT" | grep -o '"dbTotal":[0-9]*' | cut -d: -f2)
    ERRORS=$(echo "$RESULT" | grep -o '"errors":[0-9]*' | cut -d: -f2)
    echo "✓ Created: $CREATED, Total in DB: $TOTAL, Errors: $ERRORS"
  else
    echo "✗ FAILED"
    echo "$RESULT" | head -5
    echo ""
    echo "Stopping due to error. You can retry from batch $BATCH."
    exit 1
  fi
  
  # Small delay between batches
  sleep 1
done

echo ""
echo "=== Import complete! ==="
echo "Total products should be in your database now."