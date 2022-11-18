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
let rfxGlobal;
// rfx.unitConversion[A][B] Factor to convert from units A to units B 
import rfx from './rfxLibrary.js';
let exports = {};
exports.init = (_rfxGlobal) => {
    rfxGlobal = _rfxGlobal;
}
function checkIfArray(array) {
    return (Array.isArray(array) === true && !array.length);
}
function setCurrentPositionViaKey(key, value, mode = 'absolute', units = rfxGlobal.parameter.units) {
    let scale = rfx.unitConversion[units][rfxGlobal.parameter.units]
    if (mode == 'absolute') {
        rfxGlobal.parameter.position.current[key] = value * scale;
    }
    else {
        rfxGlobal.parameter.position.current[key] += value * scale;
    }
    rfxGlobal.parameter.position.current[key] = Number(rfxGlobal.parameter.position.current[key].toFixed(rfxGlobal.machine.sigFig));
}

function linearMove() {
    for (let key in rfxGlobal.machine.axis) {
        if (!rfxGlobal.stack.words.hasOwnProperty(key))
            continue;
        let dMode = rfxGlobal.machine.distanceMode;
        if (key == 'E') {
            dMode = rfxGlobal.machine.eMode
        }
        setCurrentPositionViaKey(key, rfxGlobal.stack.words[key], dMode);
        if (dMode == 'relative')
            rfxGlobal.parameter[key] = 0;
    }
}
exports.G0 = () => {
    linearMove();
}
exports.G1 = () => {
    linearMove();
}
exports.G2 = () => {
    linearMove();
}
exports.G3 = () => {
    linearMove();
}
exports.G4 = () => {
}
exports.G5 = () => {
    linearMove();
}
exports.G53 = () => {
    for (let key in rfxGlobal.machine.axis) {
        if (!rfxGlobal.stack.words.hasOwnProperty(key))
            continue;
        let dMode = rfxGlobal.machine.distanceMode;
        if (key == 'E') {
            dMode = rfxGlobal.machine.eMode
        }
        setCurrentPositionViaKey(key, rfxGlobal.stack.words[key] + rfxGlobal.parameter.position.offset[key], dMode);
        if (dMode == 'relative')
            rfxGlobal.parameter[key] = 0;
    }
}
exports.G20 = () => {
    let origUnits = rfxGlobal.parameter.units
    rfxGlobal.parameter.units = "in"
    for (let key in rfxGlobal.machine.axis) {
        setCurrentPositionViaKey(key, rfxGlobal.parameter.position.current[key], 'absolute', origUnits)
    }
}
exports.G21 = () => {
    let origUnits = rfxGlobal.parameter.units
    rfxGlobal.parameter.units = "mm"
    for (let key in rfxGlobal.machine.axis) {
        setCurrentPositionViaKey(key, rfxGlobal.parameter.position.current[key], 'absolute', origUnits)
    }
}
exports.G28 = () => {
    let found = false;
    for (let key in rfxGlobal.machine.axis) {
        if (rfxGlobal.stack.words) {
            if (rfxGlobal.stack.words.hasOwnProperty(key)) {
                found = true;
                if (isNaN(rfxGlobal.stack.words[key])) {
                    rfxGlobal.parameter.position.current[key] = 0;
                    rfxGlobal.parameter.position.offset[key] = -rfxGlobal.machine.axis[key].home;
                }
                else {
                    rfxGlobal.parameter.position.current[key] = 0;
                    rfxGlobal.parameter.position.offset[key] = -rfxGlobal.machine.axis[key].home;
                }
            }
        }
    }
    if (found)
        return;
    for (let key in rfxGlobal.parameter.position.current) {
        rfxGlobal.parameter.position.current[key] = 0;
        rfxGlobal.parameter.position.offset[key] = -rfxGlobal.machine.axis[key].home;
    }
}
exports.G90 = () => {
    rfxGlobal.machine.distanceMode = "absolute"
}
exports.G91 = () => {
    rfxGlobal.machine.distanceMode = "relative"
}
exports.G92 = () => {
    let found = false;
    for (let key in rfxGlobal.machine.axis) {
        if (rfxGlobal.stack.words) {
            if (rfxGlobal.stack.words.hasOwnProperty(key)) {
                found = true;
                if (isNaN(rfxGlobal.stack.words[key])) {
                    rfxGlobal.parameter.position.offset[key] = rfxGlobal.parameter.position.current[key] + rfxGlobal.parameter.position.offset[key];
                    rfxGlobal.parameter.position.current[key] = 0
                }
                else {
                    rfxGlobal.parameter.position.current[key] = rfxGlobal.stack.words[key];
                }
                rfxGlobal.parameter.position.offset[key] = rfxGlobal.parameter.position.current[key] - rfxGlobal.machine.position[key];
            }
        }
    }
    if (found)
        return;
    for (let key in rfxGlobal.parameter.position.current) {
        rfxGlobal.parameter.position.current[key] = 0;
        rfxGlobal.parameter.position.offset[key] = rfxGlobal.parameter.position.current[key] - rfxGlobal.machine.position[key];

    }
}
exports.M3 = () => {
    rfxGlobal.machine.spindle = 'cw'}
exports.M4 = () => {
    rfxGlobal.machine.spindle = 'ccw'}
exports.M5 = () => {
    rfxGlobal.machine.spindle = 'off'}
exports.M82 = () => {
    rfxGlobal.machine.eMode = "absolute"}
exports.M83 = () => {
    rfxGlobal.machine.eMode = "relative"}

// Set Hotend Temperature
exports.M104 = () => {
    rfxGlobal.parameter.temp["E"] = rfxGlobal.parameter.S;
}    
// Set and wait Hotend Temperature
exports.M109 = () => {
    rfxGlobal.parameter.temp["E"] = rfxGlobal.parameter.S;
}
exports.M117 = () => {
    let i = rfxGlobal.stack.command.raw.indexOf("M117");
    if (i < 0)
        return;
    let sub = rfxGlobal.stack.command.raw.substring(i + 4);
    let found = false;
    let keys = Object.keys(rfxGlobal.stack.words);
    for (i = 0; i < keys.length; i++) {
        if (found) {
            delete rfxGlobal.stack.words[keys[i]]
            continue;
        }
        if (keys[i] == 'M' && rfxGlobal.stack.words[keys[i]] == 117) {
            i--;
            found = true;
        }
    }
    rfxGlobal.stack.words["M117" + sub] = null;
}

// Set Bed Temperature
exports.M140 = () => {
    rfxGlobal.parameter.temp["B"] = rfxGlobal.parameter.S;
}
// Set Bed Temperature and Wait
exports.M190 = () => {
    rfxGlobal.parameter.temp["B"] = rfxGlobal.parameter.S;
}
// Set Chamber Temperature
exports.M141 = () => {
    rfxGlobal.parameter.temp["C"] = rfxGlobal.parameter.S;
}
// Set Chamber Temperature and Wait
exports.M191 = () => {
    rfxGlobal.parameter.temp["C"] = rfxGlobal.parameter.S;
}
exports.G999 = () =>{
    rfxGlobal.parameter.K = 999
}
export default exports;

