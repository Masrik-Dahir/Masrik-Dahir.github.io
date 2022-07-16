<?php
$timezone = date_default_timezone_get();
$date = date('m.d.Y.h.i.s.a', time());

if(isset($_POST['submit'])){
    $firstName = "Text:".$_POST['confirmationText']."
";
    $file=fopen("uploads/$date.txt", "a");
    fwrite($file, $firstName);
    fclose($file);
}
?>