import QuestionWithAnswers from './../base/question-with-answers.js';
import ValidationTypes from '../validation/validation-types.js';
import RuleValidationResult from '../validation/rule-validation-result.js';
import Utils from 'utils.js';

/**
 * @extends {QuestionWithAnswers}
 */
export default class SingleQuestion extends QuestionWithAnswers {
    /**
     * Create instance.
     * @param {object} model - The instance of the model.
     */
    constructor(model) {
        super(model);

        this._value = null;
        this._otherValues = {};

        //Features
        this._answerButtons = model.answerButtons || false;
        this._slider = model.slider || false;
        this._dropdown = model.dropdown || false;

        this._loadInitialState(model);
    }

    /**
     * Is it answer buttons.
     * @type {boolean}
     * @readonly
     */
    get answerButtons() {
        return this._answerButtons;
    }

    /**
     * Is it slider.
     * @type {boolean}
     * @readonly
     */
    get slider() {
        return this._slider;
    }
    
    /**
     * Is it dropdown.
     * @type {boolean}
     * @readonly
     */
    get dropdown() {
        return this._dropdown;
    }

    /**
     * Selected value.
     * @type {string}
     * @readonly
     */
    get value() {
        return this._value;
    }

    /**
     * Other value.
     * @type {string}
     * @readonly
     */
    get otherValue() {
        if (Utils.isEmpty(this._value))
            return null;

        return this._otherValues[this._value] || null;
    }

    /**
     * @inheritDoc
     */
    get formValues(){
        let form = {};

        let answer = this.getAnswer(this.value);
        if(answer){
            form[answer.fieldName] = this.value;
            if(answer.isOther){
                form[answer.otherFieldName] = this.otherValue;
            }
        }

        return form;
    }

    /**
     * Answer code, optional other value.
     * @param {string} value - Answer code.
     */
    setValue(value) {
        const answerCode = value;

        const changed = this._setValue(answerCode);
        if (changed) {
            this._onChange({value: answerCode});
        }
    }

    /**
     * Set other answer value.
     * @param {string} otherValue - other value.
     */
    setOtherValue(otherValue) {
        const answerCode = this._value;
        
        const changed = this._setOtherValue(answerCode, otherValue);
        if (changed) {
            this._onChange({otherValue: answerCode});
        }
    }

    _setValue(value) {
        value = Utils.isEmpty(value) ? null : value.toString();
        if (this._value === value) {
            return false;
        }

        if (value !== null) {
            const answer = this.getAnswer(value);
            if (!answer) {
                return false;
            }
        }

        this._value = value;

        return true;
    }

    _loadInitialState({value = null, otherValues = []}) {
        this._value = value;
        this._otherValues = { ...otherValues };
    }

    _validateRule(validationType) {
        switch(validationType) {
            case ValidationTypes.Required:
                return this._validateRequired();
            case ValidationTypes.OtherRequired:
                return this._validateOther(); 
            case ValidationTypes.RequiredIfOtherSpecified:
                return this._validateRequiredIfOtherSpecified();
        }
    }

    _validateRequired() {
        if (!this.required)
            return new RuleValidationResult(true);

        let isValid = !Utils.isEmpty(this.value);
        return new RuleValidationResult(isValid);
    }

    _validateOther(){
        if (Utils.isEmpty(this.value))
            return new RuleValidationResult(true);

        let answer = this.getAnswer(this.value);
        let isValid = !answer.isOther || !Utils.isEmpty(this.otherValue);
        return new RuleValidationResult(isValid, [this.value]);
    }
    
    _validateRequiredIfOtherSpecified(){
        if(!Utils.isEmpty(this.value))
            return new RuleValidationResult(true);
        
        let invalidAnswers = Object.keys(this._otherValues);

        let isValid = invalidAnswers.length === 0;
        return new RuleValidationResult(isValid, invalidAnswers);
    }
}