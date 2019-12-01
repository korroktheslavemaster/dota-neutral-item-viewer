import React, { Component } from "react";
import "./App.css";
import ItemCard from "./components/ItemCard";
import SearchBox from "./components/SearchBox";
import { getItemsJson } from "./util/api";

const twitch = window.Twitch.ext;
class App extends Component {
  state = {
    itemsJson: {},
    currentItems: [],
    searchTerm: ""
  };
  onBroadcast = (target, contentType, message) => {
    console.log(message);
    twitch.rig.log(message);
    if (contentType == "application/json") {
      var parsed = JSON.parse(message);
      if (parsed.items && Array.isArray(parsed.items)) {
        this.setState({ currentItems: Array.from(new Set(parsed.items)) });
      }
    }
  };
  componentDidMount() {
    getItemsJson.then(itemsJson => this.setState({ itemsJson }));
    // register with twitch pubsub
    twitch.listen("broadcast", this.onBroadcast);
    twitch.onContext(function(context, strings) {
      console.log(context);
      console.log(strings);
      twitch.rig.log(context);
      twitch.rig.log(strings);
    });
    twitch.onAuthorized(function(auth) {
      console.log(auth);
    });
  }
  getItemsToDisplay = (itemsJson, currentItems, searchTerm) => {
    if (searchTerm == "") return currentItems;
    const searchTermLowerCase = String(searchTerm).toLowerCase();
    const allItemsLowerCase = Object.keys(itemsJson).map(name =>
      String(name).toLowerCase()
    );
    return allItemsLowerCase.filter(itemName =>
      itemName.includes(searchTermLowerCase)
    );
  };
  render() {
    const { itemsJson, currentItems, searchTerm } = this.state;
    return (
      <div className="container">
        <div className="container">
          <div className="row py-1 pt-2">
            <SearchBox
              onSearch={value => this.setState({ searchTerm: value })}
            />
          </div>
          {this.getItemsToDisplay(itemsJson, currentItems, searchTerm).map(
            itemName =>
              itemsJson[itemName] ? (
                <div className="row py-1" key={itemName}>
                  <ItemCard json={itemsJson[itemName]} />
                </div>
              ) : (
                ""
              )
          )}
        </div>
      </div>
    );
  }
}

export default App;
