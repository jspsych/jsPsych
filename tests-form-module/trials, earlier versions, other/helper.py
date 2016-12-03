def pattern(t):
	t = t.lower()
	pattern = 'function Input%s(parent_id, item) {item.type = "%s";InputTexter.call(this, parent_id, item);__INPUT_%s++;}Input%s.prototype = inherit(InputTexter.prototype);'%(t.capitalize(), t.lower(), t.upper(), t.capitalize())
	return pattern

def test(t):
	t = t.lower()
	pattern = 'var t = new Input%s("body1", {display_info: "%s",  value:"", fontcolor:"black", name:"inputbox"});\nt.render()'%(t.capitalize(), t.capitalize())
	return pattern

    
