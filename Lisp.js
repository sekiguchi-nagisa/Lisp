var parse = function(str) {
	var temp = "";
	var parsedString = [];
	var arrayOfParsedString = [];
	var flag = 0;
	var headCount = 0;
	var tailCount = 0;
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
				arrayOfParsedString.push(parsedString);
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
	return arrayOfParsedString;
};

var ConsGen = function() {
	this.arrayOfConsTree = [];
	this.arrayOfFuncDef = new Object();
	this.arrayOfVariable = new Object();
	this.arrayOfParsedString = [];
	
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
		var len = arrayOfArg.length;
		var newArgs = [];
		
		for (var i = 0; i < len; i++) {
			newArgs.push(arrayOfArg[i].slice(0));
		}
	
		this.arrayOfArg = newArgs;
		this.arrayOfArgValue = new Object();
		this.consTree = null;
	};
	
	this.makeConsTree = function(arrayOfParsedString) {
		this.arrayOfParsedString = arrayOfParsedString;
		this.arrayOfConsTree = [];
		var consTree;
		for (var i = 0, len = this.arrayOfParsedString.length;
				i < len; i++) {
			this.len = this.arrayOfParsedString[i].length;	
			this.count = -1;
			consTree = this.make(this.arrayOfParsedString[i]);
			this.arrayOfConsTree.push(consTree);	
		}
	};
	
	this.make = function(str) {
		this.count++;
		if (this.count >= this.len) {
			return null;
		}

		var temp = null;
		var c = str[this.count];
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
			temp = this.make(str);
			break;
		case ')':
			if (this.argFlag == 1) {
				this.argFlag = 0;
				var funcDef = new FuncDef(this.arrayOfArg);
				this.arrayOfFuncDef[this.key] = funcDef;
			}
			temp = null;
			break;
		case 'defun':
			this.funcFlag = 1;
			this.key = null;
			this.arrayOfArg = [];
			temp = new Cons("defun", c, this.make(str));
			break;
		case 'setq':
			temp = new Cons("setq", c, this.make(str));
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
						var type = "variable";
						for (var i = 0, len = this.arrayOfArg.length; 
								i < len; i++) {
							if (this.arrayOfArg[i] == c) {
								type = "arg";
								break;
							}
						}
						
						if (type == "variable") {
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
		for (var i = 0, consTreesNum = this.arrayOfConsTree.length; 
				i < consTreesNum; i++) {
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
	
	this.execute = function() {
		for (var i = 0, consTreesNum = this.arrayOfConsTree.length; 
				i < consTreesNum; i++) {
			console.log(this.evaluate(this.arrayOfConsTree[i], null));
		}
	};
	
	this.evaluate = function(cons, funcDef) {
		switch (cons.type) {
		case "num":
			return cons.car;
		case "op":
			switch (cons.car) {
			case "+":
				var ret = this.evaluate(cons.cdr, funcDef);
				var tempCons = cons.cdr;
				do {
					tempCons = tempCons.cdr;
					ret += this.evaluate(tempCons, funcDef);
				} while (tempCons.cdr != null);
				return ret;
			case "-":
				var ret = this.evaluate(cons.cdr, funcDef);
				var tempCons = cons.cdr;
				do {
					tempCons = tempCons.cdr;
					ret -= this.evaluate(tempCons, funcDef);
				} while (tempCons.cdr != null);
				return ret;				
			case "*":
				var ret = this.evaluate(cons.cdr, funcDef);
				var tempCons = cons.cdr;
				do {
					tempCons = tempCons.cdr;
					ret *= this.evaluate(tempCons, funcDef);
				} while (tempCons.cdr != null);
				return ret;
			case "/":
				var ret = this.evaluate(cons.cdr, funcDef);
				var tempCons = cons.cdr;
				do {
					tempCons = tempCons.cdr;
					ret /= this.evaluate(tempCons, funcDef);
				} while (tempCons.cdr != null);
				return ret;
			case "<":
				var ret1 = this.evaluate(cons.cdr, funcDef);
				var ret2 = this.evaluate(cons.cdr.cdr, funcDef);
				
				if (ret1 < ret2) {
					return "t";
				} else {
					return "nil";
				}		
			case ">":
				var ret1 = this.evaluate(cons.cdr, funcDef);
				var ret2 = this.evaluate(cons.cdr.cdr, funcDef);
				
				if (ret1 > ret2) {
					return "t";
				} else {
					return "nil";
				}
			case "if":
				var bool = this.evaluate(cons.cdr, funcDef);
				if (bool == "t") {
					return this.evaluate(cons.cdr.cdr, funcDef);
				} else {
					return this.evaluate(cons.cdr.cdr.cdr, funcDef);
				}
			}				
		case "car":
			return this.evaluate(cons.car, funcDef);
		case "defun":
			var funcKey = cons.cdr.car;	
			this.arrayOfFuncDef[funcKey].consTree = cons.cdr.cdr.cdr.car;			
			return funcKey.toUpperCase();
		case "func":
			var tempFuncDef = new FuncDef(this.arrayOfFuncDef[cons.car].arrayOfArg);
			var argLen = tempFuncDef.arrayOfArg.length;
			var tempCons = cons;
	
			tempFuncDef.consTree = this.arrayOfFuncDef[cons.car].consTree;
			for (var i = 0; i < argLen; i++) {
				var argKey = tempFuncDef.arrayOfArg[i];
				tempCons = tempCons.cdr;
				var arg = this.evaluate(tempCons, funcDef);
				tempFuncDef.arrayOfArgValue[argKey] = arg;
			}
			return this.evaluate(tempFuncDef.consTree, tempFuncDef);
		case "arg":
			var argNum = funcDef.arrayOfArgValue[cons.car];
			return argNum;	
		case "setq":
			var varKey = cons.cdr.car;
			var setqRet = this.evaluate(cons.cdr.cdr, funcDef);
			this.arrayOfVariable[varKey] = setqRet;
			return setqRet;
		case "variable":
			var varNum = this.arrayOfVariable[cons.car];
			return varNum;	
		}
	};
};

var g = new ConsGen();
var args = process.argv;
var len = args.length;

switch (len) {
case 2:
	var readline = require("readline");
	var repl = readline.createInterface(process.stdin, process.stdout);
	//プロンプトの形を設定
	repl.setPrompt(">>> ");

	//プロンプトを出す
	repl.prompt();

	// mainループ
	repl.on("line", function(line) {
		console.log(line); //変数lineにシェルに入力した文字列が入るので、これを解析すれば良い。
		//p.parse("(defun fib (n) (if (< n 3) 1 (+ (fib (- n 1)) (fib (- n 2))))) (fib 36)");
		g.makeConsTree(parse(line));
		//g.printTree();
		g.execute();
		//g.printFunc("fib");
	
		repl.prompt();
	});

	// 終了時に呼ぶ
	repl.on("close", function() {
		console.log("bye!");
	});	
	break;
case 3:
	var fs = require('fs');
	fs.readFile(args[2], 'utf8', function(err, str) {
		if (err) {
			console.log(err);
		} else {
			g.makeConsTree(parse(str));
			g.execute();
		}
	});
	break;
default:
	console.log("invalid argument");
	break;
}

   