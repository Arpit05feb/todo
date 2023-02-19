const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require('mongoose');
const _ = require("lodash");

const app = express();

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

mongoose.set('strictQuery', false);

mongoose.connect('mongodb+srv://admin-arpit:test123@cluster0.zhykowf.mongodb.net/todolistDB', {useNewUrlParser: true});

const itemsSchema = {
    name: String
};

const Item = mongoose.model("Item", itemsSchema);

const item1 = new Item({
    name: "Welcome to my list"
});

const item2 = new Item ({
    name: "Hit + to add items"
});

const defaultitem = [item1, item2];

const listschema = {
    name: String,
    items : [itemsSchema]
}

const List = mongoose.model("List", listschema)

app.set("view engine", "ejs");



app.get("/", function(req, res) {

     
    Item.find({}, function(err, found){
        if(found.length === 0){

            Item.insertMany(defaultitem, function(err){
                if(err){
                    console.log(err);
                } else {
                    console.log("Successfully saved to DB");
                }
            })
            res.redirect("/")

        } else {
            res.render("list", {
                listtitle: "Today", 
                Nitem: found});
        }
        
    });

   
});

app.get("/:customlist", function(req, res){

    const customlist = _.capitalize(req.params.customlist);
    
    List.findOne({name: customlist}, function(err, found){
        if(!err){
            if(!found){
                const list = new List ({
                    name: customlist,
                    items: defaultitem
                });
                list.save(function(err){
                    res.redirect("/" + customlist)
                });
                
            } else{
                res.render("list", {
                    listtitle: found.name, 
                    Nitem: found.items})
            }
        }
    })
    
    

})



app.post("/", function(req, res){
    
    const NewItem = req.body.NewItem
    const listname = req.body.list
    
    const item = new Item({
        name: NewItem
    })
    
    
     if(listname === "Today"){
        item.save(function(err){
            res.redirect("/");
        }); 
       
        } else{
        console.log(listname);    
        List.findOne({name: listname}, function(err, found){
            if(!err){
                
                found.items.push(item);
                found.save(function(err){
                    res.redirect("/"+ listname);
                });
                
                
            }
            
        })
    }
          
    
});

app.post("/delete", function(req, res){

    const checkeditem = req.body.checkbox;
    const listname = req.body.listname;

    if(listname === "Today"){
        Item.findByIdAndRemove(checkeditem, function(err){
            if(err){
                console.log(err)
            } else {
                console.log("item deleted")
                res.redirect("/")
            }
        })
    
       
    } else {
        List.findOneAndUpdate({name: listname}, {$pull: {items: {_id: checkeditem}}}, function(err, found){
            if(!err){
                res.redirect("/"+listname);
            }
        } ) ;
    }

    
});


app.listen(3000, function(){

    console.log("server started")

});
