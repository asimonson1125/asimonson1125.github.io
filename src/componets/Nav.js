import React from 'react';

export default function Nav(props){
    let items;
    for(let i = 0; i < props.children.length; i++){
        items = (
            <>
                {items}
                <li>{props.children[i]}</li>
            </>
        )
    }
    return(
        <ul className='navBar'>
            {items}
        </ul>
    )
}