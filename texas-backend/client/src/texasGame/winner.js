import React from 'react';
import {Row} from 'react-flexbox-grid'

class Winner extends React.Component {
    componentWillMount() {
        this.state.socket.on('winner', (id) => (
            this.setState({id: id}))
        )
        this.state.socket.on('board_information', (data) => (
            this.setState({start: data[0].table_status}))
        )
    }

    constructor(props) {
        super(props)
        this.state = {
            socket: this.props.socket,
            id: undefined,
            start: false
        }
        this.handleInfo = this.handleInfo.bind(this)
    }

    handleInfo(data) {
        var txt = "";
        if (data.id) {
          txt += "Winner is: " + data.id;
        }
        return txt
    }

    render() {
        if (!this.state.start) {
        let txt = this.handleInfo(this.state)
            return (
                <div>
                    <Row>{txt}</Row>
                </div>
            )
        } else {
            return (
                <div></div>
            )
        }
    }
}

export default Winner
