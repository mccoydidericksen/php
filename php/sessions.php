<?php
/* 	Functions to handle our own sessions so that multiple request from the same session are not waiting on each other.
	Since we use sessions a lot, this makes sense.

	Reference: http://www.tuxradar.com/practicalphp/10/3/7
	CREATE TABLE sessions (
		session_id CHAR(40) NOT NULL UNIQUE,
		session_data TEXT NOT NULL DEFAULT '',
		touchtime INT
	);
*/
$progpath=dirname(__FILE__);
//requires common,config, and database to be loaded first
if(!isDBTable('_sessions')){
	include_once("{$progpath}/schema.php");
	include_once("{$progpath}/user.php");
	if(!isDBTable('_fielddata')){
		$ok=createWasqlTables();
	}
	$ok=createWasqlTable('_sessions');
}
global $CONFIG;
if(isset($CONFIG['database_sessions']) && $CONFIG['database_sessions']==1){
	session_set_save_handler('sessionOpen', 'sessionClose', 'sessionRead', 'sessionWrite', 'sessionDestroy', 'sessionGarbageCollect');
}
//Start the session but turn off session headers
//session_cache_limiter('');
//session_domain?
if(isset($CONFIG['session_domain'])){
	ini_set("session.cookie_domain", ".{$CONFIG['session_domain']}");
}
//start the session
@session_start();
/**
 * @author slloyd
 * @exclude  - this function is for internal use only and thus excluded from the manual
 */
function sessionOpen($sess_path, $sess_name) {
	return true;
}
/**
 * @author slloyd
 * @exclude  - this function is for internal use only and thus excluded from the manual
 */
function sessionClose() {
    return true;
}
/**
 * @author slloyd
 * @exclude  - this function is for internal use only and thus excluded from the manual
 * sessionRead
 *   The read callback must always return a session encoded (serialized) string, or an empty string if there is no data to read.
 *  This callback is called internally by PHP when the session starts or when session_start() is called. Before this callback is invoked PHP will invoke the open callback.
 *   The value this callback returns must be in exactly the same serialized format that was originally passed for storage to the write callback.
 *	The value returned will be unserialized automatically by PHP and used to populate the $_SESSION superglobal.
 *	While the data looks similar to serialize() please note it is a different format which is speficied in the session.serialize_handler ini setting.
*/
function sessionRead($session_id) {
	global $USER;
	$rec=getDBRecord(array('-query'=>"SELECT _id,session_id,session_data,json FROM _sessions WHERE session_id = '{$session_id}';"));
	//$ctime = time();
	if(isset($rec['session_data'])){
		//custom decode if session is stored in JSON
		$_SESSION=json_decode($rec['session_data'],true);
		//update touchtime
		executeSQL("UPDATE _sessions SET touchtime = UNIX_TIMESTAMP(now()) WHERE session_id = '{$session_id}';");
		return $rec['session_data'];
	}
	//no session found  - add a blank record
	$cuser=(integer)$CUSER['_id'];
	$ok=executeSQL("INSERT IGNORE INTO _sessions (_cuser,_cdate,session_id,touchtime,json) VALUES ('{$cuser}',now(),'{$session_id}', UNIX_TIMESTAMP(now()),1);");
	return '';
}
/**
 * @author slloyd
 * @exclude  - this function is for internal use only and thus excluded from the manual
 * sessionWrite
 *	The write callback is called when the session needs to be saved and closed.
 *	This callback receives the current session ID a serialized version the $_SESSION superglobal.
 *	The serialization method used internally by PHP is specified in the session.serialize_handler ini setting.
 *	The serialized session data passed to this callback should be stored against the passed session ID.
 *	When retrieving this data, the read callback must return the exact value that was originally passed to the write callback.
 *	This callback is invoked when PHP shuts down or explicitly when session_write_close() is called.
 *	Note that after executing this function PHP will internally execute the close callback.
*/
function sessionWrite($session_id, $session_data) {
	//decode the data and then store it as json instead so other programs can also share the session data
	@session_decode($session_data);
	$session_data = json_encode($_SESSION);
	if(preg_match('/minify\_(css|js)/',$_SERVER['PHP_SELF'])){return true;}
	//$ctime = time();
	$session_data=databaseEscapeString($session_data);
	$query="UPDATE _sessions SET session_data = '{$session_data}', touchtime = UNIX_TIMESTAMP(now()), json=1 WHERE session_id = '{$session_id}';";
	executeSQL($query);
	return true;
}
/**
 * @author slloyd
 * @exclude  - this function is for internal use only and thus excluded from the manual
 */
function sessionDestroy($session_id) {
	if(preg_match('/minify\_(css|js)/',$_SERVER['PHP_SELF'])){return true;}
    executeSQL("DELETE FROM _sessions WHERE session_id = '{$session_id}';");
    return true;
}
/**
 * @author slloyd
 * @exclude  - this function is for internal use only and thus excluded from the manual
 * sessionGarbageCollect
 *	The garbage collector callback is invoked internally by PHP periodically in order to purge old session data.
 *	The frequency is controlled by session.gc_probability and session.gc_divisor.
 *	The value of lifetime which is passed to this callback can be set in session.gc_maxlifetime.
 *	Return value should be TRUE for success, FALSE for failure.
*/
function sessionGarbageCollect($sess_maxlifetime) {
    //$ctime = time();
    executeSQL("DELETE FROM _sessions WHERE touchtime + {$sess_maxlifetime} < UNIX_TIMESTAMP(now());");
    return true;
}