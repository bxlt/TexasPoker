import React from 'react';
import '../style/css/card.css';
import img_arr from './img_arr.js';

// cards
class Card extends React.Component {
    render() {
        return(
            <img src={ img_arr[this.props.card] } alt={this.props.card} className={this.props.class}/>
        )
    }
}

export default Card
