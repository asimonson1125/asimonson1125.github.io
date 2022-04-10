import { Route, Link, HashRouter as Router } from 'react-router-dom'

import './App.css';
import ReactGA from 'react-ga'
import Nav from './componets/Nav.js'
import Socials from './componets/Socials.js'
import Home from './pages/Home.js'
import Projects from './pages/Projects';
import AboutMe from './pages/AboutMe';
import AOS from 'aos';
import 'aos/dist/aos.css'; // You can also use <link> for styles

AOS.init();
// testing updater
function App() {
//   ReactGA.initialize('G-E2V93W9CNV');
//   ReactGA.pageview('Init page view');

  return (
    <Router>
      <div className="App">
        <div className="header">
          <a href="/"><h1>Andrew Simonson</h1></a>
          <Nav id='navbar'>
            <Link to='/'>Home</Link>
            <a href='resume.pdf' target='_blank'>Resume</a>
            <Link to='/projects'>Projects</Link>
            <Link to='/about'>About</Link>
          </Nav>
        </div>
        <Route exact path='/'><Home /></Route>
        <Route exact path='/projects'><Projects /></Route>
        <Route exact path='/about'><AboutMe /></Route>
        <div className='footer'>
          <Socials />
        </div>
      </div>
    </Router>
  );
}

export default App;
