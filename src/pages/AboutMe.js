import React from 'react'
import Skills from '../componets/Skills'
import MyCarousel from '../componets/Carousel.js';
import img1 from '../assets/photos/itsa_me.JPG'
import img2 from '../assets/photos/me_robot.jpeg'
import img3 from '../assets/photos/AcademicTeam.jpg'
import img4 from '../assets/photos/hagerstownVex2019.jpg'
import img5 from '../assets/photos/WeThePeople_Districts.jpg'
import img6 from '../assets/photos/WeThePeople.jpg'
import img7 from '../assets/photos/WeThePeople_NationalsSetup.jpg'


export default function AboutMe(){
    return(
    <div className='foreground'>
    <div className='col'>
        <div id='aboutMe' data-aos='fade-up'>
            <h2 className='concentratedHead'>About Me</h2>
                <p>I'm a first year student at <strong>Rochester Institute of Technology </strong>
                    in the <b>Computing Exploration</b> program and am pursuing a career in data
                    science with a focus on predictive analytics.
                </p>
                <p>When I'm not in class, you can find me working on extra collaborative projects,
                    building discord bots, playing chess, reading up on some recent geopolitical
                    development, or in my dorm with a fat pint of ice cream.
                </p>
            <p>My main goal in life is to always strive to make the biggest positive impact on
                the world that I can.  Regardless of whether that is done behind the scenes or
                on the front lines, that is how I'll know I have purpose.
            </p>
            <p>I also value the ability to understand the world at large.  That awareness is 
                what grounds a person into reality and gives their place in the world value.  
                When I learn about geography or international politics, my favorite parts are
                when I can understand the causality to shifts both in history and the present
                because it presents an inside look into how we can learn from related events.
            </p> 
            <p>There is no one single special interest that makes me unique, so it is my goal to
                be the one with a collection of distinct interests and a knack for bridging 
                the gap between them.
            </p>
            <img src={img1} alt='Me' className='boxedImg'/>
        </div>
    </div>
    <div className='col'>
        <div id='skills' data-aos='fade-up'>
            <h2>Skills</h2>
            <Skills>{['Python','JavaScript','Java','C','C++','SQL','SQLite','Sequelize','SQLAlchemy',
                'HTML','CSS','Object-Oriented Programming','Git','Github','Linux','Raspberry Pi',
                'LaTeX','Angular','Flask','DOM Scraping','Google API','React.js','Node.js']}</Skills>
        </div>
        <div data-aos='fade-up' className='elementBlock'>
            <h2>Extracirricular Awards</h2>
        <MyCarousel className='carousel' data-aos='fade-up'>
                    {[
                    {
                        original: img5, 
                        description: "We the People Civics Competition District Champions"
                    }, 
                    {
                        original: img6, 
                        description: "We The People State Civics Competition Champions"
                    },
                    {
                        original: img7,
                        description: "what it looks like to compete in We the People Nationals, circa 2020"
                    },
                    {
                        original:img3, 
                        description: "Academic Team county championships"
                    }
                    ]}
                </MyCarousel>
                </div>
                </div>
    </div>
    )
}