// PG9171E / MS9001E educational solid reconstruction, millimetres.
// X downstream, Y up, Z toward initial camera. See model-notes.md for evidence.
// Estimated profiles and clearances. Not OEM CAD or fabrication geometry.

/* [Assembly] */
exploded = 0; // [0:0.05:1]
cutaway = true;
show_casings = true;
show_stators = true;
show_base = true;
component = "all"; // [all,inlet,compressor,combustion,turbine,exhaust,bearings]

/* [Reference Parameters] */
compressor_tip_diameter = 2161.5;
compressor_stages = 17;
combustor_count = 14;
igv_count = 64;
turbine_bucket_count = 92;
combustor_inclination = 13;

/* [Display Resolution] */
$fn = 48;

/* [Hidden] */
eps = 0.5;
tip = compressor_tip_diameter / 2;
steel = [0.67,0.74,0.77];
case_color = [0.53,0.66,0.64];
hot_color = [0.66,0.58,0.46];
blade_counts = [44,48,52,56,60,64,68,72,76,80,84,88,92,96,100,104,108];
// Compressor counts above are illustrative. The source gives stages, not each population.

function section_enabled(name) = component == "all" || component == name;
function stage_x(i) = -3920 + i*210;
function stage_root(i) = 600 + i*19;
function stage_tip(i) = tip - i*6;

module xcylinder(x0,x1,r0,r1=undef) {
    translate([x0,0,0]) rotate([0,90,0])
        cylinder(h=x1-x0,r1=r0,r2=is_undef(r1)?r0:r1);
}

module xtube(x0,x1,r0,r1,wall=50) {
    difference() {
        xcylinder(x0,x1,r0,r1);
        xcylinder(x0-eps,x1+eps,r0-wall,r1-wall);
    }
}

module ring(x,r,width,wall) {
    xtube(x-width/2,x+width/2,r,r,wall);
}

module radial(n,phase=0) {
    for(a=[0:360/n:360-360/n]) rotate([a+phase,0,0]) children();
}

module bolt_ring(x,r,n,size=18) {
    radial(n) translate([0,r,0]) xcylinder(x-12,x+12,size);
}

module shell_half(x0,x1,r0,r1,wall=65,upper=false) {
    intersection() {
        union() {
            xtube(x0,x1,r0,r1,wall);
            ring(x0,r0+90,85,wall+90);
            ring(x1,r1+90,85,wall+90);
        }
        translate([-15000,upper?0:-15000,-15000]) cube([30000,15000,30000]);
    }
}

module shell(x0,x1,r0,r1,wall=65) {
    if(show_casings) color(case_color) {
        translate([0,-450*exploded,0]) shell_half(x0,x1,r0,r1,wall,false);
        if(!cutaway) translate([0,2000*exploded,0]) shell_half(x0,x1,r0,r1,wall,true);
    }
}

// A simple closed cambered profile, not a recovered GE airfoil.
module airfoil(x,root,outer,chord,twist=14) {
    translate([x,root,0]) rotate([-90,0,0])
        linear_extrude(height=outer-root,twist=twist,scale=0.78,slices=4)
        polygon(points=[[-0.48*chord,0],[-0.35*chord,-0.045*chord],
            [-0.08*chord,-0.035*chord],[0.22*chord,0.035*chord],
            [0.5*chord,0.11*chord],[0.20*chord,0.075*chord],
            [-0.08*chord,0.07*chord],[-0.34*chord,0.035*chord]]);
}

module row(x,n,root,outer,chord,twist=14) {
    radial(n) airfoil(x,root,outer,chord,twist);
}

module inlet() {
    translate([-1300*exploded,0,0]) {
        color(steel) {
            xtube(-5250,-4090,1460,1120,75);
            ring(-5250,1510,95,150);
            ring(-4090,1220,90,140);
            xcylinder(-5080,-4080,310,585);
            radial(8) translate([-4960,800,0]) cube([155,930,100],center=true);
        }
        if(show_stators) color([0.40,0.56,0.61]) {
            row(-4050,igv_count,600,tip,155,-25);
            ring(-4050,1180,90,95);
        }
    }
}

module compressor() {
    translate([-400*exploded,0,0]) {
        color(steel) {
            xcylinder(-5350,-4050,200);
            xcylinder(-4000,-370,600,925);
            ring(-4920,320,65,120);
            ring(-5250,305,70,105);
            bolt_ring(-5250,250,16);
            for(i=[0:compressor_stages-1]) translate([-i*22*exploded,0,0]) {
                xcylinder(stage_x(i)-60,stage_x(i)+60,stage_root(i));
                row(stage_x(i),blade_counts[i],stage_root(i)-3,stage_tip(i),150-i*3,18);
            }
            radial(16) translate([0,470,0]) xcylinder(-3960,-500,20);
        }
        if(show_stators) color([0.42,0.52,0.56]) {
            for(i=[0:compressor_stages-1]) {
                x=stage_x(i)+95;
                row(x,blade_counts[i]+4,stage_root(i)+35,stage_tip(i)+12,120-i*2,-16);
                ring(x,stage_tip(i)+28,55,35);
            }
            for(x=[-290,-190]) row(x,80,940,1090,85,-8);
        }
        shell(-4070,-3160,1180,1140);
        shell(-3160,-1900,1140,1130);
        shell(-1900,-350,1130,1210);
    }
}

