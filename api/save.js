// File: /api/save.js

import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY // Use SERVICE_ROLE_KEY for server-side write access
);

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { filename, content, patient_id, patient_name } = req.body;

  if (!filename || !content || !patient_id || !patient_name) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  try {
    // Upload to Supabase Storage
    const { error } = await supabase.storage
      .from('records') // your bucket name
      .upload(`patients/${filename}`, content, {
        contentType: 'text/plain',
        upsert: false // Avoid overwriting
      });

    if (error) throw error;

    // Get the public URL
    const { data: publicURLData } = supabase.storage
      .from('records')
      .getPublicUrl(`patients/${filename}`);

    return res.status(200).json({ path: publicURLData.publicUrl });
  } catch (err) {
    return res.status(500).json({ error: 'Upload failed: ' + err.message });
  }
}
