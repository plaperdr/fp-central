/**
 * This script is used to detect the "Medium-High" security level
 * of the Tor browser. It should be loaded through HTTP and not HTTPS.
 * By default, the "Medium-High" security level will automatically
 * block this script and the "blockHttp" variable will not be defined.
 */
var blockHTTP = false;