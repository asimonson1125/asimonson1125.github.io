import React from 'react'

export default class Project extends React.Component {
    render(){
        let links;
        this.props.links.forEach(x => {
            links = (
                <>
                {links}
                <a href={x[0]}>{x[1]}</a>
                </>
            )
        })
        return (
            <li className={'project'} data-aos='fade-up'>
                <div className='topBox'>
                    <h3>{this.props.title}</h3>
                    <p className={this.props.status + " tab"}>⬤</p>
                    <p className='body'>{this.props.children}</p>
                </div>
                <div className='bottomBox'>
                    {links}
                </div>
            </li>
        )
    }
}
