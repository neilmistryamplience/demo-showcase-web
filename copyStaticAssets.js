var shell = require('shelljs');

shell.cp('-R', 'src/public', 'dist/src');
shell.cp('-R', 'src/views', 'dist/src');