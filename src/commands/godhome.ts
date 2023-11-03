import { ActionRowBuilder, ApplicationCommandOptionType, AutocompleteInteraction, ButtonInteraction, CommandInteraction, EmbedBuilder, MessageActionRowComponentBuilder } from "discord.js";
import { ButtonComponent, Discord, Slash, SlashChoice, SlashOption } from "discordx";
import { capitalize, embedColor, errorEmbed, filteredCategory, previewConfirmText, sendButtonComponent } from "../utils.js";
import { promises as fs } from "fs";

const godhomeList = JSON.parse(await fs.readFile("./src/json/Godhome.json", "utf-8")) as {
  name: string;
  category: string;
  locked: string;
  unlocked: string;
  image: string;
}[];
const godhomeCategories = [...new Set(godhomeList.map(pantheonOrStatue => pantheonOrStatue.category))];
const bottomRow = 1;
const topRow = 2;
[godhomeCategories[bottomRow], godhomeCategories[topRow]] = [godhomeCategories[topRow], godhomeCategories[bottomRow]];
const sendCustomId = "sendGodhome";

@Discord()
export class Godhome {
  @ButtonComponent({ id: sendCustomId })
  async sendButtonPressed(interaction: ButtonInteraction): Promise<void> {
    await interaction.update({ components: [sendButtonComponent(sendCustomId, true)] });
    if (!interaction.inGuild()) {
      return void await interaction.user.send({ embeds: [interaction.message.embeds[0]] });
    }
    return void await interaction.channel?.send({ embeds: [interaction.message.embeds[0]] });
  }

  @Slash({ description: "Shows descriptions from Pantheon doors and Hall of Gods statues", name: "godhome" })
  async godhome(
    @SlashChoice(...godhomeCategories)
    @SlashOption({
      type: ApplicationCommandOptionType.String,
      name: "category",
      description: "Display Pantheon doors or Hall of Gods statues",
      required: true,
    })
    godhomeCategory: string,
    @SlashOption({
      autocomplete: async (interaction: AutocompleteInteraction) => {
        await filteredCategory(interaction, "category", interaction.options.getString("category")!, godhomeList);
      },
      type: ApplicationCommandOptionType.String,
      name: "name",
      description: "The name of the Pantheon or Hall of Gods statue",
      required: true,
    })
    pantheonOrStatue: string,
    interaction: CommandInteraction): Promise<void> {
    const godhomeDetails = godhomeList.find((godhomeObject: { name: string; }) => capitalize(godhomeObject.name) === capitalize(pantheonOrStatue));
    if (!godhomeDetails) {
      return void await interaction.reply({ ephemeral: true, embeds: [errorEmbed("This Pantheon or statue does not exist.")] });
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

    if (godhomeDetails.category === "Pantheons") {
      embedContent.embeds.push(pantheonEmbed(godhomeDetails.name, godhomeDetails.unlocked, godhomeDetails.image, godhomeCategory, username));
    } else {
      embedContent.embeds.push(statueEmbed(godhomeDetails.name, godhomeDetails.unlocked, godhomeDetails.locked, godhomeDetails.image, godhomeCategory, username));
    }

    await interaction.reply(embedContent);
  }
}

const pantheonEmbed = (pantheonName: string, pantheonDescription: string, pantheonImage: string, godhomeCategory: string, username: string) => new EmbedBuilder()
  .setColor(embedColor)
  .setTitle(`Godhome: ${pantheonName}`)
  .setDescription(pantheonDescription)
  .setImage(pantheonImage)
  .setFooter({ text: `@${username} used /godhome category: ${godhomeCategory} name: ${pantheonName}` });

const statueEmbed = (statueName: string, statueUnlocked: string, statueLocked: string, statueImage: string, godhomeCategory: string, username: string) => new EmbedBuilder()
  .setColor(embedColor)
  .setTitle(`Hall of Gods: ${statueName}`)
  .setDescription(`
  ${statueUnlocked ? `**Unlocked:**\n${statueUnlocked}\n` : ""}
  ${statueLocked ? `**Locked:**\n${statueLocked}\n` : ""}
    `)
  .setThumbnail(statueImage)
  .setFooter({ text: `@${username} used /godhome category: ${godhomeCategory} name: ${statueName}` });
