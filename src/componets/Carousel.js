import React from "react";
import ImageGallery from 'react-image-gallery';

export default function ResponsiveCarousel(props) {
  let items = [{
    original: 'https://picsum.photos/id/1018/1000/600/',
    description: "greg"
  }]
  return (
    <div>
      <div className="carousel-container">
      <ImageGallery items={props.children}/>
      </div>
    </div>
  );
}