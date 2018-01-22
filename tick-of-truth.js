function ValidationRules(selector, validator) {
    this.validator = validator
    this.selector = selector;
    this._is = [];
    this._not = [];
    this._isRegex = [];
    this._notRegex = [];
    this._isChecked = undefined;
    this.length = {
        lt: undefined,
        gt: undefined,
        eq: undefined
    }
  
    this.isNot = function(value) {
        this._not.push(value);
        return this;
    }
  
    this.is = function(value) {
        this._is.push(value);
        return this;
    }
  
    this.isRegEx = function(regex) {
        this._isRegex.push(regex);
        return this;
    }
  
    this.isNotRegEx = function(regex) {
        this._notRegex.push(regex);
        return this;
    }
  
    this.isPhone = function() {
        this.isRegEx(/^(\+)*[0-9]{11,12}$/);
        return this;
    }
  
    this.isEmail = function() {
        this.isRegEx(/^\S+@\S+\.\S+$/);
        return this;
    }
  
    this.isInteger = function() {
        this.isRegEx(/^[^0]\d+$/);
        return this;
    }
  
    this.isNumber = function() {
        this.isRegEx(/^[\+\-]?\d*\.?\d+(?:[Ee][\+\-]?\d+)?$/);
        return this;
    }
  
    this.isPostcode = function() {
        this.isRegEx(/^[A-Z]{1,2}[0-9]{1,2} ?[0-9][A-Z]{2}$/i);
        return this;
    }
  
    this.isDrivingLicence = function() {
        this.isRegEx(/^[a-zA-Z]{5}[0-9]{6}[a-zA-Z]{2}[0-9][a-zA-Z]{2}$/);
        return this;
    }
  
    this.isEmpty = function() {
        this.isRegEx(/^$/);
        return this;
    }
  
    this.isNotEmpty = function() {
        this.isNotRegEx(/^$/);
        return this;
    }

    this.isChecked = function() {
        this._isChecked = true;
        return this;
    }
  
    this.maxLength = function(length) {
        this.length.lt = length;
        return this;
    }
  
    this.minLength = function(length) {
        this.length.gt = length;
        return this;
    }
  
    this.equalLength = function(length) {
        this.length.eq = length;
        return this;
    }
  
    this.validate = function(selector) {
        return this.validator.watch(selector);
    }
  
    //Returns true if valid, false if not
    this.check = function() {
        var nodes = document.querySelectorAll(this.selector).length;

        if (nodes > 0) {
            if (!this.validateNots()) {
                return false;
            }
            if (!this.validateIs()) {
                return false;
            }
            if (!this.validateIsReg()) {
                return false;
            }
            if (!this.validateNotReg()) {
                return false;
            }
            if (!this.validateChecked()) {
                return false;
            }
            if (!this.validateLength()) {
                return false;
            }
            return true;
        } else {
            console.error(this.selector + " not found")
            return false;
        }
    }
    //Loops through each not value, if all nots are matched, it will return true, if any not fails, it returns false
    this.validateNots = function() {
        var value = document.querySelector(this.selector).value;
        for (var i = 0; i < this._not.length; i++) {
            if (value === this._not[i]) return false;
        }
        return true;
    }
  
    this.validateIs = function() {
        var value = document.querySelector(this.selector).value;
        for (var i = 0; i < this._is.length;i++) {
            if (value !== this._is[i]) return false;
        }
        return true;
    }
  
    this.validateIsReg = function() {
        var value = document.querySelector(this.selector).value;
        for (var i = 0; i < this._isRegex.length;i++) {
            if (!this._isRegex[i].test(value)) {
                return false;
            }
        }
        return true;
    }
  
    this.validateNotReg = function() {
        var value = document.querySelector(this.selector).value;
        for (var i = 0; i < this._notRegex.length;i++) {
            if (this._notRegex[i].test(value)) {
                return false;
            }
        }
        return true;
    }

    this.validateChecked = function() {
        var checked = document.querySelectorAll(this.selector + ":checked");
        if (this._isChecked && checked.length > 0) {
            return true;
        }
        return false;
    }
  
    this.validateLength = function() {
        var value = document.querySelector(this.selector).value;
        if (this.length.lt) {
            if (!(value.length < this.length.lt)) {
                return false;
            }
        }
        if (this.length.gt) {
            if (!(value.length > this.length.gt)) {
                return false;
            }
        }
        if (this.length.eq) {
            if (!(value.length === this.length.eq)) {
                return false;
            }
        }
        return true;
    }
  
    this.error = function() {
        $(this.selector).closest('.form-group').addClass('error');
        $(this.selector).parent().find('.label-error').show();
    }
  
    this.removeError = function() {
        $(this.selector).closest('.form-group').removeClass('error');
        $(this.selector).parent().find('.label-error').hide();
    }
  
    this.true = function() {
        return this.validator.check();
    }
  
    this.false = function() {
        return !this.validator.check();
    }
  }
  
  
  function validate(id) {
    if (id) {
        if (window === this) {
            return new validate(id);
        } else {
            this._rules = [];
            this._rules.push(new ValidationRules(id, this));
            return this._rules[0];
        }
    } else {
        console.error("Provide a selector e.g. 'validate(\"#email\")");
    }
  }
  
  validate.prototype = {
    _rules: [],
    
    watch: function(selector) {
        var valRule = new ValidationRules(selector, this);
        this._rules.push(valRule);
        return valRule;
    },
  
    check: function() {
        var passed = true;
        for (var i = 0; i < this._rules.length;i++) {
            if (!this._rules[i].check()) {
                this._rules[i].error();
                passed = false;
            } else {
                this._rules[i].removeError();
            }
        }
        return passed;
    }
}