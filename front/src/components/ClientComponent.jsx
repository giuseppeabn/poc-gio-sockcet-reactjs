import React, { useEffect, useState } from "react";
import socketIOClient from "socket.io-client";
import { Grid, Box, styled, Paper, Button, Typography, Alert, AlertTitle } from "@mui/material";


const Status = styled('div')(() => ({
  position: 'absolute',
  right: '10px',
  top: '10px',
  height: '20px',
  width: '20px',
  borderRadius: '10px',
  backgroundColor: 'red'
}));

const Container = styled(Grid)(() => ({}));

const Info = styled(Paper)(({ theme }) => ({
  height: "100px",
  textAlign: "center",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  flexDirection: 'column',
  position: 'relative'
}));

const NewContainerInfo = styled(Grid)(() => ({
  borderRadius: '10px',
}))

const NewInfo = styled(Paper)(({ theme }) => ({
  height: "100px",
  textAlign: "center",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  flexDirection: 'column',
  position: 'relative',
  backgroundColor: '#85CC6F',
  border: '5px solid black',
  marginTop: 10
}));

const NewInfoName = styled(Paper)(({ theme }) => ({
  height: "50px",
  textAlign: "center",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  flexDirection: 'column',
  position: 'relative',
  backgroundColor: 'white',
  border: '5px solid black',
  marginTop: 0
}));

const Text = styled(Typography)(() => ({
  color: 'black',
}))

const TextName = styled(Typography)(() => ({
  color: 'black',
  fontWeight: 'bold', 
  fontSize: '1.5rem'
}))

const Footer = styled(Box)(() => ({
 position: 'absolute',
 bottom: 0,
 right: '10px',
 left: '10px',
}))




const ENDPOINT = "http://localhost:4001";

