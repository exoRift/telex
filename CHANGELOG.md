1.1.0
-
### **New Features**
- `|help COMMANDNAME` now brings up an expanded guide for a specific command
- `|find` now provides an easy user mention to copy paste rather than having to add the ID manually

### **Important notes**
- `startpoll` has been changed to `poll`

### **Bug Fixes**
- Unauthorized users can no longer close polls

1.0.0
-
# Rebranding
Guildlink has been rebranded to be Telex

### **New features**
- Changing the transmission channel now supports channel mentions rather than just the name
- Added the ability to initiate a room-wide poll (Looking at you, gaming/faction groups)
- The `find` command now uses a bar delimiter for users with spaces in their name
- Any server in a room can now initiate a poll

### **Quality of life**
- Upgraded to Cyclone 1.3.0
- The status message now alternates between the prefix and room count
- Severval features are now faster

### **Important notes**
- Tweaked the look of invite cards
- Added a check for DM permissions when the password is being changed

### **Bug fixes**
- Added failsafe for when an invite is accepted while already in a room

### **Removed**
- The updates command
- The `dblwidget` command