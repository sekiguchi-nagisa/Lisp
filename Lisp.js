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
		case '<':
		case 'if':
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
				temp = new Cons("arg", c, this.make(str));
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
	
	var add = function(array) {
		var temp = array[0];
		for (var i = 1, len = array.length; i < len; i++) {
			temp += array[i];
		}
		return temp;
	}
	
	var sub = function(array) {
		var temp = array[0];
		for (var i = 1, len = array.length; i < len; i++) {
			temp -= array[i];
		}
		return temp;	
	}

	var mul = function(array) {
		var temp = array[0];
		for (var i = 1, len = array.length; i < len; i++) {
			temp *= array[i];
		}
		return temp;	
	}

	var div = function(array) {
		var temp = array[0];
		for (var i = 1, len = array.length; i < len; i++) {
			temp = Math.floor(temp / array[i]);
		}
		return temp;	
	}
	
	var isSmall = function(array) {
		if (array[0] < array[1]) {
			return "t";
		} else {
			return "nil";
		}
	}	

	var isLarge = function(array) {
		if (array[0] > array[1]) {
			return "t";
		} else {
			return "nil";
		}
	}	
	
		
	this.execute = function() {
		console.log(this.evaluate(this.treeOfCons.cdr)[0]);
	}
	
	this.evaluate = function(cons) {
		var array = [];
		switch (cons.type) {
		case "num":
			array.push(cons.car);
			if (cons.cdr.type == "tail") {
				return array
			} else {
				return array.concat(this.evaluate(cons.cdr));
			}
		case "op":
			switch (cons.car) {
			case "+":
				array.push(add(this.evaluate(cons.cdr)));
				return array;
			case "-":
				array.push(sub(this.evaluate(cons.cdr)));
				return array;
			case "*":
				array.push(mul(this.evaluate(cons.cdr)));
				return array;
			case "/":
				array.push(div(this.evaluate(cons.cdr)));
				return array;
			case "<":
				array.push(isSmall(this.evaluate(cons.cdr)));
				return array;		
			case ">":
				array.push(isLarge(this.evaluate(cons.cdr)));
				return array;	
			case "if":
				var bool = this.evaluate(cons.cdr)[0];
				console.log("bool = " + bool);
				if (bool == "t") {
					return this.evaluate(cons.cdr.cdr);
				} else {
					return this.evaluate(cons.cdr.cdr.cdr);
				}
			}				
		case "head":
			return this.evaluate(cons.cdr);
		case "car":
			return this.evaluate(cons.car).concat(this.evaluate(cons.cdr));
		}
		
	}
	
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


var p = new Parser("(if (< 5 4) (+ (* 3 2) (- 234 230) 5) (- 2 3 4))");
console.log(p.arrayOfString);
p.makeConsTree();
p.printTree();
p.execute();

                  