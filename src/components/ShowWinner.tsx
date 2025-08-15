type ShowWinnerProps = {
    username: string;
    amount: number;
};

export default function ShowWinner( { username, amount }: ShowWinnerProps) {
    return (
        <>
            <div className="show_winner_text">
                <div className="show_winner_title" id="grey_text">Wygrany:</div>
                <div className="show_winner_username" id="yellow_text">{username}</div>
                <div className="show_winner_amount">{amount}$</div>
            </div>
        </>
    );
}