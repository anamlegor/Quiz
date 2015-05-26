var models = require('../models/models.js');
var busqueda;


// MW que permite acciones solamente si el quiz objeto pertenece al usuario logeado o si es cuenta admin
exports.ownershipRequired = function(req, res, next){
    var objQuizOwner = req.quiz.UserId;
    var logUser = req.session.user.id;
    var isAdmin = req.session.user.isAdmin;

    if (isAdmin || objQuizOwner === logUser) {
        next();
    } else {
        res.redirect('/');
    }
};


// Autoload :id
exports.load = function(req, res, next, quizId) {
   models.Quiz.find({
            where: {
                id: Number(quizId)
            },
            include: [{
                model: models.Comment
            }]
        }).then(function(quiz) {
      if (quiz) {
        req.quiz = quiz;
        next();
} else{next(new Error('No existe quizId=' + quizId))}
    }
).catch(function(error){next(error)});
};

// GET /quizes
// GET /users/:userId/quizes
exports.index = function(req, res) {  
  var favoritos = [];
  busqueda=req.query.search;
  var options = {};
  
  if(req.session.user){
    models.Favourites.findAll({
      where: {UserId: Number(req.session.user.id) }
    }).then(function(enc){
      for(index = 0; index < enc.length;index++){
      favoritos.push(enc[index].dataValues.QuizId);
      }
    })
  }


  if(req.user){
    options.where = {UserId: req.user.id}

    models.Quiz.findAll(options).then(function(quizes){
      //console.log(quizes);
    res.render('quizes/index.ejs', {quizes: quizes, errors: [], favoritos: favoritos});
  }).catch(function(error){next(error);});
 
  }else{
  if(busqueda===undefined){
  models.Quiz.findAll(options).then(
    function(quizes) {
      res.render('quizes/index.ejs', {quizes: quizes, errors: [], favoritos: favoritos});
    }
).catch(function(error){next(error)});
}else{
  	busqueda="%"+busqueda+"%";
  	busqueda = busqueda.replace(' ', '%');
	models.Quiz.findAll({where: ["pregunta like ?", busqueda]}).then(
    function(quizes) {
      res.render('quizes/index.ejs', {quizes: quizes, errors: [], favoritos: favoritos});
    }
).catch(function(error){next(error)});
}
  }
   
};



// GET /quizes/:id
exports.show = function(req, res) {
  models.Quiz.find(req.params.quizId).then(function(quiz){
    //Control de favoritos
    var isFavorito = 0 ;

    if(req.session.user){
      
      models.Favourites.findAll({
          where: {QuizId: Number(req.params.quizId) },
      
        }).then(function(enc){
    
          for(index = 0; index < enc.length;index++){

           if(req.session.user.id === enc[index].dataValues.UserId){
              isFavorito=1;
          }}
        })
      .then(function(){
        res.render('quizes/show' , {quiz: req.quiz, errors: [], isFavorito: isFavorito });
      })}else{

        res.render('quizes/show' , {quiz: req.quiz, errors: [], isFavorito: isFavorito });
      }
    })
  
};   // req.quiz: instancia de quiz cargada con autoload

// GET /quizes/:id/answer

exports.answer = function(req, res) {
 var resultado = 'Incorrecto';
  if (req.query.respuesta === req.quiz.respuesta) {
    resultado = 'Correcto';
  }
 res.render(
    'quizes/answer', 
    { quiz: req.quiz, 
      respuesta: resultado, 
      errors: []
    }
  );
};

// GET /quizes/new
exports.new = function(req, res) {
  var quiz = models.Quiz.build( // crea objeto quiz 
    {pregunta: "Pregunta", respuesta: "Respuesta"}
  );

  res.render('quizes/new', {quiz: quiz, errors: []});
};

// POST /quizes/create
exports.create = function(req, res) {
  
req.body.quiz.UserId = req.session.user.id;
  
 if(req.files.image){
    req.body.quiz.image = req.files.image.name;
  }

  var quiz = models.Quiz.build( req.body.quiz );

quiz.validate()
  .then(
    function(err){
      if (err) {
        res.render('quizes/new', {quiz: quiz, errors: err.errors});
      } else {
        quiz // save: guarda en DB campos pregunta y respuesta de quiz
        .save({fields: ["pregunta", "respuesta", "UserId", "image"]})
        .then( function(){ res.redirect('/quizes')}) 
      }      // res.redirect: Redirección HTTP a lista de preguntas
    }
  ).catch(function(error){next(error)});
};

// GET /quizes/:id/edit
exports.edit = function(req, res) {
  var quiz = req.quiz;  // req.quiz: autoload de instancia de quiz

  res.render('quizes/edit', {quiz: quiz, errors: []});
};

// PUT /quizes/:id
exports.update = function(req, res) {
  
if(req.files.image){
    req.quiz.image = req.files.image.name;
  }

  req.quiz.pregunta  = req.body.quiz.pregunta;
  req.quiz.respuesta = req.body.quiz.respuesta;

  req.quiz
  .validate()
  .then(
    function(err){
      if (err) {
        res.render('quizes/edit', {quiz: req.quiz, errors: err.errors});
      } else {
        req.quiz     // save: guarda campos pregunta y respuesta en DB
        .save( {fields: ["pregunta", "respuesta", "image"]})
        .then( function(){ res.redirect('/quizes');});
      }     // Redirección HTTP a lista de preguntas (URL relativo)
    }
  ).catch(function(error){next(error)});
};

// DELETE /quizes/:id
exports.destroy = function(req, res) {
  req.quiz.destroy().then( function() {
    res.redirect('/quizes');
  }).catch(function(error){next(error)});
};

exports.statistics = function(req,res){

  models.Quiz.findAll({include: [{
    
     model: models.Comment 
    
    }]}).then(function(Preguntas){

     models.Comment.count().then(function(numeroComentarios){
      var pregsConCo = 0;
      var numeroPreguntas = Preguntas.length;
      var media = numeroComentarios/numeroPreguntas;
      media=media.toFixed(3);
      for(i = 0; i < numeroPreguntas; i++){

        //console.log(P[index].Comments);
        if(Preguntas[i].Comments.length > 0){
          pregsConCo++;
        }
      }
      var pregsSinCo = numeroPreguntas - pregsConCo;

res.render('quizes/statistics',{numeroPreguntas: numeroPreguntas, 
  numeroComentarios: numeroComentarios, media: media, pregsSinCo: pregsSinCo, 
  pregsConCo: pregsConCo, errors: []});
    });
});

};
