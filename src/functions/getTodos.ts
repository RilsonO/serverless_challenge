import { APIGatewayProxyHandler } from 'aws-lambda';
import { document } from '../utils/dynimodbClient';

export const handler: APIGatewayProxyHandler = async (event) => {
  const { id } = event.pathParameters;

  // const response = await document
  // .query({
  //   TableName: 'todos',
  //   KeyConditionExpression: 'user_id= :user_id',
  //   ExpressionAttributeValues: {
  //     ':user_id': id,
  //   },
  // })
  //   .promise();

  const response = await document
    .query({
      TableName: 'todos',
      IndexName: 'user_id_index',
      KeyConditionExpression: 'user_id= :user_id',
      ExpressionAttributeValues: {
        ':user_id': id,
      },
    })
    .promise();

  if (!response) {
    return {
      statusCode: 401,
      body: JSON.stringify({ message: 'no todo found for this user!' }),
    };
  }

  return {
    statusCode: 201,
    body: JSON.stringify({ todos: response.Items }),
  };
};
