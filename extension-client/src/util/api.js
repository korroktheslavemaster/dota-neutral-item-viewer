export const getItemsJson = fetch("https://dota.b-cdn.net/items.json")
  .then(res => res.json())
  .catch(err => {
    console.log("got error while fetching items.json", err);
    return {};
  });

export const getImageUrl = str => "http://cdn.dota2.com" + str;
