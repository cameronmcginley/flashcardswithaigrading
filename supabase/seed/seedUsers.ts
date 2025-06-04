// supabase/seed/seedUsers.ts
import 'dotenv/config';
import { createClient } from '@supabase/supabase-js';

async function main() {
    const supabaseUrl =
      process.env.SUPABASE_URL ?? process.env.NEXT_PUBLIC_SUPABASE_URL;
    const serviceKey  = process.env.SUPABASE_SERVICE_ROLE_KEY;
  
    if (!supabaseUrl || !serviceKey) {
      throw new Error('Missing SUPABASE_URL/NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY');
    }
  
    const supabase = createClient(supabaseUrl, serviceKey);

  const USERS = [
    { email: 'test@example.com',   password: 'password123' },
    { email: 'nodata@example.com', password: 'password123' }
  ];

  for (const u of USERS) {
    const { data } = await supabase.auth.admin.listUsers();
    const existingUser = data?.users?.find(user => user.email === u.email);
    if (existingUser) await supabase.auth.admin.deleteUser(existingUser.id);

    const { error } = await supabase.auth.admin.createUser({ ...u, email_confirm: true });
    if (error) throw error;
  }

  console.log('Auth users seeded');
}

main().catch(err => { console.error(err); process.exit(1); });
