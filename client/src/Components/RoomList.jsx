import React from 'react';
import Button from './Button';
import NewGameForm from './NewGameForm';
import SocketProvider from '../SocketProvider';

const styles = {
    container: {
        width: "100%",
        height: "100vh",
        display: "flex",
        flexDirection: "column",

        alignItems: "center"
        
    },
    header: {
        fontSize: "2em",
        fontWeight: "normal",
        fontFamily: "Arial, Helvetica, sans-serif",
    },
    
    subHeader: {
        fontSize: "1.5em",
        fontWeight: "heavy",
        fontFamily: "Arial, Helvetica, sans-serif",
    },
    tableContainer: {
        display: "inline-block",
        maxWidth: "50%",
        minWidth: "50%",
        borderTop: "1px solid #cccccc",
    },
    tableHeader: {
        display: "flex",
        justifyContent: "space-between",
        fontSize: "1.25em",
        padding: "15px",
    },
    tableHeaderItem: {
        // maxWidth:"33%",
        // minWidth:"33%"
        width:"33%",
        textAlign:"left"
    },

    tableContent: {
        maxHeight: "60vh",
        overflowY: "scroll"
    },
    table: {
        marginBottom: "0px",
        fontSize: "20px",
        textAlign: "left",
        marginLeft: "auto",
        marginRight: "auto",
        marginTop: "0",
        width:"100%"
    },
    tbody: {
        width:"100%"
    },
    tr: {
        width:"100%"
    },
    td: {
        textAlign: "left",
        paddingLeft: "15px",
        paddingRight: "10px",
        paddingBottom: "10px",
        width:"33%"
    },

    connectButtonStyle: {
        fontSize: "16px",
        padding: "5px 10px 5px 10px",
        background: "#ffffff",
        cursor: "pointer",
    },
    
    playerName : {
        position:"absolute",
        bottom:"10vh",
        right: "15%"
    }

}

export default class RoomList extends React.Component {

    constructor(props) {
        super(props);

        this.state = {
            newGameOverlayVisible: false,
            rooms: SocketProvider.inst.rooms,
        }
        console.log('rooms: ', SocketProvider.inst.rooms);
    }
    componentDidMount() {
        this.unmountCB = SocketProvider.inst.registerUpdateCallback(()=>{
            this.setState({
                rooms: SocketProvider.inst.rooms,
            })
        })
    }
    componentWillUnmount() {
        this.unmountCB && this.unmountCB();    
    }

    newGame() {

    }

    connectRoom(roomId){

    }

    render() {

        let rooms = [];
        for(let r = 0; r < this.state.rooms.length; r++) {
            const room = this.state.rooms[r];
            rooms.push(
                <tr key={r} style={styles.tr}>
                    <td style={styles.td}>{room.name}</td>
                    <td style={styles.td}>{`${room.numPlayers} / ${room.maxPlayers}`}</td>
                    <td style={styles.td}><button style={styles.connectButtonStyle} onClick={()=>{this.connectRoom(room.id)}}>Connect</button></td>
                </tr>
            )
        }

        return (
            <div style={styles.container}>
                <h1 style={styles.header}>Welcome to Match-It!</h1>
                <Button 
                    text={"New Game"}
                    onClick={()=>{this.newGame()}}
                />

                <h2 style={styles.subHeader}>Current Rooms</h2>

                <div style={styles.tableContainer}>
                    <div style={styles.tableHeader}>
                        <div style={styles.tableHeaderItem}>Name</div>
                        <div style={styles.tableHeaderItem}># Players</div>
                        <div style={styles.tableHeaderItem}></div>
                    </div>
                    <div style={styles.tableContent}>
                        <table style={styles.table}>
                            <tbody style={styles.tbody}>
                                {rooms}
                            </tbody>
                        </table>
                    </div>
                </div>

                <div style={styles.playerName}>
                    {SocketProvider.inst.player ? SocketProvider.inst.player.id : undefined}
                </div>

                { this.state.newGameOverlayVisible && 
                    <NewGameForm />
                }
            </div>
        )
    }
}