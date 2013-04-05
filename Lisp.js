var Parser = function(str) {
	var Cons = function(type, car, cdr) {
		this.type = type;
		this.car = car;
		this.cdr = cdr;
	};
	
	this.arrayOfString = new Array();
	this.treeOfCons = null;
	this.count = null;
	this.len = null;
	
	var make = function(str) {
		this.count++;
		console.log("count =" + this.count);
		if (this.count >= len) {
			return null;
		}

		var temp;
		var c = str[this.count];
		console.log("c = " + c);
		switch (c) {
		case '+':
		case '-':
		case '*':
		case '/':
			temp = new Cons("op", c, make(str));
			break;
		case '#':
			temp = new Cons("car", make(str), make(str));
			break;
		case '(':
			temp = new Cons("head", c, make(str));
			break;
		case ')':
			temp = new Cons("tail", c, null);
			break;
		default:
			var num = parseInt(c);
			if (num == NaN) {
				temp = new Cons("var", c, make(str));
			} else {
				temp = new Cons("num", num, make(str));
			}
			break;
		}
		return temp;
	};
	
	this.makeConsTree = function() {
		this.len = this.arrayOfString.length;
		this.count = -1;
		console.log("len = " + len);
		this.treeOfCons = new Cons("dummy", 0, make(this.arrayOfString));
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



//var p = new Parser("(+ (* x 2) (- y 234) z)");
var p = new Parser(")");
console.log(p.arrayOfString);
p.makeConsTree();
console.log(p.treeOfCons);

                  
                        

                    


                    
                    
