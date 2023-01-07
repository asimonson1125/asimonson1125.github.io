import React from 'react'

export default function ProjectList(props){
    let projects;
    props.children.forEach(function(x){
        projects = (
            <>
            {projects}
            {x}
            </>
        );
    });
    return(
        <div className={'projectList centeredForeground ' + props.classes} data-aos='fade-up'>
            {projects}
        </div>
    );
} 