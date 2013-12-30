<!doctype html>
<html>
    <head>
        <meta http-equiv="Content-Type" content="text/html; charset=utf-8">
		<meta name="viewport" content="width=device-width,initial-scale=1,user-scalable=no" />
        <title>path</title>
        <script src="../lib/jquery/1.10.2.min.js"></script>
        <script src="../lib/jquery/plugins/blockUI.js"></script>
        <script src="../shared/object.types.js"></script>
        <script src="../shared/event.types.js"></script>
        <script src="../shared/utils.js"></script>
        <script src="../shared/loader.js"></script>
        <script src="global.js"></script>
        <script src="editor.js"></script>
        <style>
            html, body { font-family: Verdana; width: 96%; font-size: 12px; margin: 1%; padding: 0 }
            div { margin-bottom: 10px; }
            input, button { border: 1px solid #000; }
            h2 { font-size: 14px; }
            #viewport { position: relative; float: left; margin-left: 10px; }
            #viewport canvas { position: absolute; border: 1px solid #000; background-color: transparent }
            #objectTypes { clear: left; }
            #eventTypes { clear: left; }
            .mapPanel { display: none; }
        </style>
    </head>
    <body>
        <div style="float: left; height: 600px; width: 450px; overflow: auto;">
            <div>
                w: <input type="text" name="mapWidth" value="" style="width: 30px;" />
                h: <input type="text" name="mapHeight" value="" style="width: 30px;" />
                name: <input type="text" name="mapName" value="" value="" style="width: 60px;" />
                <button name="createMap">create map</button>
            </div>
            <div class="mapPanel">
                <div>
                    <h2>Map</h2>
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
                </div>
                <div>
                    <div id="mouse">Mouse: -</div>
                    <div id="infoObjects">Objects in cell: -</div>
                    <div id="infoEvents">Events in cell: -</div>
                </div>
                <div>
                    <span>Show coords</span>
                    <input type="checkbox" name="showCoords" value="1" />
                    <span>Show count objects: </span>
                    <input type="checkbox" name="showCountObjects" value="1" />
                </div>
                <div>
                    <h2>Map type</h2>
                    <input type="radio" name="mapType" value="collision" />: collision<br />
                    <input type="radio" name="mapType" value="objects" />: objects<br />
                    <input type="radio" name="mapType" value="erase" />: erase<br />
                    <input type="radio" name="mapType" value="events" />: events
                </div>
                <div id="objectTypes">
                    <h2>Object type</h2>
                    <div style="float: left; width: 100%"></div>
                </div>
                <div id="eventTypes">
                    <h2>Event type</h2>
                    <div style="float: left; width: 100%"></div>
                </div>
            </div>
        </div>
		<div id="viewport" class="mapPanel">
		    <canvas id="canvas"></canvas>
		</div>
    </body>
</html>
