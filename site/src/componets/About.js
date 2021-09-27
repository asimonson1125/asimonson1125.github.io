import React from 'react';
import picture from '../assets/itsa_me.JPG'
import AOS from 'aos'

export default function About(){
    return(
        <>
        <div data-aos="fade-in">
            <h2>A biography</h2>
            <p>Ahoy, I'm Andrew Simonson</p>
            <p>I'm primarily an <strong>extremely</strong> forgetful person 
                who, when productive, rewrites fate in favor of my own 
                short-term interests, or rather, whatever half-assed mistake
                results from the attempt.</p>
            <p>When I'm not <del>losing my mind</del>wasting time, 
                you can find me building discord bots, playing chess, 
                or actually exercising, doing things like, idk, playing
                racquetball or soccer.</p>
            <p>I'm a first year student at <strong>Rochester Institute of Technology </strong>
                in the <b>Computing Exploration</b> program.  I'm from Hagerstown, 
                Maryland.</p>
        </div>
            <img alt='me' src={picture} className='sideimg' data-aos='fade-up' />
        </>
    )
}