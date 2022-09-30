import { skill } from '../scripts/skill'

export default function HexGrid() {
  return (
    <div className="hex-wrapper">
      <div className="hex-row hex-odd">
        <div className="hex" onMouseOver={(event) => skill('first')}>
          <div className="hex-border"></div>
          <div className="hex-border"></div>
          <div className="hex-border"></div>
        </div>
        <div className="hex" onMouseOver={(event) => skill('second')}>
          <div className="hex-border"></div>
          <div className="hex-border"></div>
          <div className="hex-border"></div>
        </div>
      </div>
      <div className="hex-row hex-even">
        <div className="hex" onMouseOver={(event) => skill('third')}>
          <div className="hex-border"></div>
          <div className="hex-border"></div>
          <div className="hex-border"></div>
          <h3>Ahoy</h3>
        </div>
        <div className="hex" onMouseOver={(event) => skill('fourth')}>
          <div className="hex-border"></div>
          <div className="hex-border"></div>
          <div className="hex-border"></div>
        </div>
        <div className="hex" onMouseOver={(event) => skill('fifth')}>
          <div className="hex-border"></div>
          <div className="hex-border"></div>
          <div className="hex-border"></div>
        </div>
      </div>
      <div className="hex-row hex-odd">
        <div className="hex" onMouseOver={(event) => skill('sixth')}>
          <div className="hex-border"></div>
          <div className="hex-border"></div>
          <div className="hex-border"></div>
        </div>
        <div className="hex" onMouseOver={(event) => skill('seventh')}>
          <div className="hex-border"></div>
          <div className="hex-border"></div>
          <div className="hex-border"></div>
        </div>
      </div>
    </div>
  );
}
