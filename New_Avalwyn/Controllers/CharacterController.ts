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
import { CharactersService } from 'Services/CharactersService';


export const Get: APIGatewayProxyHandler = async (event, _context) => {
  try {
    const discord_id: string = event.pathParameters.id;
    const character: Character = await CharactersService.GetCharacter(discord_id);

    if(!character) return new NotFoundResponse(`${discord_id} not found`);

    return new SuccessResponse(character);
  } catch (error) {
    console.log("ERROR!", error);
    return new NotFoundResponse();
  }
}


export const Delete: APIGatewayProxyHandler = async (event, _context) => {
  try {
    const discord_id: string = event.pathParameters.id;
    const character: Character = await CharactersService.GetCharacter(discord_id);

    if(!character) return new NotFoundResponse(`${discord_id} not found`);

    if(character.isAlreadyInAFaction()) 


    await CharactersService.DeleteCharacter(discord_id);

    return new SuccessResponse(`${discord_id} deleted.`);
  } catch (error) {
    console.log("ERROR!", error);
    return new NotFoundResponse(error);
  }
}


export const CreateStub: APIGatewayProxyHandler = async (event, _context) => {
  try {
    const discord_id: string = event.pathParameters.id;
    const characterExists = CharactersService.CharacterExists(discord_id);
    if (characterExists) return new ConflictResponse(`${discord_id} already exists.`);

    const stubbedCharacter = await CharactersService.CreateStubbedCharacter(discord_id);

    return new SuccessResponse(stubbedCharacter);
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
