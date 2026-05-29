# Threat-actor naming reconciliation

A canonical → vendor cross-walk. The same operational cluster carries up to ~10 names across vendors and governments; AUSPEX needs a single internal ID per cluster, with all aliases retained.

## Vendor naming conventions (the "Rosetta stones")

| Vendor / source | Convention | Example |
|---|---|---|
| **Mandiant (now Google GTIG)** | `APT##` for high-confidence persistent groups; `UNC####` for unclassified clusters; `TEMP.<name>` for active campaigns | APT28, UNC2452 |
| **Microsoft MSTIC (post-April 2023)** | Weather adjective + family noun. Families map to origin/motivation. Pre-2023 used periodic-table element names (STRONTIUM, NOBELIUM). `Storm-####` for developing clusters; `Dev-####` is the older form (deprecated). | Forest Blizzard, Midnight Blizzard, Storm-0391 |
| **CrowdStrike** | Adjective + national-animal noun. Nation maps via the animal. SPIDER = ecrime; JACKAL = hacktivist. | Fancy Bear, Wicked Panda, Famous Chollima |
| **Cisco Talos** | Often adopts community names; uses Group-IDs (GIDs) in detections; some original (e.g. *Cosmic Lynx* for BEC) | (uses community names, e.g., "Volt Typhoon") |
| **Kaspersky GReAT** | Original names per cluster, often geographic / botanical (Equation, Sofacy, Lazarus, GhostEmperor) | Sofacy (=APT28), GhostEmperor (=Salt Typhoon) |
| **Palo Alto Unit 42** | `<adjective> Taurus` for state actors; `<adjective> Spider` for crimeware | Insidious Taurus (=Volt Typhoon), Stately Taurus (=Mustang Panda) |
| **Trend Micro** | `Earth <name>` (states), `Water <name>` (criminal) | Earth Preta (=Mustang Panda), Earth Estries (=Salt Typhoon) |
| **Secureworks CTU** (legacy; Sophos as of 2025) | `BRONZE <…>` = China; `IRON <…>` = Russia; `COBALT <…>` = Iran; `NICKEL <…>` = DPRK; `GOLD <…>` = ecrime | BRONZE SILHOUETTE (=Volt Typhoon) |
| **MITRE ATT&CK** | `G####` Group IDs; the page lists every known alias as the cross-reference of record | G0007 = APT28 |
| **NSA / CISA / FBI joint advisories** | Use community names with explicit alias lists in the document header | "Volt Typhoon, a.k.a. Vanguard Panda, BRONZE SILHOUETTE…" |

### Microsoft "weather" taxonomy (April 2023)

Family-noun = origin / category. Adjective distinguishes clusters in that family.

| Family | Origin / category |
|---|---|
| Typhoon | China nation-state |
| Blizzard | Russia nation-state |
| Sandstorm | Iran nation-state |
| Sleet | North Korea nation-state |
| Rain | Lebanon nation-state |
| Dust | Turkey nation-state |
| Cyclone | Vietnam nation-state |
| Hail | South Korea nation-state |
| **Tempest** | Financially motivated (criminal) |
| **Tsunami** | Private-sector offensive actors (commercial spyware / mercenaries) |
| **Flood** | Influence operations |
| **Storm-####** | Emerging / developing cluster (pre-promotion) |

