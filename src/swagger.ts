import swaggerUi from 'swagger-ui-express';
import { Application } from 'express';
import fs from 'fs';
import path from 'path';

export const setupSwagger = (app: Application) => {
  // Read the auto-generated JSON file
  const swaggerFile = path.resolve(__dirname, 'swagger-output.json');
  
  if (!fs.existsSync(swaggerFile)) {
    console.warn("Swagger output file not found. Please run 'npm run swagger' to generate it.");
    return;
  }

  const swaggerData = JSON.parse(fs.readFileSync(swaggerFile, 'utf8'));

  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerData));
};
