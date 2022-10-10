import React from "react";
import bg from "../assets/chesscom-embed/diamonds.png";
import def from '../assets/chesscom-embed/default.svg'

export default class ChessBed extends React.Component {
  constructor(props) {
    super(props);
    this.seeAccount = this.seeAccount.bind(this, props.username);
    this.addChessEmbed = this.addChessEmbed.bind(this, props.username);
    this.state = {
      name: 'Loading..',
      pic: def,
      ratings: {
        rapid: 'Loading',
        blitz: 'Loading',
        bullet: 'Loading',
        tactics: 'Loading'
      }
    }
    this.diamonds = {
      background: "black",
      backgroundImage: `linear-gradient(rgba(0, 0, 0, .5), rgba(0, 0, 0, .75)), url(${bg})`,
    };
  }

  seeAccount(username) {
    window.top.location.href = "https://chess.com/member/" + username;
  }
  
  async addChessEmbed(username){
    let user = await fetch(`https://api.chess.com/pub/player/${username}`);
    let stats = await fetch(`https://api.chess.com/pub/player/${username}/stats`);
    if(user.status === 200){
        user = await user.json();
        stats = await stats.json();
        this.setState({
          name: user['username'],
          pic: user.avatar,
          ratings: {
            rapid: stats.chess_rapid.last.rating,
            blitz: stats.chess_blitz.last.rating,
            bullet: stats.chess_bullet.last.rating,
            tactics: stats.tactics.highest.rating
          }
        });
    }
    else {
        this.setState({
          name: "User Not Found"
        });
    }
  }

  componentDidMount(){
    this.addChessEmbed();
  }

  render() {
    return (
      <>
        <div id="chessProfile" onClick={this.seeAccount} style={this.diamonds}>
          <div className="identity chessInfo">
            <div className="pfpContainer">
              <div>
                <img className="pfp" src={this.state.pic} alt={this.username} />
              </div>
            </div>
            <h5 className="chessName">{this.state.name}</h5>
          </div>
          <div className="vContainer chessInfo">
            <div className="vItem">
              <div className="chessIcon rapid">Ἓ</div>
              <p>{this.state.ratings.rapid}</p>
            </div>
            <div className="vItem">
              <div className="chessIcon blitz">Ἔ</div>
              <p>{this.state.ratings.blitz}</p>
            </div>
            <div className="vItem">
              <div className="chessIcon bullet">Ἕ</div>
              <p>{this.state.ratings.bullet}</p>
            </div>
            <div className="vItem">
              <div className="chessIcon puzzles">ἕ</div>
              <p>{this.state.ratings.tactics}</p>
            </div>
          </div>
        </div>
      </>
    );
  }
}
