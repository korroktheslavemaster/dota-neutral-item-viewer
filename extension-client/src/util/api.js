export const getItemsJson = fetch(process.env.REACT_APP_ITEMS_JSON_URL)
  .then(res => res.json())
  .catch(err => {
    console.log("got error while fetching items.json", err);
    return {};
  });

export const getImageUrl = str => "http://cdn.dota2.com" + str;
