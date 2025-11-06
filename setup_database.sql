-- Install and load the spatial extension
INSTALL spatial;
LOAD spatial;

-- Create the agricultural hexes table from the GeoJSON file
CREATE TABLE agricultural_hexes AS
SELECT
    ROW_NUMBER() OVER () as id,
    h3_index::VARCHAR as h3_index,
    yield_target::DOUBLE as yield_target,
    P_in_soil::DOUBLE as P_in_soil,
    K_in_soil::DOUBLE as K_in_soil,
    N_in_soil::DOUBLE as N_in_soil,
    N_to_apply::DOUBLE as N_to_apply,
    P_to_apply::DOUBLE as P_to_apply,
    K_to_apply::DOUBLE as K_to_apply,
    geom as geometry
FROM ST_Read('north-of-road-high-res.geojson');

-- Create an index on h3_index for faster lookups
CREATE INDEX idx_h3_index ON agricultural_hexes(h3_index);

-- Show summary statistics
SELECT
    COUNT(*) as total_hexes,
    ROUND(AVG(yield_target), 2) as avg_yield_target,
    ROUND(AVG(P_in_soil), 2) as avg_P_in_soil,
    ROUND(AVG(K_in_soil), 2) as avg_K_in_soil,
    ROUND(AVG(N_in_soil), 2) as avg_N_in_soil,
    ROUND(SUM(N_to_apply), 2) as total_N_to_apply,
    ROUND(SUM(P_to_apply), 2) as total_P_to_apply,
    ROUND(SUM(K_to_apply), 2) as total_K_to_apply
FROM agricultural_hexes;
