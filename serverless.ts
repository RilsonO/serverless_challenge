import type { AWS } from '@serverless/typescript';

const serverlessConfiguration: AWS = {
  service: 'serverlesstodo',
  frameworkVersion: '3',
  plugins: [
    'serverless-esbuild',
    'serverless-dynamodb-local',
    'serverless-offline',
  ],
  provider: {
    name: 'aws',
    runtime: 'nodejs14.x',
    apiGateway: {
      minimumCompressionSize: 1024,
      shouldStartNameWithService: true,
    },
    environment: {
      AWS_NODEJS_CONNECTION_REUSE_ENABLED: '1',
      NODE_OPTIONS: '--enable-source-maps --stack-trace-limit=1000',
    },
  },
  // import the function via paths
  functions: {
    createTodo: {
      handler: 'src/functions/createTodo.handler',
      events: [
        {
          http: {
            path: 'todo/{id}',
            method: 'post',
            cors: true,
          },
        },
      ],
    },
    getTodos: {
      handler: 'src/functions/getTodos.handler',
      events: [
        {
          http: {
            path: 'todos/{id}',
            method: 'get',
            cors: true,
          },
        },
      ],
    },
  },
  package: { individually: true },
  custom: {
    esbuild: {
      bundle: true,
      minify: false,
      sourcemap: true,
      exclude: ['aws-sdk'],
      target: 'node14',
      define: { 'require.resolve': undefined },
      platform: 'node',
      concurrency: 10,
    },
    dynamodb: {
      stages: ['dev', 'local'],
      start: {
        port: 8000,
        inMemory: true,
        migrate: true,
      },
    },
  },
  resources: {
    Resources: {
      dbTodos: {
        Type: 'AWS::DynamoDB::Table',
        Properties: {
          TableName: 'todos',
          ProvisionedThroughput: {
            ReadCapacityUnits: 5,
            WriteCapacityUnits: 5,
          },
          AttributeDefinitions: [
            {
              AttributeName: 'id',
              AttributeType: 'S',
            },
            {
              AttributeName: 'user_id',
              AttributeType: 'S',
            },
          ],
          KeySchema: [
            {
              AttributeName: 'id',
              KeyType: 'HASH',
            },
            {
              AttributeName: 'user_id',
              KeyType: 'RANGE',
            },
          ],
          GlobalSecondaryIndexes: [
            // optional (list of GlobalSecondaryIndex)
            {
              IndexName: 'user_id_index',
              KeySchema: [
                {
                  // Required HASH type attribute
                  AttributeName: 'user_id',
                  KeyType: 'HASH',
                },
              ],
              Projection: {
                // attributes to project into the index
                ProjectionType: 'ALL', // (ALL | KEYS_ONLY | INCLUDE)
              },
              ProvisionedThroughput: {
                // throughput to provision to the index
                ReadCapacityUnits: 5,
                WriteCapacityUnits: 5,
              },
            },
          ],
        },
      },
    },
  },
};

module.exports = serverlessConfiguration;
