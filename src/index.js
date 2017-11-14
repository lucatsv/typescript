var Select = (function () {
    function Select(config) {
        var _this = this;
        this.allInTolerance = 0.01;
        if (config.zone != undefined) {
            "";
            this.zone = document.getElementById(config.zone);
        }
        else {
            this.zone = document.getElementById("zone");
        }
        if (config.target != undefined) {
            this.target = { "element": config.target.element, "class": config.target.class };
        }
        else {
            this.target = { "element": "li" };
        }
        if (config.altKey != undefined) {
            try {
                this.altKey = config.altKey;
            }
            catch (ex) {
                throw ex;
            }
        }
        else {
            this.altKey = false;
        }
        if (config.class != undefined) {
            this.class = config.class;
        }
        else {
            this.class = "";
        }
        if (config.selection != undefined) {
            this.selectionMethod = config.selection;
        }
        else {
            this.selectionMethod = "all-in";
        }
        if (config.uniqueSelection != undefined) {
            this.uniqueSelection = config.uniqueSelection;
        }
        else {
            this.uniqueSelection = false;
        }
        this.allInTolerance = 0.15;
        this.zone.addEventListener('mousemove', function (ev) {
            _this.drawRectangle(ev);
        });
        this.zone.addEventListener('click', function (ev) {
            if (_this.altKey) {
                if (!ev.altKey) {
                    return;
                }
            }
            _this.startRectangle(ev);
        });
        document.addEventListener('keydown', function (ev) {
            if (ev.keyCode === 27) {
                _this.previousSelection = _this.selection;
                var parent_1 = _this.selection.parentElement;
                if (parent_1 instanceof HTMLElement) {
                    parent_1.removeChild(_this.previousSelection);
                    _this.selection = null;
                    _this.zone.style.cursor = "default";
                }
            }
        });
    }
    Select.prototype.drawRectangle = function (ev) {
        this.setMousePosition(ev);
        if (this.selection != null) {
            this.selection.style.width = Math.abs(this.mouse.x - this.mouse.startX) + 'px';
            this.selection.style.height = Math.abs(this.mouse.y - this.mouse.startY) + 'px';
            this.selection.style.left = (this.mouse.x - this.mouse.startX < 0) ? this.mouse.x + 'px' : this.mouse.startX + 'px';
            this.selection.style.top = (this.mouse.y - this.mouse.startY < 0) ? this.mouse.y + 'px' : this.mouse.startY + 'px';
        }
    };
    Select.prototype.deleteRectangle = function (ev) {
    };
    Select.prototype.startRectangle = function (ev) {
        var _this = this;
        var mouse = new Mouse();
        this.mouse = mouse;
        this.setMousePosition(ev);
        if (this.selection != null) {
            this.zone.style.cursor = "default";
            this.previousElements = this.getSelection();
            this.previousSelection = this.selection;
            this.selection = null;
        }
        else {
            if (this.uniqueSelection) {
                if (this.previousSelection != undefined) {
                    var parent_2 = this.previousSelection.parentElement;
                    if (parent_2 instanceof HTMLElement) {
                        parent_2.removeChild(this.previousSelection);
                        this.previousElements.map(function (e) { return e.classList.remove(_this.class); });
                    }
                }
            }
            this.mouse.startX = this.mouse.x;
            this.mouse.startY = this.mouse.y;
            this.selection = document.createElement('div');
            this.selection.className = 'rectangle';
            this.selection.style.left = ev.pageX + 'px';
            this.selection.style.top = ev.pageY + 'px';
            this.zone.appendChild(this.selection);
            this.zone.style.cursor = "crosshair";
        }
    };
    Select.prototype.setMousePosition = function (ev) {
        if (this.mouse != undefined) {
            this.mouse.x = ev.pageX + window.pageXOffset;
            this.mouse.y = ev.pageY + window.pageYOffset;
        }
    };
    Select.prototype.collectTarget = function () {
        var collection = new Array();
        var targets = this.zone.getElementsByTagName(this.target.element);
        for (var i = 0; i < targets.length; i++) {
            var element = targets.item(i);
            if (this.target.class != undefined) {
                if (element.classList.contains(this.target.class)) {
                    collection.push(element);
                }
            }
            else {
                collection.push(element);
            }
        }
        return collection;
    };
    Select.prototype.isInSelection = function (method, element) {
        var selection = this.selection.getBoundingClientRect();
        var elementCoordinate = element.getBoundingClientRect();
        if (method === "all-in") {
            return selection.left * (1 - this.allInTolerance) <= elementCoordinate.left &&
                (selection.left + selection.width) * (1 + this.allInTolerance) > elementCoordinate.left + elementCoordinate.width &&
                selection.top * (1 - this.allInTolerance) < elementCoordinate.top &&
                (selection.top + selection.height) * (1 + this.allInTolerance) > elementCoordinate.top + elementCoordinate.height;
        }
        else if (method === "touch") {
            return (selection.left < elementCoordinate.left + elementCoordinate.width &&
                selection.left + selection.width > elementCoordinate.left &&
                selection.top < elementCoordinate.top + elementCoordinate.height &&
                selection.height + selection.top > elementCoordinate.top);
        }
        else {
            throw new Error("Selectio value not valid");
        }
    };
    Select.prototype.getSelection = function () {
        var selectedElements = new Array();
        for (var _i = 0, _a = this.collectTarget(); _i < _a.length; _i++) {
            var element = _a[_i];
            if (this.isInSelection(this.selectionMethod, element)) {
                selectedElements.push(element);
                element.classList.add(this.class);
            }
        }
        return selectedElements;
    };
    return Select;
})();
var Mouse = (function () {
    function Mouse() {
        this.x = 0;
        this.y = 0;
        this.startX = 0;
        this.startY = 0;
    }
    return Mouse;
})();
var config = {
    "zone": "container",
    "target": {
        "element": "div",
        "class": "li-item"
    },
    "altKey": false,
    "class": "selected",
    "selection": "touch",
    "uniqueSelection": true
};
var select = new Select(config);
//# sourceMappingURL=index.js.map