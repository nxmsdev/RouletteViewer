import "./App.css";
import Header from "./components/Header.tsx";
import PlayerSection from "./components/player/PlayerSection.tsx";
export default function App() {
  return (
    <>
        <div className="app">
            <Header/>
            <div className="under_header">
                <aside className="aside">
                    <div className="last_round_result">
                        <div className="title">Wynik ostatnich rund:</div>
                        <div className="list"></div>
                    </div>
                    <div className="winners">
                        <div className="title">Najlepsi wygrani dnia:</div>
                        <div className="list"></div>
                    </div>
                    <div className="top_payments">
                        <div className="title">Najwięcej rozegranych:</div>
                        <div className="list"></div>
                    </div>
                    <div className="chat">Chat</div>
                </aside>
                <PlayerSection/>
            </div>
        </div>
    </>
  );
}