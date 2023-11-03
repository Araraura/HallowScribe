import { ApplicationCommandOptionType, AutocompleteInteraction, ButtonInteraction, CommandInteraction, EmbedBuilder } from "discord.js";
import { ButtonComponent, Discord, Slash, SlashChoice, SlashGroup, SlashOption } from "discordx";
import { capitalize, embedColor, errorEmbed, previewConfirmText, sendButtonComponent } from "../utils.js";
import { promises as fs } from "fs";

const merchantsDirectoryPath = "./src/json/NPCs/Merchants";
const wanderersDirectoryPath = "./src/json/NPCs/Wanderers";
const questDirectoryPath = "./src/json/NPCs/Quest";
const dreamWarriorsDirectoryPath = "./src/json/NPCs/Dream Warriors";
const spiritsDirectoryPath = "./src/json/NPCs/Spirits";
const miscDirectoryPath = "./src/json/NPCs/Miscellaneous";

const merchantsNpc: string[] = [];
const wanderersNpc: string[] = [];
const questNpc: string[] = [];
const dreamWarriorsNpc: string[] = [];
const spiritsNpc: string[] = [];
const miscNpc: string[] = [];

(await fs.readdir(merchantsDirectoryPath)).forEach(file => {
  merchantsNpc.push(file.replace(/^NPC_|\.json$/g, "").replaceAll("_", " "));
});

(await fs.readdir(wanderersDirectoryPath)).forEach(file => {
  wanderersNpc.push(file.replace(/^NPC_|\.json$/g, "").replaceAll("_", " "));
});

(await fs.readdir(questDirectoryPath)).forEach(file => {
  questNpc.push(file.replace(/^NPC_|\.json$/g, "").replaceAll("_", " "));
});

(await fs.readdir(dreamWarriorsDirectoryPath)).forEach(file => {
  dreamWarriorsNpc.push(file.replace(/^NPC_|\.json$/g, "").replaceAll("_", " "));
});

(await fs.readdir(spiritsDirectoryPath)).forEach(file => {
  spiritsNpc.push(file.replace(/^NPC_|\.json$/g, "").replaceAll("_", " "));
});

(await fs.readdir(miscDirectoryPath)).forEach(file => {
  miscNpc.push(file.replace(/^NPC_|\.json$/g, "").replaceAll("_", " "));
});

const sendCustomId = "sendNpc";

@Discord()
@SlashGroup({ description: "Shows dialogue from NPCs", name: "npcs" })
export class NPCs {
  @ButtonComponent({ id: sendCustomId })
  async sendButtonPressed(interaction: ButtonInteraction): Promise<void> {
    await interaction.update({ components: [sendButtonComponent(sendCustomId, true)] });
    if (!interaction.inGuild()) {
      return void await interaction.user.send({ embeds: [interaction.message.embeds[0]] });
    }
    return void await interaction.channel?.send({ embeds: [interaction.message.embeds[0]] });
  }

  @Slash({ description: "Shows dialogue from merchants NPCs" })
  @SlashGroup("npcs")
  async merchants(
    @SlashChoice(...merchantsNpc)
    @SlashOption({
      type: ApplicationCommandOptionType.String,
      name: "name",
      description: "The name of the NPC",
      required: true,
    })
    npc: string,
    @SlashOption({
      autocomplete: async (interaction: AutocompleteInteraction) => {
        await findCategory(interaction, merchantsDirectoryPath);
      },
      type: ApplicationCommandOptionType.String,
      name: "category",
      description: "The category of the dialogue",
      required: true,
    })
    category: string,
    @SlashOption({
      autocomplete: async (interaction: AutocompleteInteraction) => {
        await findDialogue(interaction, merchantsDirectoryPath);
      },
      type: ApplicationCommandOptionType.String,
      name: "dialogue",
      description: "The dialogue of this NPC",
      required: true,
    })
    dialogue: string,
    interaction: CommandInteraction): Promise<void> {
    await sendText(interaction, npc, category, dialogue, merchantsDirectoryPath, "merchants");
  }

