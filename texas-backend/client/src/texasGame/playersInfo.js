import React from 'react';
import {Row} from 'react-flexbox-grid';
import Card from './card.js';

import ready from '../style/images/ready.png';
import turn from '../style/images/turn.png';
import user from '../style/images/user.png';
import coin from '../style/images/coin.png';
import '../style/css/playersInfo.css';

// show cards when game start
class Back extends React.Component {
    render() {
        if (!this.props.game_status) {
            return (null)
        } else {
            return (
              <div>
                  {this.props.board_cards.map((card, index) =>
                      <Card key={index} card={card} class={"card"}/>)}
              </div>
            )
        }
    }
}

class Status extends React.Component {
    render() {
        if (this.props.data.fold) {
            return (
                <Row> Fold </Row>
            )
        } else if (this.props.data.allin) {
            return (
                <Row> All In</Row>
            )
        } else if (this.props.data.this_wave_paid !== 0) {
            return (
                <Row> This Wave: ${this.props.data.this_wave_paid} </Row>
            )
        } else{
            return (null)
        }
    }
}

class PlayerInfo extends React.Component {
    constructor(props) {
        super(props)
        this.handleCards = this.handleCards.bind(this)
    }

    handleCards(cards) {
        if (cards.length === 0) {
            return (null)
        } else {
            return (
                cards.map((card, index) =>
                    <Card key={index} card={card} class={"otherCard"}/>)
            )
        }
    }

    render() {
        let id = this.props.data.name;
        let name = "ap p" + this.props.index;
        name += " pBackground";
        let pname = "pp pp" +this.props.index;
        if (!this.props.start) {
            if (this.props.data.ready) {
                return (
                  <div>
                      <div className={pname}>{this.handleCards(this.props.data.cards)}</div>
                      <div className={name}>
                          <Row>
                              <img className="user" alt="user" src={user}/> {id}
                              <img className="user" alt="coin" src={coin}/> {this.props.data.gold}
                              <img className="ready" alt="ready" src={ready}/>
                          </Row>
                      </div>
                  </div>
                )
            } else {
                return (
                    <div>
                        <div className={pname}>{this.handleCards(this.props.data.cards)}</div>
                        <div className={name}>
                            <Row>
                                <img className="user" alt="user" src={user}/> {id}
                                <img className="user" alt="coin" src={coin}/> {this.props.data.gold}
                            </Row>
                        </div>
                    </div>
                )
            }
        } else {
            // if player fold
            if (this.props.data.fold) {
                return (
                    <div className={"fold"}>
                        <div className={pname}>{this.handleCards(this.props.data.cards)}</div>
                        <div className={name}>
                            <Row>
                                <img className="user" alt="user" src={user}/> {id}
                                <img className="user" alt="coin" src={coin}/> {this.props.data.gold}
                            </Row>
                            <Status data={this.props.data}/>
                        </div>
                    </div>
                )
            } else if (this.props.current !== id){
                return (
                    <div>
                        <div className={pname}>{this.handleCards(this.props.data.cards)}</div>
                        <div className={name}>
                            <Row>
                                <img className="user" alt="user" src={user}/> {id}
                                <img className="user" alt="coin" src={coin}/> {this.props.data.gold}
                            </Row>
                            <Status data={this.props.data}/>
                        </div>
                    </div>
                )
            } else {
                return (
                    <div>
                        <div className={pname}>{this.handleCards(this.props.data.cards)}</div>
                        <div className={name}>
                            <Row>
                                <Row>
                                    <img className="user" alt="user" src={user}/> {id}
                                    <img className="user" alt="coin" src={coin}/> {this.props.data.gold}
                                </Row>
                                <img className="turn" alt="your turn" src={turn}/>
                            </Row>
                            <Status data={this.props.data}/>
                        </div>
                    </div>
                )
            }
        }
    }
}

// all palyers
class PlayersInfo extends React.Component {
    componentWillMount() {
        this.state.socket.on('player_information', (data) => (
            this.setState({data: data}))
        )
        this.state.socket.on('board_information', (data) => (
            this.setState({start: data[0].table_status,
              current: data[0].current_turn,
              game_status: data[0].game_status,
              board_cards: data[0].board_cards}))
        )
    }

    constructor(props) {
        super(props)
        this.state = {
            socket: this.props.socket,
            start: false,
            data: [],
            current: undefined,
            game_status: undefined,
            board_cards: undefined,
        }
    }

    render() {
        return (
            <div className="playersInfo">
                {this.state.data.map((player, index) =>
                    <PlayerInfo key={index} index={index} data={player} start={this.state.start} current={this.state.current}/>
                )}
                <div className='ap p'>
                    <Back game_status={this.state.game_status} board_cards={this.state.board_cards}/>
                </div>
            </div>
        )
    }
}

export default PlayersInfo
