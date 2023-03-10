import { ApplicationCommandOptionType, AutocompleteInteraction, CommandInteraction, EmbedBuilder } from "discord.js";
import { Discord, Slash, SlashChoice, SlashOption } from "discordx";
import { capitalize, embedColor, errorEmbed, filteredCategory } from "../utils.js";
import { promises as fs } from "fs";

const dreamNailList = JSON.parse(await fs.readFile("./src/json/Dream_Nail.json", "utf-8")) as {
  name: string;
  area: string;
  text: string;
  image: string;
}[];
const dreamNailAreas = [...new Set(dreamNailList.map(dreamNail => dreamNail.area))];

@Discord()
export class DreamNail {
  @Slash({ description: "Shows text from Dream Nail interactions", name: "dream-nail" })
  async dreamNail(
    @SlashChoice(...dreamNailAreas)
    @SlashOption({
      type: ApplicationCommandOptionType.String,
      name: "area",
      description: "The area of the Dream Nail interaction",
      required: true,
    })
      area: string,
    @SlashOption({
      autocomplete: async (interaction: AutocompleteInteraction) => {
        await filteredCategory(interaction, "area", interaction.options.getString("area")!, dreamNailList);
      },
      type: ApplicationCommandOptionType.String,
      name: "name",
      description: "The name of the Dream Nail interaction",
      required: true,
    })
      name: string,
      interaction: CommandInteraction): Promise<void> {
    const dreamNailDetails = dreamNailList.find((dreamNail: { name: string; }) => capitalize(dreamNail.name) === capitalize(name));
    if (!dreamNailDetails) {
      return void await interaction.reply({ ephemeral: true, embeds: [errorEmbed("This Dream Nail interaction does not exist.")] });
    }

    await interaction.reply({ embeds: [dreamNailEmbed(dreamNailDetails.name, dreamNailDetails.area, dreamNailDetails.text, dreamNailDetails.image)] });
  }
}

const dreamNailEmbed = (dreamNailName: string, dreamNailArea: string, dreamNailText: string, dreamNailImage: string) => new EmbedBuilder()
  .setColor(embedColor)
  .setTitle(`Dream Nail: ${dreamNailArea} - ${dreamNailName}`)
  .setDescription(dreamNailText)
  .setImage(dreamNailImage);
