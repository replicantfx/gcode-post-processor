/*########################## www.replicantfx.com ##########################
    _____                _  _                      _    ______ __   __
    |  __ \              | |(_)                    | |  |  ____|\ \ / /
    | |__) |  ___  _ __  | | _   ___   __ _  _ __  | |_ | |__    \ V / 
    |  _  /  / _ \| '_ \ | || | / __| / _` || '_ \ | __||  __|    > <  
    | | \ \ |  __/| |_) || || || (__ | (_| || | | || |_ | |      / . \ 
    |_|  \_\ \___|| .__/ |_||_| \___| \__,_||_| |_| \__||_|     /_/ \_\
                | |                                                  
                |_|

Created by:     Emily A Shilling
First Release:  6 NOV 2022
Description:
                This is a gcode post processor for standard and 3D printer 
                flavored gcode.  An input file is processed by this engine
                and when the engine encounters a <<<code>>> section, that
                code is executed as javascript.  This allows the user
                extreme customization of the resulting gcode via a 
                language already heavily understood.

Note:           1) log.txt file will not be created when executed from 3rd
                   party gcode generators (prusaSlicer...).  Known bug.

*///#######################################################################
const helpString = `
################################# HELP ####################################

Argument    Value           Note
-h          N/A             Display Help
-o          N/A             Read input file and overwrite it with processed file
--in        Filename.ext    Input filename for processing    
--out       Filename.ext    1) Output filename for processed file 
                            2) If specified, will override -o option)
                            3) If not specified and no -o option, output file name 
                               will be "[input name]-rfx modified.[input ext]"

Embedding Code:
- Any text inside <<<your code here>>> will be executed as javascript.
- Code can be multi-line.  All commands will be added to a rfxGlobal.stack. Once a >>> is found, 
  the command (gcode) will execute, then the javascript. The following would produce:

  ### INPUT ###
    G1 Z1
    G1 X1 Y1 <<<
        if(p.pos.Z > 0)
            p.X = p.X + 1
        else
            p.Y = p.Y + 1
    >>>

  ### OUTPUT ###
    G1 Z1
    G1 X2 Y1

    *///###################################################################

`
// Generate a date string for inclusion in resulting modified file
let date = new Date();
let dateString = (date.getHours()<10?"0"+date.getHours():date.getHours()) + ":" 
    + (date.getMinutes()<10?"0"+date.getMinutes():date.getMinutes()) + ":"
    + (date.getSeconds()<10?"0"+date.getSeconds():date.getSeconds())
    + " " + date.toLocaleDateString('en-us', { weekday: "long", year: "numeric", month: "short", day: "numeric" });

// create and preload a log for export to "log.txt".

let appData = {}
appData.writeTo = function(input, _console = true, _log = true){
    if(_console)
        console.log(input)
    if(_log)
        appData.log += input + "\n";
}
appData.log = "Log File: " + dateString+"\n"
/*####### Handle Arguments #######
    if --in filename is passed, then set inputName to that
    if --in is not passed, exit on error

    if --out filename is passed, then set outputName to that
    if --out is not passed
        if -o is passed, set outputName = inputName
        else, set outputName = inputName+"-rfx modified"
*/
// argument helper function
let readArgValue = function (varName) {
    let varIndex = process.argv.indexOf(varName);
    if (varIndex > -1) {
        if (varIndex < process.argv.length - 1)
            return process.argv[varIndex + 1];
    }
    return null;
}

let inputName = readArgValue('--in');
let outputName = readArgValue('--out');

appData.writeTo("\n--- Process Started ---\n- Use '-h' for help\n- ARGS: " + inputName + " | " + outputName+"\n")
if (process.argv.indexOf('-h') > -1) {
    appData.writeTo(helpString)
}
if (!inputName) {
    appData.writeTo("WARNING: You must specify an input file via --in _____ argument.")
    appData.writeTo("NOTE: Use -h option for help\n--- Terminating on input error ---")
    appData.writeTo(appData.log);
    process.exitCode = 1;
    process.exit();
}
if (!outputName) {
    if (process.argv.indexOf('-o') > -1) {
        outputName = inputName
        appData.writeTo("CAUTION: Write input file in place (overwrite input with output: -o) was selected.")
    }
    else
    {
    outputName = inputName.substring(0, inputName.lastIndexOf('.')) + "-rfx modified" + inputName.substring(inputName.lastIndexOf('.'))
    appData.writeTo(`NOTE: Output file name automatically generated as: "` + outputName)
    }
}
//############################

const fs = require('fs');
//const lineReader = require('line-reader');
const engine = require("./userNoTouch/engine.js");
engine.init(appData);

/*####### Process File #######
    -read input file into an input buffer (array of lines)
    -create output buffer (string) 
    -append output with modification note
    -process each line and append the result to output
    -when done, write output to outputName file
    -when write complete, create log file and write to it
*/
fs.readFile(inputName, function (err, data) {
    if (err) throw err;
    let input = data.toString().split(/\r?\n/)
    let output = ";#### Modified by RFX at "+dateString+" ####\n";

    for (let i = 0; i < input.length; i++) {
        if (!input[i])
            continue;
        if (input[i].length < 0)
            continue;
        let result = engine.executeLine(input[i]);
        if (result)
            output += result + "\n";
    }
    fs.writeFile(outputName, output, function (err) {
        err || appData.writeTo(`--- processing complete ---\n`);
        setTimeout(()=>{
            fs.writeFile("log.txt", appData.log, function (err) {
            });
        }, 1000);
    })
})




