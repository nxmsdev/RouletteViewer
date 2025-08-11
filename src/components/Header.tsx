import "./Header.css";
import {useEffect, useState} from "react";

export default function Header() {
    let serverName = "RapySMP";

    let [sumAmount, setSumAmount] = useState<number>(0); // state to store the sum amount received from the main process
    let [_playerCount, setPlayerCount] = useState<number>(0); // state to store player count received from the main process
    let intervalTime: number = 1; // interval time (in seconds)

    useEffect(() => {

        // async function to request the current sum amount from the main process
        async function fetchSumAmount() {
            if (window.electronAPI && window.electronAPI.getSumAmount) {
                try {
                    const amount: number = await window.electronAPI.getSumAmount();
                    console.log("Received sumAmount by the Header: " + amount);

                    setSumAmount(amount);
                }
                catch (error) {
                    console.log("Failed to fetch sumAmount: " + error);
                }
            }
        }

        async function fetchPlayerCount() {
            if (window.electronAPI && window.electronAPI.getPlayerCount) {
                try {
                    const count: number = await window.electronAPI.getPlayerCount();
                    console.log("Received playerCount by the Header: " + count);

                    setPlayerCount(count);
                }
                catch (error) {
                    console.log("Failed to fetch playerCount: " + error);
                }
            }
        }

        // set up a repeating interval to fetch data from main every intervalTime seconds
        const interval = setInterval(() => {
            fetchSumAmount().catch(console.error);
            fetchPlayerCount().catch(console.error);
        }, intervalTime * 1000);

        // cleanup function runs when component unmounts
        return () => {
            clearInterval(interval);
        }
    }, []);

    return (
        <>
            <header className={"header"}>
                <div className="header_title">Ruletka {serverName}</div>
                <div className="header_counter">
                    <div id="grey_text">Losowanie za: </div>
                    <div id="yellow_text">{"69"}s</div>
                </div>
                <div className="header_right_container">
                    <div className="right_cont_text">
                        <div>Do wygrania:</div>
                        <div id="yellow_text">{Number(sumAmount * 0.92).toFixed(0)}$</div>
                    </div>
                    <div className="right_cont_text">
                        <div id="grey_text">Podatek:</div>
                        <div>{Number(sumAmount * 0.08).toFixed(0)}$ (8%)</div>
                    </div>
                    <div className="right_cont_text">
                        <div id="grey_text">Pula:</div>
                        <div>{sumAmount}$</div>
                    </div>
                </div>
            </header>
        </>
    );
}