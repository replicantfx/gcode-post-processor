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
First Release:  13 NOV 2022

*/ //#######################################################################

let exports = {};
// Allow users to create custom functions in a publically accessible way
import userFunction from "../userCustomization/userFunctions.js";

// A prebuild library of gcode functions. G0, G1, G28, G92.... etc....
import gcodeFunction from "./gcodeFunctions.js";

import rfx from "./rfxLibrary.js";

// Regexs used through out the engine
const MARKER_CODE_START = "<<<";
const MARKER_CODE_END = ">>>";
const MARKER_COMMENT = ";";

// Combined regex for command decomposition
let unknownFunctions = {};
let rfxGlobal = {};
rfxGlobal.appData = {};

//import fs from 'fs';
//rfxGlobal.machine = JSON.parse(fs.readFileSync('../src/userCustomization/machine.json'));
import _machine from "../userCustomization/machine.json" assert { type: "json" };
rfxGlobal.machine = JSON.parse(JSON.stringify(_machine));

rfxGlobal.stack = {};
rfxGlobal.parameter = {
  A: 0,
  B: 0,
  C: 0,
  D: 0,
  E: 0,
  F: 0,
  G: 0,
  H: 0,
  I: 0,
  J: 0,
  K: 0,
  L: 0,
  M: 0,
  N: 0,
  O: 0,
  P: 0,
  Q: 0,
  R: 0,
  S: 0,
  T: 0,
  U: 0,
  V: 0,
  W: 0,
  X: 0,
  Y: 0,
  Z: 0,
  temp: {
    B: 0,
    C: 0,
    E: 0,
  },
  frm: 1,
  exm: 1,
  ssm: 1,
};

const regExNumber = /-?(\d+\.?\d*|\d*\.?\d+)\s*/;
const regExCommand = /((?<![A-Za-z])[A-Za-z])\s*/; // Find Single Character not proceeded by another character
const regExWord = /([A-Za-z]+)\s*/; // Find words combosed of letters only.  Can't have numbers because of how G code represents assignments X# Y# etc...
const regExString = /(?<!\\)"(.*?)(?<!\\)"/; // Find things in Qoutes
const regExPara = /\((.*?)\)/; // Find things in ( )
const regExLine = new RegExp(
  regExPara.source +
    "|" +
    regExString.source +
    "|" +
    regExWord.source +
    "|" +
    regExCommand.source +
    "|" +
    regExNumber.source +
    "|.",
  "g"
);

