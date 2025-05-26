import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export default async function handler(req, res) {
  const { patient_id, patient_name, content } = JSON.parse(req.body);
  const timestamp = new Date().toISOString();

  const filePath = `uploads/${patient_id}/${timestamp}.txt`;

  const { error: uploadError } = await supabase.storage
    .from('your-bucket')
    .upload(filePath, content, {
      contentType: 'text/plain',
    });

  if (uploadError) return res.status(500).json({ error: uploadError.message });

  const { error: insertError } = await supabase
    .from('records')
    .insert([{ patient_id, patient_name, path: filePath, timestamp }]);

  if (insertError) return res.status(500).json({ error: insertError.message });

  res.status(200).json({ message: 'Saved', path: filePath });
}
