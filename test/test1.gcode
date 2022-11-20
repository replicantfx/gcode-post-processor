;Created by 
;Second Line
<<<
  m.units = "mm";
  m.transform = [
    [1, 0, 0, 0, 10],
    [0, 1, 0, 0, 100],
    [0, 0, 1, 0, 1000],
    [0, 0, 0, 1, 0],
    [0, 0, 0, 0, 1],
  ];
  m.axis = {
    X: {
      home: 0,
    },
    Y: {
      home: 0,
    },
    Z: {
      home: 0,
    },
    E: {
      home: 0,
      extruder: null,
    },
  };
  m.distanceMode = "absolute";
  m.eMode = "absolute";
  m.sigFig = 4;

  f.perLine = function(){
      console.log("line: "+
          p.X +", "+
          p.Y +", "+
          p.Z);
      if(p.Z >= 3)
          console.log("greater");
  }
>>>
G1 X0 Y0 Z0
G1 X1 Y2 Z3
G1 X2 Y4 Z6
G456
G1 X3 Y6 Z9
