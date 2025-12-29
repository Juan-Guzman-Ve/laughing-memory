import 'dotenv/config';
import { GoogleGenerativeAI } from "@google/generative-ai";

async function verMisModelos() {
  const apiKey = process.env.GEMINI_API_KEY;
  
  if (!apiKey) {
    console.error('❌ GEMINI_API_KEY no está configurada');
    process.exit(1);
  }

  console.log('🔍 Consultando modelos disponibles con tu API key...\n');
  
  try {
    const genAI = new GoogleGenerativeAI(apiKey);
    
    // Llamada a la API REST para listar modelos
    const response = await fetch('https://generativelanguage.googleapis.com/v1beta/models?key=' + apiKey);
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    
    const data = await response.json() as any;
    const models = data.models || [];
    
    console.log('✅ Modelos disponibles:');
    console.log('='.repeat(60));
    
    models.forEach((m: any) => {
      console.log(`\n📦 Nombre: ${m.name}`);
      console.log(`   - Display Name: ${m.displayName || 'N/A'}`);
      console.log(`   - Descripción: ${m.description || 'N/A'}`);
      if (m.supportedGenerationMethods) {
        console.log(`   - Métodos: ${m.supportedGenerationMethods.join(', ')}`);
      }
    });
    
    console.log('\n' + '='.repeat(60));
    console.log('\n💡 Copia uno de estos nombres para usar en tu código:');
    models.forEach((m: any) => console.log(`   - ${m.name}`));
    
  } catch (error: any) {
    console.error('\n❌ Error al consultar modelos:', error.message);
    if (error.status === 401) {
      console.error('   → Verifica que tu API key sea correcta');
    }
  }
}

verMisModelos();
