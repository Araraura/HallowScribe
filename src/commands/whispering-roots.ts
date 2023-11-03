import { ApplicationCommandOptionType, ButtonInteraction, CommandInteraction, EmbedBuilder } from "discord.js";
import { ButtonComponent, Discord, Slash, SlashChoice, SlashOption } from "discordx";
import { promises as fs } from "fs";
import { embedColor, previewConfirmText, sendButtonComponent } from "../utils.js";

const rootList = JSON.parse(await fs.readFile("./src/json/Whispering_Roots.json", "utf-8")) as {
  name: string;
  text: string;
  image: string;
}[];
const rootNames: string[] = [];
for (const root of rootList) {
  rootNames.push(root.name);
}
const sendCustomId = "sendWhisperingRoot";

@Discord()
export class WhisperingRoots {
  @ButtonComponent({ id: sendCustomId })
  async sendButtonPressed(interaction: ButtonInteraction): Promise<void> {
    await interaction.update({ components: [sendButtonComponent(sendCustomId, true)] });
    if (!interaction.inGuild()) {
      return void await interaction.user.send({ embeds: [interaction.message.embeds[0]] });
    }
    return void await interaction.channel?.send({ embeds: [interaction.message.embeds[0]] });
  }

  @Slash({ description: "Shows text from Whispering Roots", name: "whispering-roots" })
  async whisperingRoots(
    @SlashChoice(...rootNames)
    @SlashOption({
      type: ApplicationCommandOptionType.String,
      name: "name",
      description: "The name of the Whispering Root",
      required: true,
    })
    name: string,
    interaction: CommandInteraction): Promise<void> {
    const rootDetails = rootList.find((root: { name: string; }) => root.name === name);
    await interaction.reply({
      ephemeral: true,
      content: previewConfirmText,
      embeds: [rootEmbed(name, rootDetails!.text, rootDetails!.image, interaction.user.username)],
      components: [sendButtonComponent(sendCustomId, false)]
    });
  }
}

const rootEmbed = (rootName: string, rootText: string, rootImage: string, username: string) => new EmbedBuilder()
  .setColor(embedColor)
  .setTitle(`Whispering Root: ${rootName}`)
  .setDescription(rootText)
  .setImage(rootImage)
  .setFooter({ text: `@${username} used /whispering-roots name: ${rootName}` });
