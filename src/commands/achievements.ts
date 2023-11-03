import { ApplicationCommandOptionType, AutocompleteInteraction, ButtonInteraction, CommandInteraction, EmbedBuilder } from "discord.js";
import { ButtonComponent, Discord, Slash, SlashChoice, SlashOption } from "discordx";
import { capitalize, embedColor, errorEmbed, filteredCategory, previewConfirmText, sendButtonComponent } from "../utils.js";
import { promises as fs } from "fs";

const achievementList = JSON.parse(await fs.readFile("./src/json/Achievements.json", "utf-8")) as {
  name: string;
  category: string;
  description: string;
  image: string;
}[];
const achievementCategories = [...new Set(achievementList.map(achievement => achievement.category))];
const sendCustomId = "sendAchievement";

@Discord()
export class Achievements {
  @ButtonComponent({ id: sendCustomId })
  async sendButtonPressed(interaction: ButtonInteraction): Promise<void> {
    await interaction.update({ components: [sendButtonComponent(sendCustomId, true)] });
    await interaction.channel?.send({ embeds: [interaction.message.embeds[0]] });
  }

  @Slash({ description: "Shows descriptions for achievements", name: "achievements" })
  async achievements(
    @SlashChoice(...achievementCategories)
    @SlashOption({
      type: ApplicationCommandOptionType.String,
      name: "category",
      description: "The category of the achievement",
      required: true,
    })
    achievementCategory: string,
    @SlashOption({
      autocomplete: async (interaction: AutocompleteInteraction) => {
        await filteredCategory(interaction, "category", interaction.options.getString("category")!, achievementList);
      },
      type: ApplicationCommandOptionType.String,
      name: "achievement",
      description: "The name of the achievement",
      required: true,
    })
    achievement: string,
    interaction: CommandInteraction): Promise<void> {
    const achievementDetails = achievementList.find((achievementDetail: { name: string; }) => capitalize(achievementDetail.name) === capitalize(achievement));
    if (!achievementDetails) {
      return void await interaction.reply({ ephemeral: true, embeds: [errorEmbed("That achievement does not exist.")] });
    }

    await interaction.reply({
      ephemeral: true,
      content: previewConfirmText,
      embeds: [achievementEmbed(achievementDetails.name, achievementDetails.description, achievementDetails.image, achievementCategory, interaction.user.username)],
      components: [sendButtonComponent(sendCustomId, false)]
    });
  }
}

const achievementEmbed = (achievementName: string, achievementDescription: string, achievementImage: string, achievementCategory: string, username: string) => new EmbedBuilder()
  .setColor(embedColor)
  .setTitle(`Achievement: ${achievementName}`)
  .setDescription(achievementDescription)
  .setThumbnail(achievementImage)
  .setFooter({ text: `@${username} used /achievements category: ${achievementCategory} achievement: ${achievementName}` });
