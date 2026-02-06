-- Add image_url to members
ALTER TABLE members
ADD COLUMN IF NOT EXISTS image_url TEXT;
-- Create Storage Bucket for Member Photos
INSERT INTO storage.buckets (id, name, public)
VALUES ('member-photos', 'member-photos', true) ON CONFLICT (id) DO NOTHING;
-- Policy: Members can upload their own photo
CREATE POLICY "Members can upload their own photo" ON storage.objects FOR
INSERT WITH CHECK (
        bucket_id = 'member-photos'
        AND (storage.foldername(name)) [1] = (
            SELECT id::text
            FROM members
            WHERE auth_token::text = current_setting('app.member_token', true)
        )
    );
CREATE POLICY "Members can update their own photo" ON storage.objects FOR
UPDATE USING (
        bucket_id = 'member-photos'
        AND (storage.foldername(name)) [1] = (
            SELECT id::text
            FROM members
            WHERE auth_token::text = current_setting('app.member_token', true)
        )
    );
-- Public Access for viewing (Scanner needs to see it)
CREATE POLICY "Public Access to Member Photos" ON storage.objects FOR
SELECT USING (bucket_id = 'member-photos');