-- Storage buckets for PlakatPatruljen

-- Poster photos bucket
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
    'poster-photos',
    'poster-photos',
    false,
    10485760, -- 10MB
    ARRAY['image/jpeg', 'image/png', 'image/webp']
);

-- Organization logos bucket
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
    'org-logos',
    'org-logos',
    true,
    5242880, -- 5MB
    ARRAY['image/jpeg', 'image/png', 'image/svg+xml', 'image/webp']
);

-- Campaign poster images bucket
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
    'campaign-posters',
    'campaign-posters',
    true,
    10485760, -- 10MB
    ARRAY['image/jpeg', 'image/png', 'image/webp']
);

-- User avatars bucket
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
    'avatars',
    'avatars',
    true,
    2097152, -- 2MB
    ARRAY['image/jpeg', 'image/png', 'image/webp']
);

-- Storage policies

-- Poster photos: workers can upload, org admins can view
CREATE POLICY "Workers can upload poster photos"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'poster-photos' AND auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can view poster photos"
ON storage.objects FOR SELECT
USING (bucket_id = 'poster-photos' AND auth.uid() IS NOT NULL);

-- Org logos: org admins can upload, public read
CREATE POLICY "Org admins can upload logos"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'org-logos' AND auth.uid() IS NOT NULL);

CREATE POLICY "Public can view org logos"
ON storage.objects FOR SELECT
USING (bucket_id = 'org-logos');

-- Campaign posters: org admins can upload, public read
CREATE POLICY "Org admins can upload campaign posters"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'campaign-posters' AND auth.uid() IS NOT NULL);

CREATE POLICY "Public can view campaign posters"
ON storage.objects FOR SELECT
USING (bucket_id = 'campaign-posters');

-- Avatars: users can upload own, public read
CREATE POLICY "Users can upload own avatar"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'avatars' AND auth.uid() IS NOT NULL);

CREATE POLICY "Users can update own avatar"
ON storage.objects FOR UPDATE
USING (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Public can view avatars"
ON storage.objects FOR SELECT
USING (bucket_id = 'avatars');
