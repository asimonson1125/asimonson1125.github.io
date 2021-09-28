import React from 'react';

import github from '../assets/github.svg'
import instagram from '../assets/instagram.svg'
import linkedin from '../assets/linkedin.svg'
import email from '../assets/email.svg'

export default function Socials(){
    return(
        <table class='socials'>
            <tr>
                <td><a href='https://github.com/asimonson1125'><img alt='Github' src={github} /></a></td>
                <td><a href='https://www.instagram.com/an_a.simonson/'><img alt='Instagram' src={instagram} /></a></td>
                <td><a href='https://www.linkedin.com/in/simonsonandrew/'><img alt='LinkedIn' src={linkedin} /></a></td>
                <td><a href='mailto:asimonson1125@gmail.com'><img alt='E-mail' src={email} /></a></td>
            </tr>
        </table>
    )
}