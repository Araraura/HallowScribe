import { APIEmbedField, CommandInteraction, EmbedBuilder, RestOrArray } from "discord.js";
import { Discord, Slash } from "discordx";
import PackageJSON from "../../package.json" assert { type: "json" };
import { embedColor } from "../utils.js";

@Discord()
export class About {
  @Slash({ description: "About HallowScribe", name: "about" })
  async about(interaction: CommandInteraction): Promise<void> {
    const botAvatar = interaction.client.user.displayAvatarURL({ extension: "png", size: 1024 });
    await interaction.reply({ embeds: [aboutEmbed(botAvatar)] });
  }
}

function formatContributors(input: string[]): RestOrArray<APIEmbedField> {
  const fields: RestOrArray<APIEmbedField> = [];

  for (const str of input) {
    const startIndex = str.indexOf("(");
    const endIndex = str.indexOf(")");
    if (startIndex === -1 || endIndex === -1) {
      throw new Error("Invalid input. Must include a name followed by a URL surrounded by parenthesis.");
    }
    const contributor = str.substring(0, startIndex).trim();
    const url = str.substring(startIndex + 1, endIndex);
    fields.push({ name: contributor, value: url });
  }

  return fields;
}

const aboutEmbed = (botAvatar: string) => new EmbedBuilder()
  .setColor(embedColor)
  .setTitle("HallowScribe")
  .setURL(PackageJSON.homepage)
  .setDescription(`
  This bot allows you to pull and display any piece of text from Hollow Knight, sorted by different commands and categories.\n
  If you find any errors or have any suggestions, you can [tell us here](${PackageJSON.bugs.url}).\n
  For the list of commands, use \`/help\``)
  .setThumbnail(botAvatar)
  .setFields({ name: "\u200B", value: "__Credits:__" })
  .addFields(...formatContributors(PackageJSON.contributors))
  .setFooter({ text: `Version ${PackageJSON.version}` });
