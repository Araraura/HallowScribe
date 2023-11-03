import { ApplicationCommandOptionType, AutocompleteInteraction, CommandInteraction, EmbedBuilder } from "discord.js";
import { Discord, Slash, SlashChoice, SlashOption } from "discordx";
import { capitalize, embedColor, errorEmbed, filteredCategory } from "../utils.js";
import { promises as fs } from "fs";

const godhomeList = JSON.parse(await fs.readFile("./src/json/Godhome.json", "utf-8")) as {
  name: string;
  category: string;
  locked: string;
  unlocked: string;
  image: string;
}[];
const godhomeCategories = [...new Set(godhomeList.map(pantheonOrStatue => pantheonOrStatue.category))];
const bottomRow = 1;
const topRow = 2;
[godhomeCategories[bottomRow], godhomeCategories[topRow]] = [godhomeCategories[topRow], godhomeCategories[bottomRow]];

@Discord()
export class Godhome {
  @Slash({ description: "Shows descriptions from Pantheon doors and Hall of Gods statues", name: "godhome" })
  async godhome(
    @SlashChoice(...godhomeCategories)
    @SlashOption({
      type: ApplicationCommandOptionType.String,
      name: "category",
      description: "Display Pantheon doors or Hall of Gods statues",
      required: true,
    })
      godhomeCategory: string,
    @SlashOption({
      autocomplete: async (interaction: AutocompleteInteraction) => {
        await filteredCategory(interaction, "category", interaction.options.getString("category")!, godhomeList);
      },
      type: ApplicationCommandOptionType.String,
      name: "name",
      description: "The name of the Pantheon or Hall of Gods statue",
      required: true,
    })
      pantheonOrStatue: string,
      interaction: CommandInteraction): Promise<void> {
    const pantheonOrDoorName = capitalize(pantheonOrStatue);
    const godhomeDetails = godhomeList.find((godhomeObject: { name: string; }) => capitalize(godhomeObject.name) === pantheonOrDoorName);
    if (!godhomeDetails) {
      return void await interaction.reply({ ephemeral: true, embeds: [errorEmbed("This Pantheon or statue does not exist.")] });
    }

    if (godhomeDetails.category === "Pantheons") {
      return void await interaction.reply({ embeds: [pantheonEmbed(godhomeDetails.name, godhomeDetails.unlocked, godhomeDetails.image)] });
    }

    await interaction.reply({ embeds: [statueEmbed(godhomeDetails.name, godhomeDetails.unlocked, godhomeDetails.locked, godhomeDetails.image)] });
  }
}

const pantheonEmbed = (pantheonName: string, pantheonDescription: string, pantheonImage: string) => new EmbedBuilder()
  .setColor(embedColor)
  .setTitle(`Godhome: ${pantheonName}`)
  .setDescription(pantheonDescription)
  .setImage(pantheonImage);

const statueEmbed = (statueName: string, statueUnlocked: string, statueLocked: string, statueImage: string) => new EmbedBuilder()
  .setColor(embedColor)
  .setTitle(`Hall of Gods: ${statueName}`)
  .setDescription(`
  ${statueUnlocked ? `**Unlocked:**\n${statueUnlocked}\n` : ""}
  ${statueLocked ? `**Locked:**\n${statueLocked}\n` : ""}
    `)
  .setThumbnail(statueImage);
