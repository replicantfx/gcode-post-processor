;#### Modified by RFX at 15:19:56 Tuesday, Nov 8, 2022 ####
;Just a Commemnt
G90 ; Set Abolute movement
G21 ; Set units mm
G92 X10 Y20 Z30 E40 ; Set position with mixed spacing 
G28 X ; Home just X
G28 ; Home all
G92 X10 ; Set position of X to 10
M117  Intro line ...     ;M117 MSG with Comment after
G90 
G1 X0 Y0 Z0 E0 
G91 M82 
G92 X0 Y0 Z0 E0 
G1 X20 E10 
G1 Y20 E20 
G1 X-20 E30 
G1 Y-20 E40 
G90 M83 
G92 X0 Y0 Z0 E0 
G1 X20 E10 
G1 X20 Y20 E10 
G1 X0 Y20 E10 
G1 X0 Y0 Z50 E10 
M104 S50 ; M104 S50 in output file
G28 
G1 X1 Y2 Z3 E4 
G92 X10 
G1 X0 Y0 Z0 E0 
G53 X0 
G1 X10 Y10 Z10 E0 
G92 
