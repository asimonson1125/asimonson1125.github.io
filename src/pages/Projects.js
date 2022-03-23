import ProjectList from '../componets/ProjectList'
import Project from '../componets/Project'
import github from '../assets/github.svg'
import globe from '../assets/globe.svg'

export default function Projects(){
    return(
      <div className='foreground'>
        <div data-aos='fade-up'>
        <h2 class='concentratedHead'>Projects</h2>
          <p>Project status is indicated by the color of the project card:<br /><span className='complete'>⬤</span> - Complete<br />
            <span className='WIP'>⬤</span> - Work In Progress<br /><span className='incomplete'>⬤</span> - Incomplete
          </p>
        </div>
        <ProjectList>
          <Project status='WIP' title='Digital Portfolio' links={[['https://github.com/asimonson1125/asimonson1125.github.io', <img alt='github' src={github} />]]} >
            A personal portfolio site made with React.js.
          </Project>
          <Project status='complete' title='Slate' links={[['https://github.com/asimonson1125/Slate', <img alt='github' src={github} />], ["https://slate.cs.house", <img alt='site' src={globe} />]]} >
            Slate is a web app designed to help event coordinators schedule events by congregating participant calendar data.
          </Project>
          <Project status='complete' title='Resume' links={[['https://github.com/asimonson1125/Resume', <img alt='github' src={github} />]]} >
            My Resume, made in LaTeX  with a custom design inspired by the AltaCV template on OverLeaf.
          </Project>
          <Project status='complete' title='Humans vs. Zombies Bot' links={[['https://github.com/asimonson1125/HvZ-bot', <img alt='github' src={github} />]]} >
            A Discord bot to handle role management and statistics for RIT's Humans vs. Zombies games.
          </Project>
          <Project status ='WIP' title='FinTech' links={[['https://github.com/LukeHorigan/Financial-Management-Assocation-', <img alt='github' src={github} />]]}  >
          A team derived from the RIT Financial Management Association dedicated to learning about financial management of equities using automated solutions developed by students.
          </Project>
          <Project status='complete' title='Querist' links={[['https://github.com/asimonson1125/Querist', <img alt='github' src={github} />]]} >
            A modular discord bot to manage class discord servers.
          </Project>
          <Project status='complete' title='Acumen' links={[['https://github.com/asimonson1125/Acumen', <img alt='github' src={github} />]]} >
            A personal Discord bot focused on statistical insight and role management for NationsGame, including NG Rolls Sim accessibility.
          </Project>
          <Project status='complete' title='NationsGame Rolls Sim' links={[['https://github.com/asimonson1125/NG-Rolls-Simulator', <img alt='github' src={github} />]]} >
            A simulator for the browser game, NationsGame, to analyze unit composition and predict in-game victors and unit statistics.
          </Project>
          <Project status='incomplete' title='WallCycle' links={[['https://github.com/asimonson1125/WallCycle', <img alt='github' src={github} />]]} >
            A GNOME extension that cycles through a folder of wallpapers.
          </Project>
          <Project status='complete' title='VEXcode Button Generator' links={[['https://github.com/asimonson1125/VEXcode-Button-Generator', <img alt='github' src={github} />]]} >
            VEXcode button library + examples and template for the VEX V5 brain 
          </Project>
          <Project status='complete' title='WinKeylogger' links={[['https://github.com/asimonson1125/WinKeylogger', <img alt='github' src={github} />]]}>
            A C++ keylogger for windows based off a udemy course with my custom modifications and powershell script.
          </Project>
        </ProjectList>
      </div>
    )
}