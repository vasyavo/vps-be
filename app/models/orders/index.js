const mongo = require('../mongo')
  , moment = require('moment')
  , Schema = mongo.Schema
  , crypto = require('crypto')
  , transactionModel = require('../transactions')
  , userModel = require('../user')
  , discountModel = require('../discount')
  , QRGenerator = require('../qr-generator')
  , productsModel = require('../products')
  , helper = require('../helpers')
  , usaEpayModel = require('../usaepay')
  , api = require('../api')
  , CrudManager = require('../crud-manager');

const Order = new Schema({
  user_id: {
    type: String
  },
  machine_id: {
    type: String
  },
  codeQr: {
    type: String
  },
  codeManual: {
    type: String
  },
  products: {
    type: Array
  },
  price: {
    type: String
  },
  time_created: {
    type: String
  },
  status: {
    type: String
  },
  reservation_expired: {
    type: String
  },
  expire: {
    type: String
  },
  picked_up_time: {
    type: String
  },
  reward: {
    type: Boolean,
    default: false
  },
  notificationStatus: {
    type: String
  },
  credit_card_num: {
    type: String
  },
  payment_type: {
    type: String
  }
});

const preMethods = [
  {
    name: 'save',
    callback: function (next) {
      let self = this;
      if (!self.isModified('time_created')) {
        let now = moment().unix();
        self.time_created = now;
      }

      next();
    }
  }
];

/**
 * Order class.
 * @constructor
 */

class OrderManager extends CrudManager {
  constructor() {
    super('Order', Order, preMethods);
    this.transactionTypes = {
      esaePay: 'UsaEpay',
      coins: 'Coins Transaction',
      cancel: 'Canceling Order'
    };
    this.defaultExpireTime = 86400 * 3; // 3 days
    this.reservationTimeExpired = 60 * 15; //in minutes
    this.APPROVED_STATUS = 'approved';

    this.refundPercent = 0.3; //refund percent
    this.refundAmount = 2; //refund percent

    // userModel.getUser({login: 'v@codemotion.eu'})
    //     .then((user) => {
    //         this.processNewOrder(['32773', '32774'], '350', 'payment', user[0], 1)
    //             .then(r => console.log(r))
    //             .catch(err => console.log(err));
    //     });
  };


  /**
   * Create order reservation
   * @param {object} queryOptions - options for reservation order on external API
   * @param {object} orderOptions - options for reservation order on external API
   * @returns {Promise} promise - promise with a result of reservation order
   */

  createOrderReservation(queryOptions, orderOptions = {}) {
    return new Promise((resolve, reject) => {
      api.orders.reservation(queryOptions.params, orderOptions, queryOptions.headers || {})
        .then(resolve)
        .catch(reject);
    });
  };


  /**
   * Get order reservation status
   * @param {object} queryOptions - options for getting status of reservation order on external API
   * @param {object} reservationId - id of order reservation
   * @returns {Promise} promise - promise with a result of reservation order status
   */

  getOrderReservationStatus(queryOptions, reservationId) {
    return new Promise((resolve, reject) => {
      queryOptions.params.reservationId = reservationId;
      api.orders.getReservationStatus(queryOptions.params, {}, queryOptions.headers || {})
        .then(resolve)
        .catch(reject);
    });
  };


  /**
   * Confirm order reservation
   * @param {object} queryOptions - options for confirm reservation order on external API
   * @param {object} reservationId - id of order reservation
   * @param {object} orderOptions - options for reservation order on external API
   * @returns {Promise} promise - promise with a result of reservation confirmation
   */

  confirmOrderReservation(queryOptions, reservationId, orderOptions) {
    return new Promise((resolve, reject) => {
      queryOptions.params.reservationId = reservationId;
      api.orders.confirmReservation(queryOptions.params, orderOptions, queryOptions.headers || {})
        .then(resolve)
        .catch(reject);
    });
  };


