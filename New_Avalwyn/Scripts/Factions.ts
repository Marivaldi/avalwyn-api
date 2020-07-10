import { Handler } from 'aws-lambda';
import { DynamoDB } from 'aws-sdk';
import 'source-map-support/register';
import * as _ from 'lodash';
import { SuccessResponse } from '../Common/Responses/SuccessResponse';
import { NotFoundResponse } from '../Common/Responses/NotFoundResponse';
import { Faction } from '../Models/Faction';


const factions = {
    "ru_hollen" : {
        "faction_key" : "ru_hollen",
        "faction_description": "**The Kingdom in the Northern Mists.** Once plagued by the spectres of fallen natives, Ru-Hollen now rules the northern parts of New Avalwyn from creeping, charcoal walls. Its faction leaders gather in Morin's Tower where the mists recede to reveal approaching threats. Ru-Hollen is a dastardly faction, relying on dark deeds to fuel their font of immense power.",
        "faction_name" : "Ru-Hollen",
        "faction_members" : [],
        "faction_resources" : {
            "gold" : 0,
            "food" : 0,
            "citizens" : 0,
            "ore" : 0,
            "ingots": 0
        }
    },
    "hovelstead" : {
        "faction_key" : "hovelstead",
        "faction_description": "**The Keepers of Peace.** Quiet is the life of a Hovelsteader. What they lack pure might, they make up for in their down-to-earth wholesome nature. Hovelstead will stop at nothing to uphold peace and tranquility in their lands - even if that means getting their hands dirty.",
        "faction_name" : "Hovelstead",
        "faction_members" : [],
        "faction_resources" : {
            "gold" : 0,
            "food" : 0,
            "citizens" : 0,
            "ore" : 0,
            "ingots": 0
        }
    },
    "mkrahna" : {
        "faction_key" : "mkrahna",
        "faction_description": "**Natives of the North.** M'krahna once held the northern tracts of New Avalwyn before the settlers arrived, bringing sickness with them. In return, they slashed the veil between the living and the dead and released their ancestors on the outsiders. Though their numbers are small, they still fight The Long War to this day.",
        "faction_name" : "M'Krahna",
        "faction_members" : [],
        "faction_resources" : {
            "gold" : 0,
            "food" : 0,
            "citizens" : 0,
            "ore" : 0,
            "ingots": 0
        }
    }
}




export const Initialize: Handler = async (event, _context) => {
    try {
        const db = new DynamoDB.DocumentClient({
            region: 'us-east-1'
        });

        const faction_keys: string[] = Object.keys(factions);
        for (let i = 0; i < faction_keys.length; i++) {
            const faction_key: string = faction_keys[i];
            const key = { faction_key: faction_key };
            await db.delete({ TableName: "avalwyn-factions", Key: key }).promise();

            if (!(faction_key in factions)) continue;

            const selectedFaction = factions[faction_key];
            const faction: Faction = Object.assign(new Faction(), selectedFaction);

            await db.put({ TableName: "avalwyn-factions", Item: faction }).promise();
        }

        return new SuccessResponse("");
    } catch (error) {
        console.log("ERROR!", error);
        return new NotFoundResponse();
    }
}



