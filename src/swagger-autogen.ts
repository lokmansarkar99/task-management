import swaggerAutogen from 'swagger-autogen';

const doc = {
  info: {
    title: 'Task Management API',
    version: '1.0.0',
    description: 'API documentation for the Task Management Application',
  },
  servers: [
    {
      url: '/',
      description: 'Current Server',
    },
  ],
  components: {
    securitySchemes: {
      bearerAuth: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
      },
    },
  },
  security: [
    {
      bearerAuth: [],
    },
  ],
};

import path from 'path';

const outputFile = path.join(__dirname, 'swagger-output.json');
const endpointsFiles = ['./src/app.ts'];

import fs from 'fs';

swaggerAutogen({ openapi: '3.0.0' })(outputFile, endpointsFiles, doc).then(() => {
    // Automatically categorize all endpoints based on their URL
    const swaggerData = JSON.parse(fs.readFileSync(outputFile, 'utf8'));
    
    for (const [apiPath, methods] of Object.entries(swaggerData.paths)) {
        // e.g., apiPath = "/api/v1/auth/register"
        const parts = apiPath.split('/');
        if (parts.length > 3) {
            // parts[3] will be "auth", "user", "task", etc.
            const moduleName = parts[3].charAt(0).toUpperCase() + parts[3].slice(1);
            
            for (const method in methods as any) {
                const endpointInfo = (methods as any)[method];
                // Only add the tag if we haven't manually provided one
                if (!endpointInfo.tags || endpointInfo.tags.length === 0) {
                    endpointInfo.tags = [moduleName];
                }
            }
        }
    }

    fs.writeFileSync(outputFile, JSON.stringify(swaggerData, null, 2));
    console.log("Swagger documentation has been successfully auto-generated and categorized!");
});
