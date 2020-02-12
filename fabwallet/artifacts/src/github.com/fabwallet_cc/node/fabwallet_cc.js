/*
# Copyright IBM Corp. All Rights Reserved.
#
# SPDX-License-Identifier: Apache-2.0
*/

const shim = require('fabric-shim');
const util = require('util');

var Chaincode = class {

  // Initialize the chaincode
  async Init(stub) {
    console.info('========= fabwallet_cc Init =========');
    const wallets = [
      {
        name: 'Ajay',
        amount: "250"
      },
      {
        name: 'Raj',
        amount: "450"
      },
      {
        name: 'Gayatri',
        amount: "500"
      },
      {
        name: 'Nadesh',
        amount: "300",
      },
    ];

    try {
      for (let i = 0; i < wallets.length; i++) {
        wallets[i].docType = 'wallet';
        await stub.putState('WALLET' + i, Buffer.from(JSON.stringify(wallets[i])));
        console.info('Added <--> ', wallets[i]);
      }
      return shim.success();
    } catch (err) {
      return shim.error(err);
    }
  }

  async Invoke(stub) {
    let ret = stub.getFunctionAndParameters();
    console.info(ret);
    let method = this[ret.fcn];
    if (!method) {
      console.error('no method of name:' + ret.fcn + ' found');
      return shim.error('no method of name:' + ret.fcn + ' found');
    }

    console.info('\nCalling method : ' + ret.fcn);
    try {
      let payload = await method(stub, ret.params);
      return shim.success(payload);
    } catch (err) {
      console.log(err);
      return shim.error(err);
    }
  }

  async move(stub, args) {
    if (args.length != 3) {
      throw new Error('Incorrect number of arguments. Expecting 3');
    }

    let fromArg = args[0],
        toArg = args[1];
    if (!fromArg || !toArg) {
      throw new Error('asset holding must not be empty');
    }

    // Get the state from the ledger
    let fromAsBytes = await stub.getState(fromArg);
    if (!fromAsBytes) {
      throw new Error('Failed to get state of asset from holder');
    }
    let fromData = JSON.parse(fromAsBytes.toString());

    let toAsBytes = await stub.getState(toArg);
    if (!toAsBytes) {
      throw new Error('Failed to get state of asset to holder');
    }
    let toData = JSON.parse(toAsBytes.toString());

    // Perform the execution
    let amount = parseInt(args[2]);
    if (typeof amount !== 'number') {
      throw new Error('Expecting integer value for amount to be transaferred');
    }

    let fromBalance = fromData.amount,
        toBalance = toData.amount;

    console.info(util.format('Before From Bal = %d, To Bal = %d\n', fromBalance, toBalance));
    fromBalance -= amount;
    toBalance   += amount;
    console.info(util.format('After From Bal = %d, To Bal = %d\n', fromBalance, toBalance));


    fromData.amount = fromBalance;
    toData.amount = toBalance;

    // Perform the execution
    // Write the states back to the ledger
    await stub.putState(fromArg, Buffer.from(JSON.stringify(fromData)));
    await stub.putState(toArg, Buffer.from(JSON.stringify(toData)));
  }

  // Deletes an entity from state
  async delete(stub, args) {
    if (args.length != 1) {
      throw new Error('Incorrect number of arguments. Expecting 1');
    }

    let A = args[0];

    // Delete the key from the state in ledger
    await stub.deleteState(A);
  }

  // query callback representing the query of a chaincode
  async query(stub, args) {
    if (args.length != 1) {
      throw new Error('Incorrect number of arguments. Expecting name of the person to query')
    }

    let jsonResp = {};
    let A = args[0];

    // Get the state from the ledger
    let Avalbytes = await stub.getState(A);
    if (!Avalbytes) {
      jsonResp.error = 'Failed to get state for ' + A;
      throw new Error(JSON.stringify(jsonResp));
    }

    jsonResp.name = A;
    jsonResp.amount = Avalbytes.toString();
    console.info('Query Response:');
    console.info(jsonResp);
    return Avalbytes;
  }
};

shim.start(new Chaincode());
