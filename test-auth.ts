import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'http://127.0.0.1:54321'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0'

const supabase = createClient(supabaseUrl, supabaseKey)

async function checkUser(email: string, password: string) {
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })
    
    if (error) {
      console.log(`❌ Usuario ${email} NO existe o credenciales incorrectas`)
      return false
    }
    
    console.log(`✅ Usuario ${email} existe y las credenciales son correctas`)
    return true
  } catch (error) {
    console.error(`❌ Error verificando ${email}:`, error)
    return false
  }
}

async function main() {
  console.log('🔍 Verificando usuarios...')
  const users = [
    { email: 'king@master.co', password: '123456' },
    { email: 'key@master.co', password: '123456' }
  ]

  for (const user of users) {
    await checkUser(user.email, user.password)
  }
}

main() 