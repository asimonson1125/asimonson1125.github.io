import React from 'react'

export default function Skills(props){
    let allSkills;
    props.children.forEach(x => {
        allSkills = (
            <>
                {allSkills}
                <li className='skill'>{x}</li>
            </>
        )
    });
    return (
        <ul className='skills'>
            {allSkills}
        </ul>);
}