1.2.0
# Webhook Update

### **New Features
- You can now quote messages with the `quote` command

1.1.1
-
### **New Features**
- You can now choose the length of a poll

### **Important Notes**
- The `create` command no longer has a default for the `pass` argument

### **Bug Fixes**
- Fixed issue where adminrole would not update properly
- Fixed issue where rank badges wouldn't display properly
- Fixed issue where guilds with long names couldn't create rooms due to callsign issues

1.1.0
-
### **New Features**
- `|help COMMANDNAME` now brings up an expanded guide for a specific command
- `|find` now provides an easy user mention to copy paste rather than having to add the ID manually
- Actions pertaining to rooms are now logged for better developer support

### **Important Notes**
- `startpoll` has been changed to `poll`
- Rooms are now created with the `create` command
- "Abbreviations" have been renamed to "Callsigns"
- There are now badges in transmitted messages to define admins, server owners, and the room owner
- Renamed "Management Role" to "Admin Role"
- The announce button has been turned into a command
- The kick button has been turned into a command
- Names can no longer have spaces
- Names can have a maximum of 20 characters
- Passwords can have a maximum of 15 characters
- Pruning now happens daily in a separate process

### **Bug Fixes**
- Unauthorized users can no longer close polls
- Improved general stability
- Fixed an issue with the gif in the `ping` and `shards` commands

1.0.0
-
# Rebranding
Guildlink has been rebranded to be Telex

### **New Features**
- Changing the transmission channel now supports channel mentions rather than just the name
- Added the ability to initiate a room-wide poll (Looking at you, gaming/faction groups)
- The `find` command now uses a bar delimiter for users with spaces in their name
- Any server in a room can now initiate a poll

### **Quality of Life**
- Upgraded to Cyclone 1.3.0
- The status message now alternates between the prefix and room count
- Severval features are now faster

### **Important Notes**
- Tweaked the look of invite cards
- Added a check for DM permissions when the password is being changed

### **Bug Fixes**
- Added failsafe for when an invite is accepted while already in a room

### **Removed**
- The updates command
- The `dblwidget` command