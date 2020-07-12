import { APIGatewayProxyHandler } from 'aws-lambda';
import { DynamoDB } from 'aws-sdk';
import 'source-map-support/register';
import * as _ from 'lodash';
import { SuccessResponse } from '../Common/Responses/SuccessResponse';
import { NotFoundResponse } from '../Common/Responses/NotFoundResponse';
import { ConflictResponse } from '../Common/Responses/ConflictResponse';
import { InternalServerErrorResponse } from '../Common/Responses/InternalServerErrorResponse';
import { Character } from '../Models/Character';
import { Faction } from '../Models/Faction';
import { FactionsService } from 'Services/FactionsService';
import { CharactersService } from 'Services/CharactersService';


export const Get: APIGatewayProxyHandler = async (event, _context) => {
  try {
    const faction_key: string = event.pathParameters.faction_key;
    const faction: Faction = await FactionsService.GetFaction(faction_key);
    if (!faction) return new NotFoundResponse(`${faction_key} does not exist`);

    return new SuccessResponse(faction);
  } catch (error) {
    console.log("ERROR!", error);
    return new NotFoundResponse();
  }
}


export const Join: APIGatewayProxyHandler = async (event, _context) => {
  try {
    const faction_key: string = event.pathParameters.faction_key;
    const faction: Faction = await FactionsService.GetFaction(faction_key);
    if (!faction) return new NotFoundResponse(`${faction_key} is not a faction`);


    const discord_id: string = event.pathParameters.discord_id;
    const character: Character = await CharactersService.GetCharacter(discord_id);
    if (!character) return new NotFoundResponse(`${discord_id} does not have a character setup yet.`);

    if (character.isAlreadyInAFaction()) return new ConflictResponse(`${discord_id} is already in a faction.`);

    await FactionsService.JoinFaction(faction, character);
    await CharactersService.JoinFaction(character, faction);

    return new SuccessResponse(faction);
  } catch (error) {
    console.log("ERROR!", error);
    return new InternalServerErrorResponse(error);
  }
}