function parseCommand(command_string, result = {}) {
  if (command_string.length == 0) return result;
  let parts = command_string.match(regExLine);
  for (let i = 0; i < parts.length; i++) {
    if (parts[i] >= "A" && parts[i] <= "Z" && parts[i].length == 1) {
      if (i < parts.length - 1) {
        let n = parseFloat(parts[i + 1]);
        if (!isNaN(n)) {
          result[parts[i]] = rfx.toSigFig(n, rfxGlobal.machine.sigFig);
          i++;
          continue;
        }
      }
    }
    // If a word appears, but isn't associated with a value, add the word to the stack and assign NAN
    result[parts[i]] = NaN;
  }
}
function parseLine(line, result) {
  let commentFlag = false;
  let paraFlag = 0;
  let qouteFlag = 0;
  for (let i = 0; i < line.length; i++) {
    if (line.startsWith(MARKER_CODE_START, i)) {
      result.readingCode = true;
      i += 2;
      continue;
    }
    if (line.startsWith(MARKER_CODE_END, i)) {
      result.readingCode = false;
      result.code += ";";
      i += 2;
      continue;
    }
    if (result.readingCode) {
      if (!result.code) result.code = line[i];
      else result.code += line[i];
      continue;
    }
    if (line.startsWith(MARKER_COMMENT, i)) {
      commentFlag = true;
      continue;
    }
    if (commentFlag) {
      result.comment += line[i];
      continue;
    }
    result.command.raw += line[i];
    if (line[i] == "(") paraFlag++;
    if (line[i] == ")") paraFlag--;
    if (line[i] == '"') {
      qouteFlag = 1 - qouteFlag;
    }
    let c = line[i];
    if (paraFlag == 0 && qouteFlag == 0) {
      if (line[i] == " " || line[i] == "\t") continue;
      c = c.toUpperCase();
    }
    result.command.formatted += c;
  }
  return result;
}
function runCode(_inputObject, _userFunction) {
  // REGEX, match a single letter (p, m, or s), that is not proceeded by a digit or letter, and is followed by a .[one or more letters] =
  let part = _inputObject.stack.code.match(/((?<!w)[pms]*\.[A-Za-z]+\s*=)/g);
  if (!_inputObject.stack.ref) _inputObject.stack["ref"] = [];
  if (part)
    for (let i = 0; i < part.length; i++) {
      let c = part[i].substring(2, part[i].length - 1).trim();
      if (_inputObject.parameter.hasOwnProperty(c)) {
        _inputObject.stack.ref.push(c);
      }
    }

  let fun = new Function("p", "m", "s", "f", _inputObject.stack.code);
  fun(
    _inputObject.parameter,
    _inputObject.machine,
    _inputObject.stack,
    _userFunction
  );

  if (_inputObject.stack.ref)
    for (let i = 0; i < _inputObject.stack.ref.length; i++) {
      let key = _inputObject.stack.ref[i];
      if (key.length == 1) {
        if (typeof rfxGlobal.parameter[key] == "number")
          rfxGlobal.parameter[key] = rfx.toSigFig(
            rfxGlobal.parameter[key],
            rfxGlobal.machine.sigFig
          );
        rfxGlobal.stack.words[key] = rfxGlobal.parameter[key];
      }
    }
}

