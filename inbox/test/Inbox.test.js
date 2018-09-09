const assert = require('assert');
const ganache = require('ganache-cli');
const Web3 = require('web3');
// Web3 lets us connect to a network. Here we are connecting it to the ganache network.
// we connect it to a provider. A provider is a communication layer between web3 and 
// the actual ethereum network.

const web3 = new Web3(ganache.provider());
// ganache gives you default accounts, unlike HDWalletProvider, where you must put your
// secret mneumonics.
const { interface, bytecode } = require('../compile');

let accounts;
let inbox;

beforeEach(async () => {
  // Get a list of all accounts
  accounts = await web3.eth.getAccounts();

  // Use one of those accounts to deploy
  // the contract
  inbox = await new web3.eth.Contract(JSON.parse(interface))
    .deploy({
      data: bytecode,
      arguments: ['Hi there!'] // this is passed to the Contract's constructor arguments.
    })
    .send({ from: accounts[0], gas: '1000000' });
});

describe('Inbox', () => {
  it('deploys a contract', () => {
    assert.ok(inbox.options.address);
  });

  it('has a default message', async () => {
    const message = await inbox.methods.message().call();
    assert.equal(message, 'Hi there!');
  });

  it('can change the message', async () => {
    await inbox.methods.setMessage('bye').send({ from: accounts[0] });
    const message = await inbox.methods.message().call();
    assert.equal(message, 'bye');
  });
});
