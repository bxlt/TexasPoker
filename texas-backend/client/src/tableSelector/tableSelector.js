import React from 'react';
import '../style/css/tableSelector.css';

class TableSelector extends React.Component {
    componentWillMount() {
        this.state.socket.on('all_table_information', (room) => (
            this.setState({room: room}))
        )
    }

    handleRoom(tb) {
        this.state.socket.emit("join", {id: tb})
    }

    getRoom() {
        let element = this.state.room.map((tb, index) => {
            return (
                <button key={index} className="room" onClick={() => this.handleRoom(tb.id)}>
                    Room: {tb.id}, Player Number: {tb.players}
                </button>
            )
        })
        return element;
    }

    constructor(props) {
        super(props);
        this.state = {
            socket: this.props.socket,
            room: []
        }
        this.handleRoom = this.handleRoom.bind(this)
    }

    render() {
        return (
            <div className="tableSelector">
                <p> Room List: </p>
                {this.getRoom()}
            </div>
        )
    }

}

export default TableSelector
