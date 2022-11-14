@echo off
set FILE=%1
node "%~dp0\rfxGcodePP.js" --in %FILE% -o
PAUSE Rem Remove this line if you want the command window to close automatically after processing.