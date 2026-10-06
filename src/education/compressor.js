const NETL = {
  label: 'DOE / NETL: axial-compressor aerodynamics',
  url: 'https://www.netl.doe.gov/sites/default/files/gas-turbine-handbook/2-0.pdf',
};
const FAA = {
  label: 'FAA: axial-compressor pressure rise',
  url: 'https://www.faa.gov/sites/faa.gov/files/regulations_policies/handbooks_manuals/aviation/00-80T-80.pdf',
};
const GE_9E = {
  label: 'GE Vernova: 9E compressor design and durability',
  url: 'https://www.gevernova.com/gas-power/services/gas-turbines/upgrades/9e-advanced-compressor',
};

function video(time, topic) {
  const minutes = Math.floor(time / 60);
  const seconds = String(time % 60).padStart(2, '0');
  return {
    label: `Training video ${minutes}:${seconds}: ${topic}`,
    url: `https://www.youtube.com/watch?v=4r1-IMMS73s&t=${time}s`,
  };
}

function stageContext(stage) {
  if (stage === 1) return 'This first rotor meets air already turned by the variable inlet guide vanes. Its wheel is part of the forward stub shaft, so the aerodynamic entrance and the shaft-support structure sit close together.';
  if (stage <= 4) return `Stage ${stage} belongs to the forward compressor section. It receives the flow prepared by stator ${stage - 1}; disturbances entering the machine have already passed through the preceding rows before reaching this one.`;
  if (stage === 5) return 'This row sits near the cooling-and-sealing-air extraction groove described in the video. Some compressed air leaves through casing ports to serve other turbine systems; the remaining air continues through the compressor.';
  if (stage <= 8) return `Stage ${stage} lies in the middle of the compression process. It shares the aft casing region with adjacent rows, while its stationary partner still uses the first-eight-stage carrier-ring arrangement.`;
  if (stage <= 10) return `Stage ${stage} remains inside the aft casing. At this location the stationary vanes mount directly into casing grooves, unlike the carrier-ring arrangement used for stages 1 through 8.`;
  if (stage === 11) return 'This is the first row in the discharge-casing stage group. The video identifies a nearby extraction groove used for surge protection during transient operation, linking this location to the compressor air-management system.';
  if (stage <= 15) return `Stage ${stage} operates in the rear compressor group, after substantial upstream compression. Its shorter illustrated blade span expresses the smaller flow area needed for denser air; exact profiles and dimensions are reconstructed.`;
  if (stage === 16) return 'This row is immediately ahead of the aft stub shaft. The video describes cooling air entering through the gap between the sixteenth wheel and that stub shaft before being directed toward turbine-rotor parts.';
  return 'The final rotating row is carried by the aft stub-shaft wheel. It completes compressor shaft-work input before the final stator, two exit-guide rows and discharge diffuser prepare the air for the combustion system.';
}

function rotorLesson(stage) {
  const references = [video(98, '17-stage rotor construction'), FAA, GE_9E];
  if (stage === 5) references.splice(1, 0, video(340, 'cooling and sealing extraction'));
  if (stage === 11) references.splice(1, 0, video(356, 'transient surge-protection extraction'));
  if (stage >= 16) references.splice(1, 0, video(157, 'aft stub shaft and cooling-air path'));
  return {
    summary: `Rotor stage ${stage} of 17 adds mechanical energy to the air as the turbine-driven shaft turns its airfoils.`,
    keyIdea: 'A compressor rotor consumes shaft power. Pressure can rise inside the rotating blade passage as well as in the following stator.',
    operation: [
      'The blade row exerts a turning force on the air. The equal reaction loads the rotor, which is why the turbine must continuously supply torque to the compressor. Added work raises the air\'s total energy and temperature. Diffusion within a rotating passage can also raise static pressure; it is incomplete to assign all compression to the stationary row.',
      stageContext(stage),
    ],
    design: [
      'Blade shape must suit the approach flow seen by a moving blade, including both axial flow and blade speed. The correct angle changes along the span and through the stage sequence.',
      stage === 1 || stage === 17
        ? 'This end-stage wheel is integral with its stub shaft in the video. The wheel, blade attachment and shaft therefore share mechanical and aerodynamic duties.'
        : 'Dovetail roots transmit blade loads into the wheel; the video shows spacers establishing the relative axial positions of rotor and stator rows.',
      'Blade count, twist and tip gaps shown here are visual estimates, not an aerodynamic or clearance specification.',
    ],
    watch: [
      'Deposits, erosion and corrosion change an airfoil\'s surface and profile. GE identifies these, along with vibration, as important 9E compressor durability concerns.',
      'All 17 rows turn on one shaft. Each stage must accept the flow delivered by the previous one, so an unfavorable flow angle can affect more than one row.',
    ],
    references,
  };
}

