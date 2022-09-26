import React from 'react'
import placeholder from '../assets/photos/placeholder.png'

export default class Project extends React.Component {
    render() {
        let links = <></>;
        if (this.props.links != null) {
            this.props.links.forEach(x => {
                links = (
                    <>
                        {links}
                        <a href={x[0]}>{x[1]}</a>
                    </>
                )
            })
        } else{
            links = <div className='placeholder'><img alt="no links!" src={placeholder} /></div>
        }
        return (
            <div className={'project'} data-aos='fade-up'>
                <div className='topBox'>
                    <h3>{this.props.title}</h3>
                    <p className={this.props.status + " tab"}>⬤</p>
                    <p className='body'>{this.props.children}</p>
                </div>
                <div className='bottomBox'>
                    {links}
                </div>
            </div>
        )
    }
}
