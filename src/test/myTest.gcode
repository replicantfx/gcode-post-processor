;Just a Commemnt
G90                     ; Set Abolute movement
;G21                     ; Set units mm
<<<
    console.log("### Checking Home (G28) and Coordinate Set G(92) ###");
    console.log("1: " + f.checkPos([0,0,0,0]));
>>>
G92 X10 Y20Z 30 E40         ; Set position with mixed spacing 
<<< console.log("2: " + f.checkPos([10, 20, 30,40])); >>>
G28 X                   ; Home just X
<<< console.log("3: " + f.checkPos([0, 20, 30,40])); >>>
G28                     ; Home all
<<< console.log("4: " + f.checkPos([0, 0, 0,0])); >>>
G92 X10                 ; Set position of X to 10
<<< console.log("5: " + f.checkPos([10, 0, 0,0])); >>>
M117  Intro line ...    ;M117 MSG with Comment after
G90
G1 X0Y0Z0E0
<<< console.log("6: " + f.checkPos([0, 0, 0,0])); >>>
G91 M82<<<console.log("\n### Position=relative, Extruder=Absolute ###")>>>
G92 X0 Y0 Z0 E0
G1 X20 E10
<<< console.log("1: " + f.checkPos([20, 0, 0,10])); >>>
G1 Y20 E20
<<< console.log("2: " + f.checkPos([20, 20, 0,20])); >>>
G1 X-20 E30
<<< console.log("3: " + f.checkPos([0, 20, 0,30])); >>>
G1 Y-20 E40
<<< console.log("4: " + f.checkPos([0, 0, 0,40])); >>>

G90 M83 <<<console.log("\n### Position=absolute, Extruder=Relative ###")>>>
G92 X0 Y0 Z0 E0.000000001
G1 X20 E10
<<< console.log("1: " + f.checkPos([20, 0, 0,10])); >>>
G1 X20Y20 E10
<<< console.log("2: " + f.checkPos([20, 20, 0,20])); >>>
G1 X0Y20 E10
<<< console.log("3: " + f.checkPos([0, 20, 0,30])); >>>
G1 X0Y0 Z50E10
<<< console.log("4: " + f.checkPos([0, 0, 50,40])); >>>

<<<console.log("\n### Coordinate Systems ###")>>>
G28
<<<console.log("C "+JSON.stringify(p.position.current)+ "\tM "+JSON.stringify(m.position)+ "\tO "+JSON.stringify(p.position.offset));>>>
G1 X1 Y2 Z3 E4
<<<console.log("C "+JSON.stringify(p.position.current)+ "\tM "+JSON.stringify(m.position)+ "\tO "+JSON.stringify(p.position.offset));>>>
G92 X10
<<<console.log("C "+JSON.stringify(p.position.current)+ "\tM "+JSON.stringify(m.position)+ "\tO "+JSON.stringify(p.position.offset));>>>
G1 X0 Y0 Z0 E0
<<<console.log("C "+JSON.stringify(p.position.current)+ "\tM "+JSON.stringify(m.position)+ "\tO "+JSON.stringify(p.position.offset));>>>
G53 X0 ; Move in machine coordinates
<<<console.log("C "+JSON.stringify(p.position.current)+ "\tM "+JSON.stringify(m.position)+ "\tO "+JSON.stringify(p.position.offset));>>>
G1 X10 Y10 Z10 E0
<<<console.log("C "+JSON.stringify(p.position.current)+ "\tM "+JSON.stringify(m.position)+ "\tO "+JSON.stringify(p.position.offset));>>>
G92
<<<console.log("C "+JSON.stringify(p.position.current)+ "\tM "+JSON.stringify(m.position)+ "\tO "+JSON.stringify(p.position.offset));>>>

<<<console.log("\n### Units ###")>>>
G28
<<<console.log("\t1: " + f.checkPos([0, 0, 0,0]))>>>
G1 X1 Y2 Z3
G20 <<<console.log("Inches Set");>>>
G1 X1 Y2 Z3
<<<console.log("\t1: " + f.checkPos([1, 2, 3,0]))>>>
G21 <<<console.log("mm Set");>>>
G1 X1 Y2 Z3
<<<console.log("\t1: " + f.checkPos([1, 2, 3,0]))>>>
G20 <<<console.log("Inches Set");>>>
<<<console.log("\t1: " + f.checkPos([1/25.4, 2/25.4, 3/25.4,0]))>>>

<<<console.log("\n### Checking Math Functions ###");s.comment = "Testing Math">>>
<<<f.tempAtHeight(0,0,10,10)>>> ; M104 S50 in output file
<<<console.log("userFunction parameter manipulation:")>>>
<<<f.testMath();console.log(p.K==6)>>>
<<<console.log("inline parameter manipulation:")>>>
<<<console.log(p.K == (9-p.K)*2);>>>

<<<console.log("\n### Checking Multipliers ###");s.comment = "Testing Multipliers">>>
G1 X0Y0Z0E1000 F100 <<<p.frm = 2; p.exm = 0.5;>>>;E=500 F=200
G1 X0Y0Z0E1000 F100 <<<p.frm = 0.5; p.exm = 2.0;>>>;E=2000 F=50
M3 S100 <<<p.ssm = 0.5>>>   ;S=50
M3 S100 <<<p.ssm = 2.0>>>   ;S=200

M104 S100
<<<p.temp.E*=2>>>
M104 <<<p.S = p.temp.E>>>

M140 S200
<<<p.temp.B/=2>>>
M140 <<<p.S = p.temp.B>>>

M141 S50
M141 <<<p.S = p.temp.C+20>>>
