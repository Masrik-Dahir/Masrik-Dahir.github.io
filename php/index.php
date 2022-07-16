<?php session_start(); /* Starts the session */
if(!isset($_SESSION['UserData']['Username'])){
    header("location:login.php");
    exit;
}
?>

</br>
<!DOCTYPE html>
<html>
<body>
<h1>Locker</h1>
<form action="action_page.php" name="submit" method="post">
    <textarea id="confirmationText" class="text" cols="86" rows ="20" name="confirmationText"></textarea>

    <input type="submit" value="Submit" name="submit">
</form>

<form action="upload.php" method="post" enctype="multipart/form-data">
    Select File to Upload:
    <input type="file" name="file">
    <input type="submit" name="submit" value="Upload">
</form>




<br>
<br>
<a href="logout.php">Logout</a>
</body>
</html>