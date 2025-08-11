import "./PlayerSection.css";
import PlayerContainer from "./PlayerContainer.tsx";
import { useEffect, useState } from "react";

export default function PlayerSection() {
    let [playerData, setPlayerData] = useState<{username: string, amount: number}[]>([]);
    let [totalAmount, setTotalAmount] = useState(0);
    async function fetchPlayerData(folderName: string, fileName: string): Promise<void> {
        if (window.electronAPI && window.electronAPI.readAppDataFile) {
            try {
                const jsonData = await window.electronAPI.readAppDataFile(folderName, fileName); // read the JSON file contents as a string
                const dataArray = JSON.parse(jsonData); // parse the JSON string into an object/array

                // check if parsed data is an array
                if (Array.isArray(dataArray)) {
                    setPlayerData(currentData => { // update playerData state based on differences to avoid unnecessary re-renders
                        const currentMap = new Map(currentData.map(player => [player.username, player])); // create a map for quick lookup of existing players by username

                        const updatedData: typeof currentData = [];
                        const handledUsernames = new Set<string>(); // keep track of usernames already handled

                        // iterate over new player data
                        dataArray.forEach(newPlayer => {
                            const currentPlayer = currentMap.get(newPlayer.username); // check if player exists in current data

                            if (!currentPlayer) {  // add updated player if player is new or amount changed
                                updatedData.push(newPlayer);
                            }
                            else if (currentPlayer.amount !== newPlayer.amount) {
                                updatedData.push(newPlayer);
                            }
                            else { // otherwise, keep existing player object to preserve references
                                updatedData.push(currentPlayer);
                            }

                            handledUsernames.add(newPlayer.username);
                        });

                        // check if data changed by length or any player reference mismatch
                        const changed = updatedData.length !== currentData.length || updatedData.some((player, idx) => player !== currentData[idx]);

                        return changed ? updatedData : currentData; // return updatedData if changed, else keep previous state to avoid re-render
                    });

                    const sumAmount = dataArray.reduce((acc, player) => acc + player.amount, 0) // collect sum of all amounts

                    // send the new sum of payment amounts to the main
                    if (window.electronAPI && window.electronAPI.sendSumAmountToMain) {
                        window.electronAPI.sendSumAmountToMain(sumAmount);
                    }

                    setTotalAmount(sumAmount); // update the state of totalAmount
                }
                else {
                    console.error('JSON is not an array');

                    // if JSON file is not an array print path to JSON file and instruction of what to do to turn it into JSON Array
                    if (window.electronAPI && window.electronAPI.getPathToJSONFile) {
                        console.log('Path to JSON file: ' + await window.electronAPI.getPathToJSONFile(folderName, fileName));
                        console.log("To make JSON file JSON Array wrap all the content in square brackets.")
                    }
                }
            }
            catch (error) {
                console.error("Error fetching or parsing data:", error);
            }
        }
    }

    let intervalTime: number = 1; // interval time (in seconds)

    useEffect(() => {
        (async () => {
            const folderName = 'RoulettePaymentTracker';
            const fileName = 'paymentData.json';

            await fetchPlayerData(folderName, fileName); // fetch data immediately after component mounts

            const interval = setInterval(async () => {await fetchPlayerData(folderName, fileName);}, intervalTime * 1000); // set up an interval to fetch data

            // clean up the interval when the component unmounts
            return () => clearInterval(interval);
        })();
    }, []);

    function calculateWinChance(amount: number,  totalAmount: number) {
        return parseFloat(((amount / totalAmount) * 100).toFixed(2));
    }

    function createPlayerContainer() {
        return playerData.map((player, index) => {
            console.log("Generate new Player Component\nUsername: " + player.username + "\nAmount: " + player.amount);
            return (<PlayerContainer key={index} username={player.username} amount={player.amount} winChance={calculateWinChance(player.amount, totalAmount)}/>);
        })
    }


    return (
        <div className="player_section">
            {createPlayerContainer()}
        </div>
    );
}