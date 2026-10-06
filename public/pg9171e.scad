// PG9171E / MS9001E educational solid reconstruction, millimetres.
// X downstream, Y up, Z toward initial camera. See model-notes.md for evidence.
// Estimated profiles and enlarged clearances. Not OEM CAD or fabrication geometry.
// Independently simplified solid model, synchronized to browser station envelopes.
// Mesh airfoils, internal cooling and small hardware are intentionally not identical.

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
blade_counts = [for(i=[0:16]) 48+4*floor(i/2)];
// Compressor counts above are illustrative. The source gives stages, not each population.

function section_enabled(name) = component == "all" || component == name;
function stage_x(i) = -3920 + i*202.5;
function stage_root(i) = 665 + i*101/16;
function stage_tip(i) = tip - i*183/16;
function compressor_passage(x) = x <= -680 ? tip+18-183*(x+3920)/3240 : tip-183+18+43*(x+680)/480;

module xprofile(points) {
    rotate([0,90,0]) rotate_extrude(convexity=12)
        polygon([for(p=points) [p[1],p[0]]]);
}

module half_display() {
    difference() {
        children();
        if(cutaway) translate([-15000,0,-15000]) cube([30000,15000,30000]);
    }
}

module radial_bore(x,r0,r1,bore,angle=0) {
    rotate([angle,0,0]) translate([x,r0,0]) rotate([-90,0,0])
        cylinder(h=r1-r0,r=bore,$fn=24);
}

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
        if(show_casings) color(steel) half_display() {
            ring(-5155,1380,110,915);
            xprofile([[-5100,940],[-4960,840],[-4780,710],[-4550,620],[-4280,575],
                [-4280,530],[-4560,570],[-4800,655],[-4990,790],[-5100,880]]);
            xprofile([[-4780,1370],[-4600,1310],[-4450,1210],[-4330,1120],[-4100,1120],
                [-4100,1220],[-4310,1220],[-4440,1290],[-4600,1390],[-4770,1440]]);
            radial(4,45) translate([-4850,574,0]) cube([110,272,46],center=true);
        }
        if(show_stators) color([0.40,0.56,0.61]) {
            row(-4190,igv_count,575,1105,155,-25);
            ring(-4190,1148,120,35);
            ring(-4190,603,170,75);
            ring(-4190,1279,62,46);
        }
    }
}

module compressor() {
    translate([-400*exploded,0,0]) {
        color(steel) {
            xcylinder(-5750,-4520,200);
            xcylinder(-4520,-3955,200,620);
            xcylinder(-578.75,-370,751.16,380);
            xcylinder(-370,140,300,220);
            ring(-5220,335,75,145);
            ring(-5640,320,90,160);
            ring(-5500,356,45,170);
            radial(60) translate([-5500,361,0]) cube([57,32,17],center=true);
            bolt_ring(-5700,265,12);
            for(i=[0:compressor_stages-1]) translate([-i*22*exploded,0,0]) {
                difference() {
                    xcylinder(stage_x(i)-35,stage_x(i)+35,stage_root(i)-45);
                    xcylinder(stage_x(i)-36,stage_x(i)+36,215);
                    radial(16) translate([0,480,0]) xcylinder(stage_x(i)-36,stage_x(i)+36,29);
                }
                xtube(stage_x(i)-101.25,stage_x(i)+101.25,stage_root(i)-21.16,stage_root(i)-14.84,30);
                ring(stage_x(i),stage_root(i),88,45);
                row(stage_x(i),blade_counts[i],stage_root(i)-3,stage_tip(i),123-i*20/16,18);
            }
            radial(16) translate([0,480,0]) xcylinder(-3955,-645,25);
        }
        if(show_stators) color([0.42,0.52,0.56]) {
            for(i=[0:compressor_stages-1]) {
                x=stage_x(i)+112;
                row(x,blade_counts[i]+6,stage_root(i)-2.5,compressor_passage(x)+6,93-i*14/16,-16);
                ring(x,compressor_passage(x)+27,54,31);
            }
            for(x=[-435,-290]) row(x,80,x==-435?778:788,compressor_passage(x)+5,92,-8);
        }
        for(section=[[-4100,-3170,1220,1176],[-3170,-1950,1176,1107],[-1950,-200,1107,1064]])
            if(show_casings) color(case_color) half_display() difference() {
                xcylinder(section[0],section[1],section[2],section[3]);
                xcylinder(section[0]-eps,section[1]+eps,compressor_passage(section[0]),compressor_passage(section[1]));
                for(i=[0:16]) if(stage_x(i)+112>section[0]&&stage_x(i)+112<section[1])
                    xcylinder(stage_x(i)+83,stage_x(i)+141,compressor_passage(stage_x(i)+112)+29);
            }
        color(case_color) for(side=[-1,1])
            translate([-3830,-190,side*1340]) cylinder(h=380,r=120,center=true);
    }
}

