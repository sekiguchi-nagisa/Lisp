var Cons = function(type, car, cdr) {
	this.type = type;
	this.car = car;
	this.cdr = cdr;
};

var Parser = function(str) {
	this.arrayOfString = [];
	this.treeOfCons = null;
	this.count = 0;
	this.len = null;
	
	this.make = function(str) {
		this.count++;
		console.log("count =" + this.count);
		if (this.count >= len) {
			return null;
		}

		var temp = null;
		var c = str[this.count];
		console.log("c = " + c);
		switch (c) {
		case '+':
		case '-':
		case '*':
		case '/':
			temp = new Cons("op", c, this.make(str));
			break;
		case '#':
			temp = new Cons("car", this.make(str), this.make(str));	
			break;
		case '(':
			temp = new Cons("head", c, this.make(str));
			break;
		case ')':
			temp = new Cons("tail", c, null);
			break;
		default:
			var num = parseInt(c);
			if (isNaN(num)) {
				temp = new Cons("var", c, this.make(str));
			} else {
				temp = new Cons("num", num, this.make(str));
			}
			break;
		}
		return temp;
	};
	
	this.makeConsTree = function() {
		this.len = this.arrayOfString.length;
		this.count = 0;
		console.log("len = " + len);
		this.treeOfCons = new Cons("dummy", 0, this.make(this.arrayOfString));
	};
	
	this.printTree = function() {
		this.count = 0;
		this.print(this.treeOfCons);
	};
	
	this.print = function(cons) {
		this.count++;
		console.log("{ type: " + cons.type + ", car: " + 
				cons.car + ", cdr: " + typeof(cons.cdr) 
				+ this.count + " }");
		if (cons.type == "car") {
			this.print(cons.car);
		}
		if (cons.cdr != null) {
			this.print(cons.cdr);
		}
	};
	
	var temp = "";
	for (var i = 0, len = str.length; i < len; i++) {
		var c = str.charAt(i);
		switch (c) {
		case '(':
			this.arrayOfString.push('#');
		case ')':
			if (temp.length != 0) {
				this.arrayOfString.push(temp);
				temp = "";
			}
			this.arrayOfString.push(c);
			break;
		case ' ':
			if (temp.length != 0) {
				this.arrayOfString.push(temp);
				temp = "";
			}
			break;
		default:
			temp = temp.concat(c);
			break;
		}
	}
};

var Execute = function(consTree) {
	this.consTree = consTree;
	
	this.exe = function() {
		
	};
};



var p = new Parser("(+ (* x 2) (- y 234) z)");
//var p = new Parser("(+ 2 3)");
console.log(p.arrayOfString);
p.makeConsTree();
p.printTree();

                  
                        

                    


                    
                    
