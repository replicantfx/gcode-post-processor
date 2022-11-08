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

*///#######################################################################

// Allow users to create custom functions in a publically accessible way
const userFunction = require("../userCustomization/userFunctions.js");
// A prebuild library of gcode functions. G0, G1, G28, G92.... etc....
const gcodeFunction = require("./gcodeFunctions.js");

// Regexs used through out the engine
const regExNumber = /-?(\d+\.?\d*|\d*\.?\d+)\s*/
const regExCommand = /((?<![A-Za-z])[A-Za-z])\s*/     // Find Single Character not proceeded by another character
const regExWord = /([A-Za-z]+)\s*/                       // Find words combosed of letters only.  Can't have numbers because of how G code represents assignments X# Y# etc...
const regExString = /(?<!\\)"(.*?)(?<!\\)"/         // Find things in Qoutes
const regExPara = /\((.*?)\)/                       // Find things in ( )

// Combined regex for command decomposition 
const regExLine = new RegExp(regExPara.source + '|' + regExString.source + '|' + regExWord.source + '|' + regExCommand.source + '|' + regExNumber.source + '|.', 'g')

let rfxGlobal = {};
rfxGlobal.machine = require("../userCustomization/machine.json");
rfxGlobal.stack = {};
rfxGlobal.appData = {};

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
        E0: 0
    }
};
function parseCommand(command_string, result = {}) {
    if(command_string.length==0)
        return result;
    let parts = command_string.match(regExLine);
    for (let i = 0; i < parts.length; i++) {

    }
    for (let i = 0; i < parts.length; i++) {
        if (parts[i] >= 'A' && parts[i] <= 'Z' && parts[i].length == 1) {
            if (i < parts.length - 1) {
                let n = parseFloat(parts[i + 1]);
                if (!isNaN(n)) {
                    result[parts[i]] = n;
                    i++;
                    continue;
                }
            }
        }
        result[parts[i]] = NaN;
    }
    return result;
}
function parseLine(line, result) {
    let commentFlag = false;
    let paraFlag = 0;
    let qouteFlag = 0;
    for (let i = 0; i < line.length; i++) {
        if (line.startsWith('<<<', i)) {
            result.readingCode = true;
            i += 2;
            continue;
        }
        if (line.startsWith('>>>', i)) {
            result.readingCode = false;
            result.code += ";"
            i += 2;
            continue;
        }
        if (result.readingCode) {
            if (!result.code)
                result.code = line[i];
            else
                result.code += line[i];
            continue;
        }
        if (line[i] == ';') {
            commentFlag = true;
            continue;
        }
        if (commentFlag) {
            result.comment += line[i];
            continue;
        }
        result.command.raw += line[i];
        if (line[i] == '(')
            paraFlag++;
        if (line[i] == ')')
            paraFlag--;
        if (line[i] == '"') {
            qouteFlag = 1 - qouteFlag;
        }
        let c = line[i];
        if (paraFlag == 0 && qouteFlag == 0) {
            if (line[i] == ' ' || line[i] == '\t')
                continue;
            c = c.toUpperCase();
        }
        result.command.formated += c
    }
    return result;
}
function runCode(_inputObject, _userFunction) {
    let paraRegEx = /([pms]*\.[A-Za-z]+\s*=)/g;
    let part = _inputObject.stack.code.match(paraRegEx);
    if (!_inputObject.stack.ref)
        _inputObject.stack["ref"] = [];
    if (part)
        for (let i = 0; i < part.length; i++) {
            let c = part[i].substring(2, part[i].length - 1).trim();
            if (_inputObject.parameter.hasOwnProperty(c)) {
                _inputObject.stack.ref.push(c);
            }
        }
    let fun = new Function(_inputObject.stack.code);
    fun(p = _inputObject.parameter, m = _inputObject.machine, s = _inputObject.stack, f = _userFunction);
    for (let i = 0; i < _inputObject.stack.ref.length; i++) {
        let key = _inputObject.stack.ref[i];
        if (key.length == 1) {
            rfxGlobal.stack.words[key] = rfxGlobal.parameter[key];
        }
    }
}
function transformPoint(point, transform) {
    if (!transform)
        return point;
    if (!transform.length) {
        rfxGlobal.writeTo("WARNING: Transform isn't an array, not procssing transform");
        return point;
    }
    if (transform.length != transform[0].length) {
        rfxGlobal.writeTo("WARNING: Transform isn't square, not processing transform");
        return point;
    }
    let result = [];
    let r = 0;
    for (let r = 0; r < point.length; r++) {
        let n = 0;
        for (let c = 0; c < point.length; c++) {
            n += point[c] * transform[r][c];
        }
        result.push(n);
    }
    return result;
}
function isIdentity(input){
    if(!input)
        return false;
    if(!input.length)
        return false;
    if(input.length<=0)
        return false;
    for (let r = 0; r < input.length; r++) {
        if(input.length != input.length[r])
            return false;
        for (let c = 0; c < input.length[r]; c++) {
            if(r==c && input[r][c]!=1)
                return false;
            if(r!=c && input[r][c]!=0)
                return false;
        }
    }
    return true;
}
exports.executeLine = function (line) {
    if (!rfxGlobal.stack.readingCode)
    {
        rfxGlobal.stack.code    = ""
        rfxGlobal.stack.command = {
            "raw":"",
            "formated":""
        }
        rfxGlobal.stack.comment = ""
        rfxGlobal.stack.words   = {}
    }
    parseLine(line, rfxGlobal.stack);
    if (rfxGlobal.stack.readingCode)
        return null;
    rfxGlobal.stack.words = parseCommand(rfxGlobal.stack.command.formated);
    if (rfxGlobal.stack.code) {
        if (!rfxGlobal.stack.words)
            rfxGlobal.stack.words = {};
        for (key in rfxGlobal.stack.words) {
            rfxGlobal.parameter[key] = rfxGlobal.stack.words[key];
        }
        if (rfxGlobal.stack.comment)
            rfxGlobal.parameter.comment = rfxGlobal.stack.comment;
        if (rfxGlobal.stack.command)
            rfxGlobal.parameter.command = rfxGlobal.stack.command;
        runCode(rfxGlobal, userFunction);
        lineModified = true;
    }
    //######
    let functionStack = [];
    if (rfxGlobal.stack.words) {
        for (key in rfxGlobal.stack.words) {
            if (key.length == 1) {
                if (key == "G" || key == "M") {
                    functionStack.push(key + rfxGlobal.stack.words[key] + "()");
                    continue;
                }
                if (rfxGlobal.stack.words[key] && !isNaN(rfxGlobal.stack.words[key]))
                    rfxGlobal.parameter[key] = rfxGlobal.stack.words[key];

            }
        }
    }
    for (let i = 0; i < functionStack.length; i++) {
        
       // try {
       //eval("gcodeFunction."+functionStack[i])     
        let fun = new Function("f." + functionStack[i]);
        fun(rfxGlobal = rfxGlobal, f = gcodeFunction);
        //}
        //catch {
            //rfxGlobal.writeTo("CAUTION: Unprocessed function: " + functionStack[i]);
        //}
    }
    for (key in rfxGlobal.machine.axis) {
        rfxGlobal.machine.position.machine[key] = rfxGlobal.machine.position.current[key] - rfxGlobal.machine.position.origin[key];
    }
    let output = "";
    if (rfxGlobal.stack.words) {
        for (key in rfxGlobal.stack.words) {
            if(!isNaN(rfxGlobal.stack.words[key]))
                rfxGlobal.parameter[key] = rfxGlobal.stack.words[key];
        }
        //######
        let hasAxisLabel = false;
        for (key in rfxGlobal.machine.axis) {
            if (rfxGlobal.stack.words.hasOwnProperty(key)) {
                hasAxisLabel = true;
                break;
            }
        }
        let needToTransform = false;
        if(hasAxisLabel){
            needToTransform = !isIdentity(rfxGlobal.machine.transform);
        }
        if (needToTransform) {
            let point = [];
            for (key in rfxGlobal.machine.axis) {
                point.push(rfxGlobal.parameter[key]);
            }
            point.push(1);
            point = transformPoint(point, rfxGlobal.machine.transform);
            let i = 0;
            for (key in rfxGlobal.machine.axis) {
                if (point[i] != rfxGlobal.parameter[key]) {
                    rfxGlobal.stack.words[key] = point[i].toFixed(5);
                }
                i++;
            }
        }

        for (key in rfxGlobal.stack.words) {
            output += key;
            if (rfxGlobal.stack.words[key] != null && !isNaN(rfxGlobal.stack.words[key])) {
                output += rfxGlobal.stack.words[key];
            }
            output += " ";
        }
    }
    //output = output.trim();
    if (rfxGlobal.stack.comment) {
        output += ";"
        output += rfxGlobal.stack.comment;
    }
    for (key in rfxGlobal.stack) {
        delete rfxGlobal.stack[key];
    }
    if (output.length == 1)
        return null;
    return output;
}
function validateTransform() {
    if (!rfxGlobal.machine.transform) {
        rfxGlobal.writeTo("CAUTION: No transform defined");
        return false;
    }
    if (!rfxGlobal.machine.transform.length) {
        rfxGlobal.writeTo("CAUTION: Transform must be an n x n array, where n = (Number of Axis) + (Extruder) + 1");
        return false;
    }
    if (rfxGlobal.machine.transform.length != Object.keys(rfxGlobal.machine.axis).length + 1) {
        rfxGlobal.writeTo("CAUTION: Transform must be an n x n array, where n = (Number of Axis) + (Extruder) + 1");
        return false;
    }
    for (let r = 1; r < rfxGlobal.machine.transform.length; r++) {
        if (rfxGlobal.machine.transform[0].length != rfxGlobal.machine.transform[r].length) {
            rfxGlobal.writeTo("CAUTION: Transform must be an n x n array, where n = (Number of Axis) + (Extruder) + 1");
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
            if (c == r)
                row.push(1);
            else
                row.push(0);
        }
        result.push(row);
    }
    return result;
}
exports.init = function (_appData) {
    rfxGlobal.writeTo = _appData.writeTo;
    if (!validateTransform()) {
        rfxGlobal.machine.transform = createIdentitdyMatrix(Object.keys(rfxGlobal.machine.axis).length + 1)
        rfxGlobal.writeTo("CAUTION: Transform automatically set to identity matrix:");
    }
    rfxGlobal.writeTo("\nTransform set:");
    rfxGlobal.writeTo("[");
    for (let r = 0; r < rfxGlobal.machine.transform.length; r++) {
        let s = "\t[";
        for (let c = 0; c < rfxGlobal.machine.transform[r].length; c++) {
            if (c != 0)
                s += "\t";
            s += rfxGlobal.machine.transform[r][c].toFixed(3);
        }
        s += "]"
        rfxGlobal.writeTo(s);
    }
    rfxGlobal.writeTo("]");
    rfxGlobal.machine.position = {
        "current": {},
        "machine": {},
        "origin" : {}
    };
    for (key in rfxGlobal.machine.axis) {
        rfxGlobal.machine.position.current[key] = 0;
        rfxGlobal.machine.position.machine[key] = 0;
        rfxGlobal.machine.position.origin[key] = 0;
    }
    gcodeFunction.init(rfxGlobal);
    userFunction.init(rfxGlobal);
}