var Parser = function() {
	this.arrayOfParsedString = [];
	this.arrayOfConsTree = [];
	this.arrayOfFuncDef = new Object();
	this.count = -1;
	this.len = null;
	this.funcFlag = 0;
	this.argFlag = 0;
	this.key = null;
	this.arrayOfArg = [];
	
	var Cons = function(type, car, cdr) {
		this.type = type;
		this.car = car;
		this.cdr = cdr;
	};
	
	var FuncDef = function(arrayOfArg) {
		this.arrayOfArg = arrayOfArg;
		this.arrayOfArgValue = new Object();
		this.consTree = null;
	};
	
	this.parse = function(str) {
		var temp = "";
		var parsedString = [];
		var flag = 0;
		var headCount = 0;
		var tailCount = 0;
		this.arrayOfParsedString = [];
		for (var i = 0, len = str.length; i < len; i++) {
			var c = str.charAt(i);
			switch (c) {
			case '(':
		    	headCount++;
				if (flag == 0) {
					flag = 1;
				} else {
					parsedString.push('#');
				}
				parsedString.push(c);
				break;
			case ')':
				tailCount++;
				if (temp.length != 0) {
					parsedString.push(temp);
					temp = "";
				}
				parsedString.push(c);
			
				if (headCount == tailCount) {
					flag = 0;
					headCount = 0;
					tailCount = 0;
					this.arrayOfParsedString.push(parsedString);
					parsedString = [];
				}
				break;
			case ' ':
			case '\t':
			case '\n':
				if (temp.length != 0) {
					parsedString.push(temp);
					temp = "";
				}
				break;
			default:
				temp = temp.concat(c);
				break;
			}
		}
	};
	
	this.makeConsTree = function() {
		this.arrayOfConsTree = [];
		var consTree;
		for (var i = 0, len = this.arrayOfParsedString.length;
				i < len; i++) {
			this.len = this.arrayOfParsedString[i].length;	
			this.count = -1;
			consTree = new Cons("dummy", 0, this.make(this.arrayOfParsedString[i]));
			this.arrayOfConsTree.push(consTree);	
		}
	};
	
	this.make = function(str) {
		this.count++;
		//console.log("count =" + this.count);
		if (this.count >= this.len) {
			return null;
		}

		var temp = null;
		var c = str[this.count];
		//console.log("c = " + c);
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
			if (this.argFlag == 1) {
				this.argFlag = 0;
				var funcDef = new FuncDef(this.arrayOfArg);
				this.arrayOfFuncDef[this.key] = funcDef;
			}
			temp = new Cons("tail", c, null);
			break;
		case 'defun':
			this.funcFlag = 1;
			this.key = null;
			this.arrayOfArg = [];
			temp = new Cons("defun", c, this.make(str));
			break;
		default:
			var num = parseInt(c);
			if (isNaN(num)) {
				if (this.funcFlag == 1) {
					this.funcFlag = 0;
					this.argFlag = 1;
					this.key = c;
					temp = new Cons("func", c, this.make(str));
				} else {
					if (this.argFlag == 1) {
						this.arrayOfArg.push(c);
						temp = new Cons("arg", c, this.make(str));
					} else {
						var type = "local";
						for (var i = 0, len = this.arrayOfArg.length; 
								i < len; i++) {
							if (this.arrayOfArg[i] == c) {
								type = "arg";
								break;
							}
						}
						
						if (type == "local") {
							var value = this.arrayOfFuncDef[c];
							if (typeof(value) === "undefined") {
							} else {
								type = "func";
							}
						}
						temp = new Cons(type, c, this.make(str));
					}
				}
			} else {
				temp = new Cons("num", num, this.make(str));
			}
			break;
		}
		return temp;
	};
	
	this.printTree = function() {
		console.log("printTree()");
		for (var i = 0, len = this.arrayOfConsTree.length; 
				i < len; i++) {
			this.count = 0;
			this.print(this.arrayOfConsTree[i]);	
			console.log("");
		}
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
	
	this.printFunc = function(key) {
		console.log("printFunc()");
		this.count = 0;
		this.print(this.arrayOfFuncDef[key].consTree);
	};
	
	var add = function(array) {
		var temp = array[0];
		for (var i = 1, len = array.length; i < len; i++) {
			temp += array[i];
		}
		return temp;
	};
	
	var sub = function(array) {
		var temp = array[0];
		for (var i = 1, len = array.length; i < len; i++) {
			temp -= array[i];
		}
		return temp;	
	};

	var mul = function(array) {
		var temp = array[0];
		for (var i = 1, len = array.length; i < len; i++) {
			temp *= array[i];
		}
		return temp;	
	};

	var div = function(array) {
		var temp = array[0];
		for (var i = 1, len = array.length; i < len; i++) {
			temp = Math.floor(temp / array[i]);
		}
		return temp;	
	};
	
	var isSmall = function(array) {
		if (array[0] < array[1]) {
			return "t";
		} else {
			return "nil";
		}
	};	

	var isLarge = function(array) {
		if (array[0] > array[1]) {
			return "t";
		} else {
			return "nil";
		}
	};	
	
	this.execute = function() {
		for (var i = 0, len = this.arrayOfConsTree.length; 
				i < len; i++) {
			console.log(this.evaluate(this.arrayOfConsTree[i].cdr, null));
		}
	};
	
	this.evaluate = function(cons, funcDef) {
		var array = [];
		switch (cons.type) {
		case "num":
			console.log("type = " + cons.type + ", car = " + cons.car);
			array.push(cons.car);
			if (cons.cdr.type == "tail") {
				return array
			} else {
				return array.concat(this.evaluate(cons.cdr, funcDef));
			}
		case "op":
			switch (cons.car) {
			case "+":
				array.push(add(this.evaluate(cons.cdr, funcDef)));
				return array;
			case "-":
				array.push(sub(this.evaluate(cons.cdr, funcDef)));
				return array;
			case "*":
				array.push(mul(this.evaluate(cons.cdr, funcDef)));
				return array;
			case "/":
				array.push(div(this.evaluate(cons.cdr, funcDef)));
				return array;
			case "<":
				console.log("type = " + cons.car);
				array.push(isSmall(this.evaluate(cons.cdr, funcDef)));
				return array;		
			case ">":
				array.push(isLarge(this.evaluate(cons.cdr, funcDef)));
				return array;	
			case "if":
				console.log("type = " + cons.car);
				var bool = this.evaluate(cons.cdr, funcDef)[0];
				console.log("bool = " + bool);
				if (bool == "t") {
					return this.evaluate(cons.cdr.cdr, funcDef);
				} else {
					return this.evaluate(cons.cdr.cdr.cdr, funcDef);
				}
			}				
		case "head":
			return this.evaluate(cons.cdr, funcDef);
		case "car":
			return this.evaluate(cons.car, funcDef).concat(this.evaluate(cons.cdr, funcDef));
		case "defun":
			var key = cons.cdr.car;	
			this.arrayOfFuncDef[key].consTree = cons.cdr.cdr.cdr.car;			
			array = new Array(key.toUpperCase());
			return array;
		case "func":
			console.log("key = " + cons.car);
			var tempFuncDef = this.arrayOfFuncDef[cons.car];
			//console.log(cons.cdr);
			return this.call(tempFuncDef, this.evaluate(cons.cdr, funcDef));
		case "arg":
			var num = funcDef.arrayOfArgValue[cons.car];
			console.log("num = " + num);
			//var num = 3;
			array.push(num);
			if (cons.cdr.type == "tail") {
				return array
			} else {
				return array.concat(this.evaluate(cons.cdr, funcDef));
			}		
		}
	};
	
	this.call = function(funcDef, argValue) {
		for (var i = 0, len = argValue.length; i < len; i++) {
			var key = funcDef.arrayOfArg[i];
			//console.log("key = " + key);
			funcDef.arrayOfArgValue[key] = argValue[i];	
			//console.log("argValue = " + argValue[i]);
		}
		return this.evaluate(funcDef.consTree, funcDef);
	};
};


var p = new Parser();
p.parse("(defun fib (n) (if (< n 4) 1 4)) (fib 2)");
//p.parse("(defun twice (n) (+ n n))");
//p.parse("(defun fib (n) (if (< n 3) 1 (+ (fib (- n 1)) (fib (- n 2))))) (fib 1)");
//console.log(p.arrayOfParsedString);
p.makeConsTree();
//p.printTree();
p.execute();
//p.printFunc("fib");

   