import React from 'react';
import '../style/css/texasGame.css';

class ErrorMess extends React.Component {
    componentWillMount() {
        this.state.socket.on('_error', (mess) => (
            this.setState({mess: mess}))
        )
    }

    constructor(props) {
        super(props)
        this.state = {
            socket: this.props.socket,
            mess: undefined
        }
    }

    render() {
        if (this.state.mess !== undefined) {
            let mess = this.state.mess;
            alert(mess)
        }
        return (null)
    }
}

export default ErrorMess
