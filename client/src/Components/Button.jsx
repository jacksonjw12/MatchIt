
const styles = {
    buttonContainer: {
        cursor: "pointer",
        width: "20%",
        padding: "12px 20px",
        boxShadow: "1px 1px 5px 0px #a2958a",
        fontFamily: "Arial, Helvetica, sans-serif",
        fontSize: "20px",
    }
}
export default function Button(props){


    return (
        <div style={styles.buttonContainer} onClick={props.onClick}>
            {props.text}
        </div>
    )

}