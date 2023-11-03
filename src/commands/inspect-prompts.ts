import { ApplicationCommandOptionType, ButtonInteraction, CommandInteraction, EmbedBuilder } from "discord.js";
import { ButtonComponent, Discord, Slash, SlashChoice, SlashOption } from "discordx";
import { embedColor, previewConfirmText, sendButtonComponent } from "../utils.js";
import { promises as fs } from "fs";

const inspectList = JSON.parse(await fs.readFile("./src/json/Inspect_Prompts.json", "utf-8")) as {
  name: string;
  description: string;
  image: string;
}[];
const inspectNames: string[] = [];
for (const prompt of inspectList) {
  inspectNames.push(prompt.name);
}
const sendCustomId = "sendInspectPrompt";

@Discord()
export class Inspect {
  @ButtonComponent({ id: sendCustomId })
  async sendButtonPressed(interaction: ButtonInteraction): Promise<void> {
    await interaction.update({ components: [sendButtonComponent(sendCustomId, true)] });
    await interaction.channel?.send({ embeds: [interaction.message.embeds[0]] });
  }

  @Slash({ description: "Shows text from inspect prompts", name: "inspect-prompts" })
  async inspect(
    @SlashChoice(...inspectNames)
    @SlashOption({
      type: ApplicationCommandOptionType.String,
      name: "prompt",
      description: "The name of the inspect prompt",
      required: true,
    })
    prompt: string,
    interaction: CommandInteraction): Promise<void> {
    const promptDetails = inspectList.find((inspectPrompt: { name: string; }) => inspectPrompt.name === prompt);

    await interaction.reply({
      ephemeral: true,
      content: previewConfirmText,
      embeds: [promptEmbed(promptDetails!.name, promptDetails!.description, promptDetails!.image, interaction.user.username)],
      components: [sendButtonComponent(sendCustomId, false)]
    });
  }
}

const promptEmbed = (promptName: string, promptDescription: string, promptImage: string, username: string) => new EmbedBuilder()
  .setColor(embedColor)
  .setTitle(`Inspect prompt: ${promptName}`)
  .setDescription(promptDescription)
  .setImage(promptImage)
  .setFooter({ text: `@${username} used /inspect-prompts prompt: ${promptName}` });
