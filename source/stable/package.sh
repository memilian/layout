#!/bin/bash

cat jquery.layout.js plugins/jquery.layout.state.js plugins/jquery.layout.buttons.js \
	plugins/jquery.layout.browserZoom.js plugins/jquery.layout.slideOffscreen.js \
	plugins/jquery.layout.touch.js \
	> jquery.layout_and_plugins.js

uglify -s jquery.layout_and_plugins.js -o jquery.layout_and_plugins.min.js

echo "Done"