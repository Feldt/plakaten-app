-- Migration 005: Security & Backend Hardening
-- Closes 6 critical security gaps, adds CHECK constraints, status transition
-- enforcement, and atomic record_poster_log() function.

-- ============================================================
-- 1a. Add settlement_status column to task_claims (idempotent)
-- ============================================================
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'task_claims' AND column_name = 'settlement_status'
  ) THEN
    ALTER TABLE task_claims ADD COLUMN settlement_status TEXT DEFAULT 'unsettled';
  END IF;
END $$;

ALTER TABLE task_claims
  DROP CONSTRAINT IF EXISTS chk_task_claims_settlement_status;
ALTER TABLE task_claims
  ADD CONSTRAINT chk_task_claims_settlement_status
  CHECK (settlement_status IN ('unsettled', 'marked_settled', 'paid'));

-- ============================================================
-- 1b. CHECK constraints — pre-fix data then add constraints
-- ============================================================

-- Pre-fix: clamp counters that exceed totals
UPDATE campaigns SET posters_hung = poster_count WHERE posters_hung > poster_count;
UPDATE campaigns SET posters_removed = poster_count WHERE posters_removed > poster_count;
UPDATE campaign_zones SET posters_assigned = poster_count WHERE posters_assigned > poster_count;
UPDATE task_claims SET posters_completed = poster_count WHERE posters_completed > poster_count;

-- Pre-fix: clamp negative values to 0
UPDATE campaigns SET poster_count = 0 WHERE poster_count < 0;
UPDATE campaigns SET posters_hung = 0 WHERE posters_hung < 0;
UPDATE campaigns SET posters_removed = 0 WHERE posters_removed < 0;
UPDATE campaigns SET price_per_poster_hang = 0 WHERE price_per_poster_hang < 0;
UPDATE campaigns SET price_per_poster_remove = 0 WHERE price_per_poster_remove < 0;
UPDATE campaign_zones SET poster_count = 0 WHERE poster_count < 0;
UPDATE campaign_zones SET posters_assigned = 0 WHERE posters_assigned < 0;
UPDATE pickup_locations SET available_posters = 0 WHERE available_posters < 0;
UPDATE task_claims SET poster_count = 1 WHERE poster_count <= 0;
UPDATE task_claims SET posters_completed = 0 WHERE posters_completed < 0;
UPDATE task_claims SET earnings = 0 WHERE earnings < 0;
UPDATE worker_profiles SET rating = 0 WHERE rating < 0;
UPDATE worker_profiles SET rating = 5 WHERE rating > 5;
UPDATE worker_profiles SET total_posters_hung = 0 WHERE total_posters_hung < 0;
UPDATE worker_profiles SET total_posters_removed = 0 WHERE total_posters_removed < 0;
UPDATE worker_profiles SET total_earnings = 0 WHERE total_earnings < 0;
UPDATE payments SET amount = 0.01 WHERE amount <= 0;
UPDATE payments SET poster_count = 1 WHERE poster_count <= 0;

-- campaigns
ALTER TABLE campaigns DROP CONSTRAINT IF EXISTS chk_campaigns_poster_count;
ALTER TABLE campaigns ADD CONSTRAINT chk_campaigns_poster_count CHECK (poster_count >= 0);

ALTER TABLE campaigns DROP CONSTRAINT IF EXISTS chk_campaigns_posters_hung;
ALTER TABLE campaigns ADD CONSTRAINT chk_campaigns_posters_hung CHECK (posters_hung >= 0 AND posters_hung <= poster_count);

ALTER TABLE campaigns DROP CONSTRAINT IF EXISTS chk_campaigns_posters_removed;
ALTER TABLE campaigns ADD CONSTRAINT chk_campaigns_posters_removed CHECK (posters_removed >= 0 AND posters_removed <= poster_count);

ALTER TABLE campaigns DROP CONSTRAINT IF EXISTS chk_campaigns_price_hang;
ALTER TABLE campaigns ADD CONSTRAINT chk_campaigns_price_hang CHECK (price_per_poster_hang >= 0);

ALTER TABLE campaigns DROP CONSTRAINT IF EXISTS chk_campaigns_price_remove;
ALTER TABLE campaigns ADD CONSTRAINT chk_campaigns_price_remove CHECK (price_per_poster_remove >= 0);

ALTER TABLE campaigns DROP CONSTRAINT IF EXISTS chk_campaigns_dates;
ALTER TABLE campaigns ADD CONSTRAINT chk_campaigns_dates CHECK (hanging_start <= election_date);