(Note: AUSPEX's task brief mentioned "Hail = financially motivated"; the canonical Microsoft mapping is **Hail = South Korea, Tempest = financially motivated criminal, Tsunami = PSOA**. Brief is updated above to match the current Microsoft taxonomy.)

### CrowdStrike origin-animals

| Suffix | Origin / category |
|---|---|
| Panda | China |
| Bear | Russia |
| Kitten | Iran |
| Chollima | North Korea |
| Buffalo | Vietnam |
| Tiger | India |
| Leopard | Pakistan |
| Crane | South Korea |
| Wolf | Turkey |
| Hawk | Syria |
| Lynx | Georgia |
| Ocelot | Colombia |
| Spider | Financially-motivated ecrime |
| Jackal | Hacktivist |

---

## Master cross-walk — China

| Canonical (community) | Origin / unit | Mandiant | Microsoft | CrowdStrike | Talos / community | Kaspersky | MITRE ATT&CK | NSA-CISA / DOJ | Other |
|---|---|---|---|---|---|---|---|---|---|
| **APT1** | PLA Unit 61398 (3PLA) | APT1 | (pre-taxonomy) | Comment Panda | Comment Crew | Comment Crew | G0006 | Mandiant 2013 report | TG-8223; BrownFox |
| **APT3** | MSS, Guangdong (Boyusec) | APT3 | (legacy: Gothic Panda) | Gothic Panda | UPS Team | — | G0022 | DOJ 2017 indictment (Wu Yingzhuo et al.) | TG-0110; Buckeye |
| **APT10** | MSS Tianjin (Huaying Haitai contractor) | APT10 | Purple Typhoon (legacy: POTASSIUM) | Stone Panda | menuPass, Cloud Hopper | menuPass | G0045 | DOJ 2018 indictment (Zhu Hua, Zhang Shilong) | Red Apollo; CVNX; BRONZE RIVERSIDE; HOGFISH; TA429 |
| **APT15** | MSS (Vixen Panda lineage) | APT15 | Nylon Typhoon (legacy: NICKEL) | Vixen Panda / Ke3chang | Ke3chang | Vixen Panda | G0004 | — | Royal APT; Mirage; Playful Dragon; BRONZE PALACE |
| **APT17** | MSS Jinan | APT17 | (legacy DeputyDog) | Aurora Panda | DeputyDog | — | G0025 | DOJ 2024 indictment (i-Soon-linked) | Hidden Lynx; Tailgater; BRONZE KEYSTONE |
| **APT27** | MSS (contractor ecosystem) | APT27 | (legacy LuckyMouse) | Emissary Panda | LuckyMouse | LuckyMouse | G0027 | — | Iron Tiger; BRONZE UNION; TG-3390 |
| **APT31** | MSS Hubei (Wuhan Xiaoruizhi contractor) | APT31 | Judgment Panda (CS) / Violet Typhoon (MS) | Judgment Panda | Zirconium (legacy MS) | Hurricane Panda overlap | G0128 | DOJ 2024 indictment (Ni Gaobin et al.); UK/US sanctions Mar 2024 | RedBravo; BRONZE VINEWOOD |
| **APT40** | MSS Hainan (Hainan Xiandun contractor) | APT40 | (legacy GADOLINIUM) | Gingham Typhoon (CS) / Leviathan | Leviathan, Kryptonite Panda | TEMP.Periscope, TEMP.Jumper | G0065 | DOJ 2021 indictment; FVEY joint advisory Jul 2024 | TA423; BRONZE MOHAWK; ISLANDDREAMS |
| **APT41** | MSS + moonlight ecrime | APT41 | Brass Typhoon (legacy: BARIUM) | Wicked Panda | Double Dragon, Winnti | Winnti | G0096 | DOJ 2020 indictment (5 Chengdu 404 officers) | BRONZE ATLAS; BRONZE EXPORT; Earth Baku (Trend); Blackfly; Grayfly; HOODOO; TA415; LEAD |
| **Volt Typhoon** | PLA / MSS (precise unit disputed) | UNC3236 | Volt Typhoon (was Dev-0391/Storm-0391) | Vanguard Panda | Insidious Taurus (Unit 42) | — | G1017 | CISA AA24-038A, AA23-144A | BRONZE SILHOUETTE; VOLTZITE (Dragos); Redfly (Symantec) |
| **Salt Typhoon** | MSS | UNC5807 (distinct from UNC2286 per GTIG) | Salt Typhoon | Operator Panda | Earth Estries (Trend) | GhostEmperor | (pending) | CISA + FBI Aug 2024 joint statement; FCC actions Dec 2024 | FamousSparrow (ESET); RedMike (RF); UNC2286 |
| **Hafnium** | MSS Hubei contractor (Shanghai Powerock + Wuhan Xiaoruizhi) | UNC2640 cluster | Silk Typhoon (was Hafnium) | Murky Panda | — | — | G0125 | DOJ Jul 2025 indictment (Xu Zewei, Zhang Yu) | — |
| **Mustang Panda** | MSS | TEMP.Hex | Twill Typhoon (was TANTALUM) | Mustang Panda (Roaring Lion variant) | RedDelta, Camaro Dragon | HoneyMyte, LuminousMoth | G0129 | DOJ Sep 2024 disruption (PlugX takedown) | BRONZE PRESIDENT; Stately Taurus (Unit 42); Earth Preta (Trend); TA416; FIREANT; HIVE0154; UNC6384; Red Lich; BASIN |

---

## Master cross-walk — Russia

| Canonical | Origin / unit | Mandiant | Microsoft | CrowdStrike | Talos / community | Kaspersky | MITRE ATT&CK | NSA-CISA / DOJ | Other |
|---|---|---|---|---|---|---|---|---|---|
| **APT28** | GRU Unit 26165 (85th GTsSS) | APT28 | Forest Blizzard (was STRONTIUM) | Fancy Bear | Sednit, Pawn Storm | Sofacy | G0007 | DOJ 2018 + 2020 indictments; CISA AA22-216A; FBI 2024 takedown of GRU botnet | Tsar Team; SNAKEMACKEREL; IRON TWILIGHT; Swallowtail; Group 74; TG-4127; FROZENLAKE; ITG05; GruesomeLarch; TA422; Fighting Ursa; BlueDelta |
| **APT29** | SVR (Center 16 / Directorate S) | APT29 | Midnight Blizzard (was NOBELIUM/YTTRIUM) | Cozy Bear | The Dukes | The Dukes | G0016 | Joint US/UK SolarWinds attribution Apr 2021; CISA AA24-057A | Dark Halo; UNC2452; UNC3524; CozyDuke; SolarStorm; NobleBaron; BlueBravo; Cloaked Ursa; IRON RITUAL; IRON HEMLOCK; StellarParticle; TEMP.Monkeys |
| **Sandworm** | GRU Unit 74455 (GTsST) | APT44 | Seashell Blizzard (was IRIDIUM) | Voodoo Bear | TeleBots, BlackEnergy | Sandworm | G0034 | DOJ 2020 + 2022 indictments; CISA AA22-110A; UK NCSC attribution | IRON VIKING; ELECTRUM (Dragos); FROZENBARENTS; Quedagh; BE2; BlackEnergy Lite; UAC-0082; UAC-0113 |
| **Cadet Blizzard** (sub-Sandworm or sibling) | GRU Unit 29155 | UNC2589 / FROZENVISTA | Cadet Blizzard | (no public CS name) | — | — | G1003 | NSA/CISA/FBI/NCSC joint Sep 2024 | DEV-0586; Ember Bear (CS, partial overlap) |
| **Turla** | FSB Center 16 | Turla | Secret Blizzard (was KRYPTON) | Venomous Bear | Snake, Uroburos | Turla | G0010 | CISA/UK NCSC May 2023 Snake takedown | IRON HUNTER; Waterbug; WhiteBear; Group 88; BELUGASTURGEON; ATK13 |
| **Gamaredon** | FSB Center 18 / Sevastopol | — (covered as "Shuckworm" research) | Aqua Blizzard (was ACTINIUM) | Primitive Bear | Shuckworm | Gamaredon | G0047 | SSU Ukraine doxxed 5 officers Nov 2021 | Armageddon; Trident Ursa (Unit 42); Iron Tilden; BlueAlpha; Winterflouder; SectorC08; UAC-0010 |
| **Energetic Bear / DragonFly / Berserk Bear** | FSB Center 16 (TsNII Khimii i Mekhaniki) | TEMP.Isotope | (was DYMALLOY) | Energetic Bear / Berserk Bear (later sub-cluster) | DragonFly, Crouching Yeti | Energetic Bear | G0035 | DOJ 2022 indictment (Akulov et al.) | IRON LIBERTY; TG-4192; ALLANITE (Dragos) |
| **COLDRIVER** | FSB Center 18 | Star Blizzard (Mandiant adopted MS) | Star Blizzard (was SEABORGIUM) | Gossamer Bear | Calisto | Callisto Group | G1003 (overlap caveat) | DOJ Dec 2023 indictment; UK FCDO Dec 2023 attribution | TA446; BlueCharlie; TAG-53 |
| **Conti / Trickbot ecosystem** (state-adjacent) | Independent ecrime, but Conti leaks revealed FSB ties; some members sanctioned | UNC1878 / FIN12 (partial) | (Tempest family for ecrime) | Wizard Spider | Wizard Spider | — | G0102 (Wizard Spider) | OFAC sanctions Sep 2023 (Trickbot members); UK FCDO Feb 2024 sanctions | Grim Spider; Conti; Ryuk operators |

---

## Master cross-walk — Iran

| Canonical | Origin / unit | Mandiant | Microsoft | CrowdStrike | Talos / community | Kaspersky | MITRE ATT&CK | NSA-CISA / DOJ | Other |
|---|---|---|---|---|---|---|---|---|---|
| **APT33** | IRGC-IO / Nasr Institute contractors | APT33 | Peach Sandstorm (was HOLMIUM) | Refined Kitten | Elfin | Elfin | G0064 | — | Magnallium (Dragos); ATK35; TA451 |
| **APT34** | MOIS | APT34 | Hazel Sandstorm (was EUROPIUM) | Helix Kitten | OilRig | OilRig | G0049 | CISA/FBI joint Oct 2024 advisory (Earth Simnavaz / OilRig) | Cobalt Gypsy; Crambus; IRN2; Evasive Serpens (Unit 42); Earth Simnavaz (Trend); ITG13; TA452; Chrysene; Greenbug |
| **APT35** | IRGC-IO | APT35 | Mint Sandstorm (was PHOSPHORUS) | Charming Kitten | Charming Kitten | NewsBeef | G0059 | DOJ 2018 indictment (Mabna Institute) | Magic Hound; Ajax Security; Newscaster; TA453; Cobalt Illusion; ITG18 |
| **APT39** | MOIS (front company Rana Institute) | APT39 | Remix Kitten / (legacy ITG07) | Remix Kitten | Chafer | Chafer | G0087 | OFAC sanctions Sep 2020 (Rana Institute) | ATK51 |
| **MuddyWater** | MOIS | MuddyWater | Mango Sandstorm (was MERCURY) | Static Kitten | MuddyWater | MuddyWater | G0069 | CISA AA22-055A; CyberCom Jan 2022 link to MOIS | Seedworm; TEMP.Zagros; Cobalt Ulster; Earth Vetala (Trend); Mango Sandstorm; Boggy Serpens (Unit 42); ATK51 |
| **Pioneer Kitten / Fox Kitten** | IRGC contractor (operates as "Br0k3r" / "xplfinder") | UNC757 | Lemon Sandstorm (was RUBIDIUM) | Pioneer Kitten | Fox Kitten | — | G1051 | CISA AA24-241A (Aug 2024) | Parisite; PARISITE; ATK184 |
| **CyberAv3ngers** | IRGC-CEC (Cyber & Electronic Command) | UNC5691 | Storm-0784 | Hydro Kitten | CyberAv3ngers | — | G1027 | Treasury OFAC Feb 2024 sanctions (6 IRGC officers); CISA Dec 2023 advisory | Bauxite (Dragos); Soldiers of Solomon (persona); IRGC-CEC |

---

## Master cross-walk — DPRK

| Canonical | Origin / unit | Mandiant | Microsoft | CrowdStrike | Talos / community | Kaspersky | MITRE ATT&CK | NSA-CISA / DOJ | Other |
|---|---|---|---|---|---|---|---|---|---|
| **Lazarus Group** (umbrella) | RGB Bureau 121 (3rd Bureau / Lab 110) | TEMP.Hermit | Diamond Sleet (was ZINC) | Labyrinth Chollima | Lazarus | Lazarus | G0032 | CISA AA22-108A; DOJ 2018/2021 indictments (Park Jin Hyok et al.); OFAC sanctions Sep 2019 | Hidden Cobra (DHS/FBI legacy); Guardians of Peace; NICKEL ACADEMY; APT-C-26; Whois Team |
| **APT37** | RGB | APT37 | Ricochet Chollima — wait: Mulberry Sleet | ScarCruft / Ricochet Chollima | ScarCruft | ScarCruft | G0067 | — | Reaper; Group123; Geumseong121; InkySquid; TEMP.Reaper; ATK4; ITG10 |
| **APT38** (financial sub-cluster of Lazarus) | RGB | APT38 | Sapphire Sleet (was COPERNICIUM) (note: MS partial map; BlueNoroff is sometimes Sapphire Sleet) | Stardust Chollima | BeagleBoyz | BlueNoroff | G0082 | OFAC Sep 2019; CISA AA22-187A (BeagleBoyz) | NICKEL GLADSTONE; Bluenoroff (sub-cluster name often used coextensively with APT38) |
| **Kimsuky** (= APT43 to Mandiant; Mandiant treats APT43 as the strategic-intel subset) | RGB | APT43 (subset) | Emerald Sleet (was THALLIUM) | Velvet Chollima | Kimsuky | Kimsuky | G0094 | CISA AA20-301A; State Dept rewards | Black Banshee; TA427; Springtail; Earth Kumiho (Trend); PatheticSlug; ARCHIPELAGO; Sparkling Pisces; UAT-5394 |
| **Andariel** (sub-Lazarus) | RGB | UNC614 / APT45 | Onyx Sleet (was PLUTONIUM) | Silent Chollima | Andariel | Andariel | G0138 | DOJ Jul 2024 indictment (Rim Jong Hyok); CISA AA24-207A | Stonefly; Operation GhostSecret; ATK117 |
| **BlueNoroff** (sub-Lazarus, financial) | RGB | (covered under APT38) | Sapphire Sleet | Stardust Chollima | BlueNoroff | BlueNoroff | (under G0082) | Same as APT38 actions | SnatchCrypto operator |
| **Citrine Sleet** (DeFi-focused) | RGB | — | Citrine Sleet (was DEV-0139 / DEV-1222) | Labyrinth Chollima subset | AppleJeus operator | — | — | CISA Sep 2024 alert | UNC4736 (overlap with TraderTraitor / Jade Sleet) |
| **Moonstone Sleet** | RGB | — | Moonstone Sleet (was Storm-1789) | — | — | — | — | Microsoft May 2024 disclosure | New cluster, fake-job lures + ransomware |

---

## Practical implementation notes for AUSPEX

1. **Use MITRE ATT&CK Group IDs (G####) as the join key** wherever they exist. They're stable, machine-readable, and authoritative-by-consensus. STIX bundle: https://github.com/mitre-attack/attack-stix-data
2. **For UNCs / unmerged clusters**, MITRE often lags 12-18 months. Use Mandiant's UNC# as a transitional ID and re-map when MITRE promotes the cluster.
3. **Store every alias verbatim** (e.g., as a `aliases[]` array). Reconciliation downstream is much easier than guessing.
4. **Track the *attributing vendor* per alias**, because a single cluster's clusters-of-clusters can disagree (e.g., GTIG's UNC5807 ≠ UNC2286 even though both have been called GhostEmperor publicly).
5. **MISP-galaxy** (https://github.com/MISP/misp-galaxy/blob/main/clusters/threat-actor.json) is the most machine-readable open alias graph. It's not authoritative but it's broad. Recommend ingesting nightly and diffing.
6. **Microsoft + CrowdStrike "Rosetta Stone"** (announced Jun 2025) is the first formal cross-vendor reconciliation. Watch for the public mapping artifact; once stable, it becomes a higher-priority source than MISP-galaxy for those two vendors.
