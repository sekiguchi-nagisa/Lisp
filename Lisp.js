function parse(expr) {
	var tokenBuf = "";
	var tokenList = [];
	var arrayOfTokenList = [];
	var headCount = 0;
	var tailCount = 0;
	
	function bufferFlush() {
		if (tokenBuf.length != 0) {
			tokenList.push(tokenBuf);
			tokenBuf = "";
		}
	};
	
	for (var i = 0, len = expr.length; i < len; i++) {
		var c = expr.charAt(i);
		switch (c) {
		case '(':
			bufferFlush();
			headCount++;
			tokenList.push(c);
			break;
		case ')':
			bufferFlush();
			tokenList.push(c);		
			tailCount++;
			if (headCount == tailCount) {
				headCount = tailCount = 0;
				arrayOfTokenList.push(tokenList);
				tokenList = [];
			}
			break;
		case ' ':
		case '\t':
		case '\n':
			bufferFlush();
			break;
		default:
			tokenBuf = tokenBuf.concat(c);
			break;
		}
	}
	return arrayOfTokenList;
};

var Cons = function(type, car, cdr) {
	this.type = type;
	this.car = car;
	this.cdr = cdr;
};

var FuncInfo= function(arrayOfArg) {
	var newArgs = [];	
	for (var i = 0, len = arrayOfArg.length; i < len; i++) {
		newArgs.push(arrayOfArg[i].slice(0));
	}
	
	this.arrayOfArg = newArgs;
	this.arrayOfArgValue = new Object();
	this.consTree = null;
};

var Env = function() {
	this.varMap = new Object();
	this.funcInfoMap = new Object();
	
	function print(cons) {
		console.log("{ type: " + cons.type + ", car: " + 
				cons.car + ", cdr: " + typeof(cons.cdr) + " }");
		if (cons.type == "car") {
			print(cons.car);
		}
		if (cons.cdr != null) {
			print(cons.cdr);
		}
	};
	
	this.printTree = function(arrayOfConsTree) {
		console.log("printTree()");
		for (var i = 0, len = arrayOfConsTree.length; i < len; i++) {
			print(arrayOfConsTree[i]);	
			console.log("");
		}
	};
	
	this.printFunc = function(key, env) {
		console.log("printFunc()");
		print(env.funcInfoMap[key].consTree);
	};
};

function genCons(arrayOfTokenList, env) {
	var arrayOfConsTree = [];
	var tokenListLen = 0;
	var tokenCount = -1;
	var isFunc = 0;
	var isArg = 0;
	var key = null;
	var arrayOfArg = [];
	
	var ConsType = {
		ADD: 	0,
		SUB: 	1,
		MUL: 	2,
		DIV: 	3,
		LT:  	4,
		GT:  	5,
		LTEQ:	6,
		GTEQ:	7,
		IF:		8,
		NUM:	9,
		CAR:	10,
		DEFUN:	11,
		FUNC:	12,
		ARG:	13,
		SETQ:	14,
		VAR:	15, 
	};
	
	function makeConsTree(tokenList) {
		tokenCount++;
		if (tokenCount >= tokenListLen) {
			return null;
		}

		//var consType = ConsType();
		var newCons = null;
		var token = tokenList[tokenCount];
		switch (token) {
		case '+':
			newCons = new Cons(ConsType.ADD, token, makeConsTree(tokenList));
			return newCons;
		case '-':
			newCons = new Cons(ConsType.SUB, token, makeConsTree(tokenList));
			return newCons;
		case '*':
			newCons = new Cons(ConsType.MUL, token, makeConsTree(tokenList));
			return newCons;
		case '/':
			newCons = new Cons(ConsType.DIV, token, makeConsTree(tokenList));
			return newCons;
		case '<':
			newCons = new Cons(ConsType.LT, token, makeConsTree(tokenList));
			return newCons;
		case '>':
			newCons = new Cons(ConsType.GT, token, makeConsTree(tokenList));
			return newCons;
		case '<=':
			newCons = new Cons(ConsType.LTEQ, token, makeConsTree(tokenList));
			return newCons;
		case '>=':
			newCons = new Cons(ConsType.GTEQ, token, makeConsTree(tokenList));
			return newCons;
		case 'if':
			newCons = new Cons(ConsType.IF, token, makeConsTree(tokenList));
			return newCons;
		case '(':
			newCons = new Cons(ConsType.CAR, makeConsTree(tokenList), makeConsTree(tokenList));	
			return newCons;
		case ')':
			if (isArg == 1) {
				isArg = 0;
				var funcInfo = new FuncInfo(arrayOfArg);
				env.funcInfoMap[key] = funcInfo;
			}
			newCons = null;
			return newCons;
		case 'defun':
			isFunc = 1;
			key = null;
			arrayOfArg = [];
			newCons = new Cons(ConsType.DEFUN, token, makeConsTree(tokenList));
			return newCons;
		case 'setq':
			newCons = new Cons(ConsType.SETQ, token, makeConsTree(tokenList));
			return newCons;
		default:
			var num = parseInt(token);
			if (!isNaN(num)) {
				newCons = new Cons(ConsType.NUM, num, makeConsTree(tokenList));
				return newCons;
			}
			
			if (isFunc == 1) {
				isFunc = 0;
				isArg = 1;
				key = token;
				newCons = new Cons(ConsType.FUNC, token, makeConsTree(tokenList));
				return newCons;
			} 
				
			if (isArg == 1) {
				arrayOfArg.push(token);
				newCons = new Cons(ConsType.ARG, token, makeConsTree(tokenList));
				return newCons;
			} 
				
			var type = ConsType.VAR;
			for (var i = 0, len = arrayOfArg.length; i < len; i++) {
				if (arrayOfArg[i] == token) {
					type = ConsType.ARG;
					newCons = new Cons(type, token, makeConsTree(tokenList));	
					return newCons;
				}
			}
						
			if (type == ConsType.VAR) {
				var value = env.funcInfoMap[token];
				if (typeof(value) === "undefined") {
				} else {
					type = ConsType.FUNC;
				}
			}
			newCons = new Cons(type, token, makeConsTree(tokenList));	
			return newCons;
		}
	};
	
	for (var i = 0, len = arrayOfTokenList.length; i < len; i++) {
		tokenListLen= arrayOfTokenList[i].length;	
		tokenCount = -1;
		var consTree = makeConsTree(arrayOfTokenList[i]);
		arrayOfConsTree.push(consTree);	
	}
	return arrayOfConsTree;
};
	
