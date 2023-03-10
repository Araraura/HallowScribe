import { ApplicationCommandOptionType, AutocompleteInteraction, CommandInteraction, EmbedBuilder } from "discord.js";
import { Discord, Slash, SlashChoice, SlashOption } from "discordx";
import { capitalize, embedColor, errorEmbed, filteredCategory } from "../utils.js";
import { promises as fs } from "fs";

const charmList = JSON.parse(await fs.readFile("./src/json/Charms.json", "utf-8")) as {
  name: string;
  category: string;
  text1: string;
  text2: string;
  image: string;
}[];
const charmCategories = [...new Set(charmList.map(charm => charm.category))];

@Discord()
export class Charms {
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
    const charmDetails = charmList.find((c: { name: string; }) => capitalize(c.name) === charmName);
    if (!charmDetails) {
      return void await interaction.reply({ ephemeral: true, embeds: [errorEmbed("That charm does not exist.")] });
    }

    if (charmName === "Wayward Compass") {
      return void await interaction.reply({ embeds: [charmEmbed(charmDetails.name, charmDetails.text1, charmDetails.image)] });
    }

    await interaction.reply({ embeds: [charmEmbed(charmDetails.name, `${charmDetails.text1}\n\n${charmDetails.text2}`, charmDetails.image)] });
  }
}

const charmEmbed = (charmName: string, charmText: string, charmImage: string) => new EmbedBuilder()
  .setColor(embedColor)
  .setTitle(`Charm: ${charmName}`)
  .setDescription(charmText)
  .setThumbnail(charmImage);
