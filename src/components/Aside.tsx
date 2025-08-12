import "./Aside.css"

export default function Aside() {
    return (
        <aside className="aside">
            <div className="last_round_result">
                <div className="title">Wynik ostatnich rund:</div>
                <div className="list" id="grey_text">W przyszlosci</div>
            </div>
            <div className="winners">
                <div className="title">Najlepsi wygrani dnia:</div>
                <div className="list" id="grey_text">W przyszlosci</div>
            </div>
            <div className="top_payments">
                <div className="title">Najwiecej rozegranych $:</div>
                <div className="list" id="grey_text">W przyszlosci</div>
            </div>
            <div className="chat">Chat</div>
        </aside>
    );
}