#!/bin/bash
set -e

git apply << 'EOF'
--- a/src/modules/dashboard/dashboard.service.ts
+++ b/src/modules/dashboard/dashboard.service.ts
@@ -14,11 +14,12 @@ type TrendsInput = DateRangeInput & {
   interval: 'monthly' | 'weekly';
 };
 
 const buildDateWhere = ({ fromDate, toDate }: DateRangeInput): Prisma.FinancialRecordWhereInput => ({
   date:
     fromDate || toDate
       ? {
-          gte: fromDate,
-          lte: toDate,
+          ...(fromDate && { gte: fromDate }),
+          ...(toDate && { lte: toDate }),
         }
       : undefined,
 });
EOF
