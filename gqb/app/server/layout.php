<?php

/**
 * Gets the layout information over the post request and stores the information
 * in the file graph.json. Creates the file, if the file does not exsists.
 */

$maxFileSize = 1024 * 512; // file size in bytes
$file = '../data/graph.json';

if (!is_writable($file)) {
  echo 'File ' . $file . ' is not writable! <br>';
}

$json = $HTTP_RAW_POST_DATA;
$fh = fopen($file, 'w') or die('can not open file: ' + $file);
fwrite($fh, $json, $maxFileSize);
fclose($fh);

?>