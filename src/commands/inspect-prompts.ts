import { ApplicationCommandOptionType, CommandInteraction, EmbedBuilder } from "discord.js";
import { Discord, Slash, SlashChoice, SlashOption } from "discordx";
import { capitalize, embedColor } from "../utils.js";
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

@Discord()
export class Inspect {
  @Slash({ description: "Shows descriptions for inspect prompts", name: "inspect-prompts" })
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
    const promptDetails = inspectList.find((c: { name: string; }) => capitalize(c.name) === prompt);

    await interaction.reply({ embeds: [promptEmbed(promptDetails!.name, promptDetails!.description, promptDetails!.image)] });
  }
}

const promptEmbed = (promptName: string, promptDescription: string, promptImage: string) => new EmbedBuilder()
  .setColor(embedColor)
  .setTitle(`Inspect prompt: ${promptName}`)
  .setDescription(promptDescription)
  .setImage(promptImage);
