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
exports.init = (_rfxGlobal) => {
    rfxGlobal = _rfxGlobal;
}
function linearMove() {
    for (key in rfxGlobal.machine.axis) {
        if (!rfxGlobal.stack.words.hasOwnProperty(key))
            continue;
        if (key == 'E') {
            if (rfxGlobal.machine.eMode == "absolute") {
                rfxGlobal.machine.position.current[key] = rfxGlobal.stack.words[key];
            }
            else {
                rfxGlobal.machine.position.current[key] += rfxGlobal.stack.words[key];
                rfxGlobal.parameter[key] = 0;
            }
        }
        else {
            if (rfxGlobal.machine.distanceMode == "absolute") {
                rfxGlobal.machine.position.current[key] = rfxGlobal.stack.words[key];
            }
            else {
                rfxGlobal.machine.position.current[key] += rfxGlobal.stack.words[key];
                rfxGlobal.parameter[key] = 0;
            }
        }
        //rfxGlobal.parameter.pos[key] = Math.round(rfxGlobal.parameter.pos[key] * 1000) / 1000;
    }
}
exports.G0 = () => {
    linearMove();
}
exports.G1 = () => {
    linearMove();
}
exports.G53 = () => {
    for (key in rfxGlobal.machine.axis) {
        if (!rfxGlobal.stack.words.hasOwnProperty(key))
            continue;
        if (key == 'E') {
            if (rfxGlobal.machine.eMode == "absolute") {
                rfxGlobal.machine.position.current[key] = rfxGlobal.stack.words[key] + rfxGlobal.machine.position.origin[key];
            }
            else {
                rfxGlobal.machine.position.current[key] += rfxGlobal.stack.words[key] + rfxGlobal.machine.position.origin[key];
                rfxGlobal.parameter[key] = 0;
            }
        }
        else {
            if (rfxGlobal.machine.distanceMode == "absolute") {
                rfxGlobal.machine.position.current[key] = rfxGlobal.stack.words[key] + rfxGlobal.machine.position.origin[key];
            }
            else {
                rfxGlobal.machine.position.current[key] += rfxGlobal.stack.words[key] + rfxGlobal.machine.position.origin[key];
                rfxGlobal.parameter[key] = 0;
            }
        }
    }
}
exports.G20 = () => {
    if (rfxGlobal.machine.units == "mm") {
        for (key in rfxGlobal.parameter.pos) {
            rfxGlobal.machine.position.current[key] = Math.round(rfxGlobal.machine.position.current[key] / 25.4 * 1000) / 1000;
            rfxGlobal.machine.position.origin[key] /= 25.4;
        }
    }
    rfxGlobal.machine.units = "in"
}
exports.G21 = () => {
    if (rfxGlobal.machine.units == "in") {
        for (key in rfxGlobal.parameter.pos) {
            rfxGlobal.parameter.pos[key] = Math.round(rfxGlobal.machine.position.current[key] * 25.4 * 1000) / 1000;
            rfxGlobal.machine.position.origin[key] *= 25.4;
        }
    }
    rfxGlobal.machine.units = "mm"
}
exports.G28 = () => {
    let found = false;
    for (key in rfxGlobal.machine.axis) {
        if (rfxGlobal.stack.words) {
            if (rfxGlobal.stack.words.hasOwnProperty(key)) {
                found = true;
                if (isNaN(rfxGlobal.stack.words[key])) {
                    rfxGlobal.machine.position.current[key] = rfxGlobal.machine.axis[key].home;
                    rfxGlobal.machine.position.machine[key] = rfxGlobal.machine.axis[key].home;
                    rfxGlobal.machine.position.origin[key] = 0;
                }
                else {
                    rfxGlobal.machine.position.current[key] = rfxGlobal.stack.words[key];
                    rfxGlobal.machine.position.machine[key] = rfxGlobal.stack.words[key];
                    rfxGlobal.machine.position.origin[key] = 0;
                }
            }
        }
    }
    if (found)
        return;
    for (key in rfxGlobal.machine.position.current) {
        rfxGlobal.machine.position.current[key] = rfxGlobal.machine.axis[key].home;
        rfxGlobal.machine.position.origin[key] = 0;
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
    for (key in rfxGlobal.machine.axis) {
        if (rfxGlobal.stack.words) {
            if (rfxGlobal.stack.words.hasOwnProperty(key)) {
                found = true;
                if (isNaN(rfxGlobal.stack.words[key])) {
                    rfxGlobal.machine.position.current[key] = 0;
                }
                else {
                    rfxGlobal.machine.position.current[key] = rfxGlobal.stack.words[key];
                }
                rfxGlobal.machine.position.origin[key] = rfxGlobal.machine.position.current[key] - rfxGlobal.machine.position.machine[key];
            }
        }
    }
    if (found)
        return;
    for (key in rfxGlobal.machine.position.current) {
        rfxGlobal.machine.position.current[key] = 0;
        rfxGlobal.machine.position.origin[key] = rfxGlobal.machine.position.current[key] - rfxGlobal.machine.position.machine[key];

    }
}
exports.M82 = () => {
    rfxGlobal.machine.eMode = "absolute"
}
exports.M83 = () => {
    rfxGlobal.machine.eMode = "relative"
}
// Set Hotend Temperature
exports.M109 = () => {
    rfxGlobal.parameter.temp["E" + rfxGlobal.parameter.T] = rfxGlobal.parameter.S;
}
// Set Hotend Temperature
exports.M104 = () => {
    rfxGlobal.parameter.temp["E" + rfxGlobal.parameter.T] = rfxGlobal.parameter.S;
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
// Set Hotend Temperature and Wait
exports.M109 = () => {
    rfxGlobal.parameter.temp["E" + rfxGlobal.parameter.T] = rfxGlobal.parameter.S;
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

