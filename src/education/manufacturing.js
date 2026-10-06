import { compressorManufacturing } from './manufacturing-compressor.js';
import { hotSectionManufacturing } from './manufacturing-hot-section.js';
import { mechanicsManufacturing } from './manufacturing-mechanics.js';

export function manufacturingForPart(part) {
  return compressorManufacturing(part) || hotSectionManufacturing(part) || mechanicsManufacturing(part);
}

const families = {
  inlet: [
    ['Radial inlet casing', 'inlet-casing-upper'],
    ['Variable inlet guide vanes', 'inlet-guide-vanes'],
    ['Hydraulic actuator and linkage', 'igv-actuator']
  ],
  compressor: [
    ['Bladed rotor wheels', 'compressor-rotor-1'],
    ['Stationary blade rows', 'compressor-stator-1'],
    ['Exit guide vanes', 'compressor-exit-guides'],
    ['Stub shafts and tie bolts', 'compressor-stub-shafts'],
    ['Compressor casings', 'compressor-casing-forward-upper']
  ],
  combustion: [
    ['Combustion wrapper', 'combustion-wrapper-upper'],
    ['Discharge diffuser and inner barrel', 'compressor-discharge-inner-barrel'],
    ['DLN1 combustor assembly', 'combustor-1'],
    ['Combustion liners', 'combustor-liner-1'],
    ['Transition pieces', 'transition-1'],
    ['Crossfire tubes and fuel manifolds', 'combustor-crossfire-manifolds']
  ],
  turbine: [
    ['Stage 1 wheels and buckets', 'turbine-wheel-1'],
    ['Stage 2 wheels and buckets', 'turbine-wheel-2'],
    ['Stage 3 wheels and buckets', 'turbine-wheel-3'],
    ['Stage 1 nozzles', 'turbine-nozzle-1'],
    ['Stage 2 nozzles', 'turbine-nozzle-2'],
    ['Stage 3 nozzles', 'turbine-nozzle-3'],
    ['Wheel spacers and through-studs', 'turbine-spacers-studs'],
    ['Turbine shell and shrouds', 'turbine-shell-upper']
  ],
  exhaust: [
    ['Exhaust frame and struts', 'exhaust-frame-struts'],
    ['Exhaust diffuser', 'exhaust-diffuser-upper'],
    ['Exhaust turning vanes', 'exhaust-turning-vanes']
  ],
  bearings: [
    ['Wheel shafts and coupling', 'shaft'],
    ['Bearing 1: journal and thrust', 'bearing-1'],
    ['Bearing 2: intermediate journal', 'bearing-2'],
    ['Bearing 3: tilting pads', 'bearing-3']
  ],
  supports: [['Turbine base frame', 'base-frame']]
};

export function manufacturingOverview(system) {
  const groups = system ? { [system]: families[system] } : families;
  if (system && !families[system]) return null;
  return {
    scope: 'Manufacturing by component family. Repeated chambers and blade rows share family notes; stage-specific hot-section differences are listed separately. Sources distinguish legacy GE practice, compatible replacement hardware and general manufacturing methods.',
    families: Object.entries(groups).flatMap(([systemId, entries]) => entries.map(([title, id]) => ({
      title,
      partId: id,
      record: manufacturingForPart({ id, system: systemId })
    })))
  };
}
