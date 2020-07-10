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
import { Faction } from '../Models/Faction';


export const Get: APIGatewayProxyHandler = async (event, _context) => {
  try {
    const db = new DynamoDB.DocumentClient({
      region: 'us-east-1'
    });

    const faction_key: string = event.pathParameters.faction_key;
    const key = { faction_key: faction_key };
    const dbFaction = await db.get({ TableName: "avalwyn-factions", Key: key }).promise();

    const factionNotfound: boolean = !dbFaction || _.isEmpty(dbFaction);
    if (factionNotfound) return new NotFoundResponse();

    const faction: Faction = Object.assign(new Faction(), dbFaction.Item);

    return new SuccessResponse(faction);
  } catch (error) {
    console.log("ERROR!", error);
    return new NotFoundResponse();
  }
}


export const Join: APIGatewayProxyHandler = async (event, _context) => {
  try {
    const db = new DynamoDB.DocumentClient({
      region: 'us-east-1'
    });

    const faction_key: string = event.pathParameters.faction_key;
    const factionDBKey = { faction_key: faction_key };
    const dbFaction = await db.get({ TableName: "avalwyn-factions", Key: factionDBKey }).promise();

    const factionNotfound: boolean = !dbFaction || _.isEmpty(dbFaction);
    if (factionNotfound) return new NotFoundResponse(`${faction_key} is not a faction`);


    const discord_id: string = event.pathParameters.discord_id;
    const characterDBKey = { discord_id: discord_id };
    const dbCharacter = await db.get({ TableName: "avalwyn-characters", Key: characterDBKey }).promise();

    const characterNotfound: boolean = !dbCharacter || _.isEmpty(dbCharacter);
    if (characterNotfound) return new NotFoundResponse(`${discord_id} does not have a character setup yet.`);

    const character: Character = Object.assign(new Character(discord_id), dbCharacter.Item);

    if(character.isAlreadyInAFaction()) return new ConflictResponse(`${discord_id} is already in a faction.`);

    const faction: Faction = Object.assign(new Faction(), dbFaction.Item);

    faction.join(discord_id);

    const factionUpdateParams = {
      TableName: "avalwyn-factions",
      Key: factionDBKey,
      UpdateExpression: "set faction_members = :fm",
      ExpressionAttributeValues: { ":fm": faction.faction_members },
    };

    await db.update(factionUpdateParams).promise();

    const characterUpdateParams = {
      TableName: "avalwyn-characters",
      Key: characterDBKey,
      UpdateExpression: "set faction_key = :fk",
      ExpressionAttributeValues: { ":fk": faction_key },
    };

    await db.update(characterUpdateParams).promise();

    return new SuccessResponse(faction);
  } catch (error) {
    console.log("ERROR!", error);
    return new InternalServerErrorResponse(error);
  }
}


export const CreateStub: APIGatewayProxyHandler = async (event, _context) => {
  try {
    const db = new DynamoDB.DocumentClient({
      region: 'us-east-1'
    });

    const discord_id: string = event.pathParameters.id;
    const key = { discord_id: discord_id };
    const dbCharacter: DynamoDB.DocumentClient.GetItemOutput = await db.get({ TableName: "avalwyn-factions", Key: key }).promise();

    const characterExists: boolean = dbCharacter && !_.isEmpty(dbCharacter);
    if (characterExists) return new ConflictResponse();

    const newCharacterTemplate = new Character(discord_id);

    await db.put({ TableName: "avalwyn-factions", Item: newCharacterTemplate }).promise();

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
    const dbCharacter: DynamoDB.DocumentClient.GetItemOutput = await db.get({ TableName: "avalwyn-factions", Key: key }).promise();

    const characterNotfound: boolean = !dbCharacter || _.isEmpty(dbCharacter);
    if (characterNotfound) return new NotFoundResponse();

    const request = JSON.parse(event.body);
    if (!request || !request.character_name) return new BadRequestResponse("Request must include a name in the body.");

    const params = {
      TableName: "avalwyn-factions",
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
