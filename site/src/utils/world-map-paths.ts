/**
 * Shared world-map path data — projected once at module load, reused
 * across the homepage WorldMapDashboard and any per-state attribution
 * maps. Build-time projection via d3-geo over the world-atlas TopoJSON.
 */
import { feature } from 'topojson-client';
import { geoMercator, geoPath } from 'd3-geo';
import topoJson from 'world-atlas/countries-110m.json';

/** Numeric ISO-3166 → lowercase alpha-2 lookup for the countries we care about. */
export const NUM_TO_A2: Record<string, string> = {
  '643': 'ru', '156': 'cn', '364': 'ir', '408': 'kp', '840': 'us',
  '804': 'ua', '376': 'il', '410': 'kr', '158': 'tw', '392': 'jp',
  '826': 'gb', '276': 'de', '250': 'fr', '724': 'es', '380': 'it',
  '124': 'ca', '036': 'au', '554': 'nz', '578': 'no', '752': 'se',
  '208': 'dk', '246': 'fi', '233': 'ee', '440': 'lt', '428': 'lv',
  '616': 'pl', '203': 'cz', '348': 'hu', '642': 'ro', '100': 'bg',
  '191': 'hr', '703': 'sk', '705': 'si', '300': 'gr', '792': 'tr',
  '356': 'in', '050': 'bd', '586': 'pk', '524': 'np', '064': 'bt',
  '144': 'lk', '462': 'mv', '104': 'mm', '764': 'th', '116': 'kh',
  '704': 'vn', '458': 'my', '702': 'sg', '360': 'id', '608': 'ph',
  '682': 'sa', '784': 'ae', '414': 'kw', '634': 'qa', '048': 'bh',
  '512': 'om', '400': 'jo', '760': 'sy', '422': 'lb', '887': 'ye',
  '368': 'iq', '004': 'af', '818': 'eg', '434': 'ly', '788': 'tn',
  '012': 'dz', '504': 'ma', '710': 'za', '566': 'ng', '404': 'ke',
  '076': 'br', '484': 'mx', '032': 'ar', '152': 'cl', '170': 'co',
  '604': 'pe', '858': 'uy', '862': 've', '218': 'ec',
};

export interface CountryPath {
  /** Numeric ISO. */
  id: string;
  /** Lowercase alpha-2, or null if outside the atlas's coverage map. */
  iso2: string | null;
  /** Human name from natural-earth. */
  name: string;
  /** SVG path d for the Mercator-projected geometry. */
  d: string;
}

export const MAP_W = 960;
export const MAP_H = 500;

// Project once at module load.
const fc = feature(topoJson as any, (topoJson as any).objects.countries) as any;
const projection = geoMercator()
  .scale(150)
  .translate([MAP_W / 2, MAP_H / 1.55])
  .center([10, 30]);
const path = geoPath(projection);

export const COUNTRIES: CountryPath[] = (() => {
  const out: CountryPath[] = [];
  for (const f of fc.features) {
    const id = String(f.id ?? '');
    const d = path(f as any);
    if (!d) continue;
    out.push({
      id,
      iso2: NUM_TO_A2[id] ?? null,
      name: f.properties?.name ?? id,
      d,
    });
  }
  return out;
})();
