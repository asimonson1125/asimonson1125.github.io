import React from 'react';

export default function Nav(props) {
    let items;
    for (let i = 0; i < props.children.length; i++) {
        items = (
            <>
                {items}
                <div className='navElement'>{props.children[i]}</div>
            </>
        )
    }
    return (
        <div className='navControl'>
            <div className='navBar'>
                {items}
            </div>
        </div>
    )
}