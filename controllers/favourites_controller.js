var models = require('../models/models.js');
var quizes=[];

exports.index = function(req,res){
var favoritos = [];
var	index1 = 0;
var	index2 = 0;
var idB;

		models.Favourites.findAll({
			where: {UserId: Number(req.session.user.id) },
		}).then(function(enc){
						quizes = [];
			for(index1 = 0; index1 < enc.length;index1++){
			favoritos.push(enc[index1].dataValues.QuizId);
			}
		}).then(function(){
			index2 = 0;
		}).then(function(){
			
				if(favoritos.length > 0 ){
			for(index2 = 0; index2 < favoritos.length; index2++){
				idB=favoritos[index2];

				models.Quiz.find({
					where:{ id: Number(idB)},
					order: 'pregunta ASC',
					include: [{model: models.Comment}]
					}).then(function(quiz){
						quizes.push(quiz)
						}).then(function(){
							if(quizes.length === favoritos.length){
								res.render('quizes/index.ejs', {quizes: quizes, errors: [], favoritos: favoritos});
								}
							});
			}
		} else {
			res.render('quizes/index.ejs', {quizes: quizes, errors: [], favoritos: favoritos});
		}
});

};

exports.create = function(req,res){

	req.user.hasQuiz(req.quiz).then(function(fav){
		if(fav){
			next();
			return;
		} else {
			req.user.addQuiz(req.quiz).then(function(){
			});
		}
		res.redirect(req.session.redir.toString());
	});


};

exports.destroy = function(req,res){
req.user.hasQuiz(req.quiz).then(function(fav){
		if(fav){
			req.user.removeQuiz(req.quiz).then(function(){
			});
		} else {
			next();
			return;
		}
		res.redirect(req.session.redir.toString());
	});



};