module combustor_can() {
    // Hollow casing, liner, cap passages and dilution holes. Small film slots
    // and the individual fuel-nozzle flow circuits remain simplified here.
    color(hot_color) {
        if(show_casings) half_display() difference() {
            xtube(-160,945,287,287,22);
            for(a=[90,270]) radial_bore(140,220,340,49,a);
        }
        ring(-155,329,63,70);
        ring(840,300,35,34);
        bolt_ring(-265,292,12,12);
    }
    color(steel) {
        difference() {
            xcylinder(-225,-170,320);
            radial(6) translate([0,167,0]) xcylinder(-226,-169,47);
            xcylinder(-226,-169,53);
        }
        radial(6) translate([0,167,0]) {
            xtube(-310,55,43,35,7);
            ring(-300,63,34,26);
        }
        xtube(-460,650,49,31,7);
        ring(-345,84,43,30);
    }
    color([.58,.53,.45]) {
        difference() {
            xtube(10,970,237,237,12);
            for(a=[90,270]) radial_bore(140,190,270,49,a);
            for(a=[0,120,240]) radial_bore(800,190,270,40,a);
            for(a=[0:60:300]) {
                radial_bore(215,190,270,21,a+14.3);
                radial_bore(275,190,270,16,a);
            }
        }
        difference() {
            xcylinder(15,29,225);
            radial(6) translate([0,167,0]) xcylinder(14,30,52);
            xcylinder(14,30,60);
        }
        xprofile([[270,231],[365,162],[450,141],[590,218],[600,229],
            [460,157],[373,178],[290,231]]);
    }
}

transition_stations=[[825,1541,0],[873,1530,0],[1040,1470,.12],[1210,1300,.44],[1430,1095,.8],[1590,928,1]];
transition_n=32;
function transition_vertex(j,k,skin) = let(
    station=transition_stations[j], a=k*360/transition_n, c=cos(a), s=sin(a), inset=skin*14,
    blend=station[2], cr=c*(254-inset), ct=s*(254-inset),
    sr=sign(c)*pow(abs(c),.28)*(171-inset),
    theta=sign(s)*pow(abs(s),.28)*(180/combustor_count-.516-inset*.03438)*blend,
    rr=station[1]+cr*(1-blend)+sr*blend-cr*(1-cos(combustor_inclination))*(1-blend))
    [station[0]+cr*sin(combustor_inclination)*(1-blend),rr*cos(theta),rr*sin(theta)+ct*(1-blend)];
function tv(s,j,k)=s*len(transition_stations)*transition_n+j*transition_n+(k%transition_n);

module transition_piece() {
    // A capped wall loft, open at both ends; outlet is one nozzle-annulus sector.
    last=len(transition_stations)-1;
    polyhedron(points=[for(s=[0:1],j=[0:last],k=[0:transition_n-1]) transition_vertex(j,k,s)],faces=concat(
        [for(j=[0:last-1],k=[0:transition_n-1]) each [[tv(0,j,k),tv(0,j,k+1),tv(0,j+1,k)],
            [tv(0,j,k+1),tv(0,j+1,k+1),tv(0,j+1,k)],
            [tv(1,j,k),tv(1,j+1,k),tv(1,j,k+1)],
            [tv(1,j,k+1),tv(1,j+1,k),tv(1,j+1,k+1)]]],
        [for(k=[0:transition_n-1]) each [[tv(0,0,k),tv(1,0,k),tv(0,0,k+1)],
            [tv(0,0,k+1),tv(1,0,k),tv(1,0,k+1)],
            [tv(0,last,k),tv(0,last,k+1),tv(1,last,k)],
            [tv(0,last,k+1),tv(1,last,k+1),tv(1,last,k)]]]),convexity=12);
}

