import { CommandInteraction, EmbedBuilder } from "discord.js";
import { Discord, Slash } from "discordx";
import PackageJson from "../../package.json" assert { type: "json" };
import { embedColor } from "../utils.js";

@Discord()
export class Help {
  @Slash({ description: "List of HallowScribe commands", name: "help" })
  async help(interaction: CommandInteraction): Promise<void> {
    const botAvatar = interaction.client.user.displayAvatarURL({ extension: "png", size: 1024 });
    await interaction.reply({ ephemeral: true, embeds: [helpEmbed(botAvatar)] });
  }
}

const helpEmbed = (botAvatar: string) => new EmbedBuilder()
  .setColor(embedColor)
  .setTitle("HallowScribe - List of Commands")
  .setDescription(`
  This bot allows you to pull any piece of text from Hollow Knight, sorted by different commands and categories.\n
  [Report bugs here](${PackageJson.bugs.url})`)
  .setThumbnail(botAvatar)
  .setFields(
    { name: "• Dialogue from NPCs", value: "`/npcs <Type> [Name*] [Category*] [Dialogue*]`" },
    { name: "• Hunter's Journal entries and enemies' Dream Nail dialogue", value: "`/journal [Name*] [Text]`" },
    { name: "• Hallownest's Lore Tablets", value: "`/lore-tablets [Area*] [Name*]`" },
    { name: "• Charm descriptions", value: "`/charms [Category*] [Charm*]`" },
    { name: "• Text from Pantheon doors or statues in Hall of Gods", value: "`/godhome [Category*] [PantheonOrDoor*]`" },
    { name: "• Text from using the Dream Nail", value: "`/dream-nail [Area*] [Name*]`" },
    { name: "• Text from obtainable items/abilities", value: "`/obtain-prompts [Category*] [Obtainable*] [Text]`" },
    { name: "• Text from inspecting various objects", value: "`/inspect-prompts [Prompt*]`" },
    { name: "• Text from using the Dream Nail on Whispering Roots", value: "`/whispering-roots [Name*]`" },
    { name: "• Achievements' descriptions", value: "`/achievements [Type*] [Achievement*]`" },
    { name: "• Item descriptions in the Inventory", value: "`/inventory [Category*] [Item*]`" },
    { name: "• Text from in-game decision prompts", value: "`/decision-prompts [Category*] [Decision*]`" },
    { name: "• Text from Shrine of Believers tablets", value: "`/shrine-of-believers [Row*] [Believer*]`" },
    { name: "• Developer comments and sources", value: "`/dev-comments [Source*] [Name*]`" },
    { name: "• Developer notes found in the game files", value: "`/dev-notes [Category*] [Name*]`" },
    { name: "• Cut content found in the game files", value: "`/cut-content [Type*] [Category*] [Name*]`" },
  )
  .setFooter({ text: `Version ${PackageJson.version}\nHallowScribe made by Araraura#0001 & mossbag#0563\nIcon by @MarcelSteak3` });
