import * as _ from 'lodash';
import { DynamoDB } from 'aws-sdk';
import { Character } from "../Models/Character";
import { Faction } from '../Models/Faction';

export class CharactersService {
    constructor() { }

    static async GetCharacter(discord_id: string): Promise<Character> {
        const db = new DynamoDB.DocumentClient({ region: 'us-east-1' });
        const key = { discord_id: discord_id };
        const dbCharacter = await db.get({ TableName: "avalwyn-characters", Key: key }).promise();

        const characterNotfound: boolean = !dbCharacter || _.isEmpty(dbCharacter);
        if (characterNotfound) return;

        const character: Character = Object.assign(new Character(discord_id), dbCharacter.Item);
        return character;
    }

    static async CharacterExists(discord_id: string): Promise<boolean> {
        const character = await CharactersService.GetCharacter(discord_id);
        if (!character) return false;

        return true
    }

    static async DeleteCharacter(discord_id: string): Promise<void> {
        const db = new DynamoDB.DocumentClient({ region: 'us-east-1' });
        const key = { discord_id: discord_id };
        await db.delete({ TableName: "avalwyn-characters", Key: key }).promise();
    }

    static async JoinFaction(character: Character, faction: Faction): Promise<void> {

        const key = { discord_id: character.discord_id };
        const characterUpdateParams = {
            TableName: "avalwyn-characters",
            Key: key,
            UpdateExpression: "set faction_key = :fk",
            ExpressionAttributeValues: { ":fk": faction.faction_key },
        };

        await db.update(characterUpdateParams).promise();
    }

    static async CreateStubbedCharacter(discord_id: string): Promise<Character> {
        const db = new DynamoDB.DocumentClient({ region: 'us-east-1' });
        const newCharacterTemplate = new Character(discord_id);

        await db.put({ TableName: "avalwyn-characters", Item: newCharacterTemplate }).promise();
        return newCharacterTemplate;
    }
}