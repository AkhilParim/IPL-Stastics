import { useEffect, useState } from "react";
import axios from "axios";
import {
  Container,
  Grid,
  InputLabel,
  MenuItem,
  FormControl,
  Select,
  Button,
  Table,
  TableRow,
  TableCell,
  TableBody,
  Typography,
  Autocomplete,
  TextField,
} from "@mui/material";
import { styled } from "@mui/material/styles";

const StyledTableRow = styled(TableRow)(({ theme }) => ({
  "&:nth-of-type(odd)": {
    backgroundColor: theme.palette.action.hover,
  },
  "&:last-child td, &:last-child th": {
    border: 0,
  },
}));

export default function App() {
  const [players, setPlayers] = useState([]);
  const [selectedPlayer, setSelectedPlayer] = useState("");
  const [teams, setTeams] = useState([]);
  const [selectedTeam, setSelectedTeam] = useState("NONE");
  const [selectedYear, setSelectedYear] = useState("NONE");
  const [selectedStatistic, setSelectedStatistic] = useState("BATTING");
  const [playerStats, setPlayerStats] = useState({});
  const [statsLabel, setStatsLabel] = useState();

  const fetchPlayers = async () => {
    const { data } = await axios.get(
      "https://cricket.akhilparim1.repl.co/players"
    );
    if (data?.status !== 200 || data?.error) return;
    setPlayers(data?.response);
  };

  const fetchTeams = async () => {
    const { data } = await axios.get(
      "https://cricket.akhilparim1.repl.co/teams"
    );
    if (data?.status !== 200 || data?.error) return;
    setTeams(data?.response);
  };

  const searchPlayerStatistic = async () => {
    if (!selectedPlayer || !selectedStatistic) return;
    console.log(selectedPlayer);
    console.log(selectedStatistic);
    const { data } = await axios.get(
      "https://cricket.akhilparim1.repl.co/player-stats",
      {
        params: {
          playerId: selectedPlayer,
          statistics: selectedStatistic,
          ...(selectedTeam !== "NONE" && { opponent: selectedTeam }),
          ...(selectedYear !== "NONE" && { year: selectedYear }),
        },
      }
    );
    if (data?.status !== 200 || data?.error) return;
    const result = {
      "Player Name": players.find((p) => p?.playerId === selectedPlayer)
        ?.playerName,
    };
    Object.keys(data?.response).forEach((d) => {
      result[convertCamelCaseToTitleCase(d)] = data?.response[d];
    });
    setPlayerStats(result);
    setStatsLabel(
      `Showing ${selectedStatistic.toLowerCase()} statistics for player ${
        players.find(p => p?.playerId == selectedPlayer)?.playerName
      }${selectedYear !== "NONE" ? ` in the year ${selectedYear}` : ""}${
        selectedTeam >= 0
          ? ` against the opponent ${
              teams.find((a) => a?.teamId === selectedTeam)?.teamName
            }`
          : ""
      }`
    );
  };

  const convertCamelCaseToTitleCase = (text) => {
    const result = text.replace(/([A-Z])/g, " $1");
    return result.charAt(0).toUpperCase() + result.slice(1);
  };

  useEffect(() => {
    fetchPlayers();
    fetchTeams();
  }, []);

  return (
    <Container maxWidth="xl">
      <Grid
        sx={{
          display: "flex",
          margin: "40px 0",
          alignItems: "center",
          flexDirection: "column",
        }}
      >
        <Typography variant="h4">IPL Player Statistics</Typography>
        <Typography variant="h6">
          This web app shows the IPL cricket data from the year 2013 to 2017
        </Typography>
      </Grid>
      <Grid container spacing={2}>
        <Grid
          sx={{
            display: "flex",
            flexDirection: "column",
            gap: "20px",
          }}
          item
          xs={4}
        >
          <FormControl required fullWidth>
            <Autocomplete
              disablePortal
              options={players.map((p) => ({
                label: p?.playerName,
                value: p?.playerId,
              }))}
              value={
                players.find((p) => p?.playerId === selectedPlayer)?.playerId
              }
              renderInput={(params) => (
                <TextField {...params} label="Players *" />
              )}
              onChange={(event, newValue) => {
                setSelectedPlayer(newValue?.value);
              }}
            />
          </FormControl>
          <FormControl fullWidth>
            <InputLabel id="select-year">Year</InputLabel>
            <Select
              labelId="select-year"
              value={selectedYear}
              label="Year"
              onChange={(event) => {
                setSelectedYear(event.target.value);
              }}
            >
              <MenuItem value="NONE">None</MenuItem>
              {["2013", "2014", "2015", "2016", "2017"].map((year, i) => (
                <MenuItem key={i} value={year}>
                  {year}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <FormControl required fullWidth>
            <InputLabel id="select-statictics">Statictics Type</InputLabel>
            <Select
              labelId="select-statics"
              value={selectedStatistic}
              label="Statictics Type"
              onChange={(event) => {
                setSelectedStatistic(event.target.value);
              }}
            >
              {["BATTING", "BOWLING"].map((statictics, i) => (
                <MenuItem key={i} value={statictics}>
                  {statictics}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <FormControl fullWidth>
            <InputLabel id="select-teams">Opponent</InputLabel>
            <Select
              labelId="select-teams"
              value={selectedTeam}
              label="Opponents"
              onChange={(event) => {
                setSelectedTeam(event.target.value);
              }}
            >
              <MenuItem value="NONE">None</MenuItem>
              {teams.map((player) => (
                <MenuItem key={player?.teamId} value={player?.teamId}>
                  {player?.teamName}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <Button
            variant="contained"
            onClick={searchPlayerStatistic}
            disabled={!selectedPlayer || !selectedStatistic}
          >
            Search
          </Button>
        </Grid>
        {Object.keys(playerStats).length > 0 && (
          <Grid item xs={8}>
            <Typography variant="h5">{statsLabel}</Typography>
            <Table
              sx={{ minWidth: 650, marginTop: 2 }}
              aria-label="simple table"
            >
              <TableBody>
                {Object.keys(playerStats).map((stat) => (
                  <StyledTableRow
                    key={stat}
                    sx={{ "&:last-child td, &:last-child th": { border: 0 } }}
                  >
                    <TableCell component="th" scope="row">
                      {stat}
                    </TableCell>
                    <TableCell align="right"> {playerStats[stat]}</TableCell>
                  </StyledTableRow>
                ))}
              </TableBody>
            </Table>
          </Grid>
        )}
      </Grid>
    </Container>
  );
}
