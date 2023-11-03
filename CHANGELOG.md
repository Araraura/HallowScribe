### 1.1.0 - November 3 2023
- Messages now show a confirmation prompt to the user before sending the message to the channel. This was added to prevent sending the wrong message accidentally
- - Information about the command that was used and the user who sent it will appear on the footer of the message
- Fixed an issue where choosing `Godtuner in Godseeker’s workshop` in `/inspect-prompts` would crash the bot
- Achievement categories are now called "Categories" instead of "Types"
- Renamed `/decision-prompt` to `/decision-prompts`
- Updated packages

### 1.0.5 - July 28 2023
- Multiple links/sources can now be used in `/dev-comments`
- Removed old Discord descriminators from credits

### 1.0.4 - April 22 2023
- Added `/about` command
- Added [MarcelSteak](https://twitter.com/MarcelSteak3) to the list of contributors in `package.json`
- Moved Oro, Mato & Sheo from Quest to Misc
- Moved the White Lady, the Pale King and Snail Shaman from Misc to Quest

### 1.0.3 - April 17 2023
- Updated packages
- Bot status now resets once an hour (Fixes a bug where the status would disappear after starting bot)

### 1.0.2 - March 15 2023
- Added "Cut content:" text to the `/cut-content` embed's title, as well as a notice in the footer
- Updated packages and discord.js to 14.8.0
- Newline at the end of files now required

### 1.0.1 - March 10 2023
- Fixed issue where NPCs with 2 words in their name would not be found
- Fixed a crash when skipping arguments in the `/npcs` command(s)

### 1.0.0 - March 10 2023
- Initial release