ALTER TABLE campaigns DROP CONSTRAINT IF EXISTS chk_campaigns_title_len;
ALTER TABLE campaigns ADD CONSTRAINT chk_campaigns_title_len CHECK (char_length(title) <= 200);

ALTER TABLE campaigns DROP CONSTRAINT IF EXISTS chk_campaigns_description_len;
ALTER TABLE campaigns ADD CONSTRAINT chk_campaigns_description_len CHECK (description IS NULL OR char_length(description) <= 5000);

-- campaign_zones
ALTER TABLE campaign_zones DROP CONSTRAINT IF EXISTS chk_zones_poster_count;
ALTER TABLE campaign_zones ADD CONSTRAINT chk_zones_poster_count CHECK (poster_count >= 0);

ALTER TABLE campaign_zones DROP CONSTRAINT IF EXISTS chk_zones_posters_assigned;
ALTER TABLE campaign_zones ADD CONSTRAINT chk_zones_posters_assigned CHECK (posters_assigned >= 0 AND posters_assigned <= poster_count);

ALTER TABLE campaign_zones DROP CONSTRAINT IF EXISTS chk_zones_priority;
ALTER TABLE campaign_zones ADD CONSTRAINT chk_zones_priority CHECK (priority >= 0 AND priority <= 100);

-- pickup_locations
ALTER TABLE pickup_locations DROP CONSTRAINT IF EXISTS chk_pickup_available;
ALTER TABLE pickup_locations ADD CONSTRAINT chk_pickup_available CHECK (available_posters >= 0);

ALTER TABLE pickup_locations DROP CONSTRAINT IF EXISTS chk_pickup_name_len;
ALTER TABLE pickup_locations ADD CONSTRAINT chk_pickup_name_len CHECK (char_length(name) <= 200);

-- task_claims
ALTER TABLE task_claims DROP CONSTRAINT IF EXISTS chk_claims_poster_count;
ALTER TABLE task_claims ADD CONSTRAINT chk_claims_poster_count CHECK (poster_count > 0);

ALTER TABLE task_claims DROP CONSTRAINT IF EXISTS chk_claims_posters_completed;
ALTER TABLE task_claims ADD CONSTRAINT chk_claims_posters_completed CHECK (posters_completed >= 0 AND posters_completed <= poster_count);

ALTER TABLE task_claims DROP CONSTRAINT IF EXISTS chk_claims_earnings;
ALTER TABLE task_claims ADD CONSTRAINT chk_claims_earnings CHECK (earnings >= 0);

-- poster_logs
ALTER TABLE poster_logs DROP CONSTRAINT IF EXISTS chk_logs_latitude;
ALTER TABLE poster_logs ADD CONSTRAINT chk_logs_latitude CHECK (latitude >= -90 AND latitude <= 90);

ALTER TABLE poster_logs DROP CONSTRAINT IF EXISTS chk_logs_longitude;
ALTER TABLE poster_logs ADD CONSTRAINT chk_logs_longitude CHECK (longitude >= -180 AND longitude <= 180);

ALTER TABLE poster_logs DROP CONSTRAINT IF EXISTS chk_logs_photo_url_len;
ALTER TABLE poster_logs ADD CONSTRAINT chk_logs_photo_url_len CHECK (char_length(photo_url) <= 1000);

-- worker_profiles
ALTER TABLE worker_profiles DROP CONSTRAINT IF EXISTS chk_worker_rating;
ALTER TABLE worker_profiles ADD CONSTRAINT chk_worker_rating CHECK (rating >= 0 AND rating <= 5);

ALTER TABLE worker_profiles DROP CONSTRAINT IF EXISTS chk_worker_posters_hung;
ALTER TABLE worker_profiles ADD CONSTRAINT chk_worker_posters_hung CHECK (total_posters_hung >= 0);

ALTER TABLE worker_profiles DROP CONSTRAINT IF EXISTS chk_worker_posters_removed;
ALTER TABLE worker_profiles ADD CONSTRAINT chk_worker_posters_removed CHECK (total_posters_removed >= 0);

ALTER TABLE worker_profiles DROP CONSTRAINT IF EXISTS chk_worker_earnings;
ALTER TABLE worker_profiles ADD CONSTRAINT chk_worker_earnings CHECK (total_earnings >= 0);

ALTER TABLE worker_profiles DROP CONSTRAINT IF EXISTS chk_worker_name_len;
ALTER TABLE worker_profiles ADD CONSTRAINT chk_worker_name_len CHECK (char_length(full_name) <= 200);

