const config = global.config
    , moment = require('moment')
    , coinsTransactions = require('../coins/coinsTransactions');

/**
 * Graphics data builder class
 * @constructor
 */

class GraphicsBuilderManager {

    constructor() {
        this.coinsTransactionsModel = coinsTransactions;
        this.ranges = {
            'W': '604800',
            'M': '2592000',
            'A': moment().unix()
        };

        this.actionDictionary = {
            firstRegister: 'Registration',
            facebookPost: 'Facebook Sharing',
            referralRegister: 'Referral Register',
            referralBought: 'Referral Buy'
        };

        this.MONEY_TYPE = 'cash';
        this.PURCHASES_TYPE = 'purchase';

    };


    /**
     * Build coins transaction diagram
     * @returns {Promise} - promise with result of coins
     */

    buildCoinsTransactionData() {
        return new Promise((resolve, reject) => {
            this.coinsTransactionsModel.list({})
                .then((transactions) => {
                    let mainChart = this._createBasicCoinsTransactionsChart();
                    let footerLeft = {
                        title: 'Total Coins',
                        count: {
                            'W': 0,
                            'M': 0,
                            'A': 0
                        }
                    };

                    for (let i = 0, l = transactions.length; i < l; ++i) {
                        let currentTransaction = transactions[i];
                        for (let key in this.ranges) {

                            let currentRange = this.ranges[key];
                            let rangeTime = +moment().unix() - +currentRange;

                            if (currentTransaction.time_created > rangeTime) {
                                footerLeft.count[key] += +currentTransaction.amount;
                            }
                        }

                        for (let j = 0, lc = mainChart.length; j < lc; ++j) {
                            let currentChart = mainChart[j];
                            if (currentChart.label === this.actionDictionary[currentTransaction.transaction_name]) {
                                for (let key in this.ranges) {
                                    if (!this.ranges.hasOwnProperty(key)) {
                                        continue;
                                    }
                                    let currentRange = this.ranges[key];
                                    let rangeTime = +moment().unix() - +currentRange;

                                    if (currentTransaction.time_created > rangeTime) {
                                        currentChart.values[key]++;
                                    }
                                }
                            }
                        }
                    }

                    resolve({
                        mainChart,
                        footerLeft
                    });


                })
                .catch(reject);
        });
    };


    /**
     * Build machines graphic
     * @param {object} period - from and to properties for building graphic data
     * @param {string} type - graphic type (by money or by number of orders)
     * @returns {Promise} - promise with result of machines graphic data
     */

    buildMachinesGraphicData(period, type) {
        return new Promise((resolve, reject) => {

            //TODO make query to transactions and get transactions by period and machines
            let dummyTransactions = [
                {
                    time_created: 1474280775,
                    machine_id: '350',
                    amount: 100,
                    status: 'approved'
                },
                {
                    time_created: 1474367175,
                    machine_id: '350',
                    amount: 10,
                    status: 'approved'
                },
                {
                    time_created: 1476626375,
                    machine_id: '350',
                    amount: 50,
                    status: 'approved'
                },
                {
                    time_created: 1475280775,
                    machine_id: '330',
                    amount: 50,
                    status: 'approved'
                },
                {
                    time_created: 1475367175,
                    machine_id: '330',
                    amount: 140,
                    status: 'approved'
                },
                {
                    time_created: 1476726375,
                    machine_id: '330',
                    amount: 140,
                    status: 'approved'
                },
                {
                    time_created: 1474280775,
                    machine_id: '230',
                    amount: 20,
                    status: 'approved'
                },
                {
                    time_created: 1476453575,
                    machine_id: '230',
                    amount: 100,
                    status: 'approved'
                },
                {
                    time_created: 1476539975,
                    machine_id: '230',
                    amount: 30,
                    status: 'approved'
                },
                {
                    time_created: 1476626375,
                    machine_id: '230',
                    amount: 50,
                    status: 'approved'
                }
            ];

            let graphicData = [];

            for (let i = 0, l = dummyTransactions.length; i < l; ++i) {
                let currentTransaction = dummyTransactions[i];
                if (!graphicData.length) {
                    graphicData.push(this._getLineObject(currentTransaction, type));
                    continue;
                }
                for (let j = 0, lg = graphicData.length; j < lg; ++j) {
                    let currentGraphicLine = graphicData[j];
                    if(currentGraphicLine.key === currentTransaction.machine_id) {
                        currentGraphicLine.values.push({
                            x: currentTransaction.time_created,
                            y: currentTransaction.amount
                        });
                        continue;
                    }

                    if(j === graphicData.length - 1) {
                        graphicData.push(this._getLineObject(currentTransaction, type));
                    }

                }
            }

            resolve(graphicData);

        });
    };


    /**
     * Get line object
     * @param {object} currentTransaction - current trsanctions for graphic point
     * @param {string} type - graphic type(by cash or purchases)
     * @returns {Object} - object with line data for graphic
     */

    _getLineObject(currentTransaction, type) {
        let lineObject = {
            key: currentTransaction.machine_id,
            values: []
        };
        lineObject.values.push({
            x: currentTransaction.time_created,
            y: (type === this.MONEY_TYPE) ? currentTransaction.amount : 1
        });

        return lineObject;
    };


    /**
     * Create basic coins transactions object
     * @returns {Array} - Array with basic options for coins transactions chart
     */

    _createBasicCoinsTransactionsChart() {
        let result = [];
        for (let prop in this.actionDictionary) {
            let currentActions = this.actionDictionary[prop];
            let chartObject = {
                label: currentActions,
                values: {
                    'W': 0,
                    'M': 0,
                    'A': 0
                }
            };
            result.push(chartObject);
        }

        return result;

    };

}

const graphicsBuilderManager = new GraphicsBuilderManager();
module.exports = graphicsBuilderManager;