export default function ClientComponent() {
  const [retAcum100m5, setRetAcum100m5] = useState(null);
  const [ar0cuCal, setAr0cuCal] = useState(null);
  const [dic6052, setDic6052] = useState(0);
  const [retAcum100, setRetAcum100] = useState(0);
  const [sag2Restriccion, setSag2Restriccion] = useState(0);
  const [aguaCruda, setAguaCruda] = useState(0);
  const [ar0024, setAr0024] = useState(0);
  const [wi6136A, setWi6136A] = useState(0);
  const [cdb001, setCdb001] = useState(0);
  const [textError, setTextError] = useState('');
  const [textSucces, setTextSucces] = useState('');

  const [disconnect, setDisconnect] = useState(false);

  const handleMessage = (message) => {
    const { DeviceTagId } = message || {};
    switch (DeviceTagId) {
      case "370:Ret_Acum_100_M5":
        setRetAcum100m5(message);
        break;
      case "330:AR0306%Cu_CAL":
        setAr0cuCal(message);
        break;
      case "DIC6052(PV)":
        setDic6052(message);
        break;
      case "370:Ret_Acum_100":
        setRetAcum100(message);
        break;
      case "320:SAG2_Restriccion":
        setSag2Restriccion(message);
        break;
      case "AGUA_CRUDA(PV)":
        setAguaCruda(message);
        break;
      case "330:AR0024.P80_CAL":
        setAr0024(message);
        break;
      case "WI6136A(CAL)":
        setWi6136A(message);
        break;
        case "CDB001":
        setCdb001(message);
        break;
        case "CDB002":
          setCdb001(message);
          break;
      default:
        break;
    }
  };
  useEffect(() => {
    const socket = socketIOClient(ENDPOINT);
    if (disconnect) {
      socket.disconnect();
    } else {
      socket.on("chat message", (data) => {
        console.log("DATA:::::", data);
        handleMessage(data);
      });
    }

    return () => socket.disconnect();
  }, [disconnect]);

  const getColorStatusByTagID = (value) => {
    return value === 0 ? 'green' : 'red'
  }

  const getDate = (date) => {
    const dateFormat = date ? new Date(date) : new Date();
    return `${dateFormat.getUTCHours()}:${dateFormat.getUTCMinutes()}:${dateFormat.getUTCSeconds()}`
  }

  const DetailInfo = (props) => {
    const { info } = props || {};
    const {DeviceTagId, DeviceTagValue} = info || {}
    if(!DeviceTagId){
      return null;
    }
    return(
      <>
        <Typography>{DeviceTagId}</Typography>
        <Typography>{DeviceTagValue}</Typography>
        <Typography>{getDate(sag2Restriccion?.Timestamp)}</Typography>
        <Status style={{backgroundColor: getColorStatusByTagID(DeviceTagValue)}}/>
      </>
    )
  }

  const setStatus = (info) => {
    const {DeviceTagId, DeviceTagValue, message} = info || {};
    let color = 'green';
    if(DeviceTagId === 'CDB001' && DeviceTagValue === 100){
      setTextSucces(message)
    }
    if(DeviceTagId === 'CDB001' && 
      (DeviceTagValue === 103 || DeviceTagValue === 105 )){
      setTextError(message)
      color = 'red';
    }
    return color;
  }

  const NewDetailInfo = (props) => {
    const { info } = props || {};
    const {DeviceTagId, DeviceTagValue, title} = info || {}
    if(!title){
      return null;
    }
    return(
        <NewInfo>
          <Text sx={{fontWeight: 'bold', fontSize: '1.5rem'}}>{title}</Text>
          <Text sx={{fontWeight: 'bold', fontSize: '1rem'}}>{DeviceTagValue}</Text>
          <Text>{getDate(sag2Restriccion?.Timestamp)}</Text>
          <Status style={{backgroundColor: setStatus(info)}}/>
        </NewInfo>
    )
  }

  const OnlyName = (props) => {
    const { name } = props || {};
    if(!name){
      return null;
    }
    return(
        <NewInfoName>
          <TextName>{name}</TextName>
        </NewInfoName>
    )
  }

  return (
    <Box sx={{ flexGrow: 1, padding: "10px" }}>
      <Grid xs={12} container rowSpacing={1} columnSpacing={{ xs: 5}}>
        <Grid xs={3} item>
          <NewDetailInfo info={{...{...retAcum100m5, title:'Perforacion'} }}/>
          <NewDetailInfo info={{...{...retAcum100m5, title:'Tronadura'} }}/>
        </Grid>
        <Grid xs={3} item>
          <NewDetailInfo info={{...{...retAcum100m5, title:'Carguío'} }}/>
          <NewDetailInfo info={{...{...retAcum100m5, title:'Transporte'} }}/>
        </Grid>
        <Grid xs={3} item>
          <NewDetailInfo info={{...{...retAcum100m5, title:'Chancado'} }}/>
          <OnlyName name={'Stock Mina'}/>
          <OnlyName name={'STMG'}/>
        </Grid>
        <Grid xs={3} item>
          <NewDetailInfo info={{...{...retAcum100m5, title:'Molienda'} }}/>
          <OnlyName name={'Stock Chacay'}/>
        </Grid>

        {/* <Container item xs={3}>
          <Info>
            <DetailInfo info={retAcum100m5}/>
          </Info>
        </Container>
        <Grid item xs={3}>
          <Info>
            <DetailInfo info={ar0cuCal}/>
          </Info>
        </Grid>
        <Grid item xs={3}>
          <Info>
            <DetailInfo info={dic6052}/>
          </Info>
        </Grid>
        <Grid item xs={3}>
          <Info>
            <DetailInfo info={retAcum100}/>
          </Info>
        </Grid>
        <Grid item xs={3}>
          <Info>
            <DetailInfo info={sag2Restriccion}/>
          </Info>
        </Grid>
        <Grid item xs={3}>
          <Info>
            <DetailInfo info={aguaCruda}/>
          </Info>
        </Grid>
        <Grid item xs={3}>
          <Info>
            <DetailInfo info={aguaCruda}/>
          </Info>
        </Grid>
        <Grid item xs={3}>
          <Info>
            <DetailInfo info={wi6136A}/>
          </Info>
        </Grid>
        <Grid item xs={3}>
          <Info>
            <DetailInfo info={cdb001}/>
          </Info>
        </Grid> */}
      </Grid>
      
      {/* <Button size={'large'} variant="contained" onClick={() => setDisconnect(!disconnect)}>
        {disconnect ? "PLAY" : "STOP"}
      </Button> */}
      <Footer>
      {textError && <Alert variant="filled" severity="error">
        {textError}
      </Alert>}
      {textSucces && <Alert variant="filled" severity="success">
        {textSucces}
      </Alert>}
      </Footer>
    </Box>
  );
}
