<?php
header('Content-Type: application/json');
$score = intval($_POST['score'] ?? 0);

$descriptorspec = array(
   0 => array("pipe", "r"),
   1 => array("pipe", "w"),
   2 => array("pipe", "w")
);

$cwd = __DIR__;
$env = null;
$process = proc_open('python3 ai.py', $descriptorspec, $pipes, $cwd, $env);

if (is_resource($process)) {
    fwrite($pipes[0], json_encode(["score" => $score]));
    fclose($pipes[0]);

    $output = stream_get_contents($pipes[1]);
    fclose($pipes[1]);

    $err = stream_get_contents($pipes[2]);
    fclose($pipes[2]);

    $return_value = proc_close($process);

    if ($output) {
        echo $output;
    } else {
        echo json_encode(["error" => $err]);
    }
} else {
    echo json_encode(["error" => "proc_open failed"]);
}
