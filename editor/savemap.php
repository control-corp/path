<?php

if ($_SERVER['REQUEST_METHOD'] === 'POST')
{
    if (isset($_POST['op'])) {
        switch ($_POST['op']) {
            case 'update' :
                file_put_contents('../game/maps/' . $_POST['map'], $_POST['data']);
                break;
            case 'create' :
                file_put_contents('../game/maps/' . $_POST['map'], $_POST['data']);
                break;
            case 'delete' :
                unlink('../game/maps/' . $_POST['map']);
                break;
        }
    }
}