import "./Header.css";
import {useEffect, useState} from "react";

export default function Header() {
    let serverName = "RapySMP";
    let intervalTimeFetch: number = 1; // interval time (in seconds) to fetch data from main process

    let [sumAmount, setSumAmount] = useState<number>(0); // state to store the sum amount received from the main process
    let [playerCount, setPlayerCount] = useState<number>(0); // state to store player count received from the main process

    let timeToDraw: number = 5;
    let [timeLeftToDraw, setTimeLeftToDraw] = useState<number>(0);

    function countdownTimer(duration: number, onTimerEnd?: () => void) {
        let timerID: ReturnType<typeof setInterval> | null = null;

        if (playerCount >= 2) {
            setTimeLeftToDraw(duration); // reset timer before starting
            timerID = setInterval(() => {
                setTimeLeftToDraw((prev) => {
                    if (prev <= 1) {
                        if (onTimerEnd) onTimerEnd();

                        return duration; // reset timer
                    }
                    return prev - 1;
                });
            }, 1000);
        } else {
            setTimeLeftToDraw(duration); // reset if not enough players
        }

        return () => {
            if (timerID) clearInterval(timerID);
        };
    }

    let [_winner, setWinner] = useState<string>();

    function drawTheWinner() {
        if (window.electronAPI && window.electronAPI.drawTheWinner) {
            setWinner(window.electronAPI.drawTheWinner());
        }
    }

    useEffect(() => {
        if (playerCount >= 2) {
            return countdownTimer(timeToDraw, drawTheWinner);
        }
        else {
            setTimeLeftToDraw(timeLeftToDraw);
        }
    }, [playerCount]);

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

        // set up a repeating interval to fetch data from main
        const interval = setInterval(() => {
            fetchSumAmount().catch(console.error);
            fetchPlayerCount().catch(console.error);
        }, intervalTimeFetch * 1000);

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
                    <div id="yellow_text">{playerCount >= 2 ? `${timeLeftToDraw}s` : "Za malo graczy"}</div>
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