#! python
# -*- coding: utf-8 -*-
"""
Installation
	python3 -m pip install psycopg2-binary
	   If it errors try these first
		   python -m pip install -U setuptools
		   python -m pip install -U wheel
		   then try again
References
	https://www.psycopg.org/docs/
	https://pynative.com/psycopg2-python-postgresql-connection-pooling/
"""


#imports
import os
import sys
try:
	import json
	import psycopg2
	import psycopg2.extras
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
# ok=postgresdb.addIndex(**params)
def addIndex(params):
	#check required
	if '-table' not in params:
		return ("postgresdb.addIndex error: No Table Specified")
	if '-fields' not in params:
		return ("postgresdb.addIndex error: No Fields Specified")
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
#	cur_mssql, conn_mssql =  postgresdb.connect(params)
def connect(params):
	dbconfig = {}
	#check params and override any that are passed in
	if 'dbhost' in params:
		dbconfig['host'] = params['dbhost']
	else:
		print("Missing dbhost attribute in database tag named '{}'".format(params['name']))
		sys.exit(123)
		
	if 'dbuser' in params:
		dbconfig['user'] = params['dbuser']

	if 'dbpass' in params:
		dbconfig['password'] = params['dbpass']

	if 'dbname' in params:
		dbconfig['database'] = params['dbname']

	try:
		conn_postgres = psycopg2.connect(**dbconfig)
	except Exception as err:
		common.abort(sys.exc_info(),err)

	try:
		cur_postgres = conn_postgres.cursor(cursor_factory=psycopg2.extras.DictCursor)
	except Exception as err:
		common.abort(sys.exc_info(),err)

	return cur_postgres, conn_postgres
	   
#---------- begin function executeSQL ----------
# @describe executes a query
# @param query str - SQL query to run
# @param params tuple - parameters to override
# @return 
#	boolean
# @usage 
#	ok =  postgresdb.executeSQL(query,params)
def executeSQL(query,params):
	try:
		#connect
		cur_postgres, conn_postgres =  connect(params)
		#now execute the query
		cur_postgres.execute(query)
		conn_postgres.commit()
		return True
	except Exception as err:
		exc_type, exc_obj, exc_tb = sys.exc_info()
		cur_postgres.close()
		conn_postgres.close()
		return common.debug(sys.exc_info(),err)

#---------- begin function convertStr ----------
# @describe convert objects in recordsets to string
# @param o object
# @return 
#   str string
# @usage 
#   str =  postgresdb.convertStr(o)
def convertStr(o):
	return "{}".format(o)

#---------- begin function queryResults ----------
# @describe executes a query and returns list of records
# @param query str - SQL query to run
# @param params tuple - parameters to override
# @return 
#   recordsets list
# @usage 
#   recs =  postgresdb.queryResults(query,params)
def queryResults(query,params):
	try:
		#connect
		cur_postgres, conn_postgres =  connect(params)

		#now execute the query
		cur_postgres.execute(query)
		if 'filename' in params.keys():
			jsv_file=params['filename']
			#get column names
			fields = [field_md[0] for field_md in cur_postgres.description]
			#write file
			f = open(jsv_file, "w")
			f.write(json.dumps(fields,sort_keys=False, ensure_ascii=True, default=convertStr).lower())
			f.write("\n")
			#write records
			for rec in cur_postgres.fetchall():
				f.write(json.dumps(rec,sort_keys=False, ensure_ascii=True, default=convertStr))
				f.write("\n")
			f.close()
			cur_postgres.close()
			conn_postgres.close()
			return params['filename']
		else:
			recs = cur_postgres.fetchall()
			tname=type(recs).__name__
			if tname == 'tuple':
				recs=list(recs)
				cur_postgres.close()
				conn_postgres.close()
				return recs
			elif tname == 'list':
				cur_postgres.close()
				conn_postgres.close()
				return recs
			else:
				cur_postgres.close()
				conn_postgres.close()
				return []
		
	except Exception as err:
		cur_postgres.close()
		conn_postgres.close()
		return common.debug(sys.exc_info(),err)
###########################################
