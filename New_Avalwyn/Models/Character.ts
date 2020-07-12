import { Stats } from "./Stats";

export class Character {
    discord_id: string;
    faction_key: string = "";
    character_name: string = "New Character";
    character_description: string = "This is your new character's description.";
    character_stats: Stats = new Stats();

    constructor(discord_id: string) {
        this.discord_id = discord_id;
    }

    isAlreadyInAFaction() : boolean {
        return this.faction_key && this.faction_key !== "";
    }
}