const swaggerJsDoc = require('swagger-jsdoc');

const swaggerOptions = {
  swaggerDefinition: {
    openapi: '3.0.0',
    info: {
      title: 'MediGuide AI Platform API',
      version: '1.0.0',
      description: 'API documentation for medication tracking, AI chat, smart reminders, and risk validations.',
      contact: {
        name: 'Developer Support',
      }
    },
    servers: [
      { url: 'http://localhost:5000', description: 'Development server' }
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        }
      }
    },
    security: [{
      bearerAuth: []
    }]
  },
  apis: ['./routes/*.js'],
};

module.exports = swaggerJsDoc(swaggerOptions);
