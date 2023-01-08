import React from "react";

export default class TimeItem extends React.Component {
  constructor(props) {
    super(props);
    this.date = props.date;
    this.classes = props.classes;
    this.item = (
      <>
        <h2>{props.title}</h2>
        <div className="timeline-deets">
          <p>{props.children}</p>
        </div>
      </>
    );
  }

  render() {
    return <div className={"timeitem " + this.classes}><p className="datetext">{this.date}</p><div className="timeline-item">{this.item}</div></div>;
  }
}
