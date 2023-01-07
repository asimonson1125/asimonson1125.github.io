import { Route, Link, Routes, BrowserRouter as Router } from "react-router-dom";

import "./assets/css/App.css";
import "./assets/css/checkbox.css"
import "./assets/css/head.scss";
import menu from "./assets/icons/menu.svg";
import Nav from "./componets/Nav.js";
import Socials from "./componets/Socials.js";
import Name from "./componets/Name.js";
import Home from "./pages/Home.js";
import Projects from "./pages/Projects";
import Activities from "./pages/Activities";
import AboutMe from "./pages/AboutMe";
import Idler from "./componets/Idler";
import ErrorNotFound from "./pages/Error";
import AOS from "aos";
// import 'aos/dist/aos.css'; // You can also use <link> for styles
import { toggleMenu } from "./scripts/responsive";

AOS.init();
function App() {
  return (
    <Router>
      <Idler />
      <div className="App">
        <div className="header">
          <Name />
          <img src={menu} alt="menu" id="menu" onClick={toggleMenu} />
          <Nav id="navbar">
            <Link to="/">Home</Link>
            <a href="Resume.pdf" target="_blank">
              Resume
            </a>
            <Link to="/projects">Projects</Link>
            {/* <Link to="/activities">Activities</Link> */}
            <Link to="/about">About Me</Link>
          </Nav>
        </div>
        <Routes>
          <Route exact path="/" element={<Home />}></Route>
          <Route exact path="/projects" element={<Projects />}></Route>
          <Route exact path="activities" element={<Activities />}></Route>
          <Route exact path="/about" element={<AboutMe />}></Route>
          <Route exact path="/notFound" element={<ErrorNotFound />} />
          <Route exact path="/*" element={<ErrorNotFound />} />
        </Routes>
        <div className="footer">
          <Socials />
        </div>
      </div>
    </Router>
  );
}

export default App;
