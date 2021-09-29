import React from "react";
import { Carousel } from "react-responsive-carousel";
import "react-responsive-carousel/lib/styles/carousel.min.css";

export default function ResponsiveCarousel(props) {
  let slides = [];
  props.children.forEach(x => {
    slides.push (
        <div>
          <img src={x[0]} alt={x[1] } />
          <p className="legend">{x[1]}</p>
        </div>
    )
  });
  return (
    <div>
      <div className="carousel-container">
        <Carousel infiniteLoop autoPlay useKeyboardArrows centerMode dynamicHeight>
          {slides}
        </Carousel>
      </div>
    </div>
  );
}