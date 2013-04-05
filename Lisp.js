var Parser = function(str) {
	var Cons = function(type, car, cdr) {
		this.type = type;
		this.car = car;
		this.cdr = cdr;
	};
	
	this.arrayOfString = new Array();
	this.treeOfCons = new Cons();
	
	
	this.makeConsTree = function() {
		var len = this.arrayOfString;
		var temp;

		var make = function(index, len) {
			var c = this.arrayOfString[index];
			switch (c) {
			case '+':
			case '-':
			case '*':
			case '/':
				temp = new Cons("op", c, make(index + 1, len));
				break;
			case '(':
				temp = new Cons("head", 0, 0);
				break;
			case ')':
				temp = new Cons("tail", 0, 0);
				break;
			default:
				var num = parseInt(c);
				if (num == NaN) {
					temp = new Cons("var", c, 0);
				} else {
					temp = new Cons("num", num, 0);
				}
			}
		};
	};
	
	var len = str.length;
	var temp = "";
	for (var i = 0; i < len; i++) {
		var c = str.charAt(i);
		switch (c) {
		case '(':
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



var p = new Parser("(+ (* x 2) (- y 234) z)");
console.log(p.arrayOfString);

                  
                        

                    


                    
                    
