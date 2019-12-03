import React from "react";
import ItemCard from "../components/ItemCard";
import itemJsons from "../jsons/sample-items.json";
import "react-perfect-scrollbar/dist/css/styles.css";
import PerfectScrollbar from "react-perfect-scrollbar";
export default {
  title: "ItemCard"
};

var fullList = () => (
  <div className="container" style={{ width: "480px" }}>
    {Object.keys(itemJsons).map(key => (
      <div className="row py-2" key={key}>
        <ItemCard json={itemJsons[key]} />
      </div>
    ))}
  </div>
);
export const allCards = () => fullList();

export const elixer = () => (
  <div className="container" style={{ width: "480px" }}>
    <div className="row py-2">
      <ItemCard json={itemJsons["force_boots"]} />
    </div>
  </div>
);

export const scrollbar = () => (
  <div style={{ position: "relative" }}>
    <PerfectScrollbar>{fullList()}</PerfectScrollbar>
  </div>
);
