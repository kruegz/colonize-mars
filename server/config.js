const path = require('path');

module.exports = {
    ip: process.env.IP || 'http://localhost',
	port: process.env.PORT || 3000,
	publicDir: path.join(__dirname,'../public'),
	game: {
		start: { x: 0, y: 0, angle: 0}
	}
}
