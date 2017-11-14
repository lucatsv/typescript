class Select {

    private selection : HTMLDivElement; //selection rectangle
    private previousSelection : HTMLDivElement;
    private previousElements : HTMLElement[];

    private mouse : Mouse;
    //config section
    private zone : HTMLDivElement; //zone
    private target : Target;
    private altKey : boolean;
    private class : string;
    private selectionMethod : string;
    private allInTolerance : number = 0.01;
    private uniqueSelection : boolean;

    constructor(config : any)
    {
        if(config.zone != undefined) {      ``      
            this.zone = <HTMLDivElement>document.getElementById(config.zone);        
        }
        else {
            this.zone = <HTMLDivElement>document.getElementById("zone");        
        }
        
        if(config.target != undefined) {
            this.target = {"element": config.target.element, "class": config.target.class};            
        }
        else {
            this.target = {"element": "li"}
        }

        if(config.altKey != undefined) {
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

        if(config.class != undefined) {
            this.class = config.class;
        }
        else {
            this.class = "";
        }

        if(config.selection != undefined) {
            this.selectionMethod = config.selection;
        }
        else {
            this.selectionMethod = "all-in";           
        }

        if(config.uniqueSelection != undefined) {
            this.uniqueSelection = config.uniqueSelection;
        }
        else {
            this.uniqueSelection = false;
        }

        this.allInTolerance = 0.15;

        this.zone.addEventListener('mousemove',  ev => {
            this.drawRectangle(ev);
        });

        this.zone.addEventListener('click', ev => {
            if(this.altKey) {
                if(!ev.altKey) {
                    return;                    
                }
            }
            this.startRectangle(ev);
        });      

        document.addEventListener('keydown', ev => {
            if(ev.keyCode === 27) {
                this.previousSelection = this.selection;                    
                
                let parent = this.selection.parentElement;
                if(parent instanceof HTMLElement)
                {
                    parent.removeChild(this.previousSelection);
                    
                    this.selection = null;

                    this.zone.style.cursor = "default";
                }
            }
        });
    }

    drawRectangle(ev : MouseEvent) {
        this.setMousePosition(ev);
        if (this.selection != null) {
            this.selection.style.width = Math.abs(this.mouse.x - this.mouse.startX) + 'px';
            this.selection.style.height = Math.abs(this.mouse.y - this.mouse.startY) + 'px';
            this.selection.style.left = (this.mouse.x - this.mouse.startX < 0) ? this.mouse.x + 'px' : this.mouse.startX + 'px';
            this.selection.style.top = (this.mouse.y - this.mouse.startY < 0) ? this.mouse.y + 'px' : this.mouse.startY + 'px';
        }

    }

    deleteRectangle(ev : MouseEvent) {

    }

    startRectangle(ev : MouseEvent) {
        let mouse = new Mouse();
        this.mouse = mouse;
        this.setMousePosition(ev);
        if (this.selection != null) {            
            this.zone.style.cursor = "default";      
            this.previousElements = this.getSelection();
            this.previousSelection = this.selection;
            this.selection = null;
        } else {        
            if(this.uniqueSelection) { 
                if(this.previousSelection != undefined) {
                    let parent = this.previousSelection.parentElement;
                    if(parent instanceof HTMLElement)
                    {                    
                        parent.removeChild(this.previousSelection);
                        this.previousElements.map(e => e.classList.remove(this.class));
                    }
                }       
            }
            this.mouse.startX = this.mouse.x;
            this.mouse.startY = this.mouse.y;
            this.selection = document.createElement('div');
            this.selection.className = 'rectangle'
            this.selection.style.left = ev.pageX + 'px';
            this.selection.style.top = ev.pageY + 'px';
            this.zone.appendChild(this.selection)
            this.zone.style.cursor = "crosshair";
        }
    }

    setMousePosition(ev : MouseEvent){
        if(this.mouse != undefined) {
            this.mouse.x = ev.pageX + window.pageXOffset;
            this.mouse.y = ev.pageY + window.pageYOffset;
        }
    }
    
    private collectTarget() : Array<HTMLElement> {
        let collection : Array<HTMLElement> = new Array<HTMLElement>();
        let targets : NodeList = this.zone.getElementsByTagName(this.target.element)
        for(let i =0; i < targets.length; i++) {
            let element = <HTMLElement>targets.item(i);
            if(this.target.class != undefined) {
                if(element.classList.contains(this.target.class)){
                    collection.push(element);
                }
            }
            else {
                collection.push(element);
            }                
        }
        return collection;
    }

    private isInSelection(method : string, element : HTMLElement ): boolean {
        let selection : ClientRect = this.selection.getBoundingClientRect();    
        let elementCoordinate : ClientRect = element.getBoundingClientRect();
        if(method === "all-in") {
            
            return selection.left * (1 - this.allInTolerance) <= elementCoordinate.left &&
                   (selection.left + selection.width) * (1 + this.allInTolerance) > elementCoordinate.left + elementCoordinate.width &&
                   selection.top  * (1 - this.allInTolerance) < elementCoordinate.top && 
                   (selection.top + selection.height) * (1 + this.allInTolerance) > elementCoordinate.top + elementCoordinate.height;
        }   
        else if (method === "touch") {
            return (selection.left < elementCoordinate.left + elementCoordinate.width &&
                selection.left + selection.width > elementCoordinate.left &&
                selection.top < elementCoordinate.top + elementCoordinate.height &&
                selection.height + selection.top > elementCoordinate.top)
        } 
        else {
            throw new Error("Selectio value not valid");
        }
    }

    public getSelection() : Array<HTMLElement> {            
        let selectedElements : Array<HTMLElement> = new Array<HTMLElement>();
        for(let element of this.collectTarget())
        {
            if (this.isInSelection(this.selectionMethod, element))
              {
                    selectedElements.push(element);
                    element.classList.add(this.class);
              }              
        }
        return selectedElements;
    }
}


class Mouse {
    x: number;
    y: number;
    startX: number;
    startY: number;
    constructor() {
        this.x = 0;
        this.y = 0;
        this.startX = 0;
        this.startY = 0;
    }
}

interface Target {
    element : string;
    class? : string;
}

let config = {
        "zone" : "container",
        "target" : {
             "element": "div", 
             "class": "li-item"
        },
        "altKey" : false,
        "class" : "selected",
        "selection" : "touch", //touch, all-in
        "uniqueSelection" : true
    };

let select = new Select(config);

