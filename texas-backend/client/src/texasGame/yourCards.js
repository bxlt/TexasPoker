import React from 'react';
import {Row} from 'react-flexbox-grid';
import Card from './card.js'
import '../style/css/texasGame.css';

// player cards
class YourCards extends React.Component {
    componentWillMount() {
        this.state.socket.on('your_cards', (data) => (
            this.setState({data: data}))
        )
        this.state.socket.on('board_information', (data) => (
            this.setState({start: data[0].table_status}))
        )
    }

    constructor(props) {
        super(props)
        this.state = {
            socket: this.props.socket,
            start: false,
            data: undefined,
        }
    }

    render() {
        if (this.state.start){
            let txt = "My cards: ";
            return (
                <div className="yourCard">
                    <Row>{txt}</Row>
                    {this.state.data.map((card, index) =>
                        <Card key={index} card={card} class={"card"}/>)}
                </div>
            )
        } else {
            return (
                <div></div>
            )
        }
    }
}

export default YourCards
