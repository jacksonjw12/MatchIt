import React from 'react';
import RoomList from './RoomList';
import Room from './Room';
import Game from './Game';

export const RouterStates = {
    ROOMLIST: 'roomList',
    ROOM: "room",
    GAME: "game"
}

export default class StateRouter extends React.Component {

    constructor(props) {
        super(props);
        this.prevRoute = RouterStates.ROOMLIST;
        this.state = {
            route: undefined
        }
    }

    static getDerivedStateFromProps(props, state) {
        let nextRoute = state.route;
        if(props.room) {
            if(props.room.stage == "menu") {
                nextRoute = RouterStates.ROOM;
            }
            else{
                nextRoute = RouterStates.GAME;
            }
        }
        if(nextRoute !== state.route) {
            this.prevRoute = state.route;
            return {...state, route: nextRoute};
        }
        return state;
    }
    shouldComponentUpdate(nextProps, nextState) {
        if(this.prevRoute != nextState.route) {
            this.prevRoute = nextState.route;
            return true;
        }
        return false;
    }



    render() {
        if(this.state.route === RouterStates.ROOM) {
            return (<Room />)
        }
        else if(this.state.route === RouterStates.GAME) {
            return (<Game />)
        }
        else {
            return (<RoomList />)
        }
    }
}