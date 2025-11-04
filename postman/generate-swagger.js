const { NestFactory } = require('@nestjs/core');
const { SwaggerModule, DocumentBuilder } = require('@nestjs/swagger');
const { AppModule } = require('../dist/app.module');
const fs = require('fs');
const path = require('path');

async function generateSwagger() {
  console.log('🔨 Building Swagger documentation...');

  try {
    // Create a NestJS application instance
    const app = await NestFactory.create(AppModule, {
      logger: false, // Disable logging for cleaner output
    });

    // Configure Swagger
    const config = new DocumentBuilder()
      .setTitle('4AMI Platform API')
      .setDescription('4AMI Platform Backend MVP API Documentation')
      .setVersion('1.0')
      .addBearerAuth()
      .build();

    // Generate Swagger document
    const document = SwaggerModule.createDocument(app, config);

    // Save to /tmp/swagger.json
    const outputPath = '/tmp/swagger.json';
    fs.writeFileSync(outputPath, JSON.stringify(document, null, 2));

    console.log(`✅ Swagger JSON generated successfully!`);
    console.log(`📁 File saved to: ${outputPath}`);

    // Close the app
    await app.close();

    process.exit(0);
  } catch (error) {
    console.error('❌ Error generating Swagger JSON:', error.message);
    console.error(error.stack);
    process.exit(1);
  }
}

generateSwagger();