  @Slash({ description: "Shows dialogue from wanderers NPCs" })
  @SlashGroup("npcs")
  async wanderers(
    @SlashChoice(...wanderersNpc)
    @SlashOption({
      type: ApplicationCommandOptionType.String,
      name: "name",
      description: "The name of the NPC",
      required: true,
    })
    npc: string,
    @SlashOption({
      autocomplete: async (interaction: AutocompleteInteraction) => {
        await findCategory(interaction, wanderersDirectoryPath);
      },
      type: ApplicationCommandOptionType.String,
      name: "category",
      description: "The category of the dialogue",
      required: true,
    })
    category: string,
    @SlashOption({
      autocomplete: async (interaction: AutocompleteInteraction) => {
        await findDialogue(interaction, wanderersDirectoryPath);
      },
      type: ApplicationCommandOptionType.String,
      name: "dialogue",
      description: "The dialogue of this NPC",
      required: true,
    })
    dialogue: string,
    interaction: CommandInteraction): Promise<void> {
    await sendText(interaction, npc, category, dialogue, wanderersDirectoryPath, "wanderers");
  }

  @Slash({ description: "Shows dialogue from quest NPCs" })
  @SlashGroup("npcs")
  async quest(
    @SlashChoice(...questNpc)
    @SlashOption({
      type: ApplicationCommandOptionType.String,
      name: "name",
      description: "The name of the NPC",
      required: true,
    })
    npc: string,
    @SlashOption({
      autocomplete: async (interaction: AutocompleteInteraction) => {
        await findCategory(interaction, questDirectoryPath);
      },
      type: ApplicationCommandOptionType.String,
      name: "category",
      description: "The category of the dialogue",
      required: true,
    })
    category: string,
    @SlashOption({
      autocomplete: async (interaction: AutocompleteInteraction) => {
        await findDialogue(interaction, questDirectoryPath);
      },
      type: ApplicationCommandOptionType.String,
      name: "dialogue",
      description: "The dialogue of this NPC",
      required: true,
    })
    dialogue: string,
    interaction: CommandInteraction): Promise<void> {
    await sendText(interaction, npc, category, dialogue, questDirectoryPath, "quest");
  }

  @Slash({ description: "Shows dialogue from Dream Warriors NPCs", name: "dream-warriors" })
  @SlashGroup("npcs")
  async dreamWarriors(
    @SlashChoice(...dreamWarriorsNpc)
    @SlashOption({
      type: ApplicationCommandOptionType.String,
      name: "name",
      description: "The name of the NPC",
      required: true,
    })
    npc: string,
    @SlashOption({
      autocomplete: async (interaction: AutocompleteInteraction) => {
        await findCategory(interaction, dreamWarriorsDirectoryPath);
      },
      type: ApplicationCommandOptionType.String,
      name: "category",
      description: "The category of the dialogue",
      required: true,
    })
    category: string,
    @SlashOption({
      autocomplete: async (interaction: AutocompleteInteraction) => {
        await findDialogue(interaction, dreamWarriorsDirectoryPath);
      },
      type: ApplicationCommandOptionType.String,
      name: "dialogue",
      description: "The dialogue of this NPC",
      required: true,
    })
    dialogue: string,
    interaction: CommandInteraction): Promise<void> {
    await sendText(interaction, npc, category, dialogue, dreamWarriorsDirectoryPath, "dream-warriors");
  }

  @Slash({ description: "Shows dialogue from Spirits NPCs" })
  @SlashGroup("npcs")
  async spirits(
    @SlashChoice(...spiritsNpc)
    @SlashOption({
      type: ApplicationCommandOptionType.String,
      name: "name",
      description: "The name of the NPC",
      required: true,
    })
    npc: string,
    @SlashOption({
      autocomplete: async (interaction: AutocompleteInteraction) => {
        await findCategory(interaction, spiritsDirectoryPath);
      },
      type: ApplicationCommandOptionType.String,
      name: "category",
      description: "The category of the dialogue",
      required: true,
    })
    category: string,
    @SlashOption({
      autocomplete: async (interaction: AutocompleteInteraction) => {
        await findDialogue(interaction, spiritsDirectoryPath);
      },
      type: ApplicationCommandOptionType.String,
      name: "dialogue",
      description: "The dialogue of this NPC",
      required: true,
    })
    dialogue: string,
    interaction: CommandInteraction): Promise<void> {
    await sendText(interaction, npc, category, dialogue, spiritsDirectoryPath, "spirits");
  }

