// BUDGET CONTROLLER
var budgetController = (function() {

    var Expense = function(id, description, value) {
        this.id = id;
        this.description = description;
        this.value = value;
        this.percentage = -1;
    };

    Expense.prototype.calcPercentage = function(totalIncome) {
        if(totalIncome > 0) {
            this.percentage = Math.round((this.value / totalIncome) * 100);
        } else {
            this.percentage = -1;
        }
    };

    Expense.prototype.getPercentage = function() {
        return this.percentage;
    };

    var Income = function(id, description, value) {
        this.id = id;
        this.description = description;
        this.value = value;
    };

    var data = {
        allItems: {
            exp: [],
            inc: []
        },
        totals: {
            exp: 0,
            inc: 0
        },
        budget: 0,
        percentage: -1
    };

    var calculateTotal = function(type) {
        var sum = 0;
        data.allItems[type].forEach(function(single) {
            sum += single.value;
        });
        data.totals[type] = sum;
    };

    return {
        addItem: function(type, desc, val) {
            var newItem, ID;

            //generate new ID
            if(data.allItems[type].length > 0) {
                ID = data.allItems[type][data.allItems[type].length - 1].id + 1;       
            } else {
                ID = 0;
            }

            // create new Item Expesnse or Income
            if(type === 'exp') {
                newItem = new Expense(ID, desc, val);
            } else if (type === 'inc') {
                newItem = new Income(ID, desc, val);                
            }

            // add item to list
            data.allItems[type].push(newItem);
    
            return newItem;
        },

        deleteItem: function(type, id) {
            var ids, index;

            ids = data.allItems[type].map(function(current) {
                return current.id;
            });

            index = ids.indexOf(id);

            if (index !== -1) {
                data.allItems[type].splice(index, 1);
            }

        },

        calculateBudget: function() {

            // calculate total incomes and expanses
            calculateTotal('exp');
            calculateTotal('inc');

            // calculate the budget: income - expanses
            data.budget = data.totals.inc - data.totals.exp;

            // calculate the % of expanses
            if (data.totals.inc > 0) {
                data.percentage = Math.round((data.totals.exp / data.totals.inc) * 100);
            } else {
                data.percentage = -1;
            }
        },

        calculatePercentage: function() {

            data.allItems.exp.forEach(function(singleExp) {
                singleExp.calcPercentage(data.totals.inc);
            }); 

        },

        getPercentages: function() {

            var percArray = data.allItems.exp.map(function(singleExp) {
                return singleExp.getPercentage();
            });
            return percArray;

        },

        getBudget: function() {
            return {
                budget: data.budget,
                totalInc: data.totals.inc,
                totalExp: data.totals.exp,
                percentage: data.percentage
            }
        },

        test: function() {
            console.log(data);
        }
    }

})();