function execute(arrayOfConsTree, env) {	
	function evaluate(cons, funcInfo) {
		switch (cons.type) {
		case 0:	//ADD
			var ret = evaluate(cons.cdr, funcInfo);
			var tempCons = cons.cdr;
			do {
				tempCons = tempCons.cdr;
				ret += evaluate(tempCons, funcInfo);
			} while (tempCons.cdr != null);
			return ret;
		case 1:	//SUB
			var ret = evaluate(cons.cdr, funcInfo);
			var tempCons = cons.cdr;
			do {
				tempCons = tempCons.cdr;
				ret -= evaluate(tempCons, funcInfo);
			} while (tempCons.cdr != null);
			return ret;				
		case 2:	//MUL
			var ret = evaluate(cons.cdr, funcInfo);
			var tempCons = cons.cdr;
			do {
				tempCons = tempCons.cdr;
				ret *= evaluate(tempCons, funcInfo);
			} while (tempCons.cdr != null);
			return ret;
		case 3:	//DIV
			var ret = evaluate(cons.cdr, funcInfo);
			var tempCons = cons.cdr;
			do {
				tempCons = tempCons.cdr;
				ret /= evaluate(tempCons, funcInfo);
			} while (tempCons.cdr != null);
			return ret;
		case 4:	//LT
			var ret1 = evaluate(cons.cdr, funcInfo);
			var ret2 = evaluate(cons.cdr.cdr, funcInfo);		
			return ret1 < ret2 ? "t" : "nil";
		case 5:	//GT
			var ret1 = evaluate(cons.cdr, funcInfo);
			var ret2 = evaluate(cons.cdr.cdr, funcInfo);
			return ret1 > ret2 ? "t" : "nil";
		case 6:	//LTEQ
			var ret1 = evaluate(cons.cdr, funcInfo);
			var ret2 = evaluate(cons.cdr.cdr, funcInfo);
			return ret1 <= ret2 ? "t" : "nil";
		case 7:	//GTEQ
			var ret1 = evaluate(cons.cdr, funcInfo);
			var ret2 = evaluate(cons.cdr.cdr, funcInfo);
			return ret1 >= ret2 ? "t" : "nil";
		case 8:	//IF
			var bool = evaluate(cons.cdr, funcInfo);
			if (bool == "t") {
				return evaluate(cons.cdr.cdr, funcInfo);
			} else {
				return evaluate(cons.cdr.cdr.cdr, funcInfo);
			}
		case 9:	//NUM
			return cons.car;			
		case 10:	//CAR
			return evaluate(cons.car, funcInfo);
		case 11:	//DEFUN
			var funcKey = cons.cdr.car;	
			env.funcInfoMap[funcKey].consTree = cons.cdr.cdr.cdr;			
			return funcKey.toUpperCase();
		case 12:	//FUNC
			var tempfuncInfo = new FuncInfo(env.funcInfoMap[cons.car].arrayOfArg);
			var argLen = tempfuncInfo.arrayOfArg.length;
			var tempCons = cons;
	
			tempfuncInfo.consTree = env.funcInfoMap[cons.car].consTree;
			for (var i = 0; i < argLen; i++) {
				var argKey = tempfuncInfo.arrayOfArg[i];
				tempCons = tempCons.cdr;
				var arg = evaluate(tempCons, funcInfo);
				tempfuncInfo.arrayOfArgValue[argKey] = arg;
			}
			return evaluate(tempfuncInfo.consTree, tempfuncInfo);
		case 13:	//ARG
			return funcInfo.arrayOfArgValue[cons.car];
		case 14:	//SETQ
			var varKey = cons.cdr.car;
			var setqRet = evaluate(cons.cdr.cdr, funcInfo);
			env.varMap[varKey] = setqRet;
			return setqRet;
		case 15:	//VAR
			return env.varMap[cons.car];	
		}
	};
	
	for (var i = 0, len = arrayOfConsTree.length; i < len; i++) {
		console.log(evaluate(arrayOfConsTree[i].car, null));
	}
};

var env = new Env();
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
		//(defun fib (n) (if (< n 3) 1 (+ (fib (- n 1)) (fib (- n 2))))) (fib 36)
		//(defun tak(x y z) (if (<= x y) y (tak (tak (- x 1) y z) (tak (- y 1) z x) (tak (- z 1) x y)))) (tak 12 6 0)
		var p = parse(line);
		var consTree = genCons(p, env);
		execute(consTree, env);
	
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
			execute(genCons(parse(str), env), env);
		}
	});
	break;
default:
	console.log("invalid argument");
	break;
}

   