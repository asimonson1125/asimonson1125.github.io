import './App.css';
import Nav from './componets/Nav.js'
import Link from './componets/Link.js'
import Socials from './componets/Socials.js'

function App() {
  return (
    <div className="App">
      <div className="header">
        <h1>Andrew Simonson</h1>
        <Socials />
        <Nav>
          <Link className='navBar' onClick='/home'>Home</Link>
          <Link className='navBar' onClick='resume.pdf'>Resume</Link>
          <Link className='navBar' onClick='/projects'>Projects</Link>
        </Nav>
      </div>
    </div>
  );
}

export default App;
