type PlayerContainerProps = {
    username: string;
    amount: number;
    winChance: number;
};

export default function PlayerContainer({ username, amount, winChance } : PlayerContainerProps) {

    return (
        <div className={"player_container"}>
            <div className={"player_head"}>Player's Head</div>
            <div className={"player_username"}>{username}</div>
            <div className={"player_amount"}>Przelew {amount}$</div>
            <div className={"player_winchance"}>Szansa {winChance}%</div>
        </div>
    );
}