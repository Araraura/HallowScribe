import { ApplicationCommandOptionType, AutocompleteInteraction, CommandInteraction, EmbedBuilder } from "discord.js";
import { Discord, Slash, SlashChoice, SlashOption } from "discordx";
import { capitalize, embedColor, errorEmbed, filteredCategory } from "../utils.js";
import { promises as fs } from "fs";

const obtainList = JSON.parse(await fs.readFile("./src/json/Obtain_Prompts.json", "utf-8")) as {
  name: string;
  category: string;
  description: string;
  text: string;
  image: string;
}[];
const obtainCategories = [...new Set(obtainList.map(prompt => prompt.category))];

@Discord()
export class ObtainPrompts {
  @Slash({ description: "Shows prompts for obtainable items/abilities", name: "obtain-prompts" })
  async obtainPrompts(
    @SlashChoice(...obtainCategories)
    @SlashOption({
      type: ApplicationCommandOptionType.String,
      name: "category",
      description: "The category of the obtainable item/ability",
      required: true,
    })
      obtainableCategory: string,
    @SlashOption({
      autocomplete: async (interaction: AutocompleteInteraction) => {
        await filteredCategory(interaction, "category", interaction.options.getString("category")!, obtainList);
      },
      type: ApplicationCommandOptionType.String,
      name: "obtainable",
      description: "The name of the obtainable item/ability",
      required: true,
    })
      obtainable: string,
    @SlashChoice("Full Text", "Short Text", "Description")
    @SlashOption({
      type: ApplicationCommandOptionType.String,
      name: "text",
      description: "The short text or description of the prompt",
      required: false,
    })
      textType: string,
      interaction: CommandInteraction): Promise<void> {
    const promptName = capitalize(obtainable);
    const promptDetails = obtainList.find((c: { name: string; }) => capitalize(c.name) === promptName);
    if (!promptDetails) {
      return void await interaction.reply({ ephemeral: true, embeds: [errorEmbed("This prompt does not exist.")] });
    }

    if (!promptDetails.description && textType === "Description") {
      return void await interaction.reply({ ephemeral: true, embeds: [errorEmbed("That prompt does not have a description.")] });
    }

    if (textType === "Short Text") {
      await interaction.reply({ embeds: [promptEmbed(promptDetails.name, promptDetails.text, textType, promptDetails.image)] });
    } else if (textType === "Description") {
      await interaction.reply({ embeds: [promptEmbed(promptDetails.name, promptDetails.description, textType, promptDetails.image)] });
    } else {
      await interaction.reply({ embeds: [fullPromptEmbed(promptDetails.name, promptDetails.description, promptDetails.text, promptDetails.image)] });
    }
  }
}

const promptEmbed = (promptName: string, promptText: string, textType: string, promptImage: string) => new EmbedBuilder()
  .setColor(embedColor)
  .setTitle(`Obtainable: ${promptName}`)
  .setDescription(`**${textType}:**\n${promptText}`)
  .setImage(promptImage);

const fullPromptEmbed = (promptName: string, promptDescription: string, promptShortText: string, promptImage: string) => new EmbedBuilder()
  .setColor(embedColor)
  .setTitle(`Obtainable: ${promptName}`)
  .setDescription(`
  ${promptShortText ? `**Short Text:**\n${promptShortText}\n` : ""}
  ${promptDescription ? `**Description:**\n${promptDescription}\n` : ""}
    `)
  .setImage(promptImage);
