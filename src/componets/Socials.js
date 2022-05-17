import React from 'react';

import github from '../assets/github.svg'
import instagram from '../assets/instagram.svg'
import linkedin from '../assets/linkedin.svg'
import email from '../assets/email.svg'

export default function Socials(){
    return(
        <div className='socials'>
                <a href='https://github.com/asimonson1125'><img alt='Github' src={github} /></a>
                <a href='https://www.instagram.com/an_a.simonson/'><img alt='Instagram' src={instagram} /></a>
                <a href='https://www.linkedin.com/in/simonsonandrew/'><img alt='LinkedIn' src={linkedin} /></a>
                <a href='mailto:asimonson1125@gmail.com'><img alt='E-mail' src={email} /></a>
                <div id='vertLine'></div>
        </div>
    )
}