module combustor_can() {
    // Local origin is the can axis at its front head.
    color(hot_color) {
        xtube(0,1100,286,276,25);
        ring(0,330,75,110);
        ring(1100,300,65,55);
        for(x=[210,370,530,690,850]) ring(x,294,28,22);
        bolt_ring(-40,302,16,12);
    }
    color(steel) {
        radial(6) translate([0,155,0]) {
            xcylinder(-170,190,38,27);
            ring(-160,47,30,20);
        }
        xcylinder(-245,560,40,32);
        ring(-235,88,45,45);
    }
}

module transition_piece() {
    // Closed solid wall, formed from a circular inlet and flattened outlet.
    difference() {
        hull() {
            translate([1050,0,0]) rotate([0,90,0]) cylinder(h=40,r=275);
            translate([1740,-400,0]) cube([50,185,490],center=true);
        }
        hull() {
            translate([1040,0,0]) rotate([0,90,0]) cylinder(h=60,r=250);
            translate([1745,-400,0]) cube([80,145,450],center=true);
        }
    }
}

module combustion() {
    shell(-250,1810,1670,1800,70);
    for(i=[0:combustor_count-1]) rotate([i*360/combustor_count,0,0]) {
        translate([-250,1750+exploded*1100,0]) rotate([0,0,-combustor_inclination]) {
            combustor_can();
            color([0.53,0.49,0.42]) transition_piece();
        }
        color(steel) rotate([180/combustor_count,0,0])
            translate([-40,1720*cos(180/combustor_count),0])
            cylinder(h=3440*sin(180/combustor_count),r=27,center=true);
    }
    color([0.43,0.51,0.53]) {
        xtube(-350,1510,1030,1450,60);
        radial(12) translate([1160,1130,0]) cube([440,720,62],center=true);
    }
}

module turbine() {
    translate([650*exploded,0,0]) {
        color(steel) {
            xcylinder(-250,1650,233.78);
            xcylinder(1700,3300,640);
            xcylinder(3350,5300,198.105);
            ring(-250,400,75,166);
            ring(5300,360,90,162);
            bolt_ring(5330,285,12,21);
            radial(12) translate([0,520,0]) xcylinder(1800,3200,24);
        }
        for(i=[0:2]) translate([i*260*exploded,0,0]) {
            x=2000+i*520;
            root=1000-i*32;
            outer=1370+i*110;
            color(hot_color) {
                xcylinder(x-100,x+100,root);
                row(x,turbine_bucket_count,root-3,outer,220+i*30,26);
                if(i>0) ring(x+10,outer+12,190,30);
                if(i<2) xcylinder(x+110,x+390,780);
            }
            if(show_stators) color([0.54,0.56,0.53]) {
                row(x-250,[36,48,64][i],root+35,outer+25,190,-26);
                ring(x-250,outer+70,205,68);
            }
        }
        shell(1590,3360,1550,1730,80);
    }
}

module exhaust() {
    translate([1800*exploded,0,0]) {
        shell(3400,4550,1730,1930,75);
        color(steel) {
            xtube(3430,5170,740,630,65);
            radial(10) translate([3900,1240,0]) cube([220,1170,80],center=true);
            for(i=[0:4]) ring(4680+i*100,1990-i*85,48,370);
            ring(4540,2000,115,140);
        }
    }
}

module bearings() {
    stations=[-4650,850,4020];
    journals=[200,233.78,198.105];
    for(i=[0:2]) translate([stations[i],-650*exploded,0]) color([0.50,0.58,0.59]) {
        difference() {
            xcylinder(-230,230,journals[i]+180);
            xcylinder(-231,231,journals[i]+6);
            if(cutaway) translate([-400,0,-800]) cube([800,800,1600]);
        }
        translate([0,-journals[i]-185,0]) cube([650,150,700],center=true);
    }
}

module base() {
    color([0.26,0.36,0.36]) {
        for(z=[-1200,1200]) translate([-80,-2150,z]) cube([10500,300,200],center=true);
        for(x=[-3850,-1850,1250,3620]) translate([x,-2150,0]) cube([240,300,2600],center=true);
        for(x=[-3470,3220]) for(z=[-1150,1150])
            translate([x,-1750,z]) cube([500,650,340],center=true);
    }
}

if(section_enabled("inlet")) inlet();
if(section_enabled("compressor")) compressor();
if(section_enabled("combustion")) combustion();
if(section_enabled("turbine")) turbine();
if(section_enabled("exhaust")) exhaust();
if(section_enabled("bearings")) bearings();
if(show_base && component == "all") base();
