import { ApplicationCommandOptionType, AutocompleteInteraction, ButtonInteraction, CommandInteraction, EmbedBuilder } from "discord.js";
import { ButtonComponent, Discord, Slash, SlashChoice, SlashOption } from "discordx";
import { capitalize, embedColor, errorEmbed, filteredCategory, previewConfirmText, sendButtonComponent } from "../utils.js";
import { promises as fs } from "fs";

const inventoryList = JSON.parse(await fs.readFile("./src/json/Inventory.json", "utf-8")) as {
  name: string;
  category: string;
  description: string;
  image: string;
}[];
const inventoryCategories = [...new Set(inventoryList.map(item => item.category))];
const sendCustomId = "sendInventory";

@Discord()
export class Inventory {
  @ButtonComponent({ id: sendCustomId })
  async sendButtonPressed(interaction: ButtonInteraction): Promise<void> {
    await interaction.update({ components: [sendButtonComponent(sendCustomId, true)] });
    if (!interaction.inGuild()) {
      return void await interaction.user.send({ embeds: [interaction.message.embeds[0]] });
    }
    return void await interaction.channel?.send({ embeds: [interaction.message.embeds[0]] });
  }

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
    const itemDetails = inventoryList.find((inventoryItem: { name: string; }) => capitalize(inventoryItem.name) === capitalize(item));
    if (!itemDetails) {
      return void await interaction.reply({ ephemeral: true, embeds: [errorEmbed("That Inventory item does not exist.")] });
    }

    await interaction.reply({
      ephemeral: true,
      content: previewConfirmText,
      embeds: [itemEmbed(itemDetails.name, itemDetails.description, itemDetails.image, itemCategory, interaction.user.username)],
      components: [sendButtonComponent(sendCustomId, false)]
    });
  }
}

const itemEmbed = (itemName: string, itemDescription: string, itemImage: string, itemCategory: string, username: string) => new EmbedBuilder()
  .setColor(embedColor)
  .setTitle(`Inventory item: ${itemName}`)
  .setDescription(itemDescription)
  .setThumbnail(itemImage)
  .setFooter({ text: `@${username} used /inventory category: ${itemCategory} item: ${itemName}` });
