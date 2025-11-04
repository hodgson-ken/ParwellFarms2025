// Script to generate AI product images using various APIs
// This requires API keys - update with your preferred service

const fs = require('fs');
const path = require('path');

// Example using OpenAI DALL-E (requires OPENAI_API_KEY)
// You can also use Stability AI, Midjourney, or other services

async function generateImageWithOpenAI(prompt, outputPath) {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    console.error('OPENAI_API_KEY not found in environment variables');
    return false;
  }

  try {
    const response = await fetch('https://api.openai.com/v1/images/generations', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'dall-e-3',
        prompt: prompt,
        n: 1,
        size: '1024x1024',
        quality: 'standard',
      }),
    });

    const data = await response.json();
    
    if (data.data && data.data[0]) {
      const imageUrl = data.data[0].url;
      // Download the image
      const imageResponse = await fetch(imageUrl);
      const buffer = await imageResponse.arrayBuffer();
      fs.writeFileSync(outputPath, Buffer.from(buffer));
      console.log(`Generated: ${outputPath}`);
      return true;
    }
  } catch (error) {
    console.error(`Error generating image: ${error.message}`);
    return false;
  }
}

// Product prompts for AI image generation
const productPrompts = {
  'placeholder-1': 'Professional product photography of a handmade lavender soap bar on a rustic wooden background, natural lighting, farm aesthetic',
  'placeholder-5': 'Professional product photo of a creamy goat milk soap bar with shea butter, elegant product photography, white background',
  'placeholder-6': 'Product image of honey oat soap bar with visible oatmeal grains, natural organic aesthetic, soft lighting',
  // ... add more prompts
};

// Generate all images
async function generateAllImages() {
  const imagesDir = path.join(__dirname, '..', 'public', 'images');
  
  if (!fs.existsSync(imagesDir)) {
    fs.mkdirSync(imagesDir, { recursive: true });
  }

  console.log('Generating AI product images...');
  console.log('Requires OPENAI_API_KEY environment variable\n');

  for (const [productId, prompt] of Object.entries(productPrompts)) {
    const filename = `product-${productId}.jpg`;
    const outputPath = path.join(imagesDir, filename);
    
    if (fs.existsSync(outputPath)) {
      console.log(`Skipping ${filename} (already exists)`);
      continue;
    }

    await generateImageWithOpenAI(prompt, outputPath);
    // Rate limiting - wait 1 second between requests
    await new Promise(resolve => setTimeout(resolve, 1000));
  }

  console.log('\nDone! Update data/placeholderProducts.ts with the new image paths.');
}

// Run if called directly
if (require.main === module) {
  generateAllImages().catch(console.error);
}

module.exports = { generateImageWithOpenAI, productPrompts };

