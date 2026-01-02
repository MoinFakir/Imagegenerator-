
require('dotenv').config();
const fs = require('fs');

async function listModels() {

  try {
    console.log('Fetching available models...');
    const apiKey = process.env.GEMINI_API_KEY;
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`);
    const data = await response.json();

    let output = '';
    if (data.models) {
      output += '--- AVAILABLE MODELS ---\n';
      data.models.forEach(m => {
        output += `Name: ${m.name}\n`;
        output += `Supported Generation Methods: ${m.supportedGenerationMethods}\n`;
        output += '-------------------\n';
      });
    } else {
      output += 'No models found or error: ' + JSON.stringify(data) + '\n';
    }

    fs.writeFileSync('models_utf8.txt', output, 'utf8');
    console.log('Successfully wrote to models_utf8.txt');

  } catch (error) {
    console.error('Error listing models:', error);
  }
}

listModels();
