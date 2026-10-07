import { compressorSupply } from './research-compressor.js';
import { hotSectionSupply } from './research-hot-section.js';
import { mechanicsSupply } from './research-mechanics.js';

export const heatColors = ['#387e9e', '#60a6a5', '#e1bf67', '#cf8146', '#a84342'];
export const ratingNames = ['Low', 'Modest', 'Substantial', 'High', 'Very high'];
export const quadrants = {
  leverage: { title: 'Leverage', caption: 'Compete qualified offers', axes: 'High impact · Low risk' },
  strategic: { title: 'Strategic', caption: 'Partner & plan continuity', axes: 'High impact · High risk' },
  routine: { title: 'Non-critical', caption: 'Simplify routine purchasing', axes: 'Low impact · Low risk' },
  bottleneck: { title: 'Bottleneck', caption: 'Secure supply & alternatives', axes: 'Low impact · High risk' },
};
export const frameworkSource = { label: 'CIPS · Kraljic sourcing framework', url: 'https://www.cips.org/intelligence-hub/supplier-relationship-management/kraljic-matrix' };
export function supplyForPart(part) {
  return compressorSupply(part) || hotSectionSupply(part) || mechanicsSupply(part);
}
export function quadrantFor(record) {
  return record.businessImpact >= 3
    ? (record.supplyRisk >= 3 ? 'strategic' : 'leverage')
    : (record.supplyRisk >= 3 ? 'bottleneck' : 'routine');
}
export function isCostOpportunity(record) {
  return record.cost >= 4 && record.criticality <= 2;
}
export function heatColor(record, mode) {
  const score = record?.[mode];
  return (mode === 'cost' || mode === 'criticality') && Number.isInteger(score) && score >= 1 && score <= 5 ? heatColors[score - 1] : null;
}
