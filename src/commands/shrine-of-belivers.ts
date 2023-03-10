import { ApplicationCommandOptionType, AutocompleteInteraction, CommandInteraction, EmbedBuilder } from "discord.js";
import { Discord, Slash, SlashChoice, SlashOption } from "discordx";
import { capitalize, embedColor, errorEmbed, filteredCategory } from "../utils.js";
import { promises as fs } from "fs";

const tabletImageURL = "https://i.imgur.com/UDZTJxF.png";
const believersList = JSON.parse(await fs.readFile("./src/json/Shrine_of_Believers.json", "utf-8")) as {
  name: string;
  row: string;
  text: string;
}[];
const believerRows = [...new Set(believersList.map(believer => believer.row))];

@Discord()
export class ShrineOfBelievers {
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
    const believerName = capitalize(believer);
    const believerDetails = believersList.find((c: { name: string; }) => capitalize(c.name) === believerName);
    if (!believerDetails) {
      return void await interaction.reply({ ephemeral: true, embeds: [errorEmbed("That believer does not exist.")] });
    }

    await interaction.reply({ embeds: [believerEmbed(believerDetails.name, believerDetails.text)] });
  }
}

const believerEmbed = (believerName: string, believerText: string) => new EmbedBuilder()
  .setColor(embedColor)
  .setTitle(`Shrine of Believers: ${believerName}`)
  .setDescription(believerText)
  .setThumbnail(tabletImageURL);
