#! python
"""
Installation
	python -m pip install --upgrade snowflake-connector-python
	   If it fails then go to https://visualstudio.microsoft.com/visual-cpp-build-tools/
		   download build tools
		   install c++ build tools
		   reboot and try again
	python -m pip install snowflake-sqlalchemy

"""

#imports
import os
import sys
try:
	import json
	import snowflake.connector as sfc
	from sqlalchemy import create_engine
	import config
	import common
except Exception as err:
	exc_type, exc_obj, exc_tb = sys.exc_info()
	fname = os.path.split(exc_tb.tb_frame.f_code.co_filename)[1]
	print("Import Error: {}. ExeptionType: {}, Filename: {}, Linenumber: {}".format(err,exc_type,fname,exc_tb.tb_lineno))
	sys.exit(3)

#---------- begin function addIndex ----------
# @describe returns a dictionary of records returned from query
# @param params dictionary - params
# -table table
# -fields field(s) to add to index
# [-unique]
# [-fulltext]
# [-name] str - specific name for index
# @return 
#	boolean
# @usage
# params={
# 	'-table':'states',
# 	'-fields':'code'   
# }  
# ok=snowflakedb.addIndex(**params)
def addIndex(params):
	#check required
	if '-table' not in params:
		return ("mysqldb.addIndex error: No Table Specified")
	if '-fields' not in params:
		return ("mysqldb.addIndex error: No Fields Specified")
	#check for unique and fulltext
	fulltext = ''
	unique = ''
	prefix = ''
	if '-unique' in params:
		unique =' UNIQUE'
		prefix += 'U'
	if '-fulltext' in params:
		fulltext =' FULLTEXT'
		prefix += 'F'
	#build index name if not passed in
	if '-name' not in params:
		params['-name']="{}_{}_".format(prefix,params['-table']);
	#create query
	fieldstr = params['-fields'].replace(',','_')
	query="CREATE {} INDEX IF NOT EXISTS {} on {} ({})".format(unique,params['-name'],params['-table'],fieldstr);
	#execute query
	return executeSQL(query) 

#---------- begin function connect ----------
# @describe returns a database connection
# @param params tuple - parameters to override
# @return 
#	cur_mssql, conn_mssql array
# @usage 
#	cur_mssql, conn_mssql =  snowflakedb.connect(params)
def connect(params):
	dbconfig = {}
	#need account,user,password,database,schema,warehouse,role

	#check config.CONFIG
	
	#check params and override any that are passed in
	if 'dbaccount' in params:
		dbconfig['account'] = params['dbaccount'].replace(".snowflakecomputing.com","",1)
	elif 'dbhost' in params:
		dbconfig['account'] = params['dbhost'].replace(".snowflakecomputing.com","",1)
	else:
		print("Missing dbhost or dbaccount attribute in database tag named '{}'".format(params['name']))
		sys.exit(123)

	if 'dbuser' in params:
		dbconfig['user'] = params['dbuser']

	if 'dbpass' in params:
		dbconfig['password'] = params['dbpass']

	if 'dbname' in params:
		dbconfig['database'] = params['dbname']

	if 'dbschema' in params:
		dbconfig['schema'] = params['dbschema']

	if 'dbwarehouse' in params:
		dbconfig['warehouse'] = params['dbwarehouse']

	if 'dbrole' in params:
		dbconfig['role'] = params['dbrole']

	try:
		conn_snowflake = sfc.connect(**dbconfig)
	except Exception as err:
		common.abort(sys.exc_info(),err)

	try:
		cur_snowflake = conn_snowflake.cursor()
	except Exception as err:
		common.abort(sys.exc_info(),err)

	return cur_snowflake, conn_snowflake

#---------- begin function executeSQL ----------
# @describe executes a query
# @param query str - SQL query to run
# @param params tuple - parameters to override
# @return 
#	boolean
# @usage 
#	ok =  snowflakedb.executeSQL(query,params)
def executeSQL(query,params):
	try:
		#connect
		cur_snowflake, conn_snowflake =  connect(params)
		#now execute the query
		cur_snowflake.execute(query)
		conn_snowflake.commit()
		return True
		
	except Exception as err:
		cur_snowflake.close()
		conn_snowflake.close()
		return common.debug(sys.exc_info(),err)

#---------- begin function convertStr ----------
# @describe convert objects in recordsets to string
# @param o object
# @return 
#   str string
# @usage 
#   str =  snowflakedb.convertStr(o)
def convertStr(o):
	return "{}".format(o)

#---------- begin function queryResults ----------
# @describe executes a query and returns list of records
# @param query str - SQL query to run
# @param params tuple - parameters to override
# @return 
#   recordsets list
# @usage 
#   recs =  snowflakedb.queryResults(query,params)
def queryResults(query,params):
	try:
		#connect
		cur_snowflake, conn_snowflake =  connect(params)

		#now execute the query
		cur_snowflake.execute(query)
		if 'filename' in params.keys():
			jsv_file=params['filename']
			#get column names
			fields = [field_md[0] for field_md in cur_snowflake.description]
			#write file
			f = open(jsv_file, "w")
			f.write(json.dumps(fields,sort_keys=False, ensure_ascii=True, default=convertStr).lower())
			f.write("\n")
			#write records
			for rec in cur_snowflake.fetchall():
				#convert to a dictionary manually since it is not built into the driver
				rec=dict(zip(fields, rec))
				f.write(json.dumps(rec,sort_keys=False, ensure_ascii=True, default=convertStr))
				f.write("\n")
			f.close()
			cur_snowflake.close()
			conn_snowflake.close()
			return params['filename']
		else:
			recs = cur_snowflake.fetchall()
			tname=type(recs).__name__
			if tname == 'tuple':
				recs=list(recs)
				cur_snowflake.close()
				conn_snowflake.close()
				return recs
			elif tname == 'list':
				cur_snowflake.close()
				conn_snowflake.close()
				return recs
			else:
				cur_snowflake.close()
				conn_snowflake.close()
				return []
		
	except Exception as err:
		cur_snowflake.close()
		conn_snowflake.close()
		return common.debug(sys.exc_info(),err)
###########################################
