import "./Header.css"
import {useEffect, useState} from "react";

export default function Header() {
    let [sumAmount, setSumAmount] = useState<number>(0); // state to store the sum amount received from the main process
    let intervalTime: number = 1; // interval time (in seconds)

    useEffect(() => {
        let isMounted = true; // flag to prevent state update if the component unmounts before async call finishes

        // async function to request the current sum amount from the main process
        async function fetchSumAmount() {
            if (window.electronAPI && window.electronAPI.getSumAmount) {
                try {
                    const amount: number = await window.electronAPI.getSumAmount();
                    console.log("Received sumAmount by the Header: " + amount);

                    // only update state if component is still mounted
                    if (isMounted) {
                        setSumAmount(amount);
                    }
                }
                catch (error) {
                    console.log("Failed to fetch sumAmount from main: " + error);
                }
            }
        }

        const interval = setInterval(fetchSumAmount, intervalTime * 1000); // set up a repeating interval to fetch sumAmount every intervalTime seconds

        // cleanup function runs when component unmounts
        return () => {
            isMounted = false;
            clearInterval(interval);
        }
    }, []);

    return (
        <>
            <header className={"header"}>
                <div>Header</div>
                <div className="header_right_container">
                    <div>Do wygrania: {sumAmount * 0.9}$</div>
                    <div>Podatek: {sumAmount * 0.1}$</div>
                    <div>Pula: {sumAmount}$</div>
                    <div>Kwota minimalna: 100$</div>
                </div>
            </header>
        </>
    );
}