  /**
   * Cancel order reservation
   * @param {object} queryOptions - options for cancel reservation order on external API
   * @param {object} reservationId - id of order reservation
   * @param {object} orderOptions - options for reservation order on external API
   * @returns {Promise} promise - promise with a result of cancel reservation
   */

  cancelOrderReservation(queryOptions, reservationId, orderOptions) {
    return new Promise((resolve, reject) => {
      queryOptions.params.reservationId = reservationId;
      api.orders.cancelReservation(queryOptions.params, orderOptions, queryOptions.headers || {})
        .then(resolve)
        .catch(reject);
    });
  };


  /**
   * Process new order
   * @param {array} productsArray - products for order
   * @param {string} machineId - machine id
   * @param {object} paymentType - payment type (coins or payment system)
   * @param {string} user - user object
   * @param {int} selectedCardIdx - selected card index
   * @returns {Promise} promise - promise with a result of reservation confirmation
   */

  processNewOrder(productsArray, machineId, paymentType = 'esaePay', user, selectedCardIdx = 0) {
    let options = {
      params: {
        appId: 1,
        companyId: 49,
        machineId: machineId,
      },
      data: {},
      headers: {}
    };
    let currentOrder = null;
    let reservationOptions = {};

    return new Promise((resolve, reject) => {
      this._getOrderProducts(Object.assign({}, options), productsArray)
        .then((items) => {
          return this._calculateSum(productsArray, items, user)
            .then((response) => {
              items = items.map((e, k) => {
                return {
                  productId: e.productReference,
                  productPriceUnit: e.articlesTariffs_VO ? e.articlesTariffs_VO.price : 0,
                  productReference: e.productReference,
                  productQuantity: response.count[e.productReference],
                  productEanCode: 'yyy',
                  productName: e.productName
                };
              });
              let orderEntityOptions = {
                user_id: user._id,
                reward: response.rewardStatus,
                machine_id: machineId,
                status: 'new',
                expire: null,
                notificationStatus: 'new',
                products: items,
                credit_card_num: user.credit_cards[selectedCardIdx].maskedNum,
                price: Number(response.sum).toFixed(2),
                payment_type: this.transactionTypes[paymentType]
              };
              console.log('step1');

              return this.create(orderEntityOptions);
            })
        })
        .then((order) => {
          currentOrder = order;
          this.saveOrderQRCode(currentOrder);

          reservationOptions = {
            machineId: order.machine_id,
            codeQr: order.codeQr,
            codeManual: order.codeManual,
            products: order.products,
            id: -1
          };
          console.log('step2');

          return this.createOrderReservation(Object.assign({}, options), reservationOptions);
        })
        .then((r) => {
          if (r.result.code != '0') {
            throw r.result.message;
          }
          console.log('step3');
          //TODO save reservationId!!!
          return this.update({_id: currentOrder._id}, {
            status: 'reserved',
            reservation_expired: this.reservationTimeExpired
          });
        })
        .then((order) => {

          if (paymentType === 'coins') { //TODO: add here check if enough coins
            return this.APPROVED_STATUS;
          }

          let usaEpayData = {
            command: 'saleCommand',
            amount: order.price,
            ccNumber: user.credit_cards[selectedCardIdx].token,
            expire: '0000',
            cvv: ''
          };
          console.log('step4');
          if (order.price == 0) return {UMstatus: 'Approved'};
          return usaEpayModel.processUsaEpayRequest(usaEpayData);
        })
        .then((response) => {
          let transactionEntity = {
            user_id: user._id,
            user_login: user.login,
            order_id: currentOrder._id,
            event: this.transactionTypes[paymentType],
            details: '',
            card_num: user.credit_cards[selectedCardIdx].maskedNum,
            amount: currentOrder.price,
            status: response.UMstatus ? response.UMstatus : response
          };
          console.log('step5');
          return transactionModel.create(transactionEntity);
        })
        .then((transaction) => {
          if (transaction.status.toLowerCase() !== this.APPROVED_STATUS) {
            reject('Transaction not approved')
          }
          console.log('step6');
          return this.confirmOrderReservation(Object.assign({}, options), -1, reservationOptions);
        })
        .then((r) => {
          console.log('final7');
          this.update({_id: currentOrder._id}, {
            status: 'done',
            expire: moment().unix() + this.defaultExpireTime
          })
            .then(resolve)
        })
        .catch((err) => {
          // console.log('err');
          if (currentOrder) {
            let promises = [
              this.cancelOrderReservation(Object.assign({}, options), -1, reservationOptions),
              this.update({_id: currentOrder._id}, {status: 'canceled'})
            ];

            Promise.all(promises)
              .catch(reject)
          }
          console.log(err);
          reject(err)
        });
    });

  };


