import { ActionRowBuilder, ApplicationCommandOptionType, AutocompleteInteraction, ButtonInteraction, CommandInteraction, EmbedBuilder, MessageActionRowComponentBuilder } from "discord.js";
import { ButtonComponent, Discord, Slash, SlashChoice, SlashOption } from "discordx";
import { capitalize, embedColor, errorEmbed, previewConfirmText, sendButtonComponent } from "../utils.js";
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
const sendCustomId = "sendJournal";

@Discord()
export class journal {
  @ButtonComponent({ id: sendCustomId })
  async sendButtonPressed(interaction: ButtonInteraction): Promise<void> {
    await interaction.update({ components: [sendButtonComponent(sendCustomId, true)] });
    if (!interaction.inGuild()) {
      return void await interaction.user.send({ embeds: [interaction.message.embeds[0]] });
    }
    return void await interaction.channel?.send({ embeds: [interaction.message.embeds[0]] });
  }

  @Slash({ description: "Shows Hunter's Journal descriptions, Hunter's notes and Dream Nail dialogue for each journal entry", name: "journal" })
  async journal(
    @SlashOption({
      autocomplete: async (interaction: AutocompleteInteraction) => {
        const filtered = journalList.filter((journalEntry: { name: string; }) => capitalize(journalEntry.name).startsWith(capitalize(interaction.options.getFocused())));
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
    const journalDetails = journalList.find((journalEntry: { name: string; }) => capitalize(journalEntry.name) === capitalize(entryName));
    if (!journalDetails) {
      return void await interaction.reply({ ephemeral: true, embeds: [errorEmbed("That journal entry does not exist.")] });
    } else if ((!journalDetails.note && textType === "Hunter's notes") || (!journalDetails.dreamnail && textType === "Dream Nail")) {
      return void await interaction.reply({ ephemeral: true, embeds: [errorEmbed(`${textType} text does not exist for this journal entry.`)] });
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

    switch (textType) {
      case "Description":
        embedContent.embeds.push(journalEmbed(journalDetails.name, journalDetails.description, textType, journalDetails.image, username));
        break;
      case "Hunter's notes":
        embedContent.embeds.push(journalEmbed(journalDetails.name, journalDetails.note, textType, journalDetails.image, username));
        break;
      case "Dream Nail":
        embedContent.embeds.push(journalEmbed(journalDetails.name, journalDetails.dreamnail, textType, journalDetails.image, username));
        break;
      default:
        embedContent.embeds.push(fullJournalEmbed(journalDetails.name, journalDetails.description, journalDetails.note, journalDetails.dreamnail, journalDetails.image, textType, username));
        break;
    }

    await interaction.reply(embedContent);
  }
}

const journalEmbed = (entryName: string, journalText: string, textType: string, entryImage: string, username: string) => new EmbedBuilder()
  .setColor(embedColor)
  .setTitle(`Hunter's Journal: ${entryName}`)
  .setDescription(`**${textType}:**\n${journalText}`)
  .setThumbnail(entryImage)
  .setFooter({ text: `@${username} used /journal name: ${entryName} text: ${textType}` });

const fullJournalEmbed = (entryName: string, description: string, note: string, dreamnail: string, entryImage: string, textType: string, username: string) => new EmbedBuilder()
  .setColor(embedColor)
  .setTitle(`Hunter's Journal: ${entryName}`)
  .setDescription(`
  ${description ? `**Description:**\n${description}\n` : ""}
  ${note ? `**Hunter's notes:**\n${note}\n` : ""}
  ${dreamnail ? `**Dream Nail:**\n${dreamnail}` : ""}
    `)
  .setThumbnail(entryImage)
  .setFooter({ text: `@${username} used /journal name: ${entryName}${textType ? " text: Full Text" : ""}` });
