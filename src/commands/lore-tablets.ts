import { ApplicationCommandOptionType, AutocompleteInteraction, ButtonInteraction, CommandInteraction, EmbedBuilder } from "discord.js";
import { ButtonComponent, Discord, Slash, SlashChoice, SlashOption } from "discordx";
import { capitalize, embedColor, errorEmbed, filteredCategory, previewConfirmText, sendButtonComponent } from "../utils.js";
import { promises as fs } from "fs";

const tabletList = JSON.parse(await fs.readFile("./src/json/Lore_Tablets.json", "utf-8")) as {
  name: string;
  area: string;
  text: string;
  image: string;
}[];
const tabletAreas = [...new Set(tabletList.map(tablet => tablet.area))];
const sendCustomId = "sendLoreTablet";

@Discord()
export class LoreTablets {
  @ButtonComponent({ id: sendCustomId })
  async sendButtonPressed(interaction: ButtonInteraction): Promise<void> {
    await interaction.update({ components: [sendButtonComponent(sendCustomId, true)] });
    await interaction.channel?.send({ embeds: [interaction.message.embeds[0]] });
  }

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

    await interaction.reply({
      ephemeral: true,
      content: previewConfirmText,
      embeds: [tabletEmbed(tabletDetails.name, area, tabletDetails.text, tabletDetails.image, interaction.user.username)],
      components: [sendButtonComponent(sendCustomId, false)]
    });
  }
}

const tabletEmbed = (tabletName: string, tabletArea: string, tabletText: string, tabletImage: string, username: string) => new EmbedBuilder()
  .setColor(embedColor)
  .setTitle(`Lore Tablet: ${tabletArea} - ${tabletName}`)
  .setDescription(tabletText)
  .setImage(tabletImage)
  .setFooter({ text: `@${username} used /lore-tablets area: ${tabletArea} name: ${tabletName}` });
