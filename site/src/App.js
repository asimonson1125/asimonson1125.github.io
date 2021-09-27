import { Route, Link, BrowserRouter as Router } from 'react-router-dom'

import './App.css';
import Nav from './componets/Nav.js'
import Socials from './componets/Socials.js'
import About from './componets/About.js'
import Projects from './Projects';

const routs = (
  <Router>
    <div>
      <Route exact path='/' component={About} />
      <Route exact path='/projects' component={Projects} />
    </div>
  </Router>
)

function App() {
  return (
    <div className="App">
      <div className="header">
        <h1>Andrew Simonson</h1>
        <Nav>
          <a href='/'>Home</a>
          <a href='resume.pdf'>Resume</a>
          <a href='/projects'>Projects</a>
        </Nav>
      </div>
      <div className='foreground'>
        {routs}
      </div>
      <div className='footer'>
        <Socials />
      </div>
    </div>
  );
}

export default App;
