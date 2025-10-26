const fs = require('fs');
const path = require('path');

// Read Swagger JSON
const swaggerPath = process.argv[2] || '/tmp/swagger.json';
const swagger = JSON.parse(fs.readFileSync(swaggerPath, 'utf8'));

// Create Postman Collection
const collection = {
  info: {
    name: swagger.info.title || '4AMI Platform API',
    description: swagger.info.description || '4AMI Platform Backend MVP API Documentation',
    schema: 'https://schema.getpostman.com/json/collection/v2.1.0/collection.json',
    version: swagger.info.version || '1.0.0'
  },
  auth: {
    type: 'bearer',
    bearer: [
      {
        key: 'token',
        value: '{{authToken}}',
        type: 'string'
      }
    ]
  },
  item: []
};

// Group endpoints by tags
const groupedEndpoints = {};

Object.entries(swagger.paths).forEach(([path, methods]) => {
  Object.entries(methods).forEach(([method, details]) => {
    const tag = details.tags?.[0] || 'Other';

    if (!groupedEndpoints[tag]) {
      groupedEndpoints[tag] = [];
    }

    // Remove /api/v1 from path since it's already in baseUrl
    const cleanPath = path.replace(/^\/api\/v1/, '');

    const request = {
      name: details.summary || `${method.toUpperCase()} ${path}`,
      request: {
        method: method.toUpperCase(),
        header: [
          {
            key: 'Content-Type',
            value: 'application/json',
            type: 'text'
          }
        ],
        url: {
          raw: '{{baseUrl}}' + cleanPath,
          host: ['{{baseUrl}}'],
          path: cleanPath.split('/').filter(p => p)
        }
      },
      response: []
    };

    // Add auth if required
    if (details.security && details.security.length > 0) {
      request.request.auth = {
        type: 'bearer',
        bearer: [
          {
            key: 'token',
            value: '{{authToken}}',
            type: 'string'
          }
        ]
      };
    } else {
      request.request.auth = {
        type: 'noauth'
      };
    }

    // Add query parameters
    const queryParams = details.parameters?.filter(p => p.in === 'query') || [];
    if (queryParams.length > 0) {
      request.request.url.query = queryParams.map(param => ({
        key: param.name,
        value: param.schema?.example || '',
        description: param.description || '',
        disabled: !param.required
      }));
    }

    // Add path parameters
    const pathParams = details.parameters?.filter(p => p.in === 'path') || [];
    if (pathParams.length > 0) {
      request.request.url.variable = pathParams.map(param => ({
        key: param.name,
        value: param.schema?.example || '',
        description: param.description || ''
      }));
    }

    // Add request body
    if (details.requestBody) {
      const content = details.requestBody.content;

      if (content['application/json']) {
        const schema = content['application/json'].schema;
        const exampleBody = generateExampleFromSchema(schema, swagger.components.schemas);

        request.request.body = {
          mode: 'raw',
          raw: JSON.stringify(exampleBody, null, 2),
          options: {
            raw: {
              language: 'json'
            }
          }
        };
      } else if (content['multipart/form-data']) {
        request.request.body = {
          mode: 'formdata',
          formdata: [
            {
              key: 'file',
              type: 'file',
              src: []
            }
          ]
        };
      }
    }

    // Add auto-save token script for signin endpoints
    if (path.includes('/signin') && method === 'post') {
      request.event = [
        {
          listen: 'test',
          script: {
            type: 'text/javascript',
            exec: [
              'console.log("🔍 Test script is running...");',
              'console.log("Response code:", pm.response.code);',
              '',
              'if (pm.response.code === 200 || pm.response.code === 201) {',
              '    console.log("✅ Response is successful");',
              '    try {',
              '        var jsonData = pm.response.json();',
              '        console.log("Response data:", JSON.stringify(jsonData).substring(0, 100));',
              '        ',
              '        if (jsonData.token) {',
              '            pm.environment.set("authToken", jsonData.token);',
              '            console.log("✅ Auth token saved:", jsonData.token.substring(0, 20) + "...");',
              '        } else {',
              '            console.log("❌ No token found in response");',
              '        }',
              '    } catch (e) {',
              '        console.error("❌ Error:", e.message);',
              '    }',
              '} else {',
              '    console.log("❌ Response code is not 200/201, it is:", pm.response.code);',
              '}'
            ]
          }
        }
      ];

      // Update body to use environment variables for admin login
      if (request.request.body && request.request.body.mode === 'raw') {
        const loginExample = {
          email: '{{adminEmail}}',
          password: '{{adminPassword}}'
        };
        request.request.body.raw = JSON.stringify(loginExample, null, 2);
      }
    }

    // Add auto-save token script for signup endpoints
    if (path.includes('/signup') && method === 'post' && !path.includes('customer')) {
      request.event = [
        {
          listen: 'test',
          script: {
            type: 'text/javascript',
            exec: [
              '// Auto-save authentication token',
              'if (pm.response.code === 201) {',
              '    try {',
              '        var jsonData = pm.response.json();',
              '        if (jsonData.token) {',
              '            pm.environment.set("authToken", jsonData.token);',
              '            console.log("✅ Auth token saved automatically:", jsonData.token.substring(0, 20) + "...");',
              '        }',
              '    } catch (e) {',
              '        console.error("❌ Error saving token:", e);',
              '    }',
              '}'
            ]
          }
        }
      ];
    }

    groupedEndpoints[tag].push(request);
  });
});

