import { ApplicationCommandOptionType, AutocompleteInteraction, ButtonInteraction, CommandInteraction, EmbedBuilder } from "discord.js";
import { ButtonComponent, Discord, Slash, SlashChoice, SlashOption } from "discordx";
import { capitalize, embedColor, errorEmbed, filteredCategory, previewConfirmText, sendButtonComponent } from "../utils.js";
import { promises as fs } from "fs";

const devNotesList = JSON.parse(await fs.readFile("./src/json/Dev_Notes.json", "utf-8")) as {
  name: string;
  category: string;
  text: string;
}[];
const devNotesCategories = [...new Set(devNotesList.map(note => note.category))];
const sendCustomId = "sendDevNote";

@Discord()
export class DevNotes {
  @ButtonComponent({ id: sendCustomId })
  async sendButtonPressed(interaction: ButtonInteraction): Promise<void> {
    await interaction.update({ components: [sendButtonComponent(sendCustomId, true)] });
    await interaction.channel?.send({ embeds: [interaction.message.embeds[0]] });
  }

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
    const noteDetails = devNotesList.find((devNote: { name: string; }) => capitalize(devNote.name) === capitalize(note));
    if (!noteDetails) {
      return void await interaction.reply({ ephemeral: true, embeds: [errorEmbed("That dev note does not exist.")] });
    }

    await interaction.reply({
      ephemeral: true,
      content: previewConfirmText,
      embeds: [devNoteEmbed(noteDetails.name, noteDetails.text, devNoteCategory, interaction.user.username)],
      components: [sendButtonComponent(sendCustomId, false)]
    });
  }
}

const devNoteEmbed = (devNoteName: string, devNoteText: string, devNoteCategory: string, username: string) => new EmbedBuilder()
  .setColor(embedColor)
  .setTitle(`Developer note: ${devNoteName}`)
  .setDescription(devNoteText)
  .setFooter({ text: `@${username} used /dev-notes category: ${devNoteCategory} name: ${devNoteName}` });
