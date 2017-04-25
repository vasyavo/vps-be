/**
 * CC and Transaction validator
 * @constructor
 */

class ValidatorManager {
    constructor() {
        this.cardNumberPatterns = {
            'amex': '^3[47][0-9]{13}$',
            'masterCard': '^5[1-5][0-9]{14}$',
            'unionPay': '^(62[0-9]{14,17})$',
            'visa': '^4[0-9]{12}(?:[0-9]{3})?$',
            'visaMasterCard': '^(?:4[0-9]{12}(?:[0-9]{3})?|5[1-5][0-9]{14})$'
        };
        this.CVVPattern = '^[0-9]{3,4}$';
        this.nowYearPlus = 2000;
    };


    /**
     * Validate credit card
     * @param {string} ccNumber - credit card number
     * @param {string} CVV - credit card CVV
     * @param {string} dateExpire - string
     * @returns {Boolean} - result of card validation
     */

    validateCreditCard(ccNumber, CVV, dateExpire) {
        return {
            cvv: this.validateCVV(CVV),
            expire: this.validateDateExpire(dateExpire),
            ccNumber: this.validateCreditCardNumber(ccNumber)
        }
    };


    /**
     * Credit card validator method
     * @param {string} ccNumber - credit card number
     * @returns {Boolean} - result of cc number validation
     */

    validateCreditCardNumber(ccNumber) {
        console.log(ccNumber)
        return Object.keys(this.cardNumberPatterns).find((key) => {
                let pattern = new RegExp(this.cardNumberPatterns[key]);
                return pattern.test(ccNumber);
            }) || false;
    };


    /**
     * Credit card CVV validator method
     * @param {string} CVV - credit card CVV
     * @returns {Boolean} - result of CVV validation
     */

    validateCVV(CVV) {
        return new RegExp(this.CVVPattern).test(CVV);
    };


    /**
     * Validate expire date
     * @param {string} dateExpire - string
     * @returns {Boolean} - result of expire card validation
     */

    validateDateExpire(dateExpire) {
      if (!dateExpire.includes('/')) {
            return false;
        }
      let nowYear = new Date().getFullYear();
        let nowMonth = new Date().getMonth() + 1;

        let expireDateParts = dateExpire.split('/');
        let cardMonth = +expireDateParts[0];
        let cardYear = +expireDateParts[1] + this.nowYearPlus;
        if (cardMonth > 12 || cardMonth < 0) {
          return false;
        } else if ((cardMonth <= nowMonth) && (cardYear <= nowYear)) {
          return false;
        }
        return true;
    };


}

const validatorManager = new ValidatorManager();

module.exports = validatorManager;