// Convert grouped endpoints to Postman folders
collection.item = Object.entries(groupedEndpoints).map(([tag, requests]) => ({
  name: tag,
  item: requests
}));

// Helper function to generate example from schema
function generateExampleFromSchema(schema, components) {
  if (!schema) return {};

  if (schema.$ref) {
    const refName = schema.$ref.split('/').pop();
    return generateExampleFromSchema(components[refName], components);
  }

  if (schema.type === 'object' && schema.properties) {
    const example = {};
    Object.entries(schema.properties).forEach(([key, value]) => {
      if (value.example !== undefined) {
        example[key] = value.example;
      } else if (value.$ref) {
        const refName = value.$ref.split('/').pop();
        example[key] = generateExampleFromSchema(components[refName], components);
      } else if (value.type === 'string') {
        example[key] = value.example || '';
      } else if (value.type === 'number') {
        example[key] = value.example || 0;
      } else if (value.type === 'boolean') {
        example[key] = value.example || false;
      } else if (value.type === 'array') {
        example[key] = value.example || [];
      } else if (value.type === 'object') {
        example[key] = value.example || {};
      }
    });
    return example;
  }

  return {};
}

// Create Postman Environment
const environment = {
  name: '4AMI Platform - Development',
  values: [
    {
      key: 'baseUrl',
      value: 'http://localhost:3000/api/v1',
      type: 'default',
      enabled: true
    },
    {
      key: 'authToken',
      value: '',
      type: 'secret',
      enabled: true
    },
    {
      key: 'adminEmail',
      value: 'admin@4ami.com',
      type: 'default',
      enabled: true
    },
    {
      key: 'adminPassword',
      value: 'Admin@123456',
      type: 'secret',
      enabled: true
    }
  ],
  _postman_variable_scope: 'environment'
};

// Production environment
const productionEnvironment = {
  name: '4AMI Platform - Production',
  values: [
    {
      key: 'baseUrl',
      value: 'https://your-production-domain.com/api/v1',
      type: 'default',
      enabled: true
    },
    {
      key: 'authToken',
      value: '',
      type: 'secret',
      enabled: true
    },
    {
      key: 'adminEmail',
      value: '',
      type: 'default',
      enabled: true
    },
    {
      key: 'adminPassword',
      value: '',
      type: 'secret',
      enabled: true
    }
  ],
  _postman_variable_scope: 'environment'
};

// Write files
const outputDir = path.dirname(__filename);
fs.writeFileSync(
  path.join(outputDir, '4AMI-Platform-API.postman_collection.json'),
  JSON.stringify(collection, null, 2)
);
fs.writeFileSync(
  path.join(outputDir, '4AMI-Platform-Development.postman_environment.json'),
  JSON.stringify(environment, null, 2)
);
fs.writeFileSync(
  path.join(outputDir, '4AMI-Platform-Production.postman_environment.json'),
  JSON.stringify(productionEnvironment, null, 2)
);

console.log('✅ Postman collection and environments created successfully!');
console.log('📁 Files created:');
console.log('   - 4AMI-Platform-API.postman_collection.json');
console.log('   - 4AMI-Platform-Development.postman_environment.json');
console.log('   - 4AMI-Platform-Production.postman_environment.json');
