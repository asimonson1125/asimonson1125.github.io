import React from 'react';
import MyCarousel from '../componets/Carousel.js';
import img1 from '../assets/itsa_me.JPG'
import img2 from '../assets/me_robot.jpeg'
import img3 from '../assets/me_dog.jpg'

export default function Home() {
    return (
        <>
            <div class='centerContent' data-aos="fade-up">
                <h2>Ahoy, I'm Andrew Simonson</h2>
                <p>I'm a first year student at <strong>Rochester Institute of Technology </strong>
                    in the <b>Computing Exploration</b> program and am pursuing a career in data
                    science with a focus on predictive analytics.
                </p>
                <p>When I'm not in class, you can find me working on extra collaborative projects,
                    building discord bots, playing chess, reading up on some recent geopolitical
                    development, or in my dorm with a fat pint of ice cream.
                </p>
                <MyCarousel>
                    {[[img1, "Me, chilling"],[img2, "VEX Robotics 2019"]]}
                </MyCarousel>
            </div>
        </>
    )
}