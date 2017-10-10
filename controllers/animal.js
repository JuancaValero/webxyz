'use strict'

//modulos
var fs = require('fs');
var path = require('path');

//modelos
var User = require('../models/user');
var Animal = require('../models/animal');

//acciones
function pruebas(req, res){
  res.status(200).send({
    message: 'Probando el controlador',
    user: req.user
  });
}

function saveAnimal(req, res){
  var animal = new Animal();
  var params = req.body;

  if (params.name) {
    animal.name = params.name;
    animal.description = params.description;
    animal.year = params.year;
    animal.image = null;
    animal.user = req.user.sub;

    animal.save((err, animalStored) => {
      if (err) {
        res.status(500).send({message: 'Error en el servidor'});
      }else{
        if (!animalStored) {
          res.status(404).send({message: 'No se ha guardado el animal'});
        }else{
          res.status(200).send({animal: animalStored});
        }
      }
    });
  }else{
    res.status(200).send({message: 'El nombre es obligatorio'});
  }
}

function getAnimals(req, res){
  Animal.find({}).populate({path: 'user'}).exec((err, animals) => {
    if (err) {
      res.status(500).send({message: 'Error en la petición'});
    }else{
      if (!animals) {
        res.status(404).send({message: 'NO hay animales'});
      }else{
        res.status(200).send({
          animals
        });
      }
    }
  });
}

function getAnimal(req, res){
  var animalId = req.params.id;

  Animal.findById(animalId).populate({path: 'user'}).exec((err, animal) =>{
    if (err) {
      res.status(500).send({message: 'Error en la petición'});
    }else{
      if (!animal) {
        res.status(404).send({message: 'El animal no existe'});
      }else{
        res.status(200).send({
          animal
        });
      }
    }
  });
}

function updateAnimal(req, res){
  var animalId = req.params.id;
  var update = req.body;

  Animal.findByIdAndUpdate(animalId, update, {new:true}, (err, animalUpdated) => {
    if (err) {
      res.status(500).send({message: 'Error en la petición}'});
    }else{
      if (!animalUpdated) {
        res.status(404).send({message: 'No se actualizo el animal'});
      }else{
        res.status(200).send({animal: animalUpdated});
      }
    }
  });
}

function uploadImage(req, res){
  var animalId = req.params.id;
  var file_name = 'No subido...';

  if (req.files) {
    var file_path = req.files.image.path;
    var file_split = file_path.split('/');
    var file_name = file_split[2];

    var ext_split = file_name.split('\.');
    var file_ext = ext_split[1];

    if (file_ext == 'png' || file_ext == 'jpg' || file_ext == 'jpeg' || file_ext == 'gif') {

      Animal.findByIdAndUpdate(animalId, { image: file_name }, {new:true}, (err, animalUpdated) => {
        if (err) {
          res.status(500).send({
            message: 'Error al actualizar animal'
          });
        }else{
          if (!animalUpdated) {
            res.status(404).send({message: 'No se ha podido actualizar el animal'});
          }else{
            res.status(200).send({animal: animalUpdated, image: file_name});
          }
        }
      });
    }else{
      fs.unlink(file_path, (err) => {
        if (err) {
          res.status(200).send({ message: 'Extensión no valida y fichero no borrado'});
        }else{
          res.status(200).send({ message: 'Extensión no valida'});
        }
      });
    }

  }else{
    res.status(200).send({ message: 'No se ha subido archivos'});
  }
}

function getImageFile(req, res){
  var imageFile = req.params.imageFile;
  var path_file = './uploads/animals/'+imageFile;

  fs.exists(path_file, function(exists){
    if (exists) {
      res.sendFile(path.resolve(path_file));
    }else{
      res.status(200).send({ message: 'La imagen no existe'});
    }
  });
}

function deleteAnimal(req, res){
  var animalId = req.params.id;

  Animal.findByIdAndRemove(animalId, (err, animalRemoved) => {
    if (err) {
      res.status(500).send({ message: 'Error en la petición'});
    }else{
      if (!animalRemoved) {
        res.status(404).send({ message: 'No se ha borrado el animal'});
      }else{
        res.status(200).send({ animal: animalRemoved });
      }
    }
  });
}

module.exports = {
  pruebas,
  saveAnimal,
  getAnimals,
  getAnimal,
  updateAnimal,
  uploadImage,
  getImageFile,
  deleteAnimal
};
