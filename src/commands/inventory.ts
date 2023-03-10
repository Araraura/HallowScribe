import { ApplicationCommandOptionType, AutocompleteInteraction, CommandInteraction, EmbedBuilder } from "discord.js";
import { Discord, Slash, SlashChoice, SlashOption } from "discordx";
import { capitalize, embedColor, errorEmbed, filteredCategory } from "../utils.js";
import { promises as fs } from "fs";

const inventoryList = JSON.parse(await fs.readFile("./src/json/Inventory.json", "utf-8")) as {
  name: string;
  category: string;
  description: string;
  image: string;
}[];
const inventoryCategories = [...new Set(inventoryList.map(item => item.category))];

@Discord()
export class Inventory {
  @Slash({ description: "Shows descriptions for Inventory items", name: "inventory" })
  async inventory(
    @SlashChoice(...inventoryCategories)
    @SlashOption({
      type: ApplicationCommandOptionType.String,
      name: "category",
      description: "The category of the Inventory item",
      required: true,
    })
      itemCategory: string,
    @SlashOption({
      autocomplete: async (interaction: AutocompleteInteraction) => {
        await filteredCategory(interaction, "category", interaction.options.getString("category")!, inventoryList);
      },
      type: ApplicationCommandOptionType.String,
      name: "item",
      description: "The name of the Inventory item",
      required: true,
    })
      item: string,
      interaction: CommandInteraction): Promise<void> {
    const itemName = capitalize(item);
    const itemDetails = inventoryList.find((c: { name: string; }) => capitalize(c.name) === itemName);
    if (!itemDetails) {
      return void await interaction.reply({ ephemeral: true, embeds: [errorEmbed("That Inventory item does not exist.")] });
    }

    await interaction.reply({ embeds: [itemEmbed(itemDetails.name, itemDetails.description, itemDetails.image)] });
  }
}

const itemEmbed = (itemName: string, itemDescription: string, itemImage: string) => new EmbedBuilder()
  .setColor(embedColor)
  .setTitle(`Inventory item: ${itemName}`)
  .setDescription(itemDescription)
  .setThumbnail(itemImage);
