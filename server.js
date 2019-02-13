const express = require('express');
const app = express();
const port = 3000;
const bodyParser = require("body-parser");
var fs = require('fs');
var path = require('path');
var request = require('request');
var cheerio = require('cheerio');

var MongoClient = require('mongodb').MongoClient;
var password = 'hacker1';
var db;
var foodArray = [];


var foodString = '';
// <span class="price-group" role="text" aria-label="$



MongoClient.connect('mongodb://hacker:hacker1@ds127825.mlab.com:27825/foods', function (err, client) {
    if (err) {
        console.log(err);
        throw err;
    }

    db = client.db('foods');

    db.collection('foodItems').find().toArray(function (err, result) {
        if (err) throw err

        console.log(foodArray);
        foodArray = result;

    })

    app.listen(app.get('port'), function () {
        console.log('Server started: http://localhost:' + app.get('port') + '/');
        console.log(foodArray);
    })
});


app.set('port', (process.env.PORT || 3000));


app.use('/', express.static(path.join(__dirname, 'app')));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
    extended: true
}));



app.get('/getFood', (req, res) => {

    var collection = db.collection('foodItems');
    collection.find({}).toArray(function (err, docs) {
        if (err) {
            res.sendStatus(404);
        } else {
            foodArray = docs;
            var jsonFoodArray = JSON.stringify(foodArray);
            res.json(jsonFoodArray);
        }
    });
    console.log('/getFood was called');
});


// INDEX NEEDED
app.get('/getGroceryList', (req, res) => {
    var collection = db.collection('groceryList');
    collection.find({}).toArray(function (err, docs) {
        if (err) {
            res.sendStatus(404);
        } else {
            var groceryList = docs;
            var jsonGroceryList = JSON.stringify(groceryList);
            res.json(jsonGroceryList);
        }
    });
    console.log('/getGroceryList was called');
});


app.post('/addToGroceryList', (req, res) => {
    var foodItem = req.body.item;
    var amount = req.body.amount;
    var price = req.body.price;
    var collection = db.collection('groceryList');
    collection.insertOne({
        item: foodItem,
        amount: amount,
        price: price
    });
});

app.delete('/deleteFromGroceryList', (req, res) => {
    var collection = db.collection('groceryList');
    db.collection('groceryList').find().toArray(function (err, docs) {
        if (err) {
            res.sendStatus(404);
        } else {
            groceryList = docs;
        }
    });
    var itemToDelete = req.body.item;
    collection.deleteMany({
        item: itemToDelete
    });
});


app.post('/postFood', (req, res) => {
    console.log(req.body.item);
    var foodItem = req.body.item;
    var collection = db.collection('foodItems');
    collection.insertOne({
        item: foodItem
    });
});


app.post('/createRecipe', (req, res) => {
    var collection = db.collection('recipeList');
    if (req.body.name != ' ') {
        collection.insertOne({
            name: req.body.name,
            ingredientList: []
        });
    } else {
        res.sendStatus(100);
    }
});


// PUT / UPDATE 
app.put('/addIngredient', function (req, res) {
    db.collection('recipeList').find().toArray(function (err, docs) {
        if (err) {
            res.sendStatus(404);
        } else {
            recipeList = docs;
        }
    });
    var collection = db.collection('recipeList');
    var nameToUpdate = req.body.name;
    db.collection('recipeList').find().toArray(function (err, docs) {
        if (err) {
            res.sendStatus(404);
        } else {
            recipeList = docs;
            recipeList.forEach(element => {
                if (element.name == nameToUpdate) {
                    var newIngredient;
                    if (element.ingredientList == "") {
                        newIngredient = req.body.newIngredientTitle + ',' + req.body.newIngredientAmount;
                    } else {
                        newIngredient = ',' + req.body.newIngredientTitle + ',' + req.body.newIngredientAmount;
                    }
                    element.ingredientList = element.ingredientList + newIngredient;
                    collection.updateMany({
                        name: nameToUpdate
                    }, {
                            $set: {
                                ingredientList: element.ingredientList
                            }
                        })
                }
            });
        }
    });

    collection.find().toArray(function (err, docs) {
        if (err) {
            res.sendStatus(404);
        } else {
            recipeList = docs;
        }
        recipeList = docs;
    })
});



app.post('/getPrice', (req, res) => {
    var foodItem = req.body.item;
    if (foodItem.split(' ').length > 1) {
        var result = foodItem.replace(" ", "%20");
        foodItem = result;
    }

    var answer = '<span class="price-group" role="text" aria-label="$';


    request('https://www.walmart.com/search/?query=' + foodItem, function (error, response, html) {
        if (!error && response.statusCode == 200) {
            res.json(html);
            //console.log($('.price-group', html).attr('aria-label'));
        }
    });
});


app.get('/getRecipes', (req, res) => {
    var collection = db.collection('recipeList');
    collection.find({}).toArray(function (err, docs) {
        if (err) {
            res.sendStatus(404);
        } else {
            var recipeList = docs;
            var jsonGroceryList = JSON.stringify(recipeList);
            res.json(jsonGroceryList);
        }
    });
    console.log('/getRecipeList was called');
});





app.all("*", (req, res) => {
    res.sendStatus(404);
})

//app.listen(port, () => console.log(`Example app listening on port ${port}!`));