/*
    Input:  String (Pre-processed)
    Output: String (Post-processed)
*/
exports.executeLine = function (line) {
  // If readingCode == true, then this is a multiline code segment.  Else, clear and format the stack variable for a new line
  if (!rfxGlobal.stack.readingCode) {
    rfxGlobal.stack.code = "";
    rfxGlobal.stack.command = {
      raw: "",
      formatted: "",
    };
    rfxGlobal.stack.comment = "";
    rfxGlobal.stack.words = {};
  }
  /* Perform the initial formatting and splitting of the input line into components
        stack.command = 
        {
            raw:        ="" if empty, "string containing original command portion of line"
            formatted:   = "" if empty, "string containing original command portion of line" formatted as: 
                            - Without whitespaces, 
                            - All characters Capitalized
        }
        stack.comment   = all text after (exclusive) of a ";" character
        stack.code      = all text between (exlusive) <<< and >>>.  If >>> does not occur on same line, it is assumed to be a multiline code segment
        stack.readingCode = true if a <<< has occurred on this or a previous line. false if not previously reading code or >>> occurs on the line
    */
  parseLine(line, rfxGlobal.stack);

  // If reading code, then it is a multiline code block.  Keep reading lines until code closure >>>.  Proceed only with all code within <<< >>> read in.
  if (rfxGlobal.stack.readingCode) return null;

  // Take the formatted command string and break it into command word/value pairs
  parseCommand(rfxGlobal.stack.command.formatted, rfxGlobal.stack.words);

  // Copy all stack words into the parameters list for reference by code, prior to execution.
  // Automatically create new pararmeters if referenced in stack
  for (let key in rfxGlobal.stack.words) {
    rfxGlobal.parameter[key] = rfxGlobal.stack.words[key];
  }

  //##### Process and handle user code in input file #####
  // If stack has user code, then execute it
  if (rfxGlobal.stack.code) {
    // initialize stack.words if previously not set
    if (!rfxGlobal.stack.words) rfxGlobal.stack.words = {};
    runCode(rfxGlobal, userFunction);
  }
  //##### Execute PerLine Code if Defined #####
  if (userFunction.perLine) {
    userFunction.perLine();
  }
  //##### Process normal language (GCODE) commands #####
  if (rfxGlobal.stack.words) {
    let functionStack = [];
    for (let key in rfxGlobal.stack.words) {
      // Gcode command words are "G" and "M" only.  All other letters are parameters
      if (key == "G" || key == "M") {
        functionStack.push(key + rfxGlobal.stack.words[key]);
        continue;
      }
    }
    for (let i = 0; i < functionStack.length; i++) {
      try {
        rfx.execFn(functionStack[i], gcodeFunction);
      } catch (err) {
        // Most likely reason is functon not defined
        if (!unknownFunctions.hasOwnProperty(functionStack[i]))
          unknownFunctions[functionStack[i]] = 0;
        unknownFunctions[functionStack[i]] += 1;
      }
    }
  }
  //All user code and GCode functions that could change position have now been executed.  Update machine.position
  for (let key in rfxGlobal.machine.axis) {
    rfxGlobal.machine.position[key] =
      rfxGlobal.parameter.position.current[key] -
      rfxGlobal.parameter.position.offset[key];
  }
  let output = "";
  if (rfxGlobal.stack.words) {
    // hasFlag allows the program to know if it should apply certian processes.
    let hasFlag = {
      coordinate: false,
      spindle: false,
      feedrate: false,
      extruder: false,
    };
    for (let key in rfxGlobal.stack.words) {
      if (!isNaN(rfxGlobal.stack.words[key]))
        rfxGlobal.parameter[key] = rfxGlobal.stack.words[key];
      if (rfxGlobal.machine.axis.hasOwnProperty(key)) hasFlag.coordinate = true;
      if (key == "E") hasFlag.extruder = true;
      if (key == "F") hasFlag.feedrate = true;
      if (key == "M") {
        if (rfxGlobal.stack.words[key] == 3 || rfxGlobal.stack.words[key] == 4)
          hasFlag.spindle = true;
      }
    }
    // If there are coordinates in the stack, we need to apply the transform to these points
    if (hasFlag.coordinate) {
      if (!rfx.isIdentity(rfxGlobal.machine.transform)) {
        let point = [];
        for (let key in rfxGlobal.machine.axis) {
          point.push(rfxGlobal.parameter[key]);
        }
        // Add one entry to allow for translation in transform matrix
        point.push(1);

        // Apply the machine coordinate transform
        point = rfx.transformPoint(point, rfxGlobal.machine.transform);
        let i = 0;
        for (let key in rfxGlobal.machine.axis) {
          rfxGlobal.stack.words[key] = point[i++];
        }
      }
    }
    // Feedrate, Extruder, and Spindle multipliers for in-code manipulation of these parameters
    if (hasFlag.feedrate) rfxGlobal.stack.words.F *= rfxGlobal.parameter.frm;
    if (hasFlag.extruder) rfxGlobal.stack.words.E *= rfxGlobal.parameter.exm;
    if (hasFlag.spindle) rfxGlobal.stack.words.S *= rfxGlobal.parameter.ssm;

    // Add all word/value pairs to the output string
    for (let key in rfxGlobal.stack.words) {
      // Always add the word
      output += key;
      // Only add a value if the value is a real number
      if (
        rfxGlobal.stack.words[key] != null &&
        !isNaN(rfxGlobal.stack.words[key])
      )
        output += rfx.toSigFig(
          rfxGlobal.stack.words[key],
          rfxGlobal.machine.sigFig
        );
      // Make it pretty by adding a space between commands
      output += " ";
    }
  }

  // Add comment to output if there is a comment on the stack
  if (rfxGlobal.stack.comment) {
    output += ";";
    output += rfxGlobal.stack.comment;
  }

  // Clear the stack in a way that keeps object references intact
  for (let key in rfxGlobal.stack) {
    delete rfxGlobal.stack[key];
  }
  return output;
};
function validateTransform() {
  if (!rfxGlobal.machine.transform) {
    rfxGlobal.writeTo("CAUTION: No transform defined");
    return false;
  }
  if (!rfxGlobal.machine.transform.length) {
    rfxGlobal.writeTo(
      "CAUTION: Transform must be an n x n array, where n = (Number of Axis) + (Extruder) + 1"
    );
    return false;
  }
  if (
    rfxGlobal.machine.transform.length !=
    Object.keys(rfxGlobal.machine.axis).length + 1
  ) {
    rfxGlobal.writeTo(
      "CAUTION: Transform must be an n x n array, where n = (Number of Axis) + (Extruder) + 1"
    );
    return false;
  }
  for (let r = 1; r < rfxGlobal.machine.transform.length; r++) {
    if (
      rfxGlobal.machine.transform[0].length !=
      rfxGlobal.machine.transform[r].length
    ) {
      rfxGlobal.writeTo(
        "CAUTION: Transform must be an n x n array, where n = (Number of Axis) + (Extruder) + 1"
      );
      return false;
    }
  }
  return true;
}
function createIdentitdyMatrix(n) {
  result = [];
  for (let r = 0; r < n; r++) {
    let row = [];
    for (let c = 0; c < n; c++) {
      if (c == r) row.push(1);
      else row.push(0);
    }
    result.push(row);
  }
  return result;
}
function printMatrix(matrix) {
  for (let r = 0; r < matrix.length; r++) {
    let s = "\t[";
    for (let c = 0; c < matrix[r].length; c++) {
      if (c != 0) s += "\t";
      s += rfx.toSigFig(matrix[r][c], 3);
    }
    s += "]";
    rfxGlobal.writeTo(s);
  }
}

