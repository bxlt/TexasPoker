import React from 'react';

class PlayersCard extends React.Component {
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
}
