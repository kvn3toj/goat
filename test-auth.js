import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'http://127.0.0.1:54321'
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImV4cCI6MTk4MzgxMjk5Nn0.EGIM96RAZx35lJzdJsyH-qQwv8Hdp7fsn3W0YpN81IU'

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function testAuth() {
  try {
    // Intentar iniciar sesión con el usuario que creamos
    console.log('Intentando iniciar sesión...')
    const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
      email: 'devadmin@example.com',
      password: 'password123'
    })
    
    if (signInError) {
      console.error('Error al iniciar sesión:', signInError.message)
      return
    }
    
    console.log('Inicio de sesión exitoso:', signInData.user.id)
  } catch (error) {
    console.error('Error inesperado:', error)
  }
}

testAuth() 