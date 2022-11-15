import React from 'react';
import SocketProvider from '../SocketProvider';
import StateRouter from './StateRouter';

export default class StateProvider extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            player: undefined,
            room: undefined,
            game: undefined
        }

    }

    componentDidMount() {
        this.unmountCB = SocketProvider.inst.registerUpdateCallback(()=>{
            this.setState({
                player: SocketProvider.inst.player,
                room: SocketProvider.inst.room,
                game: SocketProvider.inst.game
            })
        })
    }
    componentWillUnmount() {
        this.unmountCB && this.unmountCB();    
    }
    render() {
        return (
            <StateRouter 
                player = {this.state.player}
                room = {this.state.room}
                game = {this.state.game}
            />
        );
    }
}