// UI CONTROLLER
var UIController = (function() {

    var DOMStrings = {
        inputType: '.add__type',
        inputDescription: '.add__description',
        inputValue: '.add__value',
        inputButton: '.add__btn',
        incomeContainer: '.income__list',
        expensesContainer: '.expenses__list',
        budgetLabel: '.budget__value',
        incomesLabel: '.budget__income--value',
        expensesLabel: '.budget__expenses--value',
        percentageLabel: '.budget__expenses--percentage',
        addContainer: '.add__container',
        container: '.container',
        percenatgeLabels: '.item__percentage',
        date: '.budget__title--month'
    };

    var formatNumbers = function(number, type) {
        var sign;

        number = Math.abs(number);

        if(type === "inc") {
            sign = "+";
        } else {
            sign = "-";
        }

        return sign + " " + number.toFixed(2);
    };

    return {
        getinput: function() {
            return {
                type: document.querySelector(DOMStrings.inputType).value,
                description: document.querySelector(DOMStrings.inputDescription).value,
                value: parseFloat(document.querySelector(DOMStrings.inputValue).value)
            };
        },

        addListItem: function(obj, type) {
            var html, newHtml, element;

            // html templates
            if (type === 'inc') {
                element = DOMStrings.incomeContainer;
                html = '<div class="item clearfix" id="inc-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>';
            } else if (type === 'exp') {
                element = DOMStrings.expensesContainer;
                html = '<div class="item clearfix" id="exp-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__percentage">21%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>';
            }
            
            // replace with real data
            newHtml = html.replace('%id%', obj.id);
            newHtml = newHtml.replace('%value%', formatNumbers(obj.value, type));
            newHtml = newHtml.replace('%description%', obj.description);

            // insert html into the DOM
            document.querySelector(element).insertAdjacentHTML('beforeend', newHtml);

        },

        deleteListItem: function(selectorID) {
            var element = document.getElementById(selectorID);
            element.parentNode.removeChild(element);
        },

        clearFields: function() {
            var fields, fieldsArr;

            // conver list of inputs to array of inputs
            fields = document.querySelectorAll(DOMStrings.inputDescription + ', ' + DOMStrings.inputValue);
            fieldsArr = Array.prototype.slice.call(fields);

            // loop through array
            fieldsArr.forEach(function(single) {
                single.value = "";
            });

            // set focus on description field
            fieldsArr[0].focus();
        },

        displayBudget: function(obj) {
            var type;

            if(obj.budget >= 0) {
                type = "inc";
            } else {
                type = "exp";
            }

            document.querySelector(DOMStrings.budgetLabel).textContent = formatNumbers(obj.budget, type);
            document.querySelector(DOMStrings.incomesLabel).textContent = formatNumbers(obj.totalInc, 'inc');
            document.querySelector(DOMStrings.expensesLabel).textContent = formatNumbers(obj.totalExp, 'exp');
            
            if (obj.percentage > 0) {
                document.querySelector(DOMStrings.percentageLabel).textContent = obj.percentage + '%';
            } else {
                document.querySelector(DOMStrings.percentageLabel).textContent = '---';
            }

        },

        displayPercentages: function(percArray) {
            var fields = document.querySelectorAll(DOMStrings.percenatgeLabels);

            function forEachNode(nodeList, callback) {
                for (let index = 0; index < nodeList.length; index++) {
                    callback(nodeList[index], index);
                }
            }

            forEachNode(fields, function(node, index) {
                if(percArray[index] > 0) {
                    node.textContent = percArray[index] + '%';
                } else {
                    node.textContent = '-';
                }
            });

        },

        displayDate: function() {
            var date, month, year, months;
            months = ['styczeń', 'luty', 'marzec', 'kwiecień', 'maj', 'czerwiec', 'lipiec', 'sierpień', 'wrzesień', 'październik', 'listopad', 'grudzień'];

            date = new Date();
            month = date.getMonth();
            year = date.getFullYear();

            document.querySelector(DOMStrings.date).textContent = months[month] + ' ' + year;
        },

        getDOMStrings: function() {
            return DOMStrings;
        }
    };

})();

// MAIN CONTROLLER
var controller = (function(budgetCtrl, UICtrl) {

    var setupEventListeners = function() {
        var DOM = UICtrl.getDOMStrings();

        document.querySelector(DOM.inputButton).addEventListener('click', ctrlAddItem);

        document.addEventListener('keypress', function(event) {
            if(event.keyCode === 13 || event.which === 13 ) {
                ctrlAddItem();
            }
        });

        // delete item
        document.querySelector(DOM.container).addEventListener('click', ctrlDeleteItem);

        // switch from incom to expense
        document.querySelector(DOM.inputType).addEventListener('change', function() {
            document.querySelector(DOM.addContainer).classList.toggle('red');
        });
    };

    var updateBudget = function() {

        // calculate the budget
        budgetCtrl.calculateBudget();

        // return the budget
        var budget = budgetCtrl.getBudget();

        // display the budget on UI
        UIController.displayBudget(budget);
    };

    var updatePrecentages = function() {
        var percArray;

        // calculate percentages
        budgetCtrl.calculatePercentage();

        // read precentage form budget ctrl
        percArray = budgetCtrl.getPercentages();

        // update UI with %
        // console.log(percArray);
        UICtrl.displayPercentages(percArray);
    };

    var ctrlDeleteItem = function(event) {
        var item, itemID, itemType;

        // get id of item
        item = event.target.parentNode.parentNode.parentNode.parentNode.id;

        if (item) {
            // split the id exp 'inc-2' to 'inc' and '2'
            item = item.split('-');    
            itemType = item[0];
            itemID = parseInt(item[1]);
        }

        // delete item from budget ctrl
        budgetCtrl.deleteItem(itemType, itemID);

        // delete item from UI
        UICtrl.deleteListItem(itemType + '-' + itemID);

        // update budget
        updateBudget();

        // update %
        updatePrecentages();
    };

    var ctrlAddItem = function() {

        // get the field input data
        var input = UICtrl.getinput();

        if (input.description !== "" && !isNaN(input.value) && input.value > 0) {

            // add the item to budget controller
            var newItem = budgetCtrl.addItem(input.type, input.description, input.value);
            
            // add item to the UI
            UICtrl.addListItem(newItem, input.type);
            
            // clear inpute fields
            UICtrl.clearFields();
            
            // update budget
            updateBudget();

            // update %
            updatePrecentages();
        }

    };

    return {
        init: function() {
            setupEventListeners();
            UICtrl.displayDate();
        }
    };

})(budgetController, UIController);

controller.init();