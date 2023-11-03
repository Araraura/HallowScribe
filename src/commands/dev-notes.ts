import { ApplicationCommandOptionType, AutocompleteInteraction, CommandInteraction, EmbedBuilder } from "discord.js";
import { Discord, Slash, SlashChoice, SlashOption } from "discordx";
import { capitalize, embedColor, errorEmbed, filteredCategory } from "../utils.js";
import { promises as fs } from "fs";

const devNotesList = JSON.parse(await fs.readFile("./src/json/Dev_Notes.json", "utf-8")) as {
  name: string;
  category: string;
  text: string;
}[];
const devNotesCategories = [...new Set(devNotesList.map(note => note.category))];

@Discord()
export class DevNotes {
  @Slash({ description: "Shows developer notes found inside the game files", name: "dev-notes" })
  async devNotes(
    @SlashChoice(...devNotesCategories)
    @SlashOption({
      type: ApplicationCommandOptionType.String,
      name: "category",
      description: "The category of the dev note",
      required: true,
    })
      devNoteCategory: string,
    @SlashOption({
      autocomplete: async (interaction: AutocompleteInteraction) => {
        await filteredCategory(interaction, "category", interaction.options.getString("category")!, devNotesList);
      },
      type: ApplicationCommandOptionType.String,
      name: "name",
      description: "The name of the dev note",
      required: true,
    })
      note: string,
      interaction: CommandInteraction): Promise<void> {
    const noteName = capitalize(note);
    const noteDetails = devNotesList.find((devNote: { name: string; }) => capitalize(devNote.name) === noteName);
    if (!noteDetails) {
      return void await interaction.reply({ ephemeral: true, embeds: [errorEmbed("That dev note does not exist.")] });
    }

    await interaction.reply({ embeds: [devNoteEmbed(noteDetails.name, noteDetails.text)] });
  }
}

const devNoteEmbed = (devNoteName: string, devNoteText: string) => new EmbedBuilder()
  .setColor(embedColor)
  .setTitle(`Developer note: ${devNoteName}`)
  .setDescription(devNoteText);
