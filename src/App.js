import { Route, Link, HashRouter as Router } from 'react-router-dom'

import './App.css';
import Nav from './componets/Nav.js'
import Socials from './componets/Socials.js'
import About from './componets/About.js'
import Projects from './Projects';
import AOS from 'aos';
import 'aos/dist/aos.css'; // You can also use <link> for styles

AOS.init();

function App() {
  return (
    <Router>
    <div className="App">
      <div className="header">
        <h1>Andrew Simonson</h1>
        <Nav>
          <Link to='/'>Home</Link>
          <a href='resume.pdf' target='_blank'>Resume</a>
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
