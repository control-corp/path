<!doctype html>
<html>
    <head>
        <meta http-equiv="Content-Type" content="text/html; charset=utf-8">
		<meta name="viewport" content="width=device-width,initial-scale=1,user-scalable=no" />
        <title>path</title>
        <script src="//code.jquery.com/jquery-1.10.2.min.js"></script>
        <script src="game/utils.js"></script>
        <script src="game/astar.js"></script>
        <script src="game/map.js"></script>
        <script src="game/player.js"></script>
        <script src="game/input.js"></script>
        <script src="game/switcher.js"></script>
        <script src="game/state/play.js"></script>
        <script src="game/main.js"></script>
        <style>
            html, body { margin: 5px; padding: 0 }
            canvas {cursor: pointer; border: 1px solid #000; background-color: #000; }
            #debug {}
        </style>
    </head>
    <body>
		<canvas id="canvas" width="320" height="320"></canvas>
		<div id="debug"></div>
		<div id="debug2"></div>
    </body>
</html>
