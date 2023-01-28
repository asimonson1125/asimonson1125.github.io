import React from "react";
import bg from "../assets/chesscom-embed/diamonds.png";
import def from "../assets/chesscom-embed/default.svg";

export default class ChessBed extends React.Component {
  constructor(props) {
    super(props);
    this.seeAccount = this.seeAccount.bind(this, props.username);
    this.addChessEmbed = this.addChessEmbed.bind(this, props.username);
    this.state = {
      name: "Loading..",
      pic: def,
      ratings: {
        rapid: "Loading",
        blitz: "Loading",
        bullet: "Loading",
        tactics: "Loading",
      },
      loaded: "hidden"
    };
    this.diamonds = {
      background: "black",
      backgroundImage: `linear-gradient(rgba(0, 0, 0, .5), rgba(0, 0, 0, .75)), url(${bg})`,
    };
  }

  seeAccount(username) {
    window.top.location.href = "https://chess.com/member/" + username;
  }

  async addChessEmbed(username) {
    let user, stats;
    try {
      user = await fetch(`https://api.chess.com/pub/player/${username}`);
      stats = await fetch(
        `https://api.chess.com/pub/player/${username}/stats`
      );
    } catch (e) {
      this.setState({
        name: "Chess.com request failed",
        ratings: {
          rapid: "Site may",
          blitz: "be blocked",
          bullet: "by client.\n\n",
          tactics: "not my fault :(",
        },
      });
      return;
    }
    if (user.status === 200) {
      user = await user.json();
      stats = await stats.json();
      this.setState({
        name: user["username"],
        pic: user.avatar,
        ratings: {
          rapid: stats.chess_rapid.last.rating,
          blitz: stats.chess_blitz.last.rating,
          bullet: stats.chess_bullet.last.rating,
          tactics: stats.tactics.highest.rating,
        },
        loaded: ''
      });
    } else if (user === null || user.status === 403 || user.status === null) {
      this.setState({
        name: "Chess.com request failed"
      });
    } else {
      this.setState({
        name: "User Not Found",
        loaded: ''
      });
    }
  }

  componentDidMount() {
    this.addChessEmbed();
  }

  render() {
    return (
      <>
        <div className="black">
          <div
            id="chessProfile"
            onClick={this.seeAccount}
            style={this.diamonds}
          >
            <div className="identity chessInfo">
              <div className="pfpContainer">
                <div>
                  <img
                    className="pfp"
                    src={this.state.pic}
                    alt={this.username}
                  />
                </div>
              </div>
              <h5 className="chessName">{this.state.name}</h5>
            </div>
            <div className="vContainer chessInfo">
              <div className="vItem">
                <div className={"chessIcon rapid " + this.state.loaded}>Ἓ</div>
                <p>{this.state.ratings.rapid}</p>
              </div>
              <div className="vItem">
                <div className={"chessIcon blitz " + this.state.loaded}>Ἔ</div>
                <p>{this.state.ratings.blitz}</p>
              </div>
              <div className="vItem">
                <div className={"chessIcon bullet " + this.state.loaded}>Ἕ</div>
                <p>{this.state.ratings.bullet}</p>
              </div>
              <div className="vItem">
                <div className={"chessIcon puzzles " + this.state.loaded}>ἕ</div>
                <p>{this.state.ratings.tactics}</p>
              </div>
            </div>
          </div>
          <div className="bottomtext">
            Chess.com Stat Embed by Andrew Simonson
          </div>
        </div>
      </>
    );
  }
}
