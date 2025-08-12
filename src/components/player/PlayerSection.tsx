import "./PlayerSection.css";
import PlayerContainer from "./PlayerContainer.tsx";
import { useEffect, useState } from "react";

export default function PlayerSection() {
    let payUsername = "WilgotnyArtur";
    let amountOfBetsShown: number = 30;

    const [playerData, setPlayerData] = useState<{username: string, amount: number}[]>([]);
    const [totalAmount, setTotalAmount] = useState<number>(0);

    let intervalTime: number = 0.5; // interval time (in seconds)

    useEffect(() => {
        async function fetchPlayerData() {
            const playerData = await window.electronAPI.getPlayerData();
            const totalAmount = await window.electronAPI.getSumAmount();

            setPlayerData(playerData);
            setTotalAmount(totalAmount);
        }

        const interval = setInterval(fetchPlayerData, intervalTime * 1000);

        return () => clearInterval(interval);
    }, []);

    function calculateWinChance(amount: number,  totalAmount: number) {
        return parseFloat(((amount / totalAmount) * 100).toFixed(2));
    }

    function createPlayerContainer() {
        return playerData.slice(0, amountOfBetsShown).map((player, index) => {
            console.log("Generated new Player Component\nUsername: " + player.username + "\nAmount: " + player.amount);
            return (<PlayerContainer key={index} username={player.username} amount={player.amount} winChance={calculateWinChance(player.amount, totalAmount)}/>);
        })
    }

    return (
        <div className="player_section">
            <div className="player_section_top">
                <div className="amount_of_bets" id="grey_text">Pierwsze 30 najwiekszych zakladow:</div>
                <div className="payment_command">
                    <div id="grey_text">Postaw zaklad przez:</div>
                    <div id="yellow_text">/pay {payUsername} {"<kwota>"}</div>
                </div>
            </div>
            <div className="player_containers">
                {createPlayerContainer()}
            </div>
        </div>
    );
}