import { APIGatewayProxyHandler } from 'aws-lambda';
import { DynamoDB } from 'aws-sdk';
import 'source-map-support/register';
import * as _ from 'lodash';
import { SuccessResponse } from '../Common/Responses/SuccessResponse';
import { NotFoundResponse } from '../Common/Responses/NotFoundResponse';
import { ConflictResponse } from '../Common/Responses/ConflictResponse';
import { BadRequestResponse } from '../Common/Responses/BadRequestResponse';
import { InternalServerErrorResponse } from '../Common/Responses/InternalServerErrorResponse';
import { Character } from '../Models/Character';


export const Get: APIGatewayProxyHandler = async (event, _context) => {
  try {
    const db = new DynamoDB.DocumentClient({
      region: 'us-east-1'
    });

    const discord_id: string = event.pathParameters.id;
    const key = { discord_id: discord_id };
    const dbCharacter = await db.get({ TableName: "avalwyn-characters", Key: key }).promise();

    const characterNotfound: boolean = !dbCharacter || _.isEmpty(dbCharacter);
    if (characterNotfound) return new NotFoundResponse();

    const character: Character = Object.assign(new Character(discord_id), dbCharacter.Item);

    return new SuccessResponse(character);
  } catch (error) {
    console.log("ERROR!", error);
    return new NotFoundResponse();
  }
}


export const CreateStub: APIGatewayProxyHandler = async (event, _context) => {
  try {
    const db = new DynamoDB.DocumentClient({
      region: 'us-east-1'
    });

    const discord_id: string = event.pathParameters.id;
    const key = { discord_id: discord_id };
    const dbCharacter: DynamoDB.DocumentClient.GetItemOutput = await db.get({ TableName: "avalwyn-characters", Key: key }).promise();

    const characterExists: boolean = dbCharacter && !_.isEmpty(dbCharacter);
    if (characterExists) return new ConflictResponse();

    const newCharacterTemplate = new Character(discord_id);

    await db.put({ TableName: "avalwyn-characters", Item: newCharacterTemplate }).promise();

    return new SuccessResponse(dbCharacter);
  } catch (error) {
    console.log("ERROR!", error);
    return new InternalServerErrorResponse(error.code);
  }
}



export const SetName: APIGatewayProxyHandler = async (event, _context) => {
  try {
    const db = new DynamoDB.DocumentClient({
      region: 'us-east-1'
    });
    const discord_id: string = event.pathParameters.id;
    const key = { discord_id: discord_id };
    const dbCharacter: DynamoDB.DocumentClient.GetItemOutput = await db.get({ TableName: "avalwyn-characters", Key: key }).promise();

    const characterNotfound: boolean = !dbCharacter || _.isEmpty(dbCharacter);
    if (characterNotfound) return new NotFoundResponse();

    const request = JSON.parse(event.body);
    if (!request || !request.character_name) return new BadRequestResponse("Request must include a name in the body.");

    const params = {
      TableName: "avalwyn-characters",
      Key: key,
      UpdateExpression: "set character_name = :n",
      ExpressionAttributeValues: { ":n": request.character_name },
    };

    await db.update(params).promise();

    return new SuccessResponse("");
  } catch (error) {
    console.log("ERROR!", error);
    return new InternalServerErrorResponse(error.code);
  }
}



export const SetDescription: APIGatewayProxyHandler = async (event, _context) => {
  try {
    const db = new DynamoDB.DocumentClient({
      region: 'us-east-1'
    });
    const discord_id: string = event.pathParameters.id;
    const key = { discord_id: discord_id };
    const dbCharacter: DynamoDB.DocumentClient.GetItemOutput = await db.get({ TableName: "avalwyn-characters", Key: key }).promise();

    const characterNotfound: boolean = !dbCharacter || _.isEmpty(dbCharacter);
    if (characterNotfound) return new NotFoundResponse();

    const request = JSON.parse(event.body);
    if (!request || !request.character_description) return new BadRequestResponse("Request must include a character_description in the body.");

    const params = {
      TableName: "avalwyn-characters",
      Key: key,
      UpdateExpression: "set character_description = :d",
      ExpressionAttributeValues: { ":d": request.character_description },
    };

    await db.update(params).promise();

    return new SuccessResponse("");
  } catch (error) {
    console.log("ERROR!", error);
    return new InternalServerErrorResponse(error.code);
  }
}
