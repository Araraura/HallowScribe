import { ApplicationCommandOptionType, AutocompleteInteraction, CommandInteraction, EmbedBuilder } from "discord.js";
import { Discord, Slash, SlashChoice, SlashOption } from "discordx";
import { capitalize, embedColor, errorEmbed } from "../utils.js";
import { promises as fs } from "fs";

const cutContentList = JSON.parse(await fs.readFile("./src/json/Cut_Content.json", "utf-8")) as {
  name: string;
  type: string;
  category: string;
  text: string;
}[];
const cutContentTypes = [...new Set(cutContentList.map(content => content.type))];

@Discord()
export class CutContent {
  @Slash({ description: "Shows text from in-game cut content", name: "cut-content" })
  async cutContent(
    @SlashChoice(...cutContentTypes)
    @SlashOption({
      type: ApplicationCommandOptionType.String,
      name: "type",
      description: "The type of the cut content",
      required: true,
    })
      cutContentType: string,
    @SlashOption({
      autocomplete: async (interaction: AutocompleteInteraction) => {
        await findCategory(interaction);
      },
      type: ApplicationCommandOptionType.String,
      name: "category",
      description: "The category of the cut content",
      required: true,
    })
      cutContentCategory: string,
    @SlashOption({
      autocomplete: async (interaction: AutocompleteInteraction) => {
        await findText(interaction);
      },
      type: ApplicationCommandOptionType.String,
      name: "name",
      description: "The name of the cut content",
      required: true,
    })
      cutContent: string,
      interaction: CommandInteraction): Promise<void> {
    const cutContentDetails = cutContentList.find((content: { name: string; category: string; }) =>
      capitalize(content.name) === capitalize(cutContent) && capitalize(content.category) === capitalize(cutContentCategory));
    if (!cutContentDetails) {
      return void await interaction.reply({ ephemeral: true, embeds: [errorEmbed("This cut content does not exist.")] });
    }

    await interaction.reply({ embeds: [cutContentEmbed(cutContentDetails.name, cutContentDetails.category, cutContentDetails.text)] });
  }
}

const cutContentEmbed = (cutContentName: string, cutContentCategory: string, cutContentText: string) => new EmbedBuilder()
  .setColor(embedColor)
  .setTitle(`Cut content: ${cutContentName} - ${cutContentCategory}`)
  .setDescription(cutContentText)
  .setFooter({ text: "Note: Cut content should not be considered canon." });

const findCategory = async (interaction: AutocompleteInteraction) => {
  const filtered = cutContentList
    .filter(cutContent => cutContent.type === interaction.options.getString("type"));
  const categories = [...new Set(filtered.map(content => content.category))].filter(c => capitalize(c).startsWith(capitalize(interaction.options.getFocused())));
  await interaction.respond(categories.map(category => ({ name: category, value: category })).slice(0, 25));
};

const findText = async (interaction: AutocompleteInteraction) => {
  const ChosenType = interaction.options.getString("type");
  const ChosenCategory = capitalize(interaction.options.getString("category")!);
  if (!ChosenType || !ChosenCategory) {
    return await interaction.respond([]);
  }

  const filtered = cutContentList
    .filter(cutContentText => cutContentText.type === ChosenType && capitalize(cutContentText.category) === ChosenCategory)
    .map(cutContentText => ({ name: cutContentText.name, value: cutContentText.name }))
    .filter(cut => capitalize(cut.name).startsWith(capitalize(interaction.options.getFocused())))
    .slice(0, 25);

  await interaction.respond(filtered);
};
