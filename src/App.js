import "./App.css";
// import web3 from "./web3.js";

// import lottery from "./Lottery";
import { useEffect, useState, useCallback } from "react";

import request from "./web3.js";
let web3;
let lottery;
let riskAmount;
function App() {
  const [manager, setManger] = useState("");
  const [players, setPlayers] = useState([]);
  const [balance, setBalance] = useState("");
  const [mybalance, setmyBalance] = useState("");

  const [isConnected, setisConnected] = useState(false);
  const [amountInput, setAmount] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [account, setAccount] = useState([]);

  const call = useCallback(async () => {
    web3 = request();
    const contractAddress = "0x3Ed1F4e5e2e453efE1BAeA5121C962E09303eF7f";

    const abi = [
      {
        constant: true,
        inputs: [],
        name: "manager",
        outputs: [{ name: "", type: "address" }],
        payable: false,
        stateMutability: "view",
        type: "function",
      },
      {
        constant: false,
        inputs: [],
        name: "pickWinner",
        outputs: [],
        payable: false,
        stateMutability: "nonpayable",
        type: "function",
      },
      {
        constant: true,
        inputs: [],
        name: "getPlayers",
        outputs: [{ name: "", type: "address[]" }],
        payable: false,
        stateMutability: "view",
        type: "function",
      },
      {
        constant: false,
        inputs: [],
        name: "enter",
        outputs: [],
        payable: true,
        stateMutability: "payable",
        type: "function",
      },
      {
        constant: true,
        inputs: [{ name: "", type: "uint256" }],
        name: "players",
        outputs: [{ name: "", type: "address" }],
        payable: false,
        stateMutability: "view",
        type: "function",
      },
      {
        inputs: [],
        payable: false,
        stateMutability: "nonpayable",
        type: "constructor",
      },
    ];

    lottery = new web3.eth.Contract(abi, contractAddress);

    let results = await lottery.methods.manager().call();
    let arrPlayers = await lottery.methods.getPlayers().call();
    await web3.eth.getAccounts().then((acc) => setAccount(acc));

    await web3.eth
      .getBalance(lottery.options.address)
      .then((bal) => setBalance(web3.utils.fromWei(bal, "ether")));
    setPlayers(arrPlayers);
    setManger(results);
  }, []);

  // handle connect wallet
  const handleConnectWallet = useCallback((e) => {
    e.preventDefault();

    call();
    setisConnected(true);
  });
  // handle input change
  const handleAmountChange = useCallback(
    (e) => {
      setAmount(e.target.value);
      console.log("imechange: " + e.target.value);
      riskAmount = e.target.value;
    },
    [amountInput]
  );

  // handle submit
  const handleSubmit = useCallback(async (e) => {
    e.preventDefault();

    try {
      console.log("processing ether: " + amountInput);
      const accounts = await web3.eth.getAccounts();
      setMessage("Waiting to send the transaction .....");
      console.log("processing ether: " + amountInput);
      let results = await lottery.methods.enter().send({
        value: web3.utils.toWei(riskAmount, "ether"),
        from: accounts[0],
      });

      console.log(results);
      setMessage("You have been entered the Lottery");
    } catch (e) {
      setError("Error processing.Try again");
      console.log(e);
    }
  }, []);

  // handle pick winner
  const handlePick = useCallback(async (e) => {
    let accounts = await web3.eth.getAccounts();

    setMessage("Waiting get winner");
    await lottery.methods.pickWinner().send({ from: accounts[0] });

    setMessage("Winner has been picked");
    setAmount("");
    fetchDetails();
  }, []);

  // handle fetch
  const fetchDetails = useCallback(async () => {
    let results = await lottery.methods.manager().call();
    let arrPlayers = await lottery.methods.getPlayers().call();
    await web3.eth.getAccounts().then((acc) => setAccount(acc));

    await web3.eth
      .getBalance(lottery.options.address)
      .then((bal) => setBalance(web3.utils.fromWei(bal, "ether")));
    setPlayers(arrPlayers);
    setManger(results);
  }, []);

  // useEffect(() => {
  //   call();
  // }, [call]);

  return (
    <div className="App">
      <h3>DeLotto </h3>
      {isConnected ? (
        <header className="App-header">
          <div id="logo">
            <h3 className="acc">
              Connected to address <span className="orange">{account}</span>
            </h3>
            <h3 className="acc">
              Your balance address <span className="orange">{mybalance}</span>
            </h3>
            <p className="meta">
              smart contract owned by: {manager} <br />
              there are currently {players.length} players compitting for
              {balance} ether
            </p>
          </div>

          <div className="form-right">
            <p>amount you are willing to risk : {amountInput}</p>

            <input
              className="amountInpt"
              value={amountInput}
              onChange={(e) => handleAmountChange(e)}
              placeholder="how much Celo to risk? "
            />

            <button
              onClick={(e) => {
                handleSubmit(e);
              }}
              className="submitBtn"
            >
              Submit
            </button>

            <hr />

            {true ? (
              <button
                onClick={(e) => {
                  handlePick(e);
                }}
                className="submitBtn"
              >
                Pick a winner !
              </button>
            ) : (
              ""
            )}

            <p>{error ? error : message}</p>
          </div>
        </header>
      ) : (
        <div className="connect">
          <h3 className="tag-line">
            Lottery on the Blockchain and win{" "}
            <span className="orange">Celo</span>
          </h3>
          <button
            onClick={(e) => {
              handleConnectWallet(e);
            }}
            className="submitBtn connect-btn"
          >
            connect wallet
          </button>
        </div>
      )}
    </div>
  );
}

export default App;
