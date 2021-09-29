import React from 'react';

export default function Nav(props){
    let items;
    for(let i = 0; i < props.children.length; i++){
        items = (
            <>
                {items}
                <td className='navElement'>{props.children[i]}</td>
            </>
        )
    }
    return(
        <div className = 'navControl'>
            <table className='navBar'>
                {items}
            </table>
        </div>
    )
}