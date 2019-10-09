import React from 'react';
import ReactDOM from 'react-dom';
// import './index.css';
// import App from './App';
import socketIOClient from "socket.io-client";
import TexasGame from './texasGame/texasGame';
import TableSelector from './tableSelector/tableSelector';
import './style/css/texasGame.css';

class Index extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            socket: socketIOClient("http://localhost:3001")
        }
    }

    render() {
        return (
            <div id="main" className= "flexcontainer">
                <TableSelector socket={this.state.socket}/>
                <TexasGame socket={this.state.socket}/>
            </div>
        )
    }
}

ReactDOM.render(<Index />, document.getElementById('root'));
