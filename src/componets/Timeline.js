import React from "react";

export default class Timeline extends React.Component {
  constructor(props) {
    super(props);
    this.items = props.children;
  }

  componentDidMount() {}

  render() {
    return <div className="timeline">
        {this.items}
    </div>;
  }
}
