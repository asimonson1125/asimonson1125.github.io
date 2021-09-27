import React from 'react'

export default function Project(props){
    let statusColor = 'rgb(0,0,0)'
    if(props.status == "WIP"){
        statusColor = 'yellow';
    }
    else if(props.status == "Complete"){
        statusColor = 'green';
    }
    else if(props.status == "Incomplete"){
        statusColor = 'red';
    }
    return (
        <li className='project'>
            <div className='topBox'>
                <h3>{props.title}</h3>
                <p>{props.children}</p>
            </div>
            <div className='bottomBox'>
                <a href={props.link}>{props.linkText}</a>
            </div>
        </li>
    )
}