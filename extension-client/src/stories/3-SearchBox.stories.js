import React from "react";
import SearchBox from "../components/SearchBox";

export default {
  title: "SearchBox"
};
export const defaultView = () => (
  <div className="container" style={{ width: "480px" }}>
    {
      <div className="row py-2">
        <SearchBox onSearch={value => console.log(value)} />
      </div>
    }
  </div>
);
