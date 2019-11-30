const parse = require('csv-parse/lib/sync')
const itemsJson = require('./dotaconstants/build/items.json')
const fs = require('fs')
const input = fs.readFileSync('./jsons/tier.csv');

const records = parse(input, {
    columns: true,
    skip_empty_lines: true
  });

const result = {};

records.forEach(({name, tier}) => {
  var reducedName = String(name).substring(5);
  result[reducedName] = {
    ...itemsJson[reducedName],
    tier: parseInt(tier)
  }
});

console.log(JSON.stringify(result, null, 2));