// copied over from https://github.com/odota/dotaconstants

const request = require('request');
const async = require('async');
const fs = require('fs');
const simplevdf = require('simple-vdf');


const sources = [{
    key: "items",
    url: [
      'https://raw.githubusercontent.com/dotabuff/d2vpkr/master/dota/resource/localization/abilities_english.json',
      'https://raw.githubusercontent.com/dotabuff/d2vpkr/master/dota/scripts/npc/items.json',
      'https://raw.githubusercontent.com/dotabuff/d2vpkr/master/dota/scripts/npc/neutral_items.txt'
    ],
    transform: respObj => {
      const strings = respObj[0].lang.Tokens;
      const scripts = respObj[1].DOTAAbilities;
      const neutrals = respObj[2];
      // parse neutral items into name => tier map
      const neutralItemNameTierMap = getNeutralItemNameTierMap(neutrals);

      // Fix places where valve doesnt care about correct case
      Object.keys(strings).forEach(key => {
        if (key.includes("DOTA_Tooltip_Ability_")) {
          strings[key.replace("DOTA_Tooltip_Ability_", "DOTA_Tooltip_ability_")] = strings[key];
        }
      })

      var items = {};

      Object.keys(scripts).filter(key => {
        return !(key.includes("item_recipe") && scripts[key].ItemCost === "0") && key !== "Version";
      }).forEach(key => {
        if (scripts[key].AbilitySpecial) {
          scripts[key].AbilitySpecial.push({abilitycastrange: parseInt(scripts[key].AbilityCastRange) || false});
          scripts[key].AbilitySpecial.push({abilitycastpoint: parseInt(scripts[key].AbilityCastPoint) || false});
          scripts[key].AbilitySpecial.push({abilityduration: parseInt(scripts[key].AbilityDuration) || false});
          scripts[key].AbilitySpecial.push({abilitychanneltime: parseInt(scripts[key].AbilityChannelTime) || false});
        }
        var item = { ...replaceSpecialAttribs(strings[`DOTA_Tooltip_ability_${key}_Description`], scripts[key].AbilitySpecial, true) };

        item.id = parseInt(scripts[key].ID);
        item.img = `/apps/dota2/images/items/${key.replace(/^item_/, '')}_lg.png`;
        if (key.includes("item_recipe")) {
          item.img = `/apps/dota2/images/items/recipe_lg.png`;
        }

        item.dname = strings[`DOTA_Tooltip_ability_${key}`];
        item.qual = scripts[key].ItemQuality;
        item.cost = parseInt(scripts[key].ItemCost);

        item.charges = parseInt(scripts[key].ItemInitialCharges) || false;
        var notes = [];
        for (let i = 0; strings[`DOTA_Tooltip_ability_${key}_Note${i}`]; i++) {
          notes.push(strings[`DOTA_Tooltip_ability_${key}_Note${i}`]);
        }

        item.notes = notes.join("\n");

        item.attrib = formatAttrib(scripts[key].AbilitySpecial, strings, `DOTA_Tooltip_ability_${key}_`)
          .filter(attr => !attr.generated || attr.key === 'lifetime');

        item.mc = parseInt(scripts[key].AbilityManaCost) || false;
        item.cd = parseInt(scripts[key].AbilityCooldown) || false;

        item.lore = (strings[`DOTA_Tooltip_ability_${key}_Lore`] || "").replace(/\\n/g, "\r\n");

        item.components = null;
        item.created = false;
        if (neutralItemNameTierMap[key]) {
          item.tier = neutralItemNameTierMap[key];
        }
        items[key.replace(/^item_/, '')] = item;
      });

      // Load recipes
      Object.keys(scripts).filter(key => scripts[key].ItemRequirements && scripts[key].ItemResult).forEach(key => {
        result_key = scripts[key].ItemResult.replace(/^item_/, '');
        items[result_key].components = scripts[key].ItemRequirements[0].split(";").map(item => item.replace(/^item_/, ''));
        items[result_key].created = true;
      });


      // only keep items with tiers! i.e. neutral items
      return Object.fromEntries(Object.entries(items).filter(([key, value]) => value.tier != undefined));
      return items;
      // return {};
    },
  }
 
];


// "heropickerdata": "http://www.dota2.com/jsfeed/heropickerdata?l=english",
// "heropediadata": "http://www.dota2.com/jsfeed/heropediadata?feeds=herodata",
// "leagues": "https://api.opendota.com/api/leagues",
async.each(sources, function(s, cb) {
    const url = s.url;
    //grab raw data from each url and save
    console.log(url);
    if (typeof url === 'object') {
      async.map(url, (urlString, cb) => {
        request(urlString, (err, resp, body) => {
          cb(err, parseJson(body));
        });
      }, (err, resultArr) => {
        handleResponse(err, {
          statusCode: 200
        }, JSON.stringify(resultArr));
      });
    }
    else {
      request(url, handleResponse);
    }

    function parseJson(text) {
      try {
        return JSON.parse(text);
      }
      catch (err) {
        let vdf = simplevdf.parse(text);
        vdf = vdf[Object.keys(vdf)[0]];
        let keys = Object.keys(vdf);
        let normalized = {};
        for (let key of keys) {
          normalized[key.toLowerCase()] = vdf[key];
        }
        return normalized;
      }
    }

    function handleResponse(err, resp, body) {
      if (err || resp.statusCode !== 200) {
        return cb(err);
      }
      let parsed;
      body = parseJson(body)
      if (s.transform) {
        body = s.transform(body);
      }
      fs.writeFileSync(process.argv[2] || './build/' + s.key + '.json', JSON.stringify(body, null, 2));
      cb(err);
    }
  },
  function(err) {
    if (err) {
      throw err;
    }
  });

