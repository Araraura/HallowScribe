import { ApplicationCommandOptionType, AutocompleteInteraction, ButtonInteraction, CommandInteraction, EmbedBuilder } from "discord.js";
import { ButtonComponent, Discord, Slash, SlashChoice, SlashOption } from "discordx";
import { capitalize, embedColor, errorEmbed, filteredCategory, previewConfirmText, sendButtonComponent } from "../utils.js";
import { promises as fs } from "fs";

const charmList = JSON.parse(await fs.readFile("./src/json/Charms.json", "utf-8")) as {
  name: string;
  category: string;
  text1: string;
  text2: string;
  image: string;
}[];
const charmCategories = [...new Set(charmList.map(charm => charm.category))];
const sendCustomId = "sendCharm";

@Discord()
export class Charms {
  @ButtonComponent({ id: sendCustomId })
  async sendButtonPressed(interaction: ButtonInteraction): Promise<void> {
    await interaction.update({ components: [sendButtonComponent(sendCustomId, true)] });
    await interaction.channel?.send({ embeds: [interaction.message.embeds[0]] });
  }

  @Slash({ description: "Shows descriptions and effects for charms", name: "charms" })
  async charms(
    @SlashChoice(...charmCategories)
    @SlashOption({
      type: ApplicationCommandOptionType.String,
      name: "category",
      description: "The category of the charm",
      required: true,
    })
    charmCategory: string,
    @SlashOption({
      autocomplete: async (interaction: AutocompleteInteraction) => {
        await filteredCategory(interaction, "category", interaction.options.getString("category")!, charmList);
      },
      type: ApplicationCommandOptionType.String,
      name: "charm",
      description: "The name of the charm",
      required: true,
    })
    charm: string,
    interaction: CommandInteraction): Promise<void> {
    const charmName = capitalize(charm);
    const charmDetails = charmList.find((charmDetail: { name: string; }) => capitalize(charmDetail.name) === charmName);
    if (!charmDetails) {
      return void await interaction.reply({ ephemeral: true, embeds: [errorEmbed("That charm does not exist.")] });
    }

    if (charmName === "Wayward Compass") {
      return void await interaction.reply({
        ephemeral: true,
        content: previewConfirmText,
        embeds: [charmEmbed(charmDetails.name, charmDetails.text1, charmDetails.image, charmCategory, interaction.user.username)],
        components: [sendButtonComponent(sendCustomId, false)]
      });
    }

    await interaction.reply({
      ephemeral: true,
      content: previewConfirmText,
      embeds: [charmEmbed(charmDetails.name, `${charmDetails.text1}\n\n${charmDetails.text2}`, charmDetails.image, charmCategory, interaction.user.username)],
      components: [sendButtonComponent(sendCustomId, false)]
    });
  }
}

const charmEmbed = (charmName: string, charmText: string, charmImage: string, charmCategory: string, username: string) => new EmbedBuilder()
  .setColor(embedColor)
  .setTitle(`Charm: ${charmName}`)
  .setDescription(charmText)
  .setThumbnail(charmImage)
  .setFooter({ text: `@${username} used /charms category: ${charmCategory} charm: ${charmName}` });
