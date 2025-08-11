import "./App.css";
import Header from "./components/Header.tsx";
import PlayerSection from "./components/player/PlayerSection.tsx";
import Aside from "./components/Aside.tsx";
export default function App() {
  return (
    <>
        <div className="app">
            <Header/>
            <div className="under_header">
                <Aside/>
                <PlayerSection/>
            </div>
        </div>
    </>
  );
}