// Formats something like "20 21 22" or [ 20, 21, 22 ] to be "20 / 21 / 22"
function formatValues(value, percent = false, separator = " / ", symbol = "+") {
  var values = Array.isArray(value) ? value : String(value).split(" ");
  if (values.every(v => v == values[0])) {
    values = [values[0]];
  }
  if (symbol == "-") {
    values = values.map(Math.abs);
  }
  if (percent) {
    values = values.map(v => v + "%");
  }
  let len = values.length;
  let res = values.join(separator).replace(/\.0+(\D|$)/g, '$1');
  return len > 1 ? res.split(separator) : res;
}

// Formats AbilitySpecial for the attrib value for abilities and items
function formatAttrib(attributes, strings, strings_prefix) {
  if (attributes && !(Array.isArray(attributes))) attributes = Object.values(attributes);
  return (attributes || []).map(attr => {
    let key = Object.keys(attr).find(key => `${strings_prefix}${key}` in strings);
    if (!key) {
      for (item in attr) { key = item; break; }
      return {
        key: key,
        header: `${key.replace(/_/g, " ").toUpperCase()}:`,
        value: formatValues(attr[key]),
        generated: true
      };
    }

    let final = { key: key };
    let header = strings[`${strings_prefix}${key}`];
    let match = header.match(/(%)?(\+\$)?([\+\-])?(.*)/);
    header = match[4];

    if (match[2]) {
      final.header = '+';
      // final.header = match[2] == '-' ? '-' : "+";
      // console.log(match[2]);
      final.value = formatValues(attr[key], match[1]);
      final.footer = strings[`dota_ability_variable_${header}`];
      if ("dota_ability_variable_attack_range".includes(header)) final.footer = final.footer;
    } else if (match[3]) {
      final.header = match[3];
      final.value = formatValues(attr[key], match[1], " / ", match[3]);
      final.footer = strings[`dota_ability_variable_${header}`] || header;
    }
    else {
      final.header = header;
      final.value = formatValues(attr[key], match[1]);
    }

    return final;
  }).filter(a => a);
}

function catogerizeItemAbilities(abilities) {
  const itemAbilities = {}
  abilities.forEach(ability => {
    if (!ability.includes("<h1>")) {
      (itemAbilities.hint = itemAbilities.hint || []).push(ability)
    }
    else {
      ability = ability.replace(/<[^h1>]*>/gi, "");
      const regExp = /<h1>\s*(.*)\s*:\s*(.*)\s*<\/h1>\s*([\s\S]*)/gi
      try {
        const [_, type, name, desc] = regExp.exec(ability);
        (itemAbilities[type.toLowerCase()] = itemAbilities[type.toLowerCase()] || []).push({ "name": name, "desc": desc })
      }
      catch(e) {
        console.log(e);
      }
    }
  })
  return itemAbilities;
}

// Formats templates like "Storm's movement speed is %storm_move_speed%" with "Storm's movement speed is 32"
// args are the template, and a list of attribute dictionaries, like the ones in AbilitySpecial for each ability in the npc_abilities.json from the vpk
function replaceSpecialAttribs(template, attribs, isItem = false) {
  if (!template) {
    return template;
  }
  if (attribs) {
    template = template.replace(/%([^% ]*)%/g, function(str, name) {
      if (name == "") {
        return "%";
      }
      if (!Array.isArray(attribs)) attribs = Object.values(attribs);
      var attr = attribs.find(attr => name in attr);
      if (!attr && name[0] === "d") { // Because someone at valve messed up in 4 places
        name = name.substr(1);
        attr = attribs.find(attr => name in attr);
      }
      if (!attr) {
        console.log(`cant find attribute %${name}%`);
        return `%${name}%`;
      }
      return attr[name];
    });
  }
  if (isItem) {
    template = template.replace(/<br>/gi, '\n')
    const abilities = template.split("\\n")
    return catogerizeItemAbilities(abilities)
  }
  template = template.replace(/\\n/g, "\n").replace(/<[^>]*>/g, "");
  return template;
}



const getNeutralItemNameTierMap = (neutrals) => {
  var ret = {};
  Object.keys(neutrals).forEach(tier => {
    var items = neutrals[tier].items;
    Object.keys(items).forEach(itemName => {
      ret[itemName] = tier;
      ret[itemName.replace(/recipe_/gi, "")] = tier;
    })
  })
  return ret;
}