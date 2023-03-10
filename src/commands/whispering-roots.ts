import { ApplicationCommandOptionType, CommandInteraction, EmbedBuilder } from "discord.js";
import { Discord, Slash, SlashChoice, SlashOption } from "discordx";
import { promises as fs } from "fs";
import { embedColor } from "../utils.js";

const rootList = JSON.parse(await fs.readFile("./src/json/Whispering_Roots.json", "utf-8")) as {
  name: string;
  text: string;
  image: string;
}[];
const rootNames: string[] = [];
for (const root of rootList) {
  rootNames.push(root.name);
}

@Discord()
export class WhisperingRoots {
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
    await interaction.reply({ embeds: [rootEmbed(rootDetails!.name, rootDetails!.text, rootDetails!.image)] });
  }
}

const rootEmbed = (rootName: string, rootText: string, rootImage: string) => new EmbedBuilder()
  .setColor(embedColor)
  .setTitle(`Whispering Root: ${rootName}`)
  .setDescription(rootText)
  .setImage(rootImage);
