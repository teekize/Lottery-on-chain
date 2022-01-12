import Web3 from "web3";

const request = () => {
  let web3;
  window.ethereum.request({ method: "eth_requestAccounts" });

  web3 = new Web3(window.ethereum);
  return web3;
};

export default request;
