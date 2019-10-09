import React from 'react';
// import {Row} from 'react-flexbox-grid'
import '../style/css/tableSelector.css';
import '../style/css/texasGame.css';
import Timer from './timer';

class ChoiceSelector extends React.Component {
    componentWillMount() {
        this.state.socket.on('your_information', (id) => (
            this.setState({id: id}))
        )
        this.state.socket.on('board_information', (data) => (
            this.setState({start: data[0].table_status,
              current_turn: data[0].current_turn,
              last_raise: data[0].last_raise,
              selectValue:data[0].last_raise,
              current_bet: data[0].current_bet}))
        )
        this.state.socket.on('player_information', (data) => (
            this.setState({data: data}))
        )
    }

    handleChange(e) {
        this.setState({selectValue: e.target.value});
    }

    handleClick(event) {
        this.state.socket.emit("action",{action:event});
    }

    handleRaise(amount) {
        this.state.socket.emit("action",{action:"raise", amount:amount});
    }

    ready(e) {
        e.preventDefault();
        this.state.socket.emit("ready",null);
    }

    // get the player's gold and paid
    findOwn(arr, id) {
        for (var i of arr) {
            if (i.id === id) {
                return i.paid+i.gold
            }
        }
    }


    joinedTable(arr,id){
        for (var i in arr) {
            if (arr[i].id === id) {
                return arr[i].table;
            }
        }
    }

    findMax(arr,id){
        for (var i in arr) {
            if (arr[i].id === id) {
                return arr[i].gold;
            }
        }
    }

    constructor(props) {
        super(props)
        this.state = {
            socket: this.props.socket,
            start: false,
            id: undefined,
            current_turn: undefined,
            current_bet: undefined,
            data: undefined,
            selectValue: null,
            last_raise: null,
        }
        this.handleChange = this.handleChange.bind(this)
        this.handleClick = this.handleClick.bind(this)
        this.handleRaise = this.handleRaise.bind(this)
        this.ready = this.ready.bind(this)
        this.findOwn = this.findOwn.bind(this)
        this.joinedTable = this.joinedTable.bind(this)
        this.findMax=this.findMax.bind(this)
    }

    render() {
        if ((this.state.start) && ((this.state.current_turn) === this.state.id.id)) {
            let total = this.findOwn(this.state.data, this.state.id.id);
            if (total <= this.state.current_bet) {
                return (
                    <div className="choiceSelector">
                        <button id="next-turn" className="Gamebutton" onClick={() => this.handleClick("fold")}>Fold</button>
                        <button id="allin" className="Gamebutton" onClick={() => this.handleClick("allin")}>All in</button>
                        <Timer socket={this.state.socket}/>
                    </div>
                )
            } else {
                if(this.findMax(this.state.data, this.state.id.id)-this.state.current_bet<this.state.last_raise){
                    return (
                        <div className="choiceSelector">
                            <button id="next-turn" className="Gamebutton" onClick={() => this.handleClick("fold")}>Fold</button>
                            <button id="call" className="Gamebutton" onClick={() => this.handleClick("call")}>Call/Check</button>
                            <button id="allin" className="Gamebutton" onClick={() => this.handleClick("allin")}>All in</button>
                            <Timer socket={this.state.socket}/>
                        </div>
                    )
                }
                else{
                    return (
                    <div className="choiceSelector">
                        <button id="next-turn" className="Gamebutton" onClick={() => this.handleClick("fold")}>Fold</button>
                        <button id="call" className="Gamebutton" onClick={() => this.handleClick("call")}>Call/Check</button>
                        <input type="number" value={this.state.selectValue} min={this.state.last_raise} max={this.findMax(this.state.data, this.state.id.id)} className="raise" onChange={this.handleChange}></input>
                        <button id="raise" className="Gamebutton" onClick={() => this.handleRaise(Number(this.state.selectValue))}>raise {this.state.selectValue}</button>
                        <button id="allin" className="Gamebutton" onClick={() => this.handleClick("allin")}>All in</button>
                        <Timer socket={this.state.socket}/>
                    </div>
                )
                }

            }
        } else if (!this.state.start) {
            if(this.state.id!==undefined){
                let table = this.joinedTable(this.state.data, this.state.id.id);
                if(table!=null){
                    return (
                        <div className="choiceSelector">
                            <button id="ready" className="Gamebutton" onClick={this.ready}>ready</button>
                        </div>
                    )
                }
            }

            return (null)

        } else {
            return (
                null
            )
        }
    }
}

export default ChoiceSelector
