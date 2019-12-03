import React, { Component } from "react";
import "./App.css";
import ItemCard from "./components/ItemCard";
import SearchBox from "./components/SearchBox";
import { getItemsJson } from "./util/api";
import SimpleBar from "simplebar-react";
import "simplebar/dist/simplebar.min.css";

const twitch = window.Twitch.ext;
class App extends Component {
  state = {
    itemsJson: {},
    currentItems: [],
    searchTerm: ""
  };
  onBroadcast = (target, contentType, message) => {
    if (contentType === "application/json") {
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
  }
  getItemsToDisplay = (itemsJson, currentItems, searchTerm) => {
    if (searchTerm === "") return currentItems;
    const searchTermLowerCase = String(searchTerm).toLowerCase();
    const allItemsLowerCaseTuple = Object.keys(itemsJson).map(name => [
      name,
      String(itemsJson[name].dname).toLowerCase()
    ]);
    return allItemsLowerCaseTuple
      .filter(([name, fullName]) => fullName.includes(searchTermLowerCase))
      .map(([name]) => name);
  };
  render() {
    const { itemsJson, currentItems, searchTerm } = this.state;
    return (
      <div className="container outer-container">
        <div className="row py-2 search-bar-div">
          <SearchBox onSearch={value => this.setState({ searchTerm: value })} />
        </div>
        <SimpleBar style={{ maxHeight: "90vh" }}>
          <div className="container">
            {this.getItemsToDisplay(itemsJson, currentItems, searchTerm).map(
              itemName =>
                itemsJson[itemName] ? (
                  <div className="row pb-2" key={itemName}>
                    <div className="col col-12">
                      <ItemCard json={itemsJson[itemName]} />
                    </div>
                  </div>
                ) : (
                  ""
                )
            )}
          </div>
        </SimpleBar>
      </div>
    );
  }
}

export default App;
