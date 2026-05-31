/**
 * Forecast feature demo — server-side exerciser of the deployed forecast-core module
 * (same code path the /forecast browser page uses). Full who×why output on example targets.
 *   pnpm exec tsx tools/forecast-demo.ts
 */
import { atlas } from '../src/utils/atlas.ts';
import { buildForecaster, type TargetProfile } from '../src/utils/forecast-core.ts';

const fc = buildForecaster(atlas(), { nowYear: 2026 });

function show(label: string, p: TargetProfile) {
  const r = fc.forecast(p);
  console.log(`\n══════ TARGET: ${label} ══════`);
  console.log(`  profile: ${[...p.sectors.map(s => 'sector:' + s), ...p.countries.map(c => 'country:' + c)].join(', ')}`);
  console.log(`  RELATIVE RISK: ${r.riskBand} (${r.riskPercentile}th pctile; ${r.comparableCount} comparable events)${r.basis === 'insufficient' ? '  [insufficient basis]' : ''}`);
  console.log(`  LIKELY ACTORS (by whom → why):`);
  for (const ac of r.actors) console.log(`    • ${ac.name.slice(0, 38).padEnd(38)} ${ac.doctrine ? '— ' + ac.doctrine.name.slice(0, 42) + ' [' + ac.doctrine.id + ']' : '— (no doctrine on record)'}`);
  console.log(`  COMPARABLE EVENTS:`);
  for (const c of r.comparables.slice(0, 3)) console.log(`    – ${c.date}  ${c.name.slice(0, 22).padEnd(22)} ${c.title.slice(0, 50)}`);
}

show('Taiwanese government agency', { sectors: ['government'], countries: ['tw'] });
show('US electric-grid / ICS operator', { sectors: ['ics', 'energy'], countries: ['us'] });
show('Israeli defense / government', { sectors: ['defense', 'government'], countries: ['il'] });
show('Ukrainian energy utility', { sectors: ['energy'], countries: ['ua'] });
show('Indian government ministry', { sectors: ['government'], countries: ['in'] });
console.log(`\n(sector options: ${fc.sectorOptions.length}, country options: ${fc.countryOptions.length})`);
