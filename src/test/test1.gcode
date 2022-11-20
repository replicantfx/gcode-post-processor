<<<
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
