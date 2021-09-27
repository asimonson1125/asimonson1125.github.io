import { Route, Link, HashRouter as Router } from 'react-router-dom'

import './App.css';
import Nav from './componets/Nav.js'
import Socials from './componets/Socials.js'
import About from './componets/About.js'
import Projects from './Projects';

function App() {
  return (
    <Router>
    <div className="App">
      <div className="header">
        <h1>Andrew Simonson</h1>
        <Nav>
          <Link to='/'>Home</Link>
          <a href='resume.pdf'>Resume</a>
          <Link to='/projects'>Projects</Link>
        </Nav>
      </div>
      <div className='foreground'>
        
          <Route exact path='/'><About /></Route>
          <Route exact path='/projects'><Projects /></Route>
        
      </div>
      <div className='footer'>
        <Socials />
      </div>
    </div>
    </Router>
  );
}

export default App;