ALTER TABLE worker_profiles DROP CONSTRAINT IF EXISTS chk_worker_phone_len;
ALTER TABLE worker_profiles ADD CONSTRAINT chk_worker_phone_len CHECK (char_length(phone) <= 20);

ALTER TABLE worker_profiles DROP CONSTRAINT IF EXISTS chk_worker_email_len;
ALTER TABLE worker_profiles ADD CONSTRAINT chk_worker_email_len CHECK (char_length(email) <= 320);

-- organizations
ALTER TABLE organizations DROP CONSTRAINT IF EXISTS chk_org_name_len;
ALTER TABLE organizations ADD CONSTRAINT chk_org_name_len CHECK (char_length(name) <= 200);

ALTER TABLE organizations DROP CONSTRAINT IF EXISTS chk_org_cvr;
ALTER TABLE organizations ADD CONSTRAINT chk_org_cvr CHECK (cvr_number ~ '^\d{8}$');

-- payments
ALTER TABLE payments DROP CONSTRAINT IF EXISTS chk_payment_amount;
ALTER TABLE payments ADD CONSTRAINT chk_payment_amount CHECK (amount > 0);

ALTER TABLE payments DROP CONSTRAINT IF EXISTS chk_payment_poster_count;
ALTER TABLE payments ADD CONSTRAINT chk_payment_poster_count CHECK (poster_count > 0);

-- notifications
ALTER TABLE notifications DROP CONSTRAINT IF EXISTS chk_notification_title_len;
ALTER TABLE notifications ADD CONSTRAINT chk_notification_title_len CHECK (char_length(title) <= 200);

ALTER TABLE notifications DROP CONSTRAINT IF EXISTS chk_notification_body_len;
ALTER TABLE notifications ADD CONSTRAINT chk_notification_body_len CHECK (char_length(body) <= 5000);

-- user_profiles
ALTER TABLE user_profiles DROP CONSTRAINT IF EXISTS chk_user_name_len;
ALTER TABLE user_profiles ADD CONSTRAINT chk_user_name_len CHECK (char_length(full_name) <= 200);

-- ============================================================
-- 1c. Composite indexes
-- ============================================================
CREATE INDEX IF NOT EXISTS idx_task_claims_worker_status ON task_claims(worker_id, status);
CREATE INDEX IF NOT EXISTS idx_task_claims_campaign_status ON task_claims(campaign_id, status);
CREATE INDEX IF NOT EXISTS idx_poster_logs_campaign_verified ON poster_logs(campaign_id, verified);
CREATE INDEX IF NOT EXISTS idx_task_claims_campaign_settlement ON task_claims(campaign_id, settlement_status);

-- ============================================================
-- 1d. RLS Policy Fixes (6 gaps)
-- ============================================================

-- GAP 1: Workers can inflate own earnings — restrict to cancel only
DROP POLICY IF EXISTS "Workers can update own claims" ON task_claims;
CREATE POLICY "Workers can cancel own claims" ON task_claims
  FOR UPDATE USING (
    worker_id IN (SELECT id FROM worker_profiles WHERE user_id = auth.uid())
  )
  WITH CHECK (
    -- Workers can only set status to cancelled
    status = 'cancelled'
  );

-- Org admins can update task claims (settlement management, etc.)
DROP POLICY IF EXISTS "Org admins can update task claims" ON task_claims;
CREATE POLICY "Org admins can update task claims" ON task_claims
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM campaigns c
      WHERE c.id = campaign_id AND is_org_admin(c.organization_id)
    )
  );

-- GAP 2: Poster log INSERT doesn't validate task ownership
DROP POLICY IF EXISTS "Workers can create logs" ON poster_logs;
CREATE POLICY "Workers can create logs" ON poster_logs
  FOR INSERT WITH CHECK (
    -- Worker must own this worker_id
    worker_id IN (SELECT id FROM worker_profiles WHERE user_id = auth.uid())
    -- task_claim must belong to this worker AND be active
    AND EXISTS (
      SELECT 1 FROM task_claims tc
      WHERE tc.id = task_claim_id
        AND tc.worker_id = worker_id
        AND tc.status IN ('claimed', 'in_progress')
    )
    -- campaign must be active
    AND EXISTS (
      SELECT 1 FROM campaigns c
      WHERE c.id = campaign_id
        AND c.status = 'active'
    )
  );