function statorLesson(stage) {
  const mounting = stage <= 8
    ? 'The video places this row in dovetailed carrier-ring segments, which fit circumferential casing grooves. The segment is the intermediate support between the vane roots and the casing.'
    : 'The video places this row directly in a circumferential casing groove using square-base dovetails. The casing locates the vane row without the carrier-ring arrangement used in stages 1 through 8.';
  const next = stage === 17
    ? 'As the final stage stator, this row is followed by two separate exit-guide-vane rows rather than another compressor rotor. Together they prepare the flow for the discharge diffuser.'
    : `This row follows rotor ${stage} and prepares the approach flow for rotor ${stage + 1}. Its exit direction matters because the next rotor meets the air while moving around the shaft.`;
  return {
    summary: `Stator stage ${stage} of 17 is a fixed airfoil row that redirects flow and recovers static pressure after its rotor.`,
    keyIdea: 'A stator can raise static pressure without adding shaft work: it trades some flow speed for pressure.',
    operation: [
      `${next} The pressure field around the vanes turns and slows the air. In a real stationary passage, friction and mixing consume some total pressure even while static pressure increases.`,
      mounting,
    ],
    design: [
      'The vane must recover pressure while keeping flow attached to its surface. Stronger turning or diffusion can become less effective if the flow separates.',
      `Stage ${stage} geometry is matched to its neighboring rows. Repeating an identical vane through all 17 stages would ignore the changing density and approach conditions.`,
      'Root support and the surrounding casing establish the row position. The illustrated attachment concept follows the video; detailed retention features are simplified.',
    ],
    watch: [
      'Stationary does not mean unloaded: redirecting air applies aerodynamic forces to the vanes and their supports.',
      'A distorted or rough vane changes the conditions seen by the next row. Surface condition, support condition and flow behavior are therefore connected.',
      stage === 17
        ? 'This seventeenth stator is distinct from EGV 1 and EGV 2, which are separately selectable in the model.'
        : `The number ${stage} identifies a compressor stage, not a count of individual vanes. The displayed vane population is estimated.`,
    ],
    references: [video(520, 'stator attachments'), video(stage === 17 ? 548 : 62, stage === 17 ? 'exit-guide rows' : 'rotor and stator stages'), NETL],
  };
}

function casingLesson(section, half) {
  const config = {
    forward: {
      stages: '1 through 4', time: 306,
      role: 'The forward casing carries the first four compressor stator rows and establishes the entrance-region structure immediately downstream of the inlet guide vanes.',
      detail: half === 'lower'
        ? 'The video identifies trunnions and a forward turbine-support-plate attachment on the lower half. These features show that the casing belongs to the machine load path as well as enclosing air.'
        : 'The upper half completes the pressure enclosure over the forward rotor rows. Its horizontal joint meets the lower half, while circumferential end flanges connect neighboring casing sections.',
      extra: 'The first four stator rows use carrier-ring segments. The casing has to position those supports relative to a rotor that spins through their annulus.',
      watch: 'The visible trunnions are source-based structural features; the model does not establish lifting loads or handling arrangements.',
    },
    aft: {
      stages: '5 through 10', time: 332,
      role: 'The aft casing supports the middle compressor stator rows and provides access to extracted compressor air. Its external connections belong to the cooling, sealing and transient air-management paths.',
      detail: 'The video describes a groove near wheel 5 feeding two upper and two lower ports for cooling and sealing. It also identifies an extraction groove near wheel 11 used for surge protection during transients. Extraction is therefore a deliberate part of the engine air balance.',
      extra: 'This section spans the attachment change: stators 5 through 8 use carrier segments; stators 9 and 10 mount directly in casing grooves.',
      watch: 'A cooling-air extraction and a transient bleed serve different purposes. Similar-looking external ports do not imply identical operating behavior.',
    },
    discharge: {
      stages: '11 through 17 plus both exit-guide rows', time: 372,
      role: 'The discharge casing is the structural connection between compressor, combustion system and turbine. This selectable shell represents its outer compressor-region portion; the larger discharge support structure has separate model parts.',
      detail: 'The video places the final seven compressor stator rows and both exit-guide rows here. It describes inner and outer cylinders connected by 12 struts, with the annular space acting as a diffuser that converts part of the remaining flow speed into static pressure.',
      extra: 'This region combines aerodynamic pressure recovery with support for neighboring assemblies. Its shape must accommodate both the air path and the transition-piece arrangement.',
      watch: 'The discharge casing is not the combustor liner: it contains compressed air upstream of combustion, even though it sits next to hot-section hardware.',
    },
  }[section];
  if (!config) return null;
  return {
    summary: `${config.role} This is the ${half} half.`,
    keyIdea: 'The casing both contains pressure and positions the stationary hardware around the rotating assembly.',
    operation: [config.detail],
    design: [
      `Its stator group covers stages ${config.stages}. ${config.extra}`,
      'The horizontal split makes internal assemblies accessible. The joint and end flanges must also preserve the intended casing shape and alignment under mechanical and thermal loading.',
      'The model separates the halves to reveal internal relationships; the displayed separation is an illustration, not a disassembly sequence.',
    ],
    watch: [
      config.watch,
      'Casing position and vane position are connected. An apparently small geometric change can alter the space available to a rotating blade or the flow passage beside it.',
      'Wall thickness, flange stiffness, port dimensions and running clearances have not been established by this reconstruction.',
    ],
    references: [video(config.time, `${section} casing`), video(520, 'stator mounting'), NETL],
  };
}

