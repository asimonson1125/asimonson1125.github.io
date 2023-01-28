import React from "react";

export default class Timeline extends React.Component {
  constructor(props) {
    super(props);
    this.items = props.children;
    this.classes = props.classes;
  }

  componentDidMount() {}

  render() {
    return <div className={"timeline " + this.classes}>
        {this.items}
    </div>;
  }
}
