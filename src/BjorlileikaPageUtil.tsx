import { Game } from "./Api";

export const createPlayerRow = (player: string, games: Game[] = []): Record<string, any> => {
    let playerRow: Record<string, any> = { playerName: player };
    let total = 1;

    games.forEach(game => {
        playerRow[game.name] = game.scores[player];
        if (game.scores[player]) {
            total *= game.scores[player];
        }
    });

    playerRow["total"] = total;
    return playerRow;
};

export const constructColumnsFromGames = (games: Game[], setColumnDefs) => {
    let newColumns = [{ headerName: "Spiller", field: "playerName"}];

    games.forEach(game => {
        newColumns.push({
            headerName: game.name,
            field: game.name, 
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
        }as any);
    });
    
    // Add the "Total" column
    newColumns.push({
        headerName: "Total",
        field: "total",
        sortable: true,

        valueGetter: (params: any) => {
            // Multiplying all the scores for a player
            return Object.keys(params.data).reduce((total, key) => {
                if (key !== 'playerName' && key !== 'total' && params.data[key]) {
                    return total * params.data[key];
                }
                return total;
            }, 1); // start multiplying from 1
        },
    } as any);

    setColumnDefs(newColumns);
};

export const convertRowDataToGame = (rowData: any[], gameNames: string[]): Game[] => {
    return gameNames.map(gameName => ({
      name: gameName,
      scores: rowData.reduce((acc, row) => {
        acc[row.playerName] = row[gameName];
        return acc;
      }, {} as Record<string, number>)
    }));
  };