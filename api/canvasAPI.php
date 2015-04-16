<?php
	// This page contains a variety of Canvas API calls
	require_once 'config.php';

	$tokenHeader = array("Authorization: Bearer ".$apiToken);

	// Display any php errors (for development purposes)
	error_reporting(E_ALL);
	ini_set('display_errors', '1');

	// the following functions run the GET calls
    if (!function_exists('http_parse_headers')) {
        function http_parse_headers($raw_headers) {
            $headers = array();
            $key = '';

            foreach(explode("\n", $raw_headers) as $i => $h) {
                $h = explode(':', $h, 2);

                if (isset($h[1])) {
                    if (!isset($headers[$h[0]]))
                        $headers[$h[0]] = trim($h[1]);
                    elseif (is_array($headers[$h[0]])) {
                        $headers[$h[0]] = array_merge($headers[$h[0]], array(trim($h[1])));
                    }
                    else {
                        $headers[$h[0]] = array_merge(array($headers[$h[0]]), array(trim($h[1])));
                    }

                    $key = $h[0];
                }
                else { 
                    if (substr($h[0], 0, 1) == "\t")
                        $headers[$key] .= "\r\n\t".trim($h[0]);
                    elseif (!$key) 
                        $headers[0] = trim($h[0]); 
                }
            }

            return $headers;
        }
    }
    function curlGet($url) {
        global $token;
        $ch = curl_init($url);
        curl_setopt ($ch, CURLOPT_URL, $GLOBALS['canvasDomain'].'/api/v1/'.$url);
        curl_setopt ($ch, CURLOPT_HTTPHEADER, $GLOBALS['tokenHeader']);
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true); // ask for results to be returned
        curl_setopt($ch, CURLOPT_VERBOSE, 1); //Requires to load headers
        curl_setopt($ch, CURLOPT_HEADER, 1);  //Requires to load headers
        $result = curl_exec($ch);
        // var_dump($result);

        #Parse header information from body response
        $header_size = curl_getinfo($ch, CURLINFO_HEADER_SIZE);
        $header = substr($result, 0, $header_size);
        $body = substr($result, $header_size);
        $data = json_decode($body);
        curl_close($ch);
            
        #Parse Link Information
        $header_info = http_parse_headers($header);
        if(isset($header_info['Link'])){
            $links = explode(',', $header_info['Link']);
            foreach ($links as $value) {
                if (preg_match('/^\s*<(.*?)>;\s*rel="(.*?)"/', $value, $match)) {
                    $links[$match[2]] = $match[1];
                }
            }
        }
        #Check for Pagination
        if(isset($links['next'])){
            // Remove the API url so it is not added again in the get call
            $next_link = str_replace($GLOBALS['canvasDomain'].'/api/v1/', '', $links['next']);
            $next_data = curlGet($next_link);
            $data = array_merge($data,$next_data);
            return $data;
        }else{
            return $data;
        }
    }

	// PAGES
	function getPageFromCourse($courseID, $page_url){
		$apiUrl = "courses/".$courseID."/pages/".$page_url;
		$response = curlGet($apiUrl);
		return $response;
	}

	function getPageBody($courseID, $page_url){
		$page = getPageFromCourse($courseID, $page_url);
		$body = $page->body;
		$bodyContent = urlencode($body);
		return $body;
	}
    function getCoursePages($courseID){
        $apiUrl = "courses/".$courseID."/pages";
        $response = curlGet($apiUrl);
        return $response;
    }
?>