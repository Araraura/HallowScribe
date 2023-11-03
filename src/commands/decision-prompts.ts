import { ApplicationCommandOptionType, AutocompleteInteraction, CommandInteraction, EmbedBuilder } from "discord.js";
import { Discord, Slash, SlashChoice, SlashOption } from "discordx";
import { capitalize, embedColor, errorEmbed, filteredCategory } from "../utils.js";
import { promises as fs } from "fs";

const decisionList = JSON.parse(await fs.readFile("./src/json/Decision_Prompts.json", "utf-8")) as {
  name: string;
  category: string;
  text: string;
  image: string;
}[];
const decisionCategories = [...new Set(decisionList.map(decision => decision.category))];

@Discord()
export class DecisionPrompts {
  @Slash({ description: "Shows text from decision prompts", name: "decision-prompt" })
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

    await interaction.reply({ embeds: [decisionPromptEmbed(decisionDetails.name, decisionDetails.text, decisionDetails.image)] });
  }
}

const decisionPromptEmbed = (decisionName: string, decisionText: string, decisionImage: string) => new EmbedBuilder()
  .setColor(embedColor)
  .setTitle(`Decision prompt: ${decisionName}`)
  .setDescription(decisionText)
  .setImage(decisionImage);
