import React from 'react'

export default class Project extends React.Component {
    constructor(props){
        super(props)
    }

    render(){
        return (
            <li className={'project'} data-aos='fade-up' data-aos-offset={0}>
                <div className='topBox'>
                    <h3>{this.props.title}</h3>
                    <p className={this.props.status + " tab"}>⬤</p>
                    <p className='body'>{this.props.children}</p>
                </div>
                <div className='bottomBox'>
                    <a href={this.props.link}>{this.props.linkText}</a>
                </div>
            </li>
        )
    }
}
