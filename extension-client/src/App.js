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
    currentBuffer: [],
    latency: 0,
    searchTerm: "",
    currentItems: undefined
  };
  onBroadcast = (target, contentType, message) => {
    if (contentType === "application/json") {
      var parsed = JSON.parse(message);
      if (parsed.items && Array.isArray(parsed.items) && parsed.timestamp) {
        this.setState({
          currentBuffer: [
            ...this.state.currentBuffer,
            {
              timestamp: parsed.timestamp,
              items: Array.from(new Set(parsed.items))
            }
          ]
        });
      }
    }
  };
  onContext = (context, strings) => {
    if (strings.includes("hlsLatencyBroadcaster")) {
      this.setState({ latency: context["hlsLatencyBroadcaster"] });
    }
  };
  componentDidMount() {
    getItemsJson.then(itemsJson => this.setState({ itemsJson }));
    // register with twitch pubsub
    twitch.listen("broadcast", this.onBroadcast);
    twitch.onContext(this.onContext);
    setInterval(this.updateCurrentItems, 1000);
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
  updateCurrentItems = () => {
    const {
      currentBuffer,
      currentItems: oldCurrentItems,
      latency
    } = this.state;
    if (currentBuffer.length === 0) {
      return; // can't do anything right now since no data, just keep as is
    }
    // if old items are undefined i.e. uninitialized, then just take first element from current buffer
    if (oldCurrentItems === undefined) {
      this.setState({
        currentItems: currentBuffer[0].items,
        currentBuffer: currentBuffer.slice(1)
      });
    } else {
      // if current buffer is too big, empty it and return
      if (currentBuffer.length > 300) {
        this.setState({
          currentItems: currentBuffer[0].items,
          currentBuffer: []
        });
        return;
      }
      // now calculate which one
      var streamEpoch = Math.round(new Date().getTime() / 1000) - latency;
      let i;
      // assumed currentBuffer is already sorted in increasing order!
      for (i = 0; i < currentBuffer.length; i++) {
        const elm = currentBuffer[i];
        const elmEpoch = elm.timestamp;
        if (elmEpoch - streamEpoch > 0) {
          // it's the previous one!
          break;
        }
      }
      if (i == 0) {
        return; // too early to update anything
      } else {
        this.setState({
          currentItems: currentBuffer[i - 1].items,
          currentBuffer: currentBuffer.slice(i)
        });
      }
    }
  };
  render() {
    const { itemsJson, currentItems, searchTerm } = this.state;
    return (
      <div className="container outer-container">
        <div className="row py-2 search-bar-div">
          <SearchBox onSearch={value => this.setState({ searchTerm: value })} />
        </div>
        <SimpleBar style={{ maxHeight: "91vh" }}>
          <div className="container">
            {this.getItemsToDisplay(
              itemsJson,
              currentItems || [],
              searchTerm
            ).map(itemName =>
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