const LESSONS = {
  'compressor-stub-shafts': {
    summary: 'The stub shafts and tie bolts organize the 17 compressor wheels into one rotating assembly and connect it to the rest of the machine.',
    keyIdea: 'A rotor is a mechanical system: disk alignment, torque transmission, balance, seals and axial location all work together.',
    operation: [
      'The video describes 15 individual wheels plus wheel portions integral with the two stub shafts, held together by 16 tie bolts. At the front, a journal runs in bearing No. 1, the thrust collar transfers axial loads to the thrust bearing, and the auxiliary-drive flange connects to the gearbox.',
      'The aft flange joins the turbine rotor. An impeller feature at the aft stub draws cooling air through the region behind wheel 16, while labyrinth teeth cooperate with stationary seals to restrict leakage toward the inner barrel.',
    ],
    design: [
      'The end shafts combine several precision features in a compact space. A seal land, journal and flange may look like similar cylinders, but they have different jobs.',
      'Balance features address uneven mass distribution. GE also identifies the aft-stub impeller geometry as a design area affecting stress and vibration tolerance.',
      'The 60-tooth forward ring creates repeating targets for speed sensing; it is separate from the airflow-producing compressor blades.',
    ],
    watch: [
      'The thrust collar controls axial position through its bearing interface; the journal supports radial motion. Neither feature eliminates the need for the other.',
      'Tie-bolt count and construction follow the video. Bolt loads, material properties and rotor dynamic behavior are not calculated in this model.',
    ],
    references: [video(98, 'rotor construction'), video(117, 'forward-shaft features'), video(157, 'aft-shaft features'), GE_9E],
  },
  'compressor-exit-guides': {
    summary: 'Two stationary exit-guide-vane rows condition the air leaving the seventeenth compressor stage before it enters the discharge diffuser.',
    keyIdea: 'Residual swirl contains motion that is not useful to the downstream combustion air supply; exit vanes organize that flow.',
    operation: [
      'The final compressor rotor leaves the air with a circumferential velocity component. After the final stage stator, these additional vane rows reduce the remaining rotation and support pressure recovery. They are fixed to the structure and do not extract useful shaft power.',
      'The next passage is the compressor-discharge diffuser. A more suitably directed inlet flow helps that expanding passage slow the air before it is distributed around the reverse-flow combustion system. Vanes and diffuser therefore form a connected aerodynamic handoff.',
    ],
    design: [
      'The desired exit direction must be achieved with limited loss. Turning and slowing the air too aggressively can make flow detach from a vane surface.',
      'Two rows provide separate steps in conditioning the flow. The exact sharing of turning and loading between them is not available from the source video.',
      'The illustrated inner and outer supports locate the vane passages; their profiles and the individual vane counts are reconstructed.',
    ],
    watch: [
      'Static pressure recovery does not mean total energy has been added. Unlike a rotor, a stationary exit guide has no shaft-work input.',
      'These are extra guide rows after stage 17, not eighteenth and nineteenth compressor stages.',
    ],
    references: [video(548, 'two exit-guide rows'), video(425, 'discharge diffuser'), NETL],
  },
  'inlet-guide-vanes': {
    summary: 'The 64 variable inlet guide vanes set the airflow delivered to the first compressor rotor.',
    keyIdea: 'Changing vane angle changes both the available passage and the direction in which air meets the moving first-stage blades.',
    operation: [
      'Each vane pivots about its stem. Pinion gears on the stems engage a common ring gear, and a hydraulic actuator moves the control ring. The video describes groups of four vanes supported at their inner ends by one segment, giving 16 inner support segments.',
      'A rotor responds to the air velocity relative to its moving blade. The inlet guide row changes that approach condition before any rotor work is added. Variable geometry helps the compressor accommodate changing airflow requirements; vane position is therefore an aerodynamic control input, not just an opening-size adjustment.',
    ],
    design: [
      'The common ring coordinates all 64 vanes. The linkage must turn the airfoils consistently around the annulus so one region does not receive a different inlet condition.',
      'Bushings support pivot motion while the airfoil carries aerodynamic load. GE identifies the bushing region, pitting and trailing-edge rubbing as 9E durability concerns.',
      'The video quotes an angle range for its configuration. The reconstructed intermediate position is illustrative and does not define settings for another unit.',
    ],
    watch: [
      'The IGVs are stationary relative to the casing while the rotor spins, but their setting can change. Most compressor stator rows shown here have fixed settings.',
      'Vane shape, linkage condition and setting all affect the air received by rotor stage 1.',
    ],
    references: [video(244, 'inlet guide function'), video(256, '64 vanes and support arrangement'), video(277, 'pinions and control ring'), NETL, GE_9E],
  },
  'igv-actuator': {
    summary: 'The hydraulic actuator converts a control demand into motion of the common inlet-guide-vane ring.',
    keyIdea: 'A small linkage motion changes the aerodynamic setting of an entire circular row of inlet vanes.',
    operation: [
      'Hydraulic pressure produces actuator force. The rod and tangential linkage move the control ring; the ring gear then rotates the pinions keyed to the 64 vane stems. This chain links a single actuator to the inlet flow condition around the whole compressor.',
      'The actuator does not supply compressor shaft power. Its role is to position the aerodynamic surfaces while the main turbine shaft provides the power that compresses air. The arrangement shown follows the video concept, with the precise attachment locations and hydraulic routing reconstructed.',
    ],
    design: [
      'Linkage geometry trades actuator travel against ring rotation and force. The complete mechanism must reach the intended vane positions without conflicting motions.',
      'The common ring synchronizes the vanes, while each stem and inner support still has to permit the required local rotation.',
      'Airflow is sensitive to the achieved vane setting. An actuator position and the actual orientation of every vane are related through the mechanical linkage.',
    ],
    watch: [
      'Lost motion in a linkage means some input travel may occur before the driven part follows. This is a useful control concept when interpreting a mechanism with several joints.',
      'The source identifies hydraulic actuation. Specific valve arrangements, feedback devices and control schedules are not established by the reconstructed geometry.',
    ],
    references: [video(277, 'ring and pinion mechanism'), video(291, 'hydraulic actuator'), NETL],
  },
};