module combustion() {
    if(show_casings) color(case_color) half_display() difference() {
        xprofile([[-40,1230],[-230,2040],[-100,2100],[420,2100],[860,1960],
            [1410,1690],[1770,1330],[1770,1250],[1400,1590],[820,1860],
            [370,2000],[-80,2000],[40,1230]]);
        radial(combustor_count) translate([-80,1750,0]) rotate([0,0,-combustor_inclination])
            xcylinder(-380,400,302);
    }
    for(i=[0:combustor_count-1]) rotate([i*360/combustor_count,0,0]) {
        translate([-80,1750+exploded*1100,0]) rotate([0,0,-combustor_inclination]) {
            combustor_can();
        }
        translate([0,exploded*620,0]) color([0.53,0.49,0.42]) transition_piece();
        color(steel) rotate([180/combustor_count,0,0])
            translate([-80+140*cos(combustor_inclination),(1750-140*sin(combustor_inclination))*cos(180/combustor_count),0])
            difference() {
                cylinder(h=2*(1750-140*sin(combustor_inclination))*sin(180/combustor_count)-455,r=43,center=true);
                cylinder(h=2*(1750-140*sin(combustor_inclination))*sin(180/combustor_count)-454,r=37,center=true);
            }
    }
    color([0.43,0.51,0.53]) {
        xprofile([[-200,799],[120,750],[580,590],[1160,550],[1570,700],[1650,750],
            [1650,690],[1130,480],[520,520],[80,680],[-200,750]]);
        xprofile([[-200,960],[150,1100],[450,1165],[760,1250],
            [760,1295],[420,1205],[100,1140],[-200,1010]]);
        radial(12) translate([440,885,0]) cube([200,550,45],center=true);
    }
}

module common_shaft() {
    xprofile([[140,0],[140,220],[220,220],[300,233.78],[1580,233.78],[1640,240],
        [3230,240],[3380,220],[3700,198.105],[5600,198.105],[5600,430],[5800,430],[5800,0]]);
    bolt_ring(5817,350,16,26);
}

module turbine() {
    translate([650*exploded,0,0]) {
        color(steel) {
            common_shaft();
            radial(12,15) translate([0,475,0]) xcylinder(1690,3270,27);
        }
        for(i=[0:2]) translate([i*260*exploded,0,0]) {
            x=2000+i*520;
            root=[745,735,715][i];
            outer=[1085,1205,1325][i];
            nx=x-[290,315,330][i];
            color(hot_color) {
                difference() {
                    xprofile([[x-160,240],[x-160,420],[x-110,640],[x-100,root-40],
                        [x+100,root-40],[x+100,620],[x+160,420],[x+160,240]]);
                    radial(12,15) translate([0,475,0]) xcylinder(x-195,x+195,31);
                }
                ring(x,root+19,200,70);
                row(x,turbine_bucket_count,root+10,outer,[190,205,235][i],26);
                if(i>0) ring(x+20,outer+14,[173,187,214][i],30);
                if(i<2) difference() {
                    xprofile([[x+160,260],[x+160,420],[x+195,610],
                        [x+325,610],[x+360,420],[x+360,260]]);
                    radial(12,15) translate([0,475,0]) xcylinder(x+159,x+361,31);
                }
            }
            if(show_stators) color([0.54,0.56,0.53]) {
                row(nx,[36,48,64][i],root+6,outer+26,[200,225,250][i],-26);
                ring(nx,outer+47,205,35);
                ring(nx,root+8,i==0?200:140,63);
            }
        }
        shell(1700,3370,1360,1600,100);
        color(case_color) for(side=[-1,1]) translate([2000,-200,side*1525])
            cylinder(h=450,r=110,center=true);
    }
}

