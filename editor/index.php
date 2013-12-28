<!doctype html>
<html>
    <head>
        <meta http-equiv="Content-Type" content="text/html; charset=utf-8">
		<meta name="viewport" content="width=device-width,initial-scale=1,user-scalable=no" />
        <title>path</title>
        <script src="//code.jquery.com/jquery-1.10.2.min.js"></script>
        <script src="editor.js"></script>
        <style>
            html, body { font-size: 12px; margin: 5px; padding: 0 }
            #canvas { border: 1px solid #000; }
        </style>
    </head>
    <body>
        <div style="margin-bottom: 10px;">
            Width: <input type="text" name="mapWidth" value="" style="width: 30px;" />
            Height: <input type="text" name="mapHeight" value="" style="width: 30px;" />
            Name: <input type="text" name="mapName" value="" />
            <button name="createMap">create map</button>
        </div>
        <div style="margin-bottom: 10px;">
            Map:
            <select name="map">
            <?php
                $files = glob('../game/maps/*.json');
                foreach ($files as $file) :
                    $name = explode('/', $file);
                    $name = end($name);
                    $map  = json_decode(file_get_contents($file));
                    echo "<option value=\"{$name}\">{$name} ({$map->w}x{$map->h})</option>";
                endforeach;
            ?>
            </select>
            <button name="save">save</button>
            <button name="clear">clear</button>
            <button name="delete">delete</button>
            Cell type:
            Obstacle: <input type="radio" name="cellType" value="1" checked="checked" />
            Portal: <input type="radio" name="cellType" value="2" />
        </div>
		<canvas id="canvas"></canvas>
    </body>
</html>
