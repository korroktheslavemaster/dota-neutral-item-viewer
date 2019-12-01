import React, { Component } from "react";
import "./SearchBox.css";

class SearchBox extends Component {
  state = {
    value: ""
  };
  render() {
    const { onSearch } = this.props;
    const { value } = this.state;
    return (
      <div className="input-group">
        <input
          type="text"
          className="form-control search-box"
          id="item-search"
          placeholder="Search Item"
          onChange={e => {
            this.setState({ value: e.target.value });
            onSearch(e.target.value);
          }}
          value={value}
        ></input>
        <div className="input-group-append close-button">
          <span className="input-group-text">
            <button
              type="button"
              onClick={() => {
                this.setState({ value: "" });
                onSearch("");
              }}
            >
              <i className="fa fa-times" aria-hidden="true"></i>
            </button>
          </span>
        </div>
      </div>
    );
  }
}

export default SearchBox;
