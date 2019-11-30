import React, { Component } from 'react';
import './App.css';
import ItemCard from "./components/ItemCard";
import { getItemsJson } from './util/api';

const twitch = window.Twitch.ext;
class App extends Component {
  state = {
    itemsJson: {},
    currentItems: []
  }
  onBroadcast = (target, contentType, message) => {
    console.log(message);
    twitch.rig.log(message);
    if (contentType == 'application/json') {
      var parsed = JSON.parse(message);
      if (parsed.items && Array.isArray(parsed.items)) {
        this.setState({ currentItems:  Array.from(new Set(parsed.items))})
      }
    }
  }
  componentDidMount() {
    getItemsJson.then(itemsJson => this.setState({ itemsJson }));
    // register with twitch pubsub
    twitch.listen("broadcast", this.onBroadcast);
    twitch.onContext(function (context, strings) {
      console.log(context);
      console.log(strings);
      twitch.rig.log(context);
      twitch.rig.log(strings);
    });
    twitch.onAuthorized(function (auth) {
      console.log(auth);
    })
  }
  render() {
    const { itemsJson, currentItems } = this.state;
    return (
      <div className="container">
        <div className="container">
          {
            currentItems.map(itemName =>
              itemsJson[itemName] ?
                <div className="row py-2" key={itemName}>
                  <ItemCard json={itemsJson[itemName]} />
                </div> : ""
            )
          }
        </div>
      </div>
    );
  }
}

export default App;
