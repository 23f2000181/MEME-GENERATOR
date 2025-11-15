// Quick script to test which models are available with your API key
const { GoogleGenerativeAI } = require('@google/generative-ai');
require('dotenv').config();

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_GEMINI_API_KEY);

async function testModels() {
  console.log('Testing Gemini API models...\n');

  const modelsToTest = [
    'gemini-2.5-flash-image',
    'gemini-exp-1206',
    'gemini-2.0-flash-exp',
    'imagen-3.0-generate-001',
    'gemini-1.5-flash',
    'gemini-1.5-pro',
  ];

  for (const modelName of modelsToTest) {
    try {
      console.log(`Testing: ${modelName}...`);
      const model = genAI.getGenerativeModel({ model: modelName });

      // Try a simple text request first
      const result = await model.generateContent('Hello');
      console.log(`✓ ${modelName} - WORKS (text generation)`);

    } catch (error) {
      if (error.status === 404) {
        console.log(`✗ ${modelName} - NOT FOUND (model doesn't exist)`);
      } else if (error.status === 403) {
        console.log(`✗ ${modelName} - FORBIDDEN (no access with this API key)`);
      } else if (error.status === 429) {
        console.log(`⚠ ${modelName} - QUOTA EXCEEDED (model exists but quota is 0 or exhausted)`);
      } else {
        console.log(`? ${modelName} - ERROR: ${error.message}`);
      }
    }
  }

  console.log('\n--- Attempting to list all available models ---');
  try {
    // Note: This might not work with all API key types
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models?key=${process.env.GOOGLE_GEMINI_API_KEY}`
    );
    const data = await response.json();

    if (data.models) {
      console.log('\nAvailable models:');
      data.models.forEach(model => {
        console.log(`  - ${model.name} (${model.displayName})`);
        if (model.supportedGenerationMethods) {
          console.log(`    Methods: ${model.supportedGenerationMethods.join(', ')}`);
        }
      });
    } else {
      console.log('Could not list models. Response:', data);
    }
  } catch (error) {
    console.log('Could not list models:', error.message);
  }
}

testModels().catch(console.error);
