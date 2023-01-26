import { APIGatewayProxyHandler } from 'aws-lambda';
import { document } from '../utils/dynimodbClient';
import { v4 as uuidV4 } from 'uuid';

interface ICreateTodo {
  title: string;
  deadline: string; //received at model '2018-08-08'
}

export const handler: APIGatewayProxyHandler = async (event) => {
  const { id } = event.pathParameters;
  const { title, deadline } = JSON.parse(event.body) as ICreateTodo;

  const todoID = uuidV4();

  await document
    .put({
      TableName: 'todos',
      Item: {
        id: todoID,
        user_id: id,
        title,
        done: false,
        deadline: new Date(deadline).toISOString(),
      },
    })
    .promise();

  const response = await document
    .query({
      TableName: 'todos',
      KeyConditionExpression: 'id= :id',
      ExpressionAttributeValues: {
        ':id': todoID,
      },
    })
    .promise();

  return {
    statusCode: 201,
    body: JSON.stringify(response.Items[0]),
  };
};
