import * as _ from 'lodash';
import { DynamoDB } from 'aws-sdk';
import { Character } from "../Models/Character";
import { Faction } from "../Models/Faction";
import { CharactersService } from './CharactersService';

export class FactionsService {
    constructor() { }


    static async  GetFaction(faction_key: string): Promise<Faction> {
        const db = new DynamoDB.DocumentClient({ region: 'us-east-1' });

        const factionDBKey = { faction_key: faction_key };
        const dbFaction = await db.get({ TableName: "avalwyn-factions", Key: factionDBKey }).promise();

        const factionNotfound: boolean = !dbFaction || _.isEmpty(dbFaction);
        if (factionNotfound) return;

        return Object.assign(new Faction(), dbFaction.Item);
    }

    static async JoinFaction(faction: Faction, character: Character) {
        const db = new DynamoDB.DocumentClient({ region: 'us-east-1' });

        const factionDBKey = { faction_key: faction.faction_key };

        faction.join(character.discord_id);

        const factionUpdateParams = {
            TableName: "avalwyn-factions",
            Key: factionDBKey,
            UpdateExpression: "set faction_members = :fm",
            ExpressionAttributeValues: { ":fm": faction.faction_members },
        };

        await db.update(factionUpdateParams).promise();
    }

    static async LeaveFaction(faction: Faction, character: Character) {
        const db = new DynamoDB.DocumentClient({ region: 'us-east-1' });

        const factionDBKey = { faction_key: faction.faction_key };

        faction.leave(character.discord_id);

        const factionUpdateParams = {
            TableName: "avalwyn-factions",
            Key: factionDBKey,
            UpdateExpression: "set faction_members = :fm",
            ExpressionAttributeValues: { ":fm": faction.faction_members },
        };

        await db.update(factionUpdateParams).promise();
    }
}