-- GAP 3: No UPDATE policy on poster_logs (org admins need it for verification)
DROP POLICY IF EXISTS "Org admins can update poster logs" ON poster_logs;
CREATE POLICY "Org admins can update poster logs" ON poster_logs
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM campaigns c
      WHERE c.id = campaign_id AND is_org_admin(c.organization_id)
    )
  );

-- GAP 4: Workers can modify computed fields on worker_profiles
-- BEFORE UPDATE trigger that resets computed fields to OLD values when caller is the worker
CREATE OR REPLACE FUNCTION protect_worker_computed_fields()
RETURNS TRIGGER AS $$
BEGIN
  -- If the caller is the worker themselves (not a SECURITY DEFINER function),
  -- reset computed fields to their old values
  IF NEW.user_id = auth.uid() THEN
    NEW.rating := OLD.rating;
    NEW.total_posters_hung := OLD.total_posters_hung;
    NEW.total_posters_removed := OLD.total_posters_removed;
    NEW.total_earnings := OLD.total_earnings;
    NEW.is_verified := OLD.is_verified;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS protect_worker_computed ON worker_profiles;
CREATE TRIGGER protect_worker_computed
  BEFORE UPDATE ON worker_profiles
  FOR EACH ROW
  EXECUTE FUNCTION protect_worker_computed_fields();

-- GAP 5: "Org admins can view workers" is too broad — scope to related workers
DROP POLICY IF EXISTS "Org admins can view workers" ON worker_profiles;
CREATE POLICY "Org admins can view related workers" ON worker_profiles
  FOR SELECT USING (
    -- Workers who have claims on campaigns belonging to the admin's org
    EXISTS (
      SELECT 1 FROM task_claims tc
      JOIN campaigns c ON c.id = tc.campaign_id
      WHERE tc.worker_id = worker_profiles.id
        AND is_org_admin(c.organization_id)
    )
  );

-- GAP 6: poster-photos storage policy too permissive
-- Drop the overly permissive policy
DROP POLICY IF EXISTS "Authenticated users can view poster photos" ON storage.objects;

-- Workers can view their own photos (path: campaignId/workerId/timestamp.jpg)
CREATE POLICY "Workers can view own poster photos" ON storage.objects
  FOR SELECT USING (
    bucket_id = 'poster-photos'
    AND auth.uid() IS NOT NULL
    AND (storage.foldername(name))[2] IN (
      SELECT wp.id::text FROM worker_profiles wp WHERE wp.user_id = auth.uid()
    )
  );

-- Org admins can view their campaign's photos (path: campaignId/workerId/timestamp.jpg)
CREATE POLICY "Org admins can view campaign poster photos" ON storage.objects
  FOR SELECT USING (
    bucket_id = 'poster-photos'
    AND auth.uid() IS NOT NULL
    AND EXISTS (
      SELECT 1 FROM campaigns c
      WHERE c.id::text = (storage.foldername(name))[1]
        AND is_org_admin(c.organization_id)
    )
  );

-- ============================================================
-- 1e. Status Transition Triggers
-- ============================================================

-- Task claim status transitions
CREATE OR REPLACE FUNCTION enforce_task_status_transition()
RETURNS TRIGGER AS $$
BEGIN
  IF OLD.status = NEW.status THEN
    RETURN NEW;
  END IF;

  -- Valid transitions
  CASE OLD.status::text
    WHEN 'claimed' THEN
      IF NEW.status::text NOT IN ('in_progress', 'cancelled', 'expired') THEN
        RAISE EXCEPTION 'Invalid task status transition: % -> %', OLD.status, NEW.status;
      END IF;
    WHEN 'in_progress' THEN
      IF NEW.status::text NOT IN ('completed', 'cancelled', 'expired') THEN
        RAISE EXCEPTION 'Invalid task status transition: % -> %', OLD.status, NEW.status;
      END IF;
    WHEN 'completed', 'cancelled', 'expired' THEN
      RAISE EXCEPTION 'Cannot transition from terminal status: %', OLD.status;
    ELSE
      RAISE EXCEPTION 'Unknown task status: %', OLD.status;
  END CASE;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS enforce_task_status ON task_claims;
CREATE TRIGGER enforce_task_status
  BEFORE UPDATE OF status ON task_claims
  FOR EACH ROW
  EXECUTE FUNCTION enforce_task_status_transition();

