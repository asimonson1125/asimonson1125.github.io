import React from "react";
import ImageGallery from 'react-image-gallery';

export default function ResponsiveCarousel(props) {
  return (
    <div>
      <div className="carousel-container">
      <ImageGallery items={props.children}/>
      </div>
    </div>
  );
}