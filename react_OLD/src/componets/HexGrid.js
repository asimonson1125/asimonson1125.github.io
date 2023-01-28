import { skill } from '../scripts/skill'

export default function HexGrid() {
  return (
    <div className="hex-wrapper">
      <div className="hex-row hex-odd">
        <div className="hex" onMouseOver={(event) => skill('python')}>
          <div className="hex-border"></div>
          <div className="hex-border"></div>
          <div className="hex-border"></div>
        </div>
        <div className="hex" onMouseOver={(event) => skill('js')}>
          <div className="hex-border"></div>
          <div className="hex-border"></div>
          <div className="hex-border"></div>
        </div>
      </div>
      <div className="hex-row hex-even">
        <div className="hex" onMouseOver={(event) => skill('html')}>
          <div className="hex-border"></div>
          <div className="hex-border"></div>
          <div className="hex-border"></div>
          <h3>Ahoy</h3>
        </div>
        <div className="hex" onMouseOver={(event) => skill('sql')}>
          <div className="hex-border"></div>
          <div className="hex-border"></div>
          <div className="hex-border"></div>
        </div>
        <div className="hex" onMouseOver={(event) => skill('cpp')}>
          <div className="hex-border"></div>
          <div className="hex-border"></div>
          <div className="hex-border"></div>
        </div>
      </div>
      <div className="hex-row hex-odd">
        <div className="hex" onMouseOver={(event) => skill('other')}>
          <div className="hex-border"></div>
          <div className="hex-border"></div>
          <div className="hex-border"></div>
        </div>
        <div className="hex" onMouseOver={(event) => skill('tools')}>
          <div className="hex-border"></div>
          <div className="hex-border"></div>
          <div className="hex-border"></div>
        </div>
      </div>
    </div>
  );
}
