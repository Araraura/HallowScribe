/* eslint-disable @typescript-eslint/no-explicit-any, no-magic-numbers */
import { AutocompleteInteraction, EmbedBuilder } from "discord.js";

const embedColor = "#32c192";

const capitalize = (string: string) => {
  return string.trim().split(" ").map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()).join(" ").replaceAll(" Of ", " of ").replaceAll(" The ", " the ");
};

const filteredCategory = async (interaction: AutocompleteInteraction, categoryName: string, chosenCategory: string, itemList: any) => {
  const filtered = itemList.filter((el: any) => el[categoryName] === chosenCategory && capitalize(el.name).startsWith(capitalize(interaction.options.getFocused())));
  await interaction.respond(filtered.map((el: any) => ({ name: el.name, value: el.name })).slice(0, 25));
};

const errorEmbed = (error: string) => new EmbedBuilder()
  .setColor("#e86b6b")
  .setDescription(error);

export { embedColor, errorEmbed, capitalize, filteredCategory };