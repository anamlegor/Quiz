var models = require('../models/models.js');
var busqueda;
// GET /quizes
exports.index = function(req, res) {
	busqueda=req.query.search;
  if(busqueda===undefined){
  models.Quiz.findAll().then(function(quizes) {
    res.render('quizes/index.ejs', { quizes: quizes});  })}
  else{
  	busqueda="%"+busqueda+"%";
  	busqueda = busqueda.replace(' ', '%');
	models.Quiz.findAll({where: ["pregunta like ?", busqueda]}).then(function(quizes) {
    res.render('quizes/index.ejs', { quizes: quizes});  })

  }
   
};



// GET /quizes/:id
exports.show = function(req, res) {
  models.Quiz.find(req.params.quizId).then(function(quiz) {
    res.render('quizes/show', { quiz: quiz});
  })
};

// GET /quizes/:id/answer

exports.answer = function(req, res) {
  models.Quiz.find(req.params.quizId).then(function(quiz) {
    if (req.query.respuesta === quiz.respuesta) {
      res.render('quizes/answer', 
                 { quiz: quiz, respuesta: 'Correcto' });
    } else {
       res.render('quizes/answer', 
                 { quiz: quiz, respuesta: 'Incorrecto'});
    }
  })

};