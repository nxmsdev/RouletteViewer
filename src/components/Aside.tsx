import "./Aside.css"

export default function Aside() {
    return (
        <aside className="aside">
            <div className="last_round_result">
                <div className="title" id="yellow_text">Wynik ostatnich rund:</div>
                <div className="list"></div>
            </div>
            <div className="winners">
                <div className="title" id="yellow_text">Najlepsi wygrani dnia:</div>
                <div className="list"></div>
            </div>
            <div className="top_payments">
                <div className="title" id="yellow_text">Najwiecej rozegranych:</div>
                <div className="list"></div>
            </div>
            <div className="chat">Chat</div>
        </aside>
    );
}