module exhaust() {
    translate([1800*exploded,0,0]) {
        shell(3350,5120,1610,1940,80);
        color(steel) {
            xprofile([[3330,700],[3530,630],[4100,560],[4600,590],[4630,530],
                [4080,500],[3530,570],[3330,640]]);
            radial(10,18) translate([3970,1135,0]) cube([260,1150,55],center=true);
            for(i=[0:4]) let(r=690+i*225,x=4420+i*110)
                xprofile([[x,r],[x+190,r+6],[x+340,r+65],[x+430,r+170],[x+455,r+330],
                    [x+426,r+330],[x+400,r+180],[x+320,r+90],[x+180,r+35],[x,r+28]]);
        }
    }
}

module bearings() {
    stations=[-4850,1100,4080];
    journals=[200,233.78,198.105];
    lengths=[267,398.52,267.72];
    housing_ends=[[-5440,-4555],[640,1565],[3700,4460]];
    if(component=="bearings") color(steel) common_shaft();
    for(i=[0:2]) translate([stations[i],-650*exploded,0]) color([0.50,0.58,0.59]) {
        half_display() {
            difference() {
                xtube(housing_ends[i][0]-stations[i],housing_ends[i][1]-stations[i],410,410,60);
                radial_bore(0,300,460,35,180);
                radial_bore(-70,300,460,26,90);
                radial_bore(70,300,460,i==1?40:24,0);
            }
            if(i<2) difference() {
                xcylinder(-lengths[i]/2,lengths[i]/2,journals[i]+72);
                scale([1,1,i==0?1.01:1]) xcylinder(-lengths[i]/2-eps,lengths[i]/2+eps,journals[i]+3);
                translate([-lengths[i],-3,-500]) cube([lengths[i]*2,6,1000]);
            }
            else radial(5) difference() {
                intersection() {
                    ring(0,journals[i]+67,lengths[i],64);
                    rotate([60,0,0]) translate([-300,0,-400]) cube([600,500,800]);
                    rotate([-60,0,0]) translate([-300,0,-400]) cube([600,500,800]);
                }
                xcylinder(-lengths[i],lengths[i],journals[i]+3);
            }
            if(i==0) for(side=[-1,1]) {
                face=-370+side*41.5;
                difference() {
                    ring(face+side*12,332,24,97);
                    radial(8) translate([face+side*12,282,0]) cube([30,150,12],center=true);
                }
            }
            for(s=i==0?[-545,255]:i==1?[-405,-290,310,425]:[-320,320]) {
                ring(s,350,75,350-journals[i]-70);
                for(side=[-1,1],tooth=[0:2]) ring(s+side*(12+tooth*9),journals[i]+74,4,69);
            }
        }
    }
}

module base() {
    color([0.26,0.36,0.36]) {
        for(z=[-1420,1420]) translate([100,-2250,z]) cube([11400,350,270],center=true);
        for(x=[-5000,-3400,-1700,100,1900,3600,5500])
            translate([x,-2250,0]) cube([140,300,3100],center=true);
        for(m=[[-3830,-190,1400,122],[2000,-200,1640,112]]) for(side=[-1,1]) {
            top=m[1]-m[3]-55;
            translate([m[0],(-2020+top)/2,side*m[2]]) cube([300,top+2020,220],center=true);
            translate([m[0],-2020,side*m[2]]) cube([620,140,580],center=true);
            translate([m[0],m[1],side*m[2]]) intersection() {
                difference() {
                    cylinder(h=220,r=m[3]+55,center=true);
                    cylinder(h=222,r=m[3],center=true);
                }
                translate([-300,-300,-300]) cube([600,300,600]);
            }
        }
    }
}

if(section_enabled("inlet")) inlet();
if(section_enabled("compressor")) compressor();
if(section_enabled("combustion")) combustion();
if(section_enabled("turbine")) turbine();
if(section_enabled("exhaust")) exhaust();
if(section_enabled("bearings")) bearings();
if(show_base && component == "all") base();
