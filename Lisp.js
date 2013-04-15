function parse(expr) {
	var tokenBuf = "";
	var tokenList = [];
	var arrayOfTokenList = [];
	var headCount = 0;
	var tailCount = 0;
	for (var i = 0, len = expr.length; i < len; i++) {
		var c = expr.charAt(i);
		switch (c) {
		case '(':
			if (tokenBuf.length != 0) {
				tokenList.push(tokenBuf);
				tokenBuf = "";
			}
			
			headCount++;
			tokenList.push(c);
			break;
		case ')':
			if (tokenBuf.length != 0) {
				tokenList.push(tokenBuf);
				tokenBuf = "";
			}
			
			tokenList.push(c);
			
			tailCount++;
			if (headCount == tailCount) {
				headCount = 0;
				tailCount = 0;
				arrayOfTokenList.push(tokenList);
				tokenList = [];
			}
			break;
		case ' ':
		case '\t':
		case '\n':
			if (tokenBuf.length != 0) {
				tokenList.push(tokenBuf);
				tokenBuf = "";
			}
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

var Env = function() {
	this.varMap = new Object();
	this.funcInfoMap = new Object();
};

var FuncInfo= function(arrayOfArg) {
	var len = arrayOfArg.length;
	var newArgs = [];
		
	for (var i = 0; i < len; i++) {
		newArgs.push(arrayOfArg[i].slice(0));
	}
	
	this.arrayOfArg = newArgs;
	this.arrayOfArgValue = new Object();
	this.consTree = null;
};

function genCons(arrayOfTokenList, env) {
	var arrayOfConsTree = [];
	var tokenListLen = 0;
	var tokenCount = -1;
	var funcFlag = 0;
	var argFlag = 0;
	var key = null;
	var arrayOfArg = [];
	
	function makeConsTree(tokenList) {
		tokenCount++;
		if (tokenCount >= tokenListLen) {
			return null;
		}

		var newCons = null;
		var token = tokenList[tokenCount];
		switch (token) {
		case '+':
		case '-':
		case '*':
		case '/':
		case '<':
		case '>':
		case '<=':
		case '>=':
		case 'if':
			newCons = new Cons("op", token, makeConsTree(tokenList));
			return newCons;
		case '(':
			newCons = new Cons("car", makeConsTree(tokenList), makeConsTree(tokenList));	
			return newCons;
		case ')':
			if (argFlag == 1) {
				argFlag = 0;
				var funcInfo = new FuncInfo(arrayOfArg);
				env.funcInfoMap[key] = funcInfo;
			}
			newCons = null;
			return newCons;
		case 'defun':
			funcFlag = 1;
			key = null;
			arrayOfArg = [];
			newCons = new Cons("defun", token, makeConsTree(tokenList));
			return newCons;
		case 'setq':
			newCons = new Cons("setq", token, makeConsTree(tokenList));
			return newCons;
		default:
			var num = parseInt(token);
			if (!isNaN(num)) {
				newCons = new Cons("num", num, makeConsTree(tokenList));
				return newCons;
			}
			
			if (funcFlag == 1) {
				funcFlag = 0;
				argFlag = 1;
				key = token;
				newCons = new Cons("func", token, makeConsTree(tokenList));
				return newCons;
			} 
				
			if (argFlag == 1) {
				arrayOfArg.push(token);
				newCons = new Cons("arg", token, makeConsTree(tokenList));
				return newCons;
			} 
				
			var type = "variable";
			for (var i = 0, len = arrayOfArg.length; 
					i < len; i++) {
				if (arrayOfArg[i] == token) {
					type = "arg";
					newCons = new Cons(type, token, makeConsTree(tokenList));	
					return newCons;
				}
			}
						
			if (type == "variable") {
				var value = env.funcInfoMap[token];
				if (typeof(value) === "undefined") {
				} else {
					type = "func";
				}
			}
			newCons = new Cons(type, token, makeConsTree(tokenList));	
			return newCons;
		}
	};
	
	for (var i = 0, len = arrayOfTokenList.length;
				i < len; i++) {
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
		case "num":
			return cons.car;
		case "op":
			switch (cons.car) {
			case "+":
				var ret = evaluate(cons.cdr, funcInfo);
				var tempCons = cons.cdr;
				do {
					tempCons = tempCons.cdr;
					ret += evaluate(tempCons, funcInfo);
				} while (tempCons.cdr != null);
				return ret;
			case "-":
				var ret = evaluate(cons.cdr, funcInfo);
				var tempCons = cons.cdr;
				do {
					tempCons = tempCons.cdr;
					ret -= evaluate(tempCons, funcInfo);
				} while (tempCons.cdr != null);
				return ret;				
			case "*":
				var ret = evaluate(cons.cdr, funcInfo);
				var tempCons = cons.cdr;
				do {
					tempCons = tempCons.cdr;
					ret *= evaluate(tempCons, funcInfo);
				} while (tempCons.cdr != null);
				return ret;
			case "/":
				var ret = evaluate(cons.cdr, funcInfo);
				var tempCons = cons.cdr;
				do {
					tempCons = tempCons.cdr;
					ret /= evaluate(tempCons, funcInfo);
				} while (tempCons.cdr != null);
				return ret;
			case "<":
				var ret1 = evaluate(cons.cdr, funcInfo);
				var ret2 = evaluate(cons.cdr.cdr, funcInfo);		
				return ret1 < ret2 ? "t" : "nil";
			case ">":
				var ret1 = evaluate(cons.cdr, funcInfo);
				var ret2 = evaluate(cons.cdr.cdr, funcInfo);
				return ret1 > ret2 ? "t" : "nil";
			case "<=":
				var ret1 = evaluate(cons.cdr, funcInfo);
				var ret2 = evaluate(cons.cdr.cdr, funcInfo);
				return ret1 <= ret2 ? "t" : "nil";
			case ">=":
				var ret1 = evaluate(cons.cdr, funcInfo);
				var ret2 = evaluate(cons.cdr.cdr, funcInfo);
				return ret1 >= ret2 ? "t" : "nil";
			case "if":
				var bool = evaluate(cons.cdr, funcInfo);
				if (bool == "t") {
					return evaluate(cons.cdr.cdr, funcInfo);
				} else {
					return evaluate(cons.cdr.cdr.cdr, funcInfo);
				}
			}				
		case "car":
			return evaluate(cons.car, funcInfo);
		case "defun":
			var funcKey = cons.cdr.car;	
			env.funcInfoMap[funcKey].consTree = cons.cdr.cdr.cdr;			
			return funcKey.toUpperCase();
		case "func":
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
		case "arg":
			return funcInfo.arrayOfArgValue[cons.car];
		case "setq":
			var varKey = cons.cdr.car;
			var setqRet = evaluate(cons.cdr.cdr, funcInfo);
			env.varMap[varKey] = setqRet;
			return setqRet;
		case "variable":
			return env.varMap[cons.car];	
		}
	};
	
	for (var i = 0, consTreesNum = arrayOfConsTree.length; 
			i < consTreesNum; i++) {
		console.log(evaluate(arrayOfConsTree[i].car, null));
	}
}

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

   