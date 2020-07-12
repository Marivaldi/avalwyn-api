import { Resources } from "./Resources";

export class Faction {
    faction_key: string;
    faction_name: string;
    faction_description: string;
    faction_members: string[] = [];
    faction_resources: Resources = new Resources();

    join(discord_id: string): boolean {
        const theUserIsAlreadyAMemberOfTheFaction = this.faction_members.includes(discord_id);
        if(theUserIsAlreadyAMemberOfTheFaction) return false;

        this.faction_members.push(discord_id);
        return true;
    }

    leave(discord_id: string): boolean {
        const theUserIsAlreadyAMemberOfTheFaction = this.faction_members.includes(discord_id);
        if(!theUserIsAlreadyAMemberOfTheFaction) return false;

        this.faction_members = this.faction_members.filter((member_id) => member_id !== discord_id)
        return true;
    }
}