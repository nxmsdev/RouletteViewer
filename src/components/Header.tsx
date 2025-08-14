import "./Header.css";
import {useEffect, useRef, useState} from "react";
import ShowWinner from "./ShowWinner.tsx";
import RouletteStatus from "./RouletteStatus.tsx";

export default function Header() {
    let serverName = "RapySMP";
    let intervalTimeFetch: number = 0.5; // interval time (in seconds) to fetch data from main process

    let [sumAmount, setSumAmount] = useState<number>(0); // state to store the sum amount received from the main process
    let [playerCount, setPlayerCount] = useState<number>(0); // state to store player count received from the main process
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

    let [rouletteStatus, setRouletteStatus] = useState<boolean>(false);
    let [rouletteStatusOpacity, setRouletteStatusOpacity] = useState<number>(1);
    let rouletteStatusRef = useRef(rouletteStatus);
    const [winnerAnimationDone, setWinnerAnimationDone] = useState(false);

    useEffect(() => {
        rouletteStatusRef.current = rouletteStatus;
    }, [rouletteStatus]);

    async function getRouletteStatus() {
        if (window.electronAPI && window.electronAPI.getRouletteStatus) {
            const status = await window.electronAPI.getRouletteStatus();

            setRouletteStatus(status);
            setRouletteStatusOpacity(status ? 0 : 1);
        }
    }

    useEffect(() => {
        let intervalId: ReturnType<typeof setInterval>;

        async function checkStatus() {
            if (!rouletteStatusRef.current && playerCount == 0) {
                await getRouletteStatus().catch(console.error);
            }
        }

        intervalId = setInterval(checkStatus, 500);

        return () => clearInterval(intervalId);
    }, []);

    useEffect(() => {
        if (winnerAnimationDone) {
            getRouletteStatus().catch(console.error);

            setWinnerAnimationDone(false);
        }

    }, [winnerAnimationDone]);

    let timeToDraw: number = 90;
    let [timeLeftToDraw, setTimeLeftToDraw] = useState<number>(0);
    function countdownTimer(duration: number, onTimerEnd?: () => void) {
        let timerID: ReturnType<typeof setInterval> | null = null;

        if (playerCount >= 2 && rouletteStatusRef.current) {
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
    useEffect(() => {
        if (playerCount >= 2 && rouletteStatusRef.current) {
            return countdownTimer(timeToDraw, drawTheWinner);
        } else {
            setTimeLeftToDraw(timeToDraw);
        }
    }, [playerCount, rouletteStatus]);

    let winPercentage: number = 0.92;
    let winAmount: string = Number(sumAmount * winPercentage).toFixed(0)
    let taxPercentage: number = 0.08;
    let taxAmount: string = Number(sumAmount * taxPercentage).toFixed(0)

    let [winner, setWinner] = useState<string>("");
    let [winnerAmount, setWinnerAmount] = useState<string>("");
    function drawTheWinner() {
        if (window.electronAPI && window.electronAPI.drawTheWinner) {
            setWinner(window.electronAPI.drawTheWinner());
            setWinnerOpacity(1);
            setWinnerAmount(winAmount)
        }
    }

    let [winnerOpacity, setWinnerOpacity] = useState<number>(0);
    let showWinnerBeforeFade: number = 2; // how long in second will winner be swhon before fading out
    useEffect(() => {
        if (winner) {
            const visibleTimeout = setTimeout(() => {
                const fadeInterval = setInterval(() => {
                    setWinnerOpacity((prev) => {
                        if (prev <= 0) {
                            clearInterval(fadeInterval);
                            setWinnerOpacity(0); // Hide winner component when opacity reaches 0
                            setWinnerAnimationDone(true); // animation finished here
                            return 0;
                        }
                        return +(prev - 0.05).toFixed(2); // reduce opacity gradually
                    });
                }, 50);
            }, showWinnerBeforeFade * 1000);

            return () => {
                clearTimeout(visibleTimeout);
            };
        }
    }, [winner]);

    return (
        <>
            <div className="show_winner" style={{ opacity: winnerOpacity, transition: "opacity 200ms linear" }}>
                <ShowWinner username={winner} amount={winnerAmount}/>
            </div>
            <div className="roulette_status" style={{ opacity: rouletteStatusOpacity, transition: "opacity 200ms linear" }}>
                <RouletteStatus/>
            </div>

            <header className={"header"}>
                <div className="header_title">Ruletka {serverName}</div>
                <div className="header_counter">
                    <div id="grey_text">Losowanie za: </div>
                    <div id="yellow_text">{playerCount >= 2 ? `${timeLeftToDraw}s` : "Za malo graczy"}</div>
                </div>
                <div className="header_right_container">
                    <div className="right_cont_text">
                        <div>Do wygrania:</div>
                        <div id="yellow_text">{winAmount}$</div>
                    </div>
                    <div className="right_cont_text">
                        <div id="grey_text">Podatek:</div>
                        <div>{taxAmount}$ ({taxPercentage * 100}%)</div>
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