  /**
   * Cancel order with refund
   * @param {string} orderId - id of order for refund
   * @param {object} user - user object
   * @returns {Promise} promise - promise with a result of canceling order
   */

  processCancelOrder(orderId, user) {

    let options = {
      params: {
        appId: 1,
        companyId: 49,
        machineId: null,
      },
      data: {},
      headers: {}
    };

    let currentOrder = null;
    let creditCardIdx = null;

    return new Promise((resolve, reject) => {
      this.list({_id: orderId})
        .then((order) => {

          order = order[0] || null;
          if (!order) {
            return reject('Wrong order id');
          }

          currentOrder = order;
          creditCardIdx = user.credit_cards.find((e, idx) => (e.maskedNum === order.card_num) ? idx : null);

          let cancelOrderOptions = {
            machineId: order.machine_id,
            codeQr: order.codeQr,
            codeManual: order.codeManual,
            products: order.products,
            id: -1
          };
          options.params.machineId = order.machine_id;

          return this.cancelOrderReservation(Object.assign({}, options), cancelOrderOptions);

        })
        .then((r) => {
          if (currentOrder.price == 0) return Promise.resolve('OK');
          let usaEpayData = {
            command: 'refundCommand',
            amount: currentOrder.price > this.refundAmount ? parseFloat(currentOrder.price) - this.refundAmount : currentOrder.price,
            ccNumber: user.credit_cards[0].token,
            expire: '0000',
            cvv: ''
          };

          return usaEpayModel.processUsaEpayRequest(usaEpayData);
        })
        .then((usaePayResponse) => {
          let transactionEntity = {
            user_id: user._id,
            user_login: user.login,
            order_id: currentOrder._id,
            event: this.transactionTypes.cancel,
            details: '',
            card_num: user.credit_cards[0].maskedNum,
            amount: currentOrder.price > this.refundAmount ? parseFloat(currentOrder.price) - this.refundAmount : currentOrder.price,
            status: 'approved'
          };

          return transactionModel.create(transactionEntity)
        })
        .then(resolve)
        .catch(reject);
    });
  };


  /**
   * Load items by ids
   * @param {object} options - object with options for request
   * @param {array} itemsIds - array with item ids for order
   * @returns {Promise} promise - promise with a result of items
   */

  _getOrderProducts(options, product) {
    let promises = Object.keys(product).map((e) => {
      options.params.productReference = e;
      return productsModel.getProduct(options);
    });
    return new Promise((resolve, reject) => {
      Promise.all(promises)
        .then(resolve)
        .catch(reject);
    });
  };


  /**
   * Cancel user order
   * @param {object} order - options for canceling order
   * @returns {Promise} promise - promise with a result of executing order
   */

  saveOrderQRCode(order) {
    let fileName = 'qr' + order._id;
    let cryptedStr = crypto.createHash("sha256").update(order._id.toString()).digest("base64").slice(0, 8);

    order.codeQr = fileName;
    order.codeManual = cryptedStr;

    QRGenerator.generateQR(cryptedStr, fileName, {})
      .then((res) => {
        order.save();
      })
      .catch((e) => {
      });
  };


  /**
   * Cancel user order
   * @param {object} options - options for canceling order
   * @returns {Promise} promise - promise with a result of executing order
   */

  cancelOrder(options, user) {
    return new Promise((resolve, reject) => {
      this.processCancelOrder(options.params.orderId, user)
        .then((res) => {
          return productsModel.cancelOrder(options)
        })
        .then((result) => {
          return result;
        })
        .then((status) => {
          return this.update({_id: options.params.orderId}, {status: 'canceled'})
        })
        .then(resolve)
        .catch(reject);
    });

  };


  /**
   * Execute user order
   * @param {object} order - order object
   * @returns {Promise} promise - promise with a result of executing order
   */

  executeOrder(order) {
    let promise = new Promise((resolve, reject) => {
      transactionModel.list({order_id: oreder._id})
        .then((transaction) => {
          transaction = transaction.length ? transaction[0] : null;

          if (!transaction) {
            return reject('Wrong order id');
          }


          if (transaction.status !== 'Approved') {
            return reject('Transaction not approved');
          }

          let updateOrderPromise = new Promise((resolveUpdate, rejectUpdate) => {
            this.update({_id: order._id}, {status: 'Paid'})
              .then(resolveUpdate)
              .catch(rejectUpdate);
          });

          let updateUserPromise = new Promise((resolveUpdate, rejectUpdate) => {
            userModel.updateUser({_id: order.user_id}, {$push: {'unratedProducts': order.id}})
              .then(resolveUpdate)
              .catch(rejectUpdate);
          });

          Promise.all([updateOrderPromise, updateUserPromise])
            .then(resolve)
            .reject(reject);

        })
        .catch(reject);
    });

    return promise;
  };


  /**
   * Auto Order checker
   */

  orderChecker() {
    this.list({status: 'pending'})
      .then((orders) => {
        if (!orders || !orders.length) {
          return;
        }
        for (let i = 0, l = orders.length; i < l; ++i) {
          this.executeOrder(orders[i]);
        }

      })
      .catch(err => console.log(err));
  };

  _calculateSum(productsArray, items, user) {
    let sum = 0;
    let count = {
    };
    let rewardStatus = false;
    return new Promise((resolve, reject) => {
      discountModel.list({})
        .then((discounts) => {
          discounts = discounts || [];

          let preparedDiscount = {};
          let preparedItems = {};
          discounts.forEach((d) => {
            preparedDiscount[d.product_id] = d;
          });
          items.forEach((d) => {
            preparedItems[d.productReference] = d;
          });

          for (let key in productsArray) {
            if (productsArray.hasOwnProperty(key)) {
              count[key] = 0;
              if (productsArray[key].regularQuantity && productsArray[key].regularQuantity > 0) {
                sum = (+sum + (preparedItems[key].articlesTariffs_VO.price * productsArray[key].regularQuantity)).toFixed(2)
                count[key] = +count[key] + productsArray[key].regularQuantity;
              }
              if (productsArray[key].discountQuantity && productsArray[key].discountQuantity > 0) {
                let pairs = productsArray[key].discountPair || [];
                pairs.forEach((pair) => {
                  if (productsArray[pair].regularPair.includes(productsArray[key].productReference)) {
                    count[key] = count[key] + 1;
                    sum = +sum + (+preparedDiscount[productsArray[key].productReference].discount);
                    productsArray[pair].regularPair.splice(productsArray[pair].regularPair.indexOf(productsArray[key].productReference), 1);
                  }
                })
              }
              if (productsArray[key].freeQuantity && productsArray[key].freeQuantity > 0) {
                for (let i = 0, len = productsArray[key].freeQuantity; i < len; i++) {
                  if (user.freeProducts.includes(productsArray[key].articles_VO.category)) {
                    rewardStatus = true;
                    count[key] = count[key] + 1;
                    user.freeProducts.splice(user.freeProducts.indexOf(productsArray[key].articles_VO.category), 1);
                  }
                }
              }
              userModel.updateUser({_id: user._id}, {freeProducts: user.freeProducts})
                .then((user) => {
                  resolve({
                    rewardStatus,
                    count,
                    sum
                  })
                })
                .catch(reject)
            }
          }
        });
    });
  }

}

const orderManager = new OrderManager();

module.exports = orderManager;
