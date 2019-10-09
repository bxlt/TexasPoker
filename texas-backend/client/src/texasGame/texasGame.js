import React from 'react';
// import ReactDOM from 'react-dom';
import WelcomeMess from './welcomeMess';
import BoardInfo from './boardInfo';
import ErrorMess from './errorMess';
import PlayersInfo from './playersInfo';
import YourCards from './yourCards';
import Winner from './winner';
import ChoiceSelector from './choiceSelector';
import '../style/css/texasGame.css';
import NameForm from './NameForm.js';


class TexasGame extends React.Component {

    render() {
        return(
            <div className="texasGame backgroundImage">
            	<NameForm socket={this.props.socket}/>
                <WelcomeMess socket={this.props.socket}/>
                <BoardInfo socket={this.props.socket}/>
                <ErrorMess socket={this.props.socket}/>
                <PlayersInfo socket={this.props.socket}/>
                <YourCards socket={this.props.socket}/>
                <Winner socket={this.props.socket}/>
                <ChoiceSelector socket={this.props.socket}/>
            </div>
        );
    }
}

export default TexasGame
