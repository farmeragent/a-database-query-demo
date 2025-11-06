-- Example queries for the agricultural hexes database

-- 1. Find hexes with low phosphorus (< 60) that need high P application
SELECT h3_index, P_in_soil, P_to_apply, yield_target
FROM agricultural_hexes
WHERE P_in_soil < 60
ORDER BY P_to_apply DESC
LIMIT 10;

-- 2. Calculate average nutrient requirements by yield target
SELECT
    yield_target,
    COUNT(*) as hex_count,
    ROUND(AVG(N_to_apply), 2) as avg_N_needed,
    ROUND(AVG(P_to_apply), 2) as avg_P_needed,
    ROUND(AVG(K_to_apply), 2) as avg_K_needed
FROM agricultural_hexes
GROUP BY yield_target
ORDER BY yield_target DESC;

-- 3. Find hexes that need potassium (K_to_apply > 0)
SELECT
    COUNT(*) as hexes_needing_K,
    ROUND(AVG(K_in_soil), 2) as avg_K_in_soil,
    ROUND(SUM(K_to_apply), 2) as total_K_needed
FROM agricultural_hexes
WHERE K_to_apply > 0;

-- 4. Identify high-priority hexes (low nutrients, high yield target)
SELECT h3_index, yield_target, P_in_soil, K_in_soil, P_to_apply, K_to_apply
FROM agricultural_hexes
WHERE yield_target >= 240
  AND (P_in_soil < 60 OR K_in_soil < 180)
ORDER BY (P_to_apply + K_to_apply) DESC
LIMIT 10;

-- 5. Nutrient deficiency analysis
SELECT
    CASE
        WHEN P_in_soil < 60 THEN 'Low P'
        WHEN P_in_soil < 80 THEN 'Medium P'
        ELSE 'High P'
    END as P_category,
    CASE
        WHEN K_in_soil < 180 THEN 'Low K'
        WHEN K_in_soil < 220 THEN 'Medium K'
        ELSE 'High K'
    END as K_category,
    COUNT(*) as hex_count,
    ROUND(AVG(yield_target), 2) as avg_yield_target
FROM agricultural_hexes
GROUP BY P_category, K_category
ORDER BY hex_count DESC;

-- 6. Calculate total costs (assuming prices per unit)
-- Example prices: N=$0.50/unit, P=$0.70/unit, K=$0.40/unit
SELECT
    ROUND(SUM(N_to_apply * 0.50), 2) as total_N_cost,
    ROUND(SUM(P_to_apply * 0.70), 2) as total_P_cost,
    ROUND(SUM(K_to_apply * 0.40), 2) as total_K_cost,
    ROUND(SUM(N_to_apply * 0.50 + P_to_apply * 0.70 + K_to_apply * 0.40), 2) as total_fertilizer_cost
FROM agricultural_hexes;

-- 7. Find hexes with extreme nutrient requirements
SELECT
    'High N Application' as category,
    COUNT(*) as hex_count,
    ROUND(AVG(N_to_apply), 2) as avg_application
FROM agricultural_hexes
WHERE N_to_apply > 280
UNION ALL
SELECT
    'High P Application' as category,
    COUNT(*) as hex_count,
    ROUND(AVG(P_to_apply), 2) as avg_application
FROM agricultural_hexes
WHERE P_to_apply > 120
UNION ALL
SELECT
    'High K Application' as category,
    COUNT(*) as hex_count,
    ROUND(AVG(K_to_apply), 2) as avg_application
FROM agricultural_hexes
WHERE K_to_apply > 40;

-- 8. Compare soil nutrient levels to application amounts
SELECT
    ROUND(AVG(P_in_soil), 2) as avg_P_in_soil,
    ROUND(AVG(P_to_apply), 2) as avg_P_to_apply,
    ROUND(AVG(K_in_soil), 2) as avg_K_in_soil,
    ROUND(AVG(K_to_apply), 2) as avg_K_to_apply,
    ROUND(AVG(N_to_apply), 2) as avg_N_to_apply
FROM agricultural_hexes;

-- 9. Find hexes by specific H3 index pattern (e.g., all hexes starting with '8d44ec2b')
SELECT h3_index, yield_target, P_in_soil, K_in_soil, N_to_apply
FROM agricultural_hexes
WHERE h3_index LIKE '8d44ec2b%'
LIMIT 5;

-- 10. Statistical summary of the entire field
SELECT
    COUNT(*) as total_hexes,
    ROUND(MIN(yield_target), 2) as min_yield,
    ROUND(MAX(yield_target), 2) as max_yield,
    ROUND(AVG(yield_target), 2) as avg_yield,
    ROUND(MIN(P_in_soil), 2) as min_P,
    ROUND(MAX(P_in_soil), 2) as max_P,
    ROUND(STDDEV(P_in_soil), 2) as stddev_P,
    ROUND(MIN(K_in_soil), 2) as min_K,
    ROUND(MAX(K_in_soil), 2) as max_K,
    ROUND(STDDEV(K_in_soil), 2) as stddev_K
FROM agricultural_hexes;