  @Slash({ description: "Shows dialogue from miscellaneous NPCs" })
  @SlashGroup("npcs")
  async misc(
    @SlashChoice(...miscNpc)
    @SlashOption({
      type: ApplicationCommandOptionType.String,
      name: "name",
      description: "The name of the NPC",
      required: true,
    })
    npc: string,
    @SlashOption({
      autocomplete: async (interaction: AutocompleteInteraction) => {
        await findCategory(interaction, miscDirectoryPath);
      },
      type: ApplicationCommandOptionType.String,
      name: "category",
      description: "The category of the dialogue",
      required: true,
    })
    category: string,
    @SlashOption({
      autocomplete: async (interaction: AutocompleteInteraction) => {
        await findDialogue(interaction, miscDirectoryPath);
      },
      type: ApplicationCommandOptionType.String,
      name: "dialogue",
      description: "The dialogue of this NPC",
      required: true,
    })
    dialogue: string,
    interaction: CommandInteraction): Promise<void> {
    await sendText(interaction, npc, category, dialogue, miscDirectoryPath, "misc");
  }
}

const npcEmbed = (npcName: string, npcText: string, dialogueCategory: string, npcContext: string, npcImage: string, npcCategory: string, username: string) => new EmbedBuilder()
  .setColor(embedColor)
  .setTitle(`${npcName} - ${dialogueCategory} - ${npcContext}`)
  .setDescription(npcText)
  .setThumbnail(npcImage)
  .setFooter({ text: `@${username} used /npcs ${npcCategory} name: ${npcName} category: ${dialogueCategory} dialogue: ${npcContext}` });

const findCategory = async (interaction: AutocompleteInteraction, directoryPath: string) => {
  const enteredName = interaction.options.getString("name");
  if (!enteredName) {
    return await interaction.respond([]);
  }

  const npcName = enteredName.replaceAll(" ", "_");
  const npcFile = JSON.parse(await fs.readFile(`${directoryPath}/NPC_${npcName}.json`, "utf-8")) as {
    name: string;
    category: string;
    text: string;
  }[];

  const categories = [...new Set(npcFile.map(npc => npc.category))];
  const filtered = categories.filter(c => capitalize(c).startsWith(capitalize(interaction.options.getFocused())));
  await interaction.respond(filtered.map(c => ({ name: c, value: c })).slice(0, 25));
};

const findDialogue = async (interaction: AutocompleteInteraction, directoryPath: string) => {
  const chosenName = capitalize(interaction.options.getString("name")!).replaceAll(" ", "_");
  const chosenCategory = capitalize(interaction.options.getString("category")!);
  if (!chosenName || !chosenCategory) {
    return await interaction.respond([]);
  }

  const npcFile = JSON.parse(await fs.readFile(`${directoryPath}/NPC_${chosenName}.json`, "utf-8")) as {
    name: string;
    category: string;
    text: string;
  }[];

  const filtered = npcFile
    .filter(npcDialogue => capitalize(npcDialogue.category) === chosenCategory)
    .map(npcDialogue => ({ name: npcDialogue.name, value: npcDialogue.name }))
    .filter(c => capitalize(c.name).startsWith(capitalize(interaction.options.getFocused())))
    .slice(0, 25);

  await interaction.respond(filtered);
};

const sendText = async (interaction: CommandInteraction, npcName: string, dialogueCategory: string, dialogue: string, directoryPath: string, npcCategory: string) => {
  const npcFile = JSON.parse(await fs.readFile(`${directoryPath}/NPC_${npcName.replaceAll(" ", "_")}.json`, "utf-8")) as {
    name: string;
    category: string;
    text: string;
  }[];
  const npcImagesFile = JSON.parse(await fs.readFile("./src/json/NPCs/NPCs_Images.json", "utf-8")) as {
    name: string;
    image: string;
  }[];

  const npcDialogueDetails = npcFile.find((npc: { name: string; category: string; }) => capitalize(npc.name) === capitalize(dialogue) && capitalize(npc.category) === capitalize(dialogueCategory));
  if (!npcDialogueDetails) {
    return void await interaction.reply({ ephemeral: true, embeds: [errorEmbed("This dialogue does not exist.")] });
  }

  const npcImage = npcImagesFile.find((npc: { name: string; }) => capitalize(npc.name) === capitalize(npcName));
  await interaction.reply({
    ephemeral: true,
    content: previewConfirmText,
    embeds: [npcEmbed(npcName, npcDialogueDetails.text, npcDialogueDetails.category, npcDialogueDetails.name, npcImage!.image, npcCategory, interaction.user.username)],
    components: [sendButtonComponent(sendCustomId, false)]
  });
};
