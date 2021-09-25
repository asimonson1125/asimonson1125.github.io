import './App.css';
import Nav from './componets/Nav.js'
import Link from './componets/Link.js'
import Socials from './componets/Socials.js'
import About from './componets/About.js'

function App() {
  return (
    <div className="App">
      <div className="header">
        <h1>Andrew Simonson</h1>
        <Socials />
        <Nav>
          <Link onClick='/home'>Home</Link>
          <Link onClick='resume.pdf'>Resume</Link>
          <Link onClick='/projects'>Projects</Link>
        </Nav>
      </div>
      <div className='spacer'></div>
      <div className='foreground'>
        <About />
      </div>
    </div>
  );
}

export default App;
