import { OpenAPIV3 } from 'openapi-types';
const swaggerJSDoc = require('swagger-jsdoc');
const isProd = process.env.NODE_ENV === 'production';

const swaggerOptions = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Event RSVP API',
      version: '1.0.0',
      description: 'API documentation for the Event RSVP application',
    },
    servers: [
      {
       url:
        process.env.NODE_ENV === 'production'
          ? 'https://event-rsvp-backend-d0s8.onrender.com/'
          : 'http://localhost:5000/',
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
    security: [{ bearerAuth: [] }],
  } as unknown as OpenAPIV3.Document,
   apis: [isProd ? './dist/routes/*.js' : './src/routes/*.ts'],
};

const swaggerSpec = swaggerJSDoc(swaggerOptions);

export default swaggerSpec;
