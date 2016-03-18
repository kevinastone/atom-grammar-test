const parserFactory = require('grammar');
const diagram = require('chevrotain/diagrams/src/main.js');


const Parser = parserFactory.default('[Comment]', '[EndComment]').Parser;
const parserInstanceToDraw = new Parser([]);


module.exports = function(targetDiv) {
  diagram.drawDiagramsFromParserInstance(parserInstanceToDraw, targetDiv);
};