function inletCasingLesson(half) {
  return {
    summary: `The ${half} inlet-casing half helps collect incoming air, turn it into the axial compressor and support the inlet-region assemblies.`,
    keyIdea: 'Good inlet flow is both clean and well directed: the first rotor inherits whatever the inlet delivers.',
    operation: [
      'In this industrial radial-inlet arrangement, air approaches around the inlet region and turns downstream toward the compressor axis. The internal bellmouth shapes that turn into the annular passage between the central support structure and the outer wall. The guide-vane row sits at the downstream end.',
      `The complete casing also supports the No. 1 bearing region and the inlet guide vanes. The ${half} half is one part of that shared structure, so it serves mechanical and airflow functions at the same time. The upstream filter house and inlet ductwork are outside this model.`,
    ],
    design: [
      'The turning passage must deliver a reasonably uniform approach to the guide vanes. Structural supports occupy part of that passage and must coexist with the airflow.',
      'A smooth-looking inlet is not automatically a low-loss inlet: bend shape, area changes and support geometry all influence the delivered flow.',
      'The split casing exposes the bearing-support and bellmouth relationships in the model. Its wall profiles, fasteners and support dimensions remain estimates.',
    ],
    watch: [
      'GE identifies water, dust and other contaminants as contributors to 9E compressor degradation. The inlet system is the first part of that chain.',
      'The broad inlet passage is not an extra compression stage. Shaft-work input begins in the first rotating compressor row.',
    ],
    references: [video(237, 'inlet and contaminants'), video(244, 'guide-vane location'), video(2612, 'No. 1 bearing region'), GE_9E],
  };
}

export function compressorEducation(part) {
  if (!part || !['inlet', 'compressor'].includes(part.system)) return null;
  const rotor = /^compressor-rotor-(\d+)$/.exec(part.id);
  if (rotor) return rotorLesson(Number(rotor[1]));
  const stator = /^compressor-stator-(\d+)$/.exec(part.id);
  if (stator) return statorLesson(Number(stator[1]));
  const casing = /^compressor-casing-(forward|aft|discharge)-(upper|lower)$/.exec(part.id);
  if (casing) return casingLesson(casing[1], casing[2]);
  const inlet = /^inlet-casing-(upper|lower)$/.exec(part.id);
  if (inlet) return inletCasingLesson(inlet[1]);
  return LESSONS[part.id] ?? null;
}
