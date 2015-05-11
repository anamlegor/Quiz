var models = require('../models/models.js');

// GET /quizes/question
exports.question = function(req, res) {
    models.Quiz.findAll().then(function(quiz) {
    res.render('quizes/question', { pregunta: quiz[0].pregunta});
  })
   
};

// GET /quizes/answer
exports.answer = function(req, res) {
 models.Quiz.findAll().then(function(quiz) {
    if (req.query.respuesta === quiz[0].respuesta) {
      res.render('quizes/answer', { respuesta: 'Correcto' });
    } else {
      res.render('quizes/answer', { respuesta: 'Incorrecto'});
    }
  })

//GET  /quizes?search=texto_a_buscar
/*exports.busqueda = function(req, res) {
	res.render('/quizes?search=texto_a_buscar',{
		search = search.replace(' ', '%');
	findAll({where: ["pregunta like ?", search]});


	});*/
};