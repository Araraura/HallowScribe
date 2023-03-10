import { ApplicationCommandOptionType, AutocompleteInteraction, CommandInteraction, EmbedBuilder } from "discord.js";
import { Discord, Slash, SlashChoice, SlashOption } from "discordx";
import { capitalize, embedColor, errorEmbed, filteredCategory } from "../utils.js";
import { promises as fs } from "fs";

const achievementList = JSON.parse(await fs.readFile("./src/json/Achievements.json", "utf-8")) as {
  name: string;
  type: string;
  description: string;
  image: string;
}[];
const achievementTypes = [...new Set(achievementList.map(achievement => achievement.type))];

@Discord()
export class Achievements {
  @Slash({ description: "Shows descriptions for achievements", name: "achievements" })
  async achievements(
    @SlashChoice(...achievementTypes)
    @SlashOption({
      type: ApplicationCommandOptionType.String,
      name: "type",
      description: "The type of the achievement",
      required: true,
    })
      achievementType: string,
    @SlashOption({
      autocomplete: async (interaction: AutocompleteInteraction) => {
        await filteredCategory(interaction, "type", interaction.options.getString("type")!, achievementList);
      },
      type: ApplicationCommandOptionType.String,
      name: "achievement",
      description: "The name of the achievement",
      required: true,
    })
      achievement: string,
      interaction: CommandInteraction): Promise<void> {
    const achievementName = capitalize(achievement);
    const achievementDetails = achievementList.find((c: { name: string; }) => capitalize(c.name) === achievementName);
    if (!achievementDetails) {
      return void await interaction.reply({ ephemeral: true, embeds: [errorEmbed("That achievement does not exist.")] });
    }

    await interaction.reply({ embeds: [achievementEmbed(achievementDetails.name, achievementDetails.description, achievementDetails.image)] });
  }
}

const achievementEmbed = (achievementName: string, achievementDescription: string, achievementImage: string) => new EmbedBuilder()
  .setColor(embedColor)
  .setTitle(`Achievement: ${achievementName}`)
  .setDescription(achievementDescription)
  .setThumbnail(achievementImage);
