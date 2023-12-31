import React, { useEffect, useState } from 'react';
import { AgGridReact } from 'ag-grid-react';
import 'ag-grid-community/styles/ag-grid.css';
import 'ag-grid-community/styles/ag-theme-alpine.css';
import './BjorlileikaPage.css'
import { getDates, getDateData, sendGame, BjorliGame, Game } from './Api';
import { constructColumnsFromGames, convertRowDataToGame, createPlayerRow } from './BjorlileikaPageUtil';


const BjorliLeikaPage: React.FC = () => {
    const [gridApi, setGridApi] = useState<any>(null);
    const [rowData, setRowData] = useState<any[]>([]);
    const [columnDefs, setColumnDefs] = useState<any[]>([]);

    const [dates, setDates] = useState<string[]>([]);
    const [selectedDate, setSelectedDate] = useState<string | null>(null);

    useEffect(() => {
        // Fetch dates when component mounts
        const fetchDates = async () => {
            const availableDates = await getDates();
            setDates(availableDates);
            if (availableDates.length) {
                setSelectedDate(availableDates[0]);
            }
        }
        fetchDates();
    }, []);

    useEffect(() => {
        if (selectedDate) {
            fetchDataForDate(selectedDate);
        }
    }, [selectedDate]);

    const fetchDataForDate = async (date: string) => {
        try {
            const result = await getDateData(date);
            if (result) {
                constructColumnsFromGames(result.games, setColumnDefs);
                constructRowsFromPlayersAndScores(result.players, result.games);
            }
        } catch (error) {
            console.error("Error fetching data:", error);
        }
    };

    const addNewPlayer = () => {
        const newPlayerName = prompt("Spillerns navn?:");
    
        if (newPlayerName && newPlayerName.trim() !== "") {
            const newRow = createPlayerRow(newPlayerName);
            setRowData(prevRows => [...(prevRows || []), newRow]);
        } else if (newPlayerName !== null) { // Only show the alert if user didn't press Cancel
            alert("Kom igjen da, ikke vær teit.");
        }
    };
    const constructRowsFromPlayersAndScores = (players: string[], games: Game[]) => {
        let newRows: Record<string, any>[] = players.map(player => createPlayerRow(player, games));
        setRowData(newRows || []);
    };
    const addNewGame = () => {
        const newGameName = prompt("Spillets navn?:");
    
        if (columnDefs && newGameName && newGameName.trim() !== "") {
            // Check if the game already exists
            if (columnDefs.some(col => col.field === newGameName)) {
                alert('Dust! dette spillet finnes allerede!');
                return;
            }
    
            // Create a new column for the game
            const newColumn = {
                headerName: newGameName,
                field: newGameName,
                editable: true,
                cellStyle: { textAlign: "right" },
                width: 110,
                autoHeaderHeight: true,
                sortable: true,
                singleClickEdit: true,
                cellEditor: "agNumberCellEditor",
                cellEditorParams: {
                  min: 1,
                  max: 9,
                  precision: 0,
                },
                cellDataType: "number",
            };

            // Update columns and rowData
            setColumnDefs((prevColumns) => [...prevColumns, newColumn]);
            setRowData((prevRows) =>
                prevRows && prevRows.length > 0
                    ? prevRows.map((row) => ({
                          ...row,
                          [newGameName]: 0, // Default score value; adjust as needed
                      }))
                    : []
            );
        } else if (newGameName !== null) { // Only show the alert if user didn't press Cancel
            alert("Kom igjen da, et skikkelig navn takk!");
        }
    };
    const sendDataToApi = async () => {
        if (!gridApi || !selectedDate) {
            alert("Grid or date is not ready!");
            return;
        }
        // Get the current data from the grid
        const rowDataArray: any[] = [];
        gridApi.forEachNode(node => rowDataArray.push(node.data));

        // Get game names (excluding playerName and total columns)
        const gameNames = columnDefs
            .filter(col => col.field !== 'playerName' && col.field !== 'total')
            .map(col => col.field);

        // Convert grid data to BjorliGame object
        const bjorliGame: BjorliGame = {
            date: selectedDate,
            locked: false, // Or get the current status of the game if needed
            games: convertRowDataToGame(rowDataArray, gameNames),
            players: rowDataArray.map(row => row.playerName)
        };

    
        try {
            // Send the BjorliGame data using Api.addGame
            const response = await sendGame(bjorliGame);
            if (response.status !== "success") {
                throw new Error("Klarte ikke sende data");
            }
            alert("Data ble sendt tilbake, ser det ut som!");
        } catch (error) {
            console.error("Error sending data:", error);
            alert("Det der gikk ikke!");
        }
    };
    const onGridReady = (params) => {
        setGridApi(params.api);
    };

    return (
        <>
            <div className="beaver-theme" style={{ marginBottom: '10px', width: '100%' }}>
                <label>Velg dato: </label>
                <select
                    value={selectedDate || ''}
                    onChange={(e) => setSelectedDate(e.target.value)}
                >
                    {dates.map(date => (
                        <option key={date} value={date}>
                            {date}
                        </option>
                    ))}
                </select>
            </div>
            <div className="beaver-button-group" style={{ marginBottom: '10px' }}>
                <button className="beaver-button" onClick={addNewPlayer}>Ny Spiller</button>
                <button className="beaver-button" onClick={addNewGame}>Nytt Spill</button>
                <button className="beaver-button" onClick={sendDataToApi}>Send Data</button>
            </div>
            <div className="ag-theme-alpine" style={{ height: '100%', width: '100%' }}>
                <AgGridReact
                    domLayout='autoHeight'
                    onGridReady={onGridReady}
                    rowData={rowData}
                    columnDefs={columnDefs}
                    defaultColDef={{
                      headerClass: 'ag-right-aligned-header',
                      cellClass: 'ag-right-aligned-cell'
                    }}
                />
            </div>
        </>
    );
}

export default BjorliLeikaPage;
