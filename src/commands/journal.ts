import { ApplicationCommandOptionType, AutocompleteInteraction, CommandInteraction, EmbedBuilder } from "discord.js";
import { Discord, Slash, SlashChoice, SlashOption } from "discordx";
import { capitalize, embedColor, errorEmbed } from "../utils.js";
import { promises as fs } from "fs";

const journalList = JSON.parse(await fs.readFile("./src/json/Journal.json", "utf-8")) as {
  name: string;
  dreamnail: string;
  description: string;
  note: string;
  image: string;
}[];
const journalsAutocomplete: { name: string; value: string; }[] = [];
for (const journal of journalList) {
  journalsAutocomplete.push({ name: journal.name, value: journal.name });
}

@Discord()
export class journal {
  @Slash({ description: "Shows Hunter's Journal descriptions, Hunter's notes and Dream Nail dialogue for each journal entry", name: "journal" })
  async journal(
    @SlashOption({
      autocomplete: async (interaction: AutocompleteInteraction) => {
        const filtered = journalList.filter((el: { name: string; }) => capitalize(el.name).startsWith(capitalize(interaction.options.getFocused())));
        await interaction.respond(
          filtered.map(entry => ({ name: entry.name, value: entry.name })).slice(0, 25),
        );
      },
      type: ApplicationCommandOptionType.String,
      name: "name",
      description: "The name of the journal entry",
      required: true,
    })
      entryName: string,
    @SlashChoice("Full Text", "Description", "Hunter's notes", "Dream Nail")
    @SlashOption({
      type: ApplicationCommandOptionType.String,
      name: "text",
      description: "The description, Hunter's notes or Dream Nail dialogue of this journal entry",
      required: false,
    })
      textType: string,
      interaction: CommandInteraction): Promise<void> {
    const enteredEntryName = capitalize(entryName);
    const journalDetails = journalList.find((c: { name: string; }) => capitalize(c.name) === enteredEntryName);
    if (!journalDetails) {
      return void await interaction.reply({ ephemeral: true, embeds: [errorEmbed("That journal entry does not exist.")] });
    } else if ((!journalDetails.note && textType === "Hunter's notes") || (!journalDetails.dreamnail && textType === "Dream Nail")) {
      return void await interaction.reply({ ephemeral: true, embeds: [errorEmbed(`${textType} text does not exist for this journal entry.`)] });
    }

    switch (textType) {
    case "Description":
      await interaction.reply({ embeds: [journalEmbed(journalDetails.name, journalDetails.description, textType, journalDetails.image)] });
      break;
    case "Hunter's notes":
      await interaction.reply({ embeds: [journalEmbed(journalDetails.name, journalDetails.note, textType, journalDetails.image)] });
      break;
    case "Dream Nail":
      await interaction.reply({ embeds: [journalEmbed(journalDetails.name, journalDetails.dreamnail, textType, journalDetails.image)] });
      break;
    default:
      await interaction.reply({ embeds: [fullJournalEmbed(journalDetails.name, journalDetails.description, journalDetails.note, journalDetails.dreamnail, journalDetails.image)] });
      break;
    }
  }
}

const journalEmbed = (entryName: string, journalText: string, textType: string, entryImage: string) => new EmbedBuilder()
  .setColor(embedColor)
  .setTitle(`Hunter's Journal: ${entryName}`)
  .setDescription(`**${textType}:**\n${journalText}`)
  .setThumbnail(entryImage);

const fullJournalEmbed = (entryName: string, description: string, note: string, dreamnail: string, entryImage: string) => new EmbedBuilder()
  .setColor(embedColor)
  .setTitle(`Hunter's Journal: ${entryName}`)
  .setDescription(`
  ${description ? `**Description:**\n${description}\n` : ""}
  ${note ? `**Hunter's notes:**\n${note}\n` : ""}
  ${dreamnail ? `**Dream Nail:**\n${dreamnail}` : ""}
    `)
  .setThumbnail(entryImage);
