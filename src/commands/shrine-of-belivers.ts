import { ApplicationCommandOptionType, AutocompleteInteraction, ButtonInteraction, CommandInteraction, EmbedBuilder } from "discord.js";
import { ButtonComponent, Discord, Slash, SlashChoice, SlashOption } from "discordx";
import { capitalize, embedColor, errorEmbed, filteredCategory, previewConfirmText, sendButtonComponent } from "../utils.js";
import { promises as fs } from "fs";

const tabletImageURL = "https://i.imgur.com/UDZTJxF.png";
const believersList = JSON.parse(await fs.readFile("./src/json/Shrine_of_Believers.json", "utf-8")) as {
  name: string;
  row: string;
  text: string;
}[];
const believerRows = [...new Set(believersList.map(believer => believer.row))];
const sendCustomId = "sendBeliever";

@Discord()
export class ShrineOfBelievers {
  @ButtonComponent({ id: sendCustomId })
  async sendButtonPressed(interaction: ButtonInteraction): Promise<void> {
    await interaction.update({ components: [sendButtonComponent(sendCustomId, true)] });
    if (!interaction.inGuild()) {
      return void await interaction.user.send({ embeds: [interaction.message.embeds[0]] });
    }
    return void await interaction.channel?.send({ embeds: [interaction.message.embeds[0]] });
  }

  @Slash({ description: "Shows text from Shrine of Believers tablets", name: "shrine-of-believers" })
  async shrineOfBelievers(
    @SlashChoice(...believerRows)
    @SlashOption({
      type: ApplicationCommandOptionType.String,
      name: "row",
      description: "The row of the Shrine of Believers tablet",
      required: true,
    })
    believerRow: string,
    @SlashOption({
      autocomplete: async (interaction: AutocompleteInteraction) => {
        await filteredCategory(interaction, "row", interaction.options.getString("row")!, believersList);
      },
      type: ApplicationCommandOptionType.String,
      name: "believer",
      description: "The name of the believer",
      required: true,
    })
    believer: string,
    interaction: CommandInteraction): Promise<void> {
    const believerDetails = believersList.find((believerStatue: { name: string; }) => capitalize(believerStatue.name) === capitalize(believer));
    if (!believerDetails) {
      return void await interaction.reply({ ephemeral: true, embeds: [errorEmbed("That believer does not exist.")] });
    }

    await interaction.reply({
      ephemeral: true,
      content: previewConfirmText,
      embeds: [believerEmbed(believerDetails.name, believerDetails.text, believerRow, interaction.user.username)],
      components: [sendButtonComponent(sendCustomId, false)]
    });
  }
}

const believerEmbed = (believerName: string, believerText: string, believerRow: string, username: string) => new EmbedBuilder()
  .setColor(embedColor)
  .setTitle(`Shrine of Believers: ${believerName}`)
  .setDescription(believerText)
  .setThumbnail(tabletImageURL)
  .setFooter({ text: `@${username} used /shrine-of-believers row: ${believerRow} believer: ${believerName}` });
