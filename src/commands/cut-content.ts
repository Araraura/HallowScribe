import { ApplicationCommandOptionType, AutocompleteInteraction, ButtonInteraction, CommandInteraction, EmbedBuilder } from "discord.js";
import { ButtonComponent, Discord, Slash, SlashChoice, SlashOption } from "discordx";
import { capitalize, embedColor, errorEmbed, previewConfirmText, sendButtonComponent } from "../utils.js";
import { promises as fs } from "fs";

const cutContentList = JSON.parse(await fs.readFile("./src/json/Cut_Content.json", "utf-8")) as {
  name: string;
  type: string;
  category: string;
  text: string;
}[];
const cutContentTypes = [...new Set(cutContentList.map(content => content.type))];
const sendCustomId = "sendCutContent";

@Discord()
export class CutContent {
  @ButtonComponent({ id: sendCustomId })
  async sendButtonPressed(interaction: ButtonInteraction): Promise<void> {
    await interaction.update({ components: [sendButtonComponent(sendCustomId, true)] });
    if (!interaction.inGuild()) {
      return void await interaction.user.send({ embeds: [interaction.message.embeds[0]] });
    }
    return void await interaction.channel?.send({ embeds: [interaction.message.embeds[0]] });
  }

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

    await interaction.reply({
      ephemeral: true,
      content: previewConfirmText,
      embeds: [cutContentEmbed(cutContentDetails.name, cutContentDetails.category, cutContentDetails.text, cutContentType, interaction.user.username)],
      components: [sendButtonComponent(sendCustomId, false)]
    });
  }
}

const cutContentEmbed = (cutContentName: string, cutContentCategory: string, cutContentText: string, cutContentType: string, username: string) => new EmbedBuilder()
  .setColor(embedColor)
  .setTitle(`Cut content: ${cutContentName} - ${cutContentCategory}`)
  .setDescription(cutContentText)
  .setFields({ name: "\u200B", value: "***Note**: Cut content should not be considered canon.*" })
  .setFooter({ text: `@${username} used /cut-content type: ${cutContentType} category: ${cutContentCategory} name: ${cutContentName}` });

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
