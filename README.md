# gcode-post-processor
#### A JavaScript implementation of a GCode (CNC, 3D printer, Laser Cutter) post processor for programmatically adjusting GCode via inline-JavaScript and global transformations
***
    _____                _  _                      _    ______ __   __
    |  __ \              | |(_)                    | |  |  ____|\ \ / /
    | |__) |  ___  _ __  | | _   ___   __ _  _ __  | |_ | |__    \ V / 
    |  _  /  / _ \| '_ \ | || | / __| / _` || '_ \ | __||  __|    > <  
    | | \ \ |  __/| |_) || || || (__ | (_| || | | || |_ | |      / . \ 
    |_|  \_\ \___|| .__/ |_||_| \___| \__,_||_| |_| \__||_|     /_/ \_\
                  | |                                                  
                  |_|
***
Created by:     Emily A Shilling

First Release:  6 NOV 2022

Description:
                This is a gcode post processor for standard and 3D printer flavored gcode.  An input file is processed by this engine
                and when the engine encounters a <<\<```javascript code```\>>> section, that code is executed as javascript.  This allows the user
                extreme customization of the resulting gcode via a language already heavily understood. Additionally users can define (and adjust 
                real-time) a global geometric transform to scale, rotate, translate GCode programmatically.
***
## Major Features
* 3D Printer, CNC, and Laser Cutter Compatable
* Works with Prusa Slicer, Simplify3d and cura
* 3D transformation capable for all coordinates (including extruder)
    * Scale
    * Translate
    * Rotate
    * Scew
* Adjust Extruder and Feedrate Multipliers 
* All GCode parameters exposed, modify anything with your own Javascript run as a post processor
## Standards Followed:

* Partial implementation of RS-274

## Instructions / Getting Started

Please see: https://github.com/replicantfx/gcode-post-processor/wiki
