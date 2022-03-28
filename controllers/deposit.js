var fetch = require('node-fetch');
const config = require('../config');
const marketplaceQueries = require('../services/marketplaceQueries');

exports.checkTransactions = async (db, res) => {
    try {

        var getDataQry = "SELECT t.*,  user_wallet.public as userAddress FROM transaction as t LEFT JOIN user_wallet ON t.user_id = user_wallet.user_id WHERE t.transaction_type_id = 11 AND t.status = 0 AND  t.datetime >= (now() - interval 5 day) ORDER BY t.id DESC"

        await db.query(getDataQry, async function (error, getDepositData) {


                for(p = 0; p < getDepositData.length; p++){
                    var address = getDepositData[p].userAddress
                    var dbAmount = getDepositData[p].amount
                    var id = getDepositData[p].id
                    const getAllTransactions = await fetch(`https://cardano-mainnet.blockfrost.io/api/v0/addresses/${address}/txs`, {
                        method: 'GET', headers: {
                            'Accept': 'application/json',
                            'Content-Type': 'application/json',
                            'project_id': 'sfc47jZlhjZpDBQQ7Xd3aoyPswdSWv2q'
                        }
                    });
                    const getAllTransactionsRes = await getAllTransactions.json();
                    if (getAllTransactionsRes.length > 0) {
                        for (var i = 0; i < getAllTransactionsRes.length; i++) {
                            var transactionHash = getAllTransactionsRes[i];
                            var trxhashurl = `https://cardano-mainnet.blockfrost.io/api/v0/txs/${transactionHash}/utxos`
                            const trackHash = await fetch(trxhashurl, {
                                method: 'GET', headers: {
                                    'Accept': 'application/json',
                                    'Content-Type': 'application/json',
                                    'project_id': 'sfc47jZlhjZpDBQQ7Xd3aoyPswdSWv2q'
                                },
                            });
                            const trackHashRes = await trackHash.json();
                            var getOutputArr = trackHashRes.outputs
                            if (getOutputArr.length > 0) {
        
                                for (var j = 0; j < getOutputArr.length; j++) {
        
                                    if (getOutputArr[j].address == address) {
        
                                        var amountArr = getOutputArr[j].amount
                                        for (var k = 0; k < amountArr.length; k++) {
        
                                            if (amountArr[k].unit == 'lovelace') {
                                                var depositAmt = amountArr[k].quantity / 1000000
                                                if (depositAmt == dbAmount) {
                                                    console.log("Yes", transactionHash);
        
                                                    var getPreviousDataQry = `SELECT * FROM transaction WHERE hash = '${transactionHash}'`
                                                    await db.query(getPreviousDataQry , async function (error, getPrevious) {
                                                        if(getPrevious.length == 0 ){
                                                            var updateQry = `UPDATE transaction SET hash = '${transactionHash}' , status = 1 WHERE id = ${id} `
                                                            console.log(updateQry);
                                                            await db.query(updateQry , async function (error, insertData) {
                                                                console.log("Yes");
                                                            })                                                    
                                                        }
                                                    })
        
                                                } else {
                                                    console.log("No");
                                                }
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
        })


    }
    catch (err) {
        console.log(err);
        return res.status(400).send({
            success: false,
            msg: "Unexpected internal error!!",
        });
    }
}

