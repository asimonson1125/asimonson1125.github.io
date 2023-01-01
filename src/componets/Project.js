import React from "react";
import placeholder from "../assets/photos/placeholder.png";

export default class Project extends React.Component {
  render() {
    let style = {
      backgroundImage: "url(" + this.props.bgi + ")",
    };
    let links = <></>;
    if (this.props.links != null) {
      this.props.links.forEach((x) => {
        links = (
          <>
            {links}
            <a href={x[0]}>{x[1]}</a>
          </>
        );
      });
    } else {
      links = (
        <div className="placeholder">
          <img alt="no links!" src={placeholder} />
        </div>
      );
    }
    return (
      <div className={"project"} data-aos="fade-up">
        <div className="vFlex">
          <div className="projTitle">
            <h3>{this.props.title}</h3>
            <p className={this.props.status + " tab"}>⬤</p>
          </div>
          <div className='projBody vFlex spaceBetween'>
            <div style={style} className='bgi' />
            <div className="topBox">
              <p className="backedBody">{this.props.children}</p>
            </div>
            <div className="bottomBox">{links}</div>
          </div>
        </div>
      </div>
    );
  }
}
