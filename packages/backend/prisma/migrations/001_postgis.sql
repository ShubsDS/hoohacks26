-- Add geometry columns for spatial queries
ALTER TABLE "UserLocation" ADD COLUMN IF NOT EXISTS geom geometry(Point, 4326);
ALTER TABLE "Report" ADD COLUMN IF NOT EXISTS geom geometry(Point, 4326);

-- Auto-sync geom from lat/lng on UserLocation
CREATE OR REPLACE FUNCTION sync_user_location_geom()
RETURNS TRIGGER AS $$
BEGIN
  NEW.geom = ST_SetSRID(ST_MakePoint(NEW.longitude, NEW.latitude), 4326);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'user_location_geom_trigger') THEN
    CREATE TRIGGER user_location_geom_trigger
    BEFORE INSERT OR UPDATE ON "UserLocation"
    FOR EACH ROW EXECUTE FUNCTION sync_user_location_geom();
  END IF;
END $$;

-- Auto-sync geom on Report
CREATE OR REPLACE FUNCTION sync_report_geom()
RETURNS TRIGGER AS $$
BEGIN
  NEW.geom = ST_SetSRID(ST_MakePoint(NEW.longitude, NEW.latitude), 4326);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'report_geom_trigger') THEN
    CREATE TRIGGER report_geom_trigger
    BEFORE INSERT OR UPDATE ON "Report"
    FOR EACH ROW EXECUTE FUNCTION sync_report_geom();
  END IF;
END $$;

-- Spatial indexes
CREATE INDEX IF NOT EXISTS user_location_geom_idx ON "UserLocation" USING GIST(geom);
CREATE INDEX IF NOT EXISTS report_geom_idx ON "Report" USING GIST(geom);