-- Settlement status transitions
CREATE OR REPLACE FUNCTION enforce_settlement_status_transition()
RETURNS TRIGGER AS $$
BEGIN
  IF OLD.settlement_status = NEW.settlement_status THEN
    RETURN NEW;
  END IF;

  CASE OLD.settlement_status
    WHEN 'unsettled' THEN
      IF NEW.settlement_status NOT IN ('marked_settled') THEN
        RAISE EXCEPTION 'Invalid settlement transition: % -> %', OLD.settlement_status, NEW.settlement_status;
      END IF;
    WHEN 'marked_settled' THEN
      IF NEW.settlement_status NOT IN ('paid') THEN
        RAISE EXCEPTION 'Invalid settlement transition: % -> %', OLD.settlement_status, NEW.settlement_status;
      END IF;
    WHEN 'paid' THEN
      RAISE EXCEPTION 'Cannot transition from terminal settlement status: paid';
    ELSE
      RAISE EXCEPTION 'Unknown settlement status: %', OLD.settlement_status;
  END CASE;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS enforce_settlement_status ON task_claims;
CREATE TRIGGER enforce_settlement_status
  BEFORE UPDATE OF settlement_status ON task_claims
  FOR EACH ROW
  EXECUTE FUNCTION enforce_settlement_status_transition();

-- Campaign status transitions
CREATE OR REPLACE FUNCTION enforce_campaign_status_transition()
RETURNS TRIGGER AS $$
BEGIN
  IF OLD.status = NEW.status THEN
    RETURN NEW;
  END IF;

  CASE OLD.status::text
    WHEN 'draft' THEN
      IF NEW.status::text NOT IN ('active', 'cancelled') THEN
        RAISE EXCEPTION 'Invalid campaign status transition: % -> %', OLD.status, NEW.status;
      END IF;
    WHEN 'active' THEN
      IF NEW.status::text NOT IN ('paused', 'completed', 'cancelled') THEN
        RAISE EXCEPTION 'Invalid campaign status transition: % -> %', OLD.status, NEW.status;
      END IF;
    WHEN 'paused' THEN
      IF NEW.status::text NOT IN ('active', 'cancelled') THEN
        RAISE EXCEPTION 'Invalid campaign status transition: % -> %', OLD.status, NEW.status;
      END IF;
    WHEN 'completed', 'cancelled' THEN
      RAISE EXCEPTION 'Cannot transition from terminal campaign status: %', OLD.status;
    ELSE
      RAISE EXCEPTION 'Unknown campaign status: %', OLD.status;
  END CASE;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS enforce_campaign_status ON campaigns;
CREATE TRIGGER enforce_campaign_status
  BEFORE UPDATE OF status ON campaigns
  FOR EACH ROW
  EXECUTE FUNCTION enforce_campaign_status_transition();

-- ============================================================
-- 1f. Atomic record_poster_log() function (SECURITY DEFINER)
-- ============================================================
CREATE OR REPLACE FUNCTION record_poster_log(
  p_task_claim_id UUID,
  p_campaign_id UUID,
  p_worker_id UUID,
  p_type TEXT,
  p_latitude NUMERIC,
  p_longitude NUMERIC,
  p_photo_url TEXT,
  p_address TEXT DEFAULT NULL,
  p_notes TEXT DEFAULT NULL,
  p_rule_violations TEXT[] DEFAULT '{}'
)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_claim task_claims%ROWTYPE;
  v_campaign campaigns%ROWTYPE;
  v_log_id UUID;
  v_new_count INTEGER;
  v_new_earnings NUMERIC(10,2);
  v_is_complete BOOLEAN;
  v_new_status task_status;
  v_price NUMERIC(10,2);
