def commenter(name, parent, args, inherited=True):
	print "/*"
	print "#"*60
	if inherited:
		print "# %s **inherits** %s"%(name, parent)
	print "# %s does the following:\n"%name
	print '''#
# Default settings:
# item.type <-- automatically assigned
# item.id   <-- automatically assigned
# item.needQuestion <-- True
#'''
	print "# @param parent_id --> the id of its parent element\n# @param item --> a set of values for setting"
	for i in args.split('.'):
		print "# @param item.%s -->"%i 
	print "#"*60
	print "# @return\n#"
	print "#"*60
	print "*/"