/* eslint-disable @typescript-eslint/no-explicit-any */
import { ActionRowBuilder, AutocompleteInteraction, ButtonBuilder, ButtonStyle, EmbedBuilder, MessageActionRowComponentBuilder } from "discord.js";

const embedColor = "#32c192";
const previewConfirmText = "**Preview** - Is this the message you want to send?"

const capitalize = (string: string) => {
  if (typeof string !== "string") return "";
  return string.trim().split(" ").map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()).join(" ").replaceAll(" Of ", " of ").replaceAll(" The ", " the ");
};

const filteredCategory = async (interaction: AutocompleteInteraction, categoryName: string, chosenCategory: string, itemList: any) => {
  const filtered = itemList.filter((el: any) => el[categoryName] === chosenCategory && capitalize(el.name).startsWith(capitalize(interaction.options.getFocused())));
  await interaction.respond(filtered.map((el: any) => ({ name: el.name, value: el.name })).slice(0, 25));
};

const sendButtonComponent = (customId: string, disabled: boolean) => {
  const sendButton = new ButtonBuilder()
    .setLabel("Send this message")
    .setStyle(ButtonStyle.Primary)
    .setCustomId(customId)
    .setDisabled(disabled);
  return new ActionRowBuilder<MessageActionRowComponentBuilder>().addComponents(sendButton);
}

const errorEmbed = (error: string) => new EmbedBuilder()
  .setColor("#e86b6b")
  .setDescription(error);

export { embedColor, previewConfirmText, capitalize, filteredCategory, sendButtonComponent, errorEmbed };
