async function addChessEmbed(username) {
  let user, stats;
  try {
    user = await fetch(`https://api.chess.com/pub/player/${username}`);
    stats = await fetch(`https://api.chess.com/pub/player/${username}/stats`);
  } catch (e) {
    setChess({cName:"Chess.com request failed"});
    return;
  }
  if (user.status === 200) {
    user = await user.json();
    stats = await stats.json();
    ratings = {
      rapid: stats.chess_rapid.last.rating,
      blitz: stats.chess_blitz.last.rating,
      bullet: stats.chess_bullet.last.rating,
      tactics: stats.tactics.highest.rating,
    }
    setChess({cName:user["username"],pic:user.avatar,ratings:ratings});
  } else if (user === null || user.status === 403 || user.status === null) {
    chessSet({cName:"Chess.com request failed"});
  } else {
    chessSet({cName:"User Not Found"});
  }
}

function setChess({cName = null, pic = null, ratings = null}) {
  if (cName) {
    document.querySelector(".chessName").textContent = cName;
  }
  if (pic) {
    document.querySelector(".chessImage").src = pic;
  }
  if (ratings) {
    document.querySelector(".chessRapid .chessStat").textContent = ratings.rapid;
    document.querySelector(".chessBlitz .chessStat").textContent = ratings.blitz;
    document.querySelector(".chessBullet .chessStat").textContent = ratings.bullet;
    document.querySelector(".chessPuzzles .chessStat").textContent = ratings.tactics;
  }
}
