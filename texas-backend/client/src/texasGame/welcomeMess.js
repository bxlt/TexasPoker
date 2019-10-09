import React from 'react';
import {Row} from 'react-flexbox-grid'
import '../style/css/texasGame.css';

class WelcomeMess extends React.Component {
    componentWillMount() {
        this.state.socket.on('your_information', (data) => (
            this.setState({data: data}))
        )
    }

    constructor(props) {
        super(props)
        this.state = {
            socket: this.props.socket,
            data: undefined,

        }
        this.handleInfo = this.handleInfo.bind(this)
    }

    handleInfo(data) {
        var txt = "";
        if (this.state.data !== undefined) {
            txt += "Hi! Player: " + this.state.data.name + ", ";
            txt += "Table: " + this.state.data.table;
        }
        return txt
    }

    render() {
        let txt = this.handleInfo(this.state)
        return (
            <div>
                <Row>
                    {txt}
                </Row>
            </div>
        )
    }
}

export default WelcomeMess
