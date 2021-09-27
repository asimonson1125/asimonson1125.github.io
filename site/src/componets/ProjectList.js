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
        <>
        <ul className='projectList'>
            {projects}
        </ul>
        </>
    );
} 