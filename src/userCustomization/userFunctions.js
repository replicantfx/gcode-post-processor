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

The userFunctions.js file is where you can create custom functions to 
include in the post processing process. Any function exported from this
file will be available to the post processor via "f.<functionName>"
*/ //#######################################################################

let exports = {};
/* scale
    Input:  factor      An array of scale factors, typically [X,Y,Z,E]
            relative    If true, factor is multiplied with previous value in transform
                        If false (default), factor overwites existing value in transform
    Output:
            None

    Effect: Modifies the machine transform to scale gcode the prescribed amount
*/
exports.scale = function (factor, relative = false) {
  for (let i = 0; i < factor.length; i++) {
    if (i >= m.transform.length) return;
    if (i >= m.transform.length[i]) return;
    if (relative) m.transform[i][i] *= factor[i];
    else m.transform[i][i] = factor[i];
  }
};
/* translate
    Input:  factor      An array of translation factors, typically [X,Y,Z,E]
            relative    If true, factor is added to previous value in transform
                        If false (default), factor overwites existing value in transform
    Output:
            None

    Effect: Modifies the machine transform to translate gcode the prescribed amount
*/
exports.translate = function (factor, relative = false) {
  for (let i = 0; i < factor.length; i++) {
    if (i >= m.transform.length) return;
    if (i >= m.transform.length[i]) return;
    if (relative) m.transform[i][m.transform[i].length-1] += factor[i];
    else m.transform[i][m.transform[i].length-1] = factor[i];
  }
};
/*  function tempAtHeight

        [    ]              }-band    
        [    ]              }-band    
        [    ]     __zStart }-band    
     ___[####]___  __Bed           

    Input:  zStart:     Starting height in selected units (mm/inch)
            startValue: The temperature for the extruder to be set to for the first band
            step:       How much to step temperature with each new band
            band:       How many units (mm/inch) should be used for each tempStep

    Output:
            If above zStart     adds "M104 S[temp]" to output command
            else                adds nothing to output command

    Effect: None
*/
exports.tempAtHeight = function (zStart, startValue, step, band) {
  if (p.position.current.Z >= zStart) {
    p.M = 104;
    p.S =
      startValue + step * Math.floor((p.position.current.Z - zStart) / band);
    s.ref.push("M");
    s.ref.push("S");
  }
};
/*  function feedrateMultiplyAtHeight

        [    ]              }-band    
        [    ]              }-band    
        [    ]     __zStart }-band    
     ___[####]___  __Bed           

    Input:  zStart:     Starting height in selected units (mm/inch)
            startValue: The temperature for the extruder to be set to for the first band
            step:       How much to step temperature with each new band
            band:       How many units (mm/inch) should be used for each tempStep

    Output: None

    Effect: Feedrate multipier (FRM) is changed to the value indicated.
            Whenever gcode references the "F" rfxGlobal.parameter (feedrate), the
            original "F" value is stored in rfxGlobal.parameter but the value
            output to the new gcode file will be F = (FRM*F).
    
            Example:
            <<< f.feedrateMultiplyAtHeight(0,1.0,-0.1,10) >>> 
            Input line:     G1 X1 Z50 F100

            -Behind the scenes math:
                F =   F * FRM
                F = 100 * (1.0 + (-0.1 * Math.floor((50-0)/10))) 
                F = 100 * (1.0 - 0.5)
                F = 100 * 0.5
                F = 50

            output line     G1 X1 Z50 F50;  
*/
exports.feedrateMultiplyAtHeight = function (zStart, startValue, step, band) {
  if (p.position.current.Z >= zStart) {
    p.frm =
      startValue + step * Math.floor((p.position.current.Z - zStart) / band);
  }
};
/*  function extruderMultiplyAtHeight

        [    ]              }-band    
        [    ]              }-band    
        [    ]     __zStart }-band    
     ___[####]___  __Bed           

    Input:  zStart:     Starting height in selected units (mm/inch)
            startValue: The temperature for the extruder to be set to for the first band
            step:       How much to step temperature with each new band
            band:       How many units (mm/inch) should be used for each tempStep

    Output: None

    Effect: Extruder multipier (EM) is changed to the value indicated.
            Whenever gcode references the "E" rfxGlobal.parameter (extruder value), the
            original "E" value is stored in rfxGlobal.parameter but the value
            output to the new gcode file will be E = (EM*E).
    
            Example:
            <<< f.extruderMultiplyAtHeight(0,1.0,-0.1,10) >>> 
            Input line:     G1 X1 Z50 E100

            -Behind the scenes math:
                E =   E * EM
                E = 100 * (1.0 + (-0.1 * Math.floor((50-0)/10))) 
                E = 100 * (1.0 - 0.5)
                E = 100 * 0.5
                E = 50

            output line     G1 X1 Z50 E50;  
*/
exports.extruderMultiplyAtHeight = function (zStart, startValue, step, band) {
  if (p.position.current.Z >= zStart) {
    p.exm =
      startValue + step * Math.floor((p.position.current.Z - zStart) / band);
  }
};

//#########################################################################
//################## WARNING DO NOT TOUCH BELOW THIS LINE #################
//#########################################################################
/*
exports.setExtruderMultipler = function(value){
    let i = Object.keys(m.axis).indexOf("E");
    m.transform[i][i] = value;
}
exports.setFeedrateMultipler = function(value){

}
*/
exports.checkPos = (truth) => {
  let actualPos = [];
  let keys = Object.keys(m.axis);
  for (let i = 0; i < keys.length; i++) {
    actualPos.push(p.position.current[keys[i]]);
  }
  for (let i = 0; i < truth.length; i++) {
    if (actualPos[i].toFixed(4) != truth[i].toFixed(4)) return false;
  }
  return true;
};
exports.testMath = () => {
  p.I = 2;
  p.J = 3;
  p.K = p.I * p.J;
};
exports.init = function (_rfxGlobal) {
  p = _rfxGlobal.parameter;
  m = _rfxGlobal.machine;
  s = _rfxGlobal.stack;
};
//NOTE: The following is not used in any way, simply placed here to help
//      auto fill/code completion functionality with your editor.  Setting
//      values here will have no effect.
let m = {};
let p = {};
let s = {};
export default exports;