BEGIN
  -- 1. Verify the authenticated user owns this worker_id
  IF NOT EXISTS (
    SELECT 1 FROM worker_profiles
    WHERE id = p_worker_id AND user_id = auth.uid()
  ) THEN
    RAISE EXCEPTION 'Worker ID does not belong to authenticated user';
  END IF;

  -- 2. Lock the task_claim row
  SELECT * INTO v_claim
  FROM task_claims
  WHERE id = p_task_claim_id
  FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Task claim not found';
  END IF;

  -- 3. Validate claim ownership and active status
  IF v_claim.worker_id != p_worker_id THEN
    RAISE EXCEPTION 'Task claim does not belong to this worker';
  END IF;

  IF v_claim.status NOT IN ('claimed', 'in_progress') THEN
    RAISE EXCEPTION 'Task claim is not active (status: %)', v_claim.status;
  END IF;

  -- Validate campaign is active
  SELECT * INTO v_campaign
  FROM campaigns
  WHERE id = p_campaign_id;

  IF NOT FOUND OR v_campaign.status != 'active' THEN
    RAISE EXCEPTION 'Campaign is not active';
  END IF;

  IF v_claim.campaign_id != p_campaign_id THEN
    RAISE EXCEPTION 'Task claim does not belong to this campaign';
  END IF;

  -- 4. Check for over-completion
  IF v_claim.posters_completed >= v_claim.poster_count THEN
    RAISE EXCEPTION 'Task claim already fully completed (% / %)',
      v_claim.posters_completed, v_claim.poster_count;
  END IF;

  -- 5. Insert poster_log row
  INSERT INTO poster_logs (
    task_claim_id, campaign_id, worker_id, type,
    latitude, longitude, photo_url, address, notes,
    rule_violations, location
  ) VALUES (
    p_task_claim_id, p_campaign_id, p_worker_id, p_type::task_type,
    p_latitude, p_longitude, p_photo_url, p_address, p_notes,
    p_rule_violations,
    ST_SetSRID(ST_MakePoint(p_longitude::float, p_latitude::float), 4326)
  )
  RETURNING id INTO v_log_id;

  -- 6. Compute new counters
  v_new_count := v_claim.posters_completed + 1;

  IF p_type = 'hang' THEN
    v_price := v_campaign.price_per_poster_hang;
  ELSE
    v_price := v_campaign.price_per_poster_remove;
  END IF;

  v_new_earnings := v_new_count * v_price;
  v_is_complete := v_new_count >= v_claim.poster_count;

  -- 7. Auto-transition task status
  IF v_is_complete THEN
    v_new_status := 'completed';
  ELSIF v_claim.status = 'claimed' THEN
    v_new_status := 'in_progress';
  ELSE
    v_new_status := v_claim.status;
  END IF;

  -- Update task_claim atomically
  UPDATE task_claims SET
    posters_completed = v_new_count,
    earnings = v_new_earnings,
    status = v_new_status,
    started_at = CASE WHEN v_claim.status = 'claimed' THEN now() ELSE started_at END,
    completed_at = CASE WHEN v_is_complete THEN now() ELSE completed_at END
  WHERE id = p_task_claim_id;

  -- 8. Increment campaign counters
  IF p_type = 'hang' THEN
    UPDATE campaigns SET posters_hung = posters_hung + 1
    WHERE id = p_campaign_id;
  ELSE
    UPDATE campaigns SET posters_removed = posters_removed + 1
    WHERE id = p_campaign_id;
  END IF;

  -- 9. Increment worker_profiles aggregate counters
  IF p_type = 'hang' THEN
    UPDATE worker_profiles SET
      total_posters_hung = total_posters_hung + 1,
      total_earnings = total_earnings + v_price
    WHERE id = p_worker_id;
  ELSE
    UPDATE worker_profiles SET
      total_posters_removed = total_posters_removed + 1,
      total_earnings = total_earnings + v_price
    WHERE id = p_worker_id;
  END IF;

  -- 10. Return result
  RETURN json_build_object(
    'log_id', v_log_id,
    'new_count', v_new_count,
    'new_earnings', v_new_earnings,
    'is_complete', v_is_complete,
    'status', v_new_status::text
  );
END;
$$;

-- Grant execute to authenticated users
GRANT EXECUTE ON FUNCTION record_poster_log TO authenticated;

-- ============================================================
-- 1g. Duplicate Submission Prevention
-- ============================================================

-- Unique index: same photo can't be submitted twice for the same task
CREATE UNIQUE INDEX IF NOT EXISTS idx_poster_logs_unique_photo
  ON poster_logs(task_claim_id, photo_url);

-- BEFORE INSERT trigger: reject rapid-fire submissions (same worker+task within 5s)
CREATE OR REPLACE FUNCTION prevent_rapid_poster_log()
RETURNS TRIGGER AS $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM poster_logs
    WHERE task_claim_id = NEW.task_claim_id
      AND worker_id = NEW.worker_id
      AND created_at > (now() - interval '5 seconds')
  ) THEN
    RAISE EXCEPTION 'Duplicate submission: poster log for this task was created less than 5 seconds ago';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS prevent_rapid_poster_log ON poster_logs;
CREATE TRIGGER prevent_rapid_poster_log
  BEFORE INSERT ON poster_logs
  FOR EACH ROW
  EXECUTE FUNCTION prevent_rapid_poster_log();
