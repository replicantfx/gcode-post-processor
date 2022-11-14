;#### Modified by RFX at 08:55:53 Monday, Nov 14, 2022 ####
;Just a Commemnt
G90 ; Set Abolute movement
;G21                      Set units mm
G92 X10 Y20 Z30 E40 ; Set position with mixed spacing 
G28 X Y Z E ; Home just X
G28 ; Home all
G92 X10 Y20 Z30 E40 ; Set position of X to 10
M117  Intro line ...     ;M117 MSG with Comment after
G90 
G1 X0 Y0 Z0 E0 
G91 M82 
G92 X0 Y0 Z0 E0 
G1 X20 E10 Y0 Z0 
G1 Y20 E20 X20 Z0 
G1 X-20 E30 Y20 Z0 
G1 Y-20 E40 X-20 Z0 
G90 M83 
G92 X0 Y0 Z0 E0 
G1 X20 E10 Y0 Z0 
G1 X20 Y20 E10 Z0 
G1 X0 Y20 E10 Z0 
G1 X0 Y0 Z50 E10 
G28 
G1 X1 Y2 Z3 E4 
G92 X10 Y2 Z3 E4 
G1 X0 Y0 Z0 E0 
G53 X0 Y0 Z0 E0 ; Move in machine coordinates
G1 X10 Y10 Z10 E0 
G92 
G28 
G1 X1 Y2 Z3 E0 
G20 
G1 X1 Y2 Z3 E0 
G21 
G1 X1 Y2 Z3 E0 
G20 
;Testing Math
M104 S0 ; M104 S50 in output file
K6 
K6 
;Testing Multipliers
G1 X0 Y0 Z0 E500 F200 ;E=500 F=200
G1 X0 Y0 Z0 E2000 F50 ;E=2000 F=50
M3 S50 ;S=50
M3 S200 ;S=200
M104 S100 
M104 S200 
M140 S200 
M140 S100 
M141 S50 
M141 S70 
