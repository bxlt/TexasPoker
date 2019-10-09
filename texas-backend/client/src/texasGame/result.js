import React from 'react';

class Each extends React.Component {
    render() {
        return (
            <div>
                Id: {this.props.data.id},
                Cards: {this.props.data.cards},
                Value: {this.props.data.value},
                type:  {this.props.data.type},
            </div>
        )
    }
}

class Result extends React.Component {
    componentWillMount() {
        this.state.socket.on('other_players_cards', (data) => (
            this.setState({data: data}))
        )
        this.state.socket.on('board_information', (data) => (
            this.setState({start: data[0].table_status,
            game_status: data[0].game_status,
            board_cards: data[0].board_cards}))
        )
    }

    constructor(props) {
        super(props)
        this.state = {
            socket: this.props.socket,
            data: {},
            start: false,
            game_status: undefined,
            board_cards: undefined
        }
    }

    render() {
        if (this.state.game_status === "End") {
            return (
                <div>
                    <h3> Result: </h3>
                    <div> Board Cards: {this.state.board_cards.toString()} </div>
                </div>
            )
        } else {
            return (
                null
            )
        }
    }
}

export default Result
