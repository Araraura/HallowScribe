import { ApplicationCommandOptionType, AutocompleteInteraction, CommandInteraction, EmbedBuilder } from "discord.js";
import { Discord, Slash, SlashChoice, SlashOption } from "discordx";
import { capitalize, embedColor, errorEmbed, filteredCategory } from "../utils.js";
import { promises as fs } from "fs";

const tabletList = JSON.parse(await fs.readFile("./src/json/Lore_Tablets.json", "utf-8")) as {
  name: string;
  area: string;
  text: string;
  image: string;
}[];
const tabletAreas = [...new Set(tabletList.map(tablet => tablet.area))];

@Discord()
export class LoreTablets {
  @Slash({ description: "Shows text from Lore Tablets", name: "lore-tablets" })
  async loreTablets(
    @SlashChoice(...tabletAreas)
    @SlashOption({
      type: ApplicationCommandOptionType.String,
      name: "area",
      description: "The area of the Lore Tablet",
      required: true,
    })
      area: string,
    @SlashOption({
      autocomplete: async (interaction: AutocompleteInteraction) => {
        await filteredCategory(interaction, "area", interaction.options.getString("area")!, tabletList);
      },
      type: ApplicationCommandOptionType.String,
      name: "name",
      description: "The name of the Lore Tablet",
      required: true,
    })
      name: string,
      interaction: CommandInteraction): Promise<void> {
    const tabletDetails = tabletList.find((tablet: { name: string; }) => capitalize(tablet.name) === capitalize(name));
    if (!tabletDetails) {
      return void await interaction.reply({ ephemeral: true, embeds: [errorEmbed("This Lore Tablet does not exist.")] });
    }

    await interaction.reply({ embeds: [tabletEmbed(tabletDetails.name, tabletDetails.area, tabletDetails.text, tabletDetails.image)] });
  }
}

const tabletEmbed = (tabletName: string, tabletArea: string, tabletText: string, tabletImage: string) => new EmbedBuilder()
  .setColor(embedColor)
  .setTitle(`Lore Tablet: ${tabletArea} - ${tabletName}`)
  .setDescription(tabletText)
  .setImage(tabletImage);
