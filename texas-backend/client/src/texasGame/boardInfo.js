import React from 'react';
import {Row} from 'react-flexbox-grid'
import '../style/css/texasGame.css';
import port from '../style/images/port.png'

class BoardInfo extends React.Component {
    componentWillMount() {
        this.state.socket.on('board_information', (data) => (
            this.setState(data[0]))
        )
    }

    constructor(props) {
        super(props)
        this.state = {
            socket: this.props.socket,
            current_turn: undefined,
            table_status: undefined,
            ThePot: undefined,
            current_bet: undefined,
            game_status: undefined,
            board_cards: undefined,

        }
        this.handleTable = this.handleTable.bind(this)
    }

    handleTable(data) {
        let text = "";
        text += data.ThePot;
        return text
    }

    render() {
        if (!this.state.table_status) {
            return (
                null
            )
        } else {
            let text = this.handleTable(this.state)
            return (
                <div className="boardInfo">
                	<img className="port" alt="port" src = {port}/>
                    <Row>{text}</Row>
                </div>
            )
        }
    }
}

export default BoardInfo
