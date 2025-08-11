import "./PlayerContainer.css";

type PlayerContainerProps = {
    username: string;
    amount: number;
    winChance: number;
};

export default function PlayerContainer({ username, amount, winChance } : PlayerContainerProps) {

    let imageURL: string = `https://mc-heads.net/avatar/${username}` ;

    return (
        <div className={"player_container"}>
            <img className={"player_head"} src={imageURL} alt="player_head"></img>
            <div className={"player_username"} id="yellow_text">{username}</div>
            <div className={"player_amount"}>Przelew: {amount}$</div>
            <div className={"player_winchance"}>Szansa: {winChance}%</div>
        </div>
    );
}