import { useEffect, useState } from 'react';
import logo from './logo.svg';
import './App.css';
import { Layout, Button } from "antd";
import { useWeb3React } from '@web3-react/core';
import { injected } from './components/wallet/Connectors';
import AccountDetails from "./components/AccountDetails";
import CurrentBalance from './components/CurrentBalance';
import RecentActivity from './components/RecentActivity';
import RequestAndPay from './components/RequestAndPay';
import abi from './abi.json';
import axios from 'axios';


const { ethers } = require("ethers");
const { Header, Content } = Layout;

function convertArrayToObjects(arr) {
  const dataArray = arr.map((transaction, index) => ({
    key: (arr.length + 1 - index).toString(),
    type: transaction[0],
    amount: transaction[1],
    message: transaction[2],
    address: `${transaction[3].slice(0, 4)}...${transaction[3].slice(0, 4)}`,
    subject: transaction[4],
  }));

  return dataArray.reverse();
}
function App() {

  const { activate, account, deactivate, active, chainId } = useWeb3React()
  const [state, setState] = useState({
    provider: null,
    signer: null,
    contract: null
  })
  const [name, setName] = useState("...");
  const [balance, setBalance] = useState("...");
  const [dollars, setDollars] = useState("...");
  const [history, setHistory] = useState(null);
  const [requests, setRequests] = useState({ "1": [0], "0": [] });


  const connectMetamask = async () => {
    try {
      await activate(injected)
    } catch (error) {
      console.log(error);
    }
  }
  const disconnectMetamask = async () => {
    try {
      await deactivate()
    } catch (error) {
      console.log(error)
    }
  }
  async function getNameAndBalance() {
    const contractAddress = "0xDA436C33c2fd1DD154dD7BBD6800b75F16BDB061";
    const ContractABI = abi;
    try {
      const ethereum = { window };

      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();
      console.log(signer);
      const contract = new ethers.Contract(
        contractAddress,
        ContractABI,
        signer
      )
      console.log(contract)
      setState({ provider, signer, contract })

      const nameFromContract = await contract.getMyName(account);
      const balanceFromContract = await provider.getBalance(account);
      const balance = Number(ethers.utils.formatEther(balanceFromContract)).toFixed(4)
      const request = await contract.getMyRequests(account);
      const history = await contract.getMyHistory(account);

      console.log(history)

      const response = await axios.get('https://api.coingecko.com/api/v3/simple/price?ids=matic-network&vs_currencies=usd');
      const maticToUSD = response.data['matic-network'].usd;
      const balanceInUSD = (maticToUSD * balance).toFixed(2);
      const jsonHistory = convertArrayToObjects(history);


      setName(nameFromContract);
      setBalance(balance);
      setDollars(balanceInUSD);
      setRequests(request)
      setHistory(jsonHistory)
    } catch (error) {
      console.log(error);
    }
  }
  useEffect(() => {
    if (!active) return;
    getNameAndBalance();
  }, [active])





  return (
    <div className="App">
      <Layout>
        <Header className="header">
          <div className="headerLeft">
            <img src={logo} alt="logo" className="logo" />
            {active ? 'connected' : "not connected"}
            {active && (
              <>
                <div
                  className="menuOption"
                  style={{ borderBottom: "1.5px solid black" }}
                >
                  Summary
                </div>
                <div className="menuOption">Activity</div>
                <div className="menuOption">{`Send & Request`}</div>
                <div className="menuOption">Wallet</div>
                <div className="menuOption">Help</div>
              </>
            )}
          </div>
          {active ? (
            <Button type={"primary"} onClick={disconnectMetamask}>
              Disconnect Wallet
            </Button>
          ) : (
            <Button type={"primary"} onClick={connectMetamask}>
              Connect Wallet
            </Button>

          )}
          {/* <span className='account'>{account}</span> */}
        </Header>
        <Content className="content">
          {active ? (
            <>
              <div className="firstColumn">
                <CurrentBalance dollars={dollars} />
                <RequestAndPay state={state} requests={requests} getNameAndBalance={getNameAndBalance} />
                <AccountDetails
                  address={account}
                  name={name}
                  balance={balance}
                />
              </div>
              <div className="secondColumn">
                <RecentActivity history={history} />
              </div>
            </>
          ) : (
            <div>Please Login</div>
          )}
        </Content>
      </Layout>

    </div>
  );
}

export default App;
