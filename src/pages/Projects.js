import ProjectList from '../componets/ProjectList'
import Project from '../componets/Project'
import github from '../assets/github.svg'

export default function Projects(){
    return(
      <>
        <div data-aos='fade-up'>
        <h2>Projects</h2>
          <p>Project status is indicated by the color of the project card:<br /><span className='complete'>⬤</span> - Complete<br />
            <span className='WIP'>⬤</span> - Work In Progress<br /><span className='incomplete'>⬤</span> - Incomplete
          </p>
        </div>
        <ProjectList>
          <Project status='complete' title='Digital Portfolio' link='https://github.com/asimonson1125/asimonson1125.github.io' linkText={<img alt='github' src={github} />}>
            A personal portfolio site made with React.js.
          </Project>
          <Project status='WIP' title='Slate' link='https://github.com/asimonson1125/Slate' linkText={<img alt='github' src={github} />}>
            Slate is a web app designed to help event coordinators schedule events by congregating participant calendar data.
          </Project>
          <Project status='WIP' title='Querist' link='https://github.com/asimonson1125/Querist' linkText={<img alt='github' src={github} />}>
            A modular discord bot to manage class discord servers.
          </Project>
          <Project status='complete' title='NationsGame Rolls Sim' link='https://github.com/asimonson1125/NG-Rolls-Simulator' linkText={<img alt='github' src={github} />}>
            A simulator for the browser game, NationsGame, to analyze unit composition and predict in-game victors and unit statistics.
          </Project>
          <Project status='complete' title='Humans vs. Zombies Bot' link='https://github.com/asimonson1125/HvZ-bot' linkText={<img alt='github' src={github} />}>
            A Discord bot to handle role management and statistics for RIT's Humans vs. Zombies games.
          </Project>
          <Project status='incomplete' title='WallCycle' link='https://github.com/asimonson1125/WallCycle' linkText={<img alt='github' src={github} />}>
            A GNOME extension that cycles through a folder of wallpapers.
          </Project>
          <Project status='complete' title='WinKeylogger' link='https://github.com/asimonson1125/WinKeylogger' linkText={<img alt='github' src={github} />}>
            A C++ keylogger for windows based off a udemy course with my custom modifications and powershell script.
          </Project>
        </ProjectList>
      </>
    )
}