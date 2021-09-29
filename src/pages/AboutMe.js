import React from 'react'
import Skills from '../componets/Skills'

export default function AboutMe(){
    return(
    <>
        <div id='aboutMe' data-aos='fade-up'>
            <h2>About Me</h2>
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
            <p>There is one single special interest that makes me unique, so it is my goal to
                be the one with a collection of distinct interests and a knack for bridging 
                the gap between them.
            </p>
        </div>
        <div id='skills' data-aos='fade-up'>
            <h2>Skills</h2>
            <Skills>{['Python','JavaScript','Java','C++','SQL','SQLite','Sequelize','SQLAclchemy',
                'HTML','CSS','Object-Oriented Programming','Git','Github','Linux','Raspberry Pi',
                'LaTeX','Flask','DOM Scraping','Google API','React.js','Node.js']}</Skills>
        </div>
    </>
    )
}