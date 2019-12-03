import React from "react";
import "./ItemCard.css";
import { getImageUrl } from "../util/api";
import CdBoxImg from "../cd-box.png";

export default ({ json }) => {
  return (
    <div className="card outer-most">
      <div className="card-body">
        <div className="card-title">
          <div className="row">
            <div className="col col-auto">
              <img
                alt="item icon"
                className="item-image"
                src={getImageUrl(json.img)}
              />
            </div>
            <div className="col item-title">
              <div className="row">
                <b>{String(json.dname).toUpperCase()}</b>
              </div>
              <div className="row">
                {json.charges ? (
                  <small className="charges">
                    Stack Count: {json.charges}{" "}
                  </small>
                ) : (
                  ""
                )}

                <small className="subtitle">
                  Tier {json.tier} Neutral Item
                </small>
              </div>
            </div>
          </div>
        </div>
        <div className="card-text">
          <div className="attribute">
            {json.attrib
              ? json.attrib.map(
                  ({ header = "", footer = "", value = "" }, idx) => (
                    <div className="row" key={idx}>
                      <div
                        className="header"
                        dangerouslySetInnerHTML={{ __html: header }}
                      ></div>
                      <div
                        className="value"
                        dangerouslySetInnerHTML={{ __html: value }}
                      ></div>
                      <div
                        className="footer"
                        dangerouslySetInnerHTML={{ __html: footer }}
                      ></div>
                    </div>
                  )
                )
              : ""}
          </div>
          {getActiveOrUseAbilities(json, "active")}
          {getActiveOrUseAbilities(json, "use")}
          {getPassiveAbilities(json)}
          {json.hint ? (
            <div className="passive-abilities">
              <div className="card">
                <div className="card-text">
                  <div className="description">
                    <div dangerouslySetInnerHTML={{ __html: json.hint }} />
                  </div>
                </div>
              </div>
            </div>
          ) : (
            ""
          )}
        </div>
      </div>
    </div>
  );
};

const getActiveOrUseAbilities = (json, key) => {
  return (
    <div className="active-abilities">
      {json[key]
        ? json[key].map(({ name = "", desc = "" }, idx) => (
            <div className="card" key={idx}>
              <div className="card-title">
                <div className="row">
                  <div className="col col-auto">Active: {name}</div>
                  <div className="col float-right">
                    <div className="row float-right no-gutters">
                      {/* mana */}
                      {json.mc ? (
                        <div className="col col-auto float-right pr-2">
                          <div className="float-right">
                            <div className="row no-gutters">
                              <div className="col col-auto">
                                <div className="mana-box" />
                              </div>
                              <div className="col">
                                <span className="cd-mana-text">{json.mc}</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      ) : (
                        ""
                      )}
                      {/* cooldown */}
                      {json.cd ? (
                        <div className="col col-auto float-right">
                          <div className="float-right">
                            <div className="row no-gutters">
                              <div className="col col-auto">
                                <div className="cd-box">
                                  <img alt="mana icon" src={CdBoxImg} />
                                </div>
                              </div>
                              <div className="col">
                                <span className="cd-mana-text">{json.cd}</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      ) : (
                        ""
                      )}
                    </div>
                  </div>
                </div>
              </div>
              <div className="card-text">
                <div className="description">{desc}</div>
              </div>
            </div>
          ))
        : ""}
    </div>
  );
};

const getPassiveAbilities = json => (
  <div className="passive-abilities">
    {json.passive
      ? json.passive.map(({ name = "", desc = "" }, idx) => (
          <div className="card" key={idx}>
            <div className="card-title">
              <div className="row">
                <div className="col col-auto">Passive: {name}</div>
                <div className="col float-right">
                  <div className="row float-right no-gutters">
                    {/* mana */}
                    {json.mc && !json.active ? (
                      <div className="col col-auto float-right pr-2">
                        <div className="float-right">
                          <div className="row no-gutters">
                            <div className="col col-auto">
                              <div className="mana-box" />
                            </div>
                            <div className="col">
                              <span className="cd-mana-text">{json.mc}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    ) : (
                      ""
                    )}
                    {/* cooldown */}
                    {json.cd && !json.active ? (
                      <div className="col col-auto float-right">
                        <div className="float-right">
                          <div className="row no-gutters">
                            <div className="col col-auto">
                              <div className="cd-box">
                                <img alt="cooldown icon" src={CdBoxImg} />
                              </div>
                            </div>
                            <div className="col">
                              <span className="cd-mana-text">{json.cd}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    ) : (
                      ""
                    )}
                  </div>
                </div>
              </div>
            </div>
            <div className="card-text">
              <div className="description">{desc}</div>
            </div>
          </div>
        ))
      : ""}
  </div>
);
