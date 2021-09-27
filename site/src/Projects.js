import ProjectList from './componets/ProjectList'
import Project from './componets/Project'

export default function Projects(){
    return(
      <>
        <h2>Projects</h2>
        <ProjectList>
          <Project status='WIP' title='Digital Portfolio' link='https://github.com/asimonson1125/asimonson1125.github.io' linkText='view code'>
            A personal portfolio site made with React.js
          </Project>
          <Project status='WIP' title='Slate' link='https://github.com/asimonson1125/Slate' linkText='view code'>
            Slate is a thing
          </Project>
          <Project status='WIP' title='Querist' link='https://github.com/asimonson1125/Querist' linkText='view code'>
            A modular discord bot to manage class discord servers.
          </Project>
          <Project status='Complete' title='NationsGame Rolls Simulator' link='https://github.com/asimonson1125/NG-Rolls-Simulator' linkText='view code'>
            A simulator for the browser game, NationsGame, to analyze unit composition and predict in-game victors and unit statistics.
          </Project>
          <Project status='Complete' title='Humans vs. Zombies Bot' link='https://github.com/asimonson1125/HvZ-bot' linkText='view code'>
            A Discord bot to handle role management and statistics for RIT's Humans vs. Zombies games.
          </Project>
          <Project status='Incomplete' title='WallCycle' link='https://github.com/asimonson1125/WallCycle' linkText='view code'>
            A GNOME extension that cycles through a folder of wallpapers
          </Project>
          <Project status='Complete' title='WinKeylogger' link='https://github.com/asimonson1125/WinKeylogger' linkText='view code'>
            A C++ keylogger for windows based off a udemy course with my custom modifications and powershell script.
          </Project>
        </ProjectList>
      </>
    )
}