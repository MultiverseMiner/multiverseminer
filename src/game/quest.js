/**
* @param {String} name The name of the quest
* @param {String} desc The quest description
* @param {Boolean} ordered Determines whether or not order matters. If true, tasks must be completed in order.
* @param {Task} [tasks] A list of tasks
* @param {function} reward A function that will be fired once you complete the quest.
*/
function Quest(name,desc, ordered, tasks, reward){
    // Ideally quest can be written in JSON and then can be parsed by the quest module
    this.name = name;
    this.desc = desc;
    this.ordered = ordered;
    this.tasks = tasks.splice(0);
    this._reward = reward;
    this.completed = false;
    
    /**
    * Add a new task
    * @param {String} desc Task description
    * @param {String} type The type of task, valid options are kill, craft, mine, event
    * @param {String} what What we need to do. Format for kill, craft, mine is X Y. Eg : 10 ironBar. 
    * If the type is event then a listener will be created for that event and when fired will complete the task
    */
    this.addTask = function(desc,type,what){
        var t = new Task(desc,type,what);
        return this;
    };
    
    this.removeTask = function(index){
        return this.tasks.splice(index,1);
    };
    
    this.fail = function(){
        //placeholder
    };
    
    this.complete = function(){
        if(this.completed) return true;
        this.completed = true;
        this._reward();
        return true;
    };
    
    this.check = function() {
		for(var i = 0; i < this.tasks.length; i++) {
			if(!this.tasks[i].completed) return false;
		}
		this.complete();
		return true;
    };
    
    this.taskProgress = function(type, what) { //kill, craft, mine, event? x y
    	if(this.ordered) {
    		for(var i = 0; i < this.tasks.length; i++) {
    			if(!this.tasks[i].completed) {
	    			this.tasks[i].progress(type, what);
	    			break;
    			}
    		}
    	} else {
    		for(var i = 0; i < this.tasks.length; i++) {
    			this.tasks[i].progress(type, what);
    		}
    	}
    	this.check();
    };
    
};


/**
* The task object
* @param {String} desc Task description
* @param {String} type The type of task, valid options are kill, craft, mine, event
* @param {String} what What we need to do. Format for kill, craft, mine, is X Y.
* Where X is the quantity and Y is the object. It can be specific, EG: 10 ironBar, or generic 5 gems
* If the type is event then a listener will be created for that event and when fired will complete the task
*/
function Task(desc,type,what) {
	this.desc = desc;
	this.type = type;
	
    if(type == 'event'){
        this.event = what;
    } else {
	    var quantity, id;
	    quantity = what.split(' ')[0];
	    id = what.split(' ')[1];
	    quantity = parseInt(quantity,10);
	    quantity = isNaN(quantity) ? 1 : quantity;
	    this.current = 0; //when current progress >= goal, win :P
	    this.goal = quantity;
	    this.event = id;
    }
    this.completed = false;
    
    this.check = function() {
    	if(this.type != 'event') {
	    	if(this.current >= this.goal) {
	    		this.completed = true;
	    	}
    	}
    	return this.completed;
    };
    
    this.progress = function(type, what) {
    	if(this.type == type) {
    		if(type == 'event') {
    			if(what == this.event) {
    				this.completed = true;
    			}
	    	} else {
	    	    var quantity, id;
	    	    quantity = what.split(' ')[0];
	    	    id = what.split(' ')[1];
	    	    quantity = parseInt(quantity,10);
	    	    quantity = isNaN(quantity) ? 0 : quantity;
	    	    if(id == this.event) {
	    	    	this.current += quantity;
	    	    }
	    	}
    	}
    	return this.check();
    };
};

function initQuests() {
	// example quest
	// game.addQuest(
	//	"Example",
	//		"This is just an example quest.", false,
	//			[new Task("Example Task", "event", "example")], 
	//
	//function() { console.log("The example quest was completed!"); }
	//);
		
	game.addQuest(
		'Mine Copper', 
			'Mine 10 copper', false, 
				[new Task('Mine copper', 'mine', '10 copper')], 
	
	function() {noty({text: "Quest Complete: Mine Copper", type: "information", timeout: 3500 });}
	);
	
	game.addQuest(
		'Kill Thugs', 
			'Kill 2 thugs', false, 
				[new Task('Kill thugs', 'kill', '2 npc_thug')], 
	
	function() {noty({text: "Quest Complete: Kill Thugs", type: "information", timeout: 3500 });}
	);
	
	game.addQuest(
		'Craft Copper Bar', 
			'Craft 1 copper bar with the copper from before', false, 
				[new Task('Craft copper bar', 'craft', '1 copperBar')], 
	
	function() {noty({text: "Quest Complete: Craft Copper Bar", type: "information", timeout: 3500 });}
	);

};