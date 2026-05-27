const fs = require('fs');
const path = require('path');

const producersDataPath = path.join(__dirname, '../src/data/producers.json');
const producers = JSON.parse(fs.readFileSync(producersDataPath, 'utf8'));

const regionKeywords = {
  // Spain
  'Andalusia': ['andalusia', 'andalucía', 'jaén', 'jaen', 'córdoba', 'cordoba', 'seville', 'sevilla', 'granada', 'almería', 'málaga'],
  'Catalonia': ['catalonia', 'cataluña', 'tarragona', 'lleida', 'barcelona', 'girona', 'empordà'],
  'Aragon': ['aragon', 'aragón', 'teruel', 'zaragoza', 'bajo aragón'],
  'Castilla-La Mancha': ['castilla-la mancha', 'toledo', 'ciudad real'],
  'Extremadura': ['extremadura', 'cáceres', 'badajoz'],
  'Madrid': ['madrid'],
  
  // Italy
  'Puglia': ['puglia', 'apulia', 'bari', 'lecce', 'foggia'],
  'Tuscany': ['tuscany', 'toscana', 'florence', 'siena', 'lucca'],
  'Sicily': ['sicily', 'sicilia', 'palermo', 'catania'],
  'Umbria': ['umbria', 'perugia'],
  'Calabria': ['calabria'],
  
  // Greece
  'Peloponnese': ['peloponnese', 'kalamata', 'messinia', 'messenia', 'sparta', 'lakonia', 'laconia', 'olympia', 'gortys'],
  'Crete': ['crete', 'chania', 'heraklion', 'sitia', 'kolymvari'],
  'Lesvos': ['lesvos', 'mytilene'],
  
  // Portugal
  'Alentejo': ['alentejo', 'evora', 'beja'],
  'Trás-os-Montes': ['trás-os-montes', 'tras-os-montes', 'valpaços', 'murça'],
  'Douro': ['douro'],
  
  // Israel
  'Golan Heights': ['golan', 'geshur', 'eliad', 'bnei yehuda', 'katzrin'],
  'Galilee': ['galilee', 'galil', 'safed', 'carmiel', 'meron'],
  'Judea': ['judea', 'jerusalem', 'yehuda'],
  'Negev': ['negev', 'desert'],
  'Emek HaMaayanot': ['emek amayanot', 'emek hamaayanot', 'bet shean'],
  'Carmel': ['carmel'],
  
  // Brazil
  'Rio Grande do Sul': ['rio grande do sul', 'rs', 'gramado', 'caçapava', 'pinheiro machado', 'encruzilhada do sul'],
  'Minas Gerais': ['minas gerais', 'mg', 'serra da mantiqueira', 'maria da fé'],
  'São Paulo': ['são paulo', 'sp'],
  
  // Turkey
  'Aegean': ['aegean', 'izmir', 'manisa', 'aydin', 'muğla', 'mugla'],
  'Marmara': ['marmara', 'balikesir', 'bursa', 'çanakkale'],
  
  // South Africa
  'Western Cape': ['western cape', 'cape town', 'stellenbosch'],
  
  // Cyprus
  'Larnaca': ['larnaca', 'vavatsinia']
};

let updated = 0;

for (const p of producers) {
  if (!p.region || p.region === '') {
    let foundRegion = null;
    
    // Check name and description for keywords
    const searchSpace = (p.name + ' ' + (p.description || '')).toLowerCase();
    
    // Some direct rules based on known names
    if (searchSpace.includes('bajo aragón') || searchSpace.includes('bajo aragon')) foundRegion = 'Aragon';
    else if (searchSpace.includes('jerusalem')) foundRegion = 'Judea';
    else if (searchSpace.includes('golan')) foundRegion = 'Golan Heights';
    
    if (!foundRegion) {
      for (const [region, keywords] of Object.entries(regionKeywords)) {
        for (const kw of keywords) {
          if (searchSpace.includes(kw.toLowerCase())) {
            foundRegion = region;
            break;
          }
        }
        if (foundRegion) break;
      }
    }
    
    // Last resort fallback by country
    if (!foundRegion) {
        if (p.country === 'Israel') {
            if (searchSpace.includes('meshek')) foundRegion = 'Galilee / Coastal Plain';
            else foundRegion = 'Israel (Various)';
        } else if (p.country === 'Spain') {
            foundRegion = 'Andalusia'; // most common
        } else if (p.country === 'Italy') {
            foundRegion = 'Puglia'; // most common
        } else if (p.country === 'Greece') {
            foundRegion = 'Peloponnese'; // most common
        } else if (p.country === 'Brazil') {
            foundRegion = 'Rio Grande do Sul'; // most common
        } else if (p.country === 'Portugal') {
            foundRegion = 'Alentejo';
        } else if (p.country === 'Turkey') {
            foundRegion = 'Aegean';
        } else {
            foundRegion = p.country;
        }
    }
    
    if (foundRegion) {
        p.region = foundRegion;
        console.log(`Guessed region for ${p.name}: ${foundRegion}`);
        updated++;
    }
  }
}

console.log(`\nUpdated ${updated} producers with a region!`);
fs.writeFileSync(producersDataPath, JSON.stringify(producers, null, 2), 'utf8');
