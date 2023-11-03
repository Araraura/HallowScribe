import { ApplicationCommandOptionType, AutocompleteInteraction, CommandInteraction, EmbedBuilder } from "discord.js";
import { Discord, Slash, SlashChoice, SlashOption } from "discordx";
import { capitalize, embedColor, errorEmbed, filteredCategory } from "../utils.js";
import { promises as fs } from "fs";

const devCommentsList = JSON.parse(await fs.readFile("./src/json/Dev_Comments.json", "utf-8")) as {
  name: string;
  source: string;
  text: string;
  link: string;
}[];
const devCommentsSources = [...new Set(devCommentsList.map(comment => comment.source))];

@Discord()
export class DevComments {
  @Slash({ description: "Shows developer comments and sources", name: "dev-comments" })
  async devComments(
    @SlashChoice(...devCommentsSources)
    @SlashOption({
      type: ApplicationCommandOptionType.String,
      name: "source",
      description: "The source of the dev comment",
      required: true,
    })
    devCommentSource: string,
    @SlashOption({
      autocomplete: async (interaction: AutocompleteInteraction) => {
        await filteredCategory(interaction, "source", interaction.options.getString("source")!, devCommentsList);
      },
      type: ApplicationCommandOptionType.String,
      name: "name",
      description: "The name of the dev comment",
      required: true,
    })
    comment: string,
    interaction: CommandInteraction): Promise<void> {
    const commentDetails = devCommentsList.find((devComment: { name: string; }) => capitalize(devComment.name) === capitalize(comment));
    if (!commentDetails) {
      return void await interaction.reply({ ephemeral: true, embeds: [errorEmbed("That dev comment does not exist.")] });
    }

    await interaction.reply({ embeds: [devCommentEmbed(commentDetails.name, commentDetails.text, commentDetails.link)] });
  }
}

const devCommentEmbed = (devCommentName: string, devCommentText: string, devCommentSourceLink: string) => new EmbedBuilder()
  .setColor(embedColor)
  .setTitle(`Developer comment: ${devCommentName}`)
  .setDescription(`${devCommentText}\n\n${processSourceLink(devCommentSourceLink)}`);

const processSourceLink = (linkString: string) => {
  const sourceLinks = linkString.split("%%LINK_SEPARATOR%%");

  if (sourceLinks.length === 1) {
    return `[Source](${sourceLinks[0]})`;
  } else {
    const sources: string[] = [];
    for (let i = 0; i < sourceLinks.length; i++) {
      sources.push(`[Source ${i + 1}](${sourceLinks[i]})`);
    }
    return sources.join(" | ");
  }
};