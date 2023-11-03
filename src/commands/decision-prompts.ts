import { ApplicationCommandOptionType, AutocompleteInteraction, ButtonInteraction, CommandInteraction, EmbedBuilder } from "discord.js";
import { ButtonComponent, Discord, Slash, SlashChoice, SlashOption } from "discordx";
import { capitalize, embedColor, errorEmbed, filteredCategory, previewConfirmText, sendButtonComponent } from "../utils.js";
import { promises as fs } from "fs";

const decisionList = JSON.parse(await fs.readFile("./src/json/Decision_Prompts.json", "utf-8")) as {
  name: string;
  category: string;
  text: string;
  image: string;
}[];
const decisionCategories = [...new Set(decisionList.map(decision => decision.category))];
const sendCustomId = "sendDecisionPrompt";

@Discord()
export class DecisionPrompts {
  @ButtonComponent({ id: sendCustomId })
  async sendButtonPressed(interaction: ButtonInteraction): Promise<void> {
    await interaction.update({ components: [sendButtonComponent(sendCustomId, true)] });
    if (!interaction.inGuild()) {
      return void await interaction.user.send({ embeds: [interaction.message.embeds[0]] });
    }
    return void await interaction.channel?.send({ embeds: [interaction.message.embeds[0]] });
  }

  @Slash({ description: "Shows text from decision prompts", name: "decision-prompts" })
  async decisionPrompts(
    @SlashChoice(...decisionCategories)
    @SlashOption({
      type: ApplicationCommandOptionType.String,
      name: "category",
      description: "The category of the decision prompt",
      required: true,
    })
    decisionCategory: string,
    @SlashOption({
      autocomplete: async (interaction: AutocompleteInteraction) => {
        await filteredCategory(interaction, "category", interaction.options.getString("category")!, decisionList);
      },
      type: ApplicationCommandOptionType.String,
      name: "decision",
      description: "The name of the decision prompt",
      required: true,
    })
    decision: string,
    interaction: CommandInteraction): Promise<void> {
    const decisionDetails = decisionList.find((decisionPrompt: { name: string; }) => capitalize(decisionPrompt.name) === capitalize(decision));
    if (!decisionDetails) {
      return void await interaction.reply({ ephemeral: true, embeds: [errorEmbed("That decision prompt does not exist.")] });
    }

    await interaction.reply({
      ephemeral: true,
      content: previewConfirmText,
      embeds: [decisionPromptEmbed(decisionDetails.name, decisionDetails.text, decisionDetails.image, decisionCategory, interaction.user.username)],
      components: [sendButtonComponent(sendCustomId, false)]
    });
  }
}

const decisionPromptEmbed = (decisionName: string, decisionText: string, decisionImage: string, decisionCategory: string, username: string) => new EmbedBuilder()
  .setColor(embedColor)
  .setTitle(`Decision prompt: ${decisionName}`)
  .setDescription(decisionText)
  .setImage(decisionImage)
  .setFooter({ text: `@${username} used /decision-prompts category: ${decisionCategory} decision: ${decisionName}` });
