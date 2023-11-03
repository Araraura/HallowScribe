import { ActionRowBuilder, ApplicationCommandOptionType, AutocompleteInteraction, ButtonInteraction, CommandInteraction, EmbedBuilder, MessageActionRowComponentBuilder } from "discord.js";
import { ButtonComponent, Discord, Slash, SlashChoice, SlashOption } from "discordx";
import { capitalize, embedColor, errorEmbed, filteredCategory, previewConfirmText, sendButtonComponent } from "../utils.js";
import { promises as fs } from "fs";

const obtainList = JSON.parse(await fs.readFile("./src/json/Obtain_Prompts.json", "utf-8")) as {
  name: string;
  category: string;
  description: string;
  text: string;
  image: string;
}[];
const obtainCategories = [...new Set(obtainList.map(prompt => prompt.category))];
const sendCustomId = "sendObtainPrompt";

@Discord()
export class ObtainPrompts {
  @ButtonComponent({ id: sendCustomId })
  async sendButtonPressed(interaction: ButtonInteraction): Promise<void> {
    await interaction.update({ components: [sendButtonComponent(sendCustomId, true)] });
    await interaction.channel?.send({ embeds: [interaction.message.embeds[0]] });
  }

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
    const promptDetails = obtainList.find((obtainPrompt: { name: string; }) => capitalize(obtainPrompt.name) === capitalize(obtainable));
    if (!promptDetails) {
      return void await interaction.reply({ ephemeral: true, embeds: [errorEmbed("This prompt does not exist.")] });
    }

    if (!promptDetails.description && textType === "Description") {
      return void await interaction.reply({ ephemeral: true, embeds: [errorEmbed("That prompt does not have a description.")] });
    }

    const username = interaction.user.username;
    const embedContent: {
      ephemeral: boolean;
      content: string;
      embeds: EmbedBuilder[];
      components: ActionRowBuilder<MessageActionRowComponentBuilder>[];
    } = {
      ephemeral: true,
      content: previewConfirmText,
      embeds: [],
      components: [sendButtonComponent(sendCustomId, false)]
    };

    switch(textType) {
      case "Short Text":
        embedContent.embeds.push(promptEmbed(promptDetails.name, promptDetails.text, textType, promptDetails.image, obtainableCategory, username));
        break;
      case "Description":
        embedContent.embeds.push(promptEmbed(promptDetails.name, promptDetails.description, textType, promptDetails.image, obtainableCategory, username));
        break;
      default:
        embedContent.embeds.push(fullPromptEmbed(promptDetails.name, promptDetails.description, promptDetails.text, promptDetails.image, obtainableCategory, textType, username));
        break;
    }

    await interaction.reply(embedContent);
  }
}

const promptEmbed = (promptName: string, promptText: string, textType: string, promptImage: string, promptCategory: string, username: string) => new EmbedBuilder()
  .setColor(embedColor)
  .setTitle(`Obtainable: ${promptName}`)
  .setDescription(`**${textType}:**\n${promptText}`)
  .setImage(promptImage)
  .setFooter({ text: `@${username} used /obtain-prompts category: ${promptCategory} obtainable: ${promptName} text: ${textType}` });

const fullPromptEmbed = (promptName: string, promptDescription: string, promptShortText: string, promptImage: string, promptCategory: string, textType: string, username: string) => new EmbedBuilder()
  .setColor(embedColor)
  .setTitle(`Obtainable: ${promptName}`)
  .setDescription(`
  ${promptShortText ? `**Short Text:**\n${promptShortText}\n` : ""}
  ${promptDescription ? `**Description:**\n${promptDescription}\n` : ""}
    `)
  .setImage(promptImage)
  .setFooter({ text: `@${username} used /obtain-prompts category: ${promptCategory} obtainable: ${promptName}${textType ? " text: Full Text" : ""}` });