exports.init = function () {};
exports.processAll = function (data) {
  if (!data) return "";
  if (data.length == 0) return "";

  //##### Initialize Variables and Environment #####
  unknownFunctions = {};
  rfxGlobal.parameter.position = {
    current: {},
    offset: {},
  };
  rfxGlobal.machine.position = {};
  for (let key in rfxGlobal.machine.axis) {
    rfxGlobal.parameter.position.current[key] = 0;
    rfxGlobal.parameter.position.offset[key] = 0;
    rfxGlobal.machine.position[key] = 0;
  }
  if (!rfxGlobal.machine.units) rfxGlobal.machine.units = "mm";
  rfxGlobal.parameter.units = rfxGlobal.machine.units;
  rfxGlobal.machine.spindle = "off";

  gcodeFunction.init(rfxGlobal);
  userFunction.init(rfxGlobal);

  //##### Initialize and pre build strings #####
  let input = data.toString().split(/\r?\n/);
  let preBody = ";#### Modified by RFX at " + rfx.dateString() + " ####\n";
  let body = "";
  let postBody = "";

  //##### Validate transform and write to output #####
  if (!validateTransform()) {
    rfxGlobal.machine.transform = createIdentitdyMatrix(
      Object.keys(rfxGlobal.machine.axis).length + 1
    );
    preBody += "; CAUTION: Transform automatically set to identity matrix:\n";
  }
  preBody += ";\n; Transform set:\n";
  for (let r = 0; r < rfxGlobal.machine.transform.length; r++) {
    let s = ";\t[";
    for (let c = 0; c < rfxGlobal.machine.transform[r].length; c++) {
      s += "\t";
      s += rfx.toSigFig(rfxGlobal.machine.transform[r][c], 3);
    }
    s += "]\n";
    preBody += s;
  }

  //##### Process lines #####
  for (let i = 0; i < input.length; i++) {
    if (!input[i]) continue;
    if (input[i].length < 0) continue;
    let result = exports.executeLine(input[i]);
    if (result) body += result + "\n";
  }

  //##### Build Output #####
  if (Object.keys(unknownFunctions).length > 0) {
    preBody += ";\n;\tUnknown functions found\n";
    preBody += ";\t\tFunc\tQty\n";
    for (let key in unknownFunctions) {
      preBody += ";\t\t" + key + "\t" + unknownFunctions[key] + "\n";
    }
  }
  console.log(`--- processing complete ---\n`);
  return preBody + "\n" + body + "\n" + postBody;